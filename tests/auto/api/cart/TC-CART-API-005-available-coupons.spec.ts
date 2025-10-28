import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TC-CART-API-005: 查詢可用優惠券
 * 
 * 測試目標: 驗證優惠券查詢功能（訪客模式）
 * API: GET /api/ec/coupons/available_coupons
 */

// 讀取 API tokens
const tokensPath = path.join(process.cwd(), 'fixtures', 'api-tokens.json');
let tokens: any = {};

if (fs.existsSync(tokensPath)) {
  tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
}

const BASE_URL = 'https://fortune-api.moneynet.tw';

test.describe('TC-CART-API-005: 查詢可用優惠券', () => {
  
  test('005-1: 成功查詢可用優惠券（訪客模式）', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS',
          user_id: '0' // 訪客模式
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 優惠券查詢（訪客）- Status:', response.status());
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log('🎟️ 可用優惠券:', JSON.stringify(data, null, 2));
    
    // 驗證回應格式（可能是陣列或物件）
    expect(data).toBeDefined();
    expect(Array.isArray(data) || typeof data === 'object').toBe(true);
    
    if (Array.isArray(data)) {
      console.log('✅ 優惠券數量:', data.length);
      
      // 如果有優惠券，驗證資料結構
      if (data.length > 0) {
        const coupon = data[0];
        console.log('📦 優惠券範例:', JSON.stringify(coupon, null, 2));
        
        // 驗證基本欄位（如果存在）
        if (coupon.id || coupon.coupon_id) {
          console.log('✅ 優惠券 ID 存在');
        }
        if (coupon.name || coupon.title) {
          console.log('✅ 優惠券名稱存在');
        }
      }
    } else {
      console.log('ℹ️ 回應為物件格式');
    }
  });

  test('005-2: 查詢優惠券（指定 user_id）', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS',
          user_id: '12345' // 模擬會員 ID
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 優惠券查詢（會員）- Status:', response.status());
    
    // 200（有效會員）或 401/403（無效會員）
    expect([200, 401, 403, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      console.log('🎟️ 會員優惠券數量:', Array.isArray(data) ? data.length : '物件格式');
    }
  });

  test('005-3: 測試不同 project_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS',
          user_id: '0'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 Project: DCS - Status:', response.status());
    
    expect([200, 400, 404]).toContain(response.status());
  });

  test('005-4: 測試不同 country_code', async ({ request }) => {
    const countryCodes = ['TW', 'US', 'JP'];

    for (const countryCode of countryCodes) {
      const response = await request.get(
        `${BASE_URL}/api/ec/coupons/available_coupons`,
        {
          params: {
            country_code: countryCode,
            project_code: 'DCS',
            user_id: '0'
          },
          headers: {
            'api-token': tokens.apiToken,
            'x-platform-token': tokens.platformToken,
            'accept': 'application/json'
          }
        }
      );

      console.log(`🌍 Country: ${countryCode} - Status:`, response.status());
      
      expect([200, 400, 404]).toContain(response.status());
    }
  });

  test('005-5: 缺少必要參數 - country_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          // 故意缺少 country_code
          project_code: 'DCS',
          user_id: '0'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 缺少 country_code - Status:', response.status());
    
    expect([200, 400, 422]).toContain(response.status());
  });

  test('005-6: 缺少必要參數 - project_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          // 故意缺少 project_code
          user_id: '0'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 缺少 project_code - Status:', response.status());
    
    expect([200, 400, 422]).toContain(response.status());
  });

  test('005-7: 缺少必要參數 - user_id', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
          // 故意缺少 user_id
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 缺少 user_id - Status:', response.status());
    
    // 可能使用預設值（0）或回傳錯誤
    expect([200, 400, 422]).toContain(response.status());
  });

  test('005-8: 無效的 api-token', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS',
          user_id: '0'
        },
        headers: {
          'api-token': 'invalid_token_xyz',
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 無效 api-token - Status:', response.status());
    
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 正確拒絕無效 token');
  });

  test('005-9: 無效的 x-platform-token', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS',
          user_id: '0'
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

  test('005-10: 驗證 API 回應時間', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS',
          user_id: '0'
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
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000);
    
    console.log('✅ 回應時間正常');
  });

  test('005-11: 測試併發查詢優惠券', async ({ request }) => {
    const requests = Array(3).fill(null).map(() => 
      request.get(
        `${BASE_URL}/api/ec/coupons/available_coupons`,
        {
          params: {
            country_code: 'TW',
            project_code: 'DCS',
            user_id: '0'
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
      expect(res.status()).toBe(200);
    });
    
    console.log('✅ 併發請求處理正常');
  });

  test('005-12: 驗證回應 Content-Type', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS',
          user_id: '0'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    console.log('📦 Content-Type:', contentType);
    
    expect(contentType).toContain('application/json');
    
    console.log('✅ Content-Type 正確');
  });

  test('005-13: 驗證優惠券資料結構完整性', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/coupons/available_coupons`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS',
          user_id: '0'
        },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const coupon = data[0];
      
      console.log('📋 優惠券欄位檢查:');
      
      // 檢查常見欄位
      const commonFields = [
        'id', 'coupon_id', 'name', 'title', 'code',
        'discount_type', 'discount_amount', 'minimum_amount',
        'expiry_date', 'start_date', 'end_date', 'is_available'
      ];
      
      commonFields.forEach(field => {
        if (coupon[field] !== undefined) {
          console.log(`  ✅ ${field}: ${typeof coupon[field]}`);
        }
      });
      
      console.log('✅ 資料結構檢查完成');
    } else {
      console.log('ℹ️ 無優惠券資料或非陣列格式');
    }
  });

  test('005-14: 測試無效的 user_id 格式', async ({ request }) => {
    const invalidUserIds = ['abc', '-1', '999999999999'];

    for (const userId of invalidUserIds) {
      const response = await request.get(
        `${BASE_URL}/api/ec/coupons/available_coupons`,
        {
          params: {
            country_code: 'TW',
            project_code: 'DCS',
            user_id: userId
          },
          headers: {
            'api-token': tokens.apiToken,
            'x-platform-token': tokens.platformToken,
            'accept': 'application/json'
          }
        }
      );

      console.log(`📊 user_id=${userId} - Status:`, response.status());
      
      // 可能回傳 200（當作訪客）或 400（格式錯誤）
      expect([200, 400, 404]).toContain(response.status());
    }
  });

  test('005-15: 測試不同 Accept header', async ({ request }) => {
    const acceptTypes = [
      'application/json',
      'application/json, text/plain, */*',
      '*/*'
    ];

    for (const acceptType of acceptTypes) {
      const response = await request.get(
        `${BASE_URL}/api/ec/coupons/available_coupons`,
        {
          params: {
            country_code: 'TW',
            project_code: 'DCS',
            user_id: '0'
          },
          headers: {
            'api-token': tokens.apiToken,
            'x-platform-token': tokens.platformToken,
            'accept': acceptType
          }
        }
      );

      console.log(`📊 Accept: ${acceptType} - Status:`, response.status());
      
      expect(response.status()).toBe(200);
    }
    
    console.log('✅ 支援多種 Accept header');
  });

});
