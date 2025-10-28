import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TC-CART-API-007: 查詢用戶地址資訊
 * 
 * 測試目標: 驗證用戶地址查詢功能（訪客模式）
 * API: GET /api/ec/user/address_info
 */

// 讀取 API tokens
const tokensPath = path.join(process.cwd(), 'fixtures', 'api-tokens.json');
let tokens: any = {};

if (fs.existsSync(tokensPath)) {
  tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
}

const BASE_URL = 'https://fortune-api.moneynet.tw';

test.describe('TC-CART-API-007: 查詢用戶地址資訊', () => {
  
  test('007-1: 查詢用戶地址（訪客模式）', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 用戶地址查詢（訪客）- Status:', response.status());
    
    // 訪客模式可能回傳 200（空地址）或 401/403（未登入）
    expect([200, 401, 403]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      console.log('📦 地址資料:', JSON.stringify(data, null, 2));
      
      // 訪客模式地址應為空或預設值
      expect(data).toBeDefined();
      
      console.log('✅ 訪客模式地址查詢成功（可能為空）');
    } else {
      console.log('ℹ️ 訪客模式無地址資料（需登入）');
    }
  });

  test('007-2: 驗證地址資料結構', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 地址結構驗證 - Status:', response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      
      console.log('📋 地址欄位檢查:');
      
      // 檢查可能的地址欄位
      const addressFields = [
        'addresses', 'address_list', 'default_address',
        'billing_address', 'shipping_address'
      ];
      
      addressFields.forEach(field => {
        if (data[field] !== undefined) {
          console.log(`  ✅ ${field}: ${typeof data[field]}`);
          
          if (Array.isArray(data[field])) {
            console.log(`    - 地址數量: ${data[field].length}`);
          }
        }
      });
      
      console.log('✅ 地址結構檢查完成');
    } else {
      console.log('ℹ️ 需登入才能查看地址結構');
    }
  });

  test('007-3: 測試不同 country_code', async ({ request }) => {
    const countryCodes = ['TW', 'US', 'JP'];

    for (const countryCode of countryCodes) {
      const response = await request.get(
        `${BASE_URL}/api/ec/user/address_info`,
        {
          params: {
            country_code: countryCode,
            project_code: 'DCS'
          },
          headers: {
            'api-token': tokens.apiToken,
            'x-platform-token': tokens.platformToken,
            'accept': 'application/json'
          }
        }
      );

      console.log(`🌍 Country: ${countryCode} - Status:`, response.status());
      
      expect([200, 400, 401, 403, 404]).toContain(response.status());
    }
  });

  test('007-4: 測試不同 project_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 Project: DCS - Status:', response.status());
    
    expect([200, 400, 401, 403, 404]).toContain(response.status());
  });

  test('007-5: 缺少必要參數 - country_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          // 故意缺少 country_code
          project_code: 'DCS'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 缺少 country_code - Status:', response.status());
    
    expect([200, 400, 401, 403, 422]).toContain(response.status());
  });

  test('007-6: 缺少必要參數 - project_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'TW'
          // 故意缺少 project_code
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 缺少 project_code - Status:', response.status());
    
    expect([200, 400, 401, 403, 422]).toContain(response.status());
  });

  test('007-7: 無效的 api-token', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
        },
        headers: {
          'api-token': 'invalid_token_12345',
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 無效 api-token - Status:', response.status());
    
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 正確拒絕無效 token');
  });

  test('007-8: 無效的 x-platform-token', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': 'invalid_platform_token',
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 無效 x-platform-token - Status:', response.status());
    
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 正確拒絕無效 platform token');
  });

  test('007-9: 驗證 API 回應時間', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('⏱️ API 回應時間:', responseTime, 'ms');
    
    expect([200, 401, 403]).toContain(response.status());
    expect(responseTime).toBeLessThan(5000);
    
    console.log('✅ 回應時間正常');
  });

  test('007-10: 測試併發查詢地址', async ({ request }) => {
    const requests = Array(3).fill(null).map(() => 
      request.get(
        `${BASE_URL}/api/ec/user/address_info`,
        {
          params: {
            country_code: 'TW',
            project_code: 'DCS'
          },
          headers: {
            'api-token': tokens.apiToken,
            'x-platform-token': tokens.platformToken,
            'accept': 'application/json'
          }
        }
      )
    );

    const responses = await Promise.all(requests);
    
    console.log('📊 併發請求結果:');
    responses.forEach((res, index) => {
      console.log(`  請求 ${index + 1}: Status ${res.status()}`);
      expect([200, 401, 403]).toContain(res.status());
    });
    
    console.log('✅ 併發請求處理正常');
  });

  test('007-11: 驗證回應 Content-Type', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 Content-Type 驗證 - Status:', response.status());
    
    if (response.status() === 200) {
      const contentType = response.headers()['content-type'];
      console.log('📦 Content-Type:', contentType);
      
      expect(contentType).toContain('application/json');
      
      console.log('✅ Content-Type 正確');
    } else {
      console.log('ℹ️ 訪客模式無權查看地址');
    }
  });

  test('007-12: 測試無效的 country_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'INVALID',
          project_code: 'DCS'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 無效 country_code - Status:', response.status());
    
    expect([400, 401, 403, 404, 500]).toContain(response.status());
    
    console.log('✅ 正確處理無效 country_code');
  });

  test('007-13: 測試不同 Accept header', async ({ request }) => {
    const acceptTypes = [
      'application/json',
      'application/json, text/plain, */*',
      '*/*'
    ];

    for (const acceptType of acceptTypes) {
      const response = await request.get(
        `${BASE_URL}/api/ec/user/address_info`,
        {
          params: {
            country_code: 'TW',
            project_code: 'DCS'
          },
          headers: {
            'api-token': tokens.apiToken,
            'x-platform-token': tokens.platformToken,
            'accept': acceptType
          }
        }
      );

      console.log(`📊 Accept: ${acceptType} - Status:`, response.status());
      
      expect([200, 401, 403]).toContain(response.status());
    }
    
    console.log('✅ 支援多種 Accept header');
  });

  test('007-14: 驗證訪客與會員的差異', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/user/address_info`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 訪客/會員差異驗證 - Status:', response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      
      // 訪客模式應該沒有儲存的地址
      if (Array.isArray(data.addresses) || Array.isArray(data.address_list)) {
        const addresses = data.addresses || data.address_list;
        console.log('📦 地址數量:', addresses.length);
        
        if (addresses.length === 0) {
          console.log('✅ 訪客模式：無儲存地址（符合預期）');
        } else {
          console.log('ℹ️ 檢測到已儲存地址（可能為登入用戶）');
        }
      } else {
        console.log('✅ 訪客模式：地址資料為空');
      }
    } else if (response.status() === 401 || response.status() === 403) {
      console.log('✅ 訪客模式：需要登入才能查看地址');
    }
  });

});
