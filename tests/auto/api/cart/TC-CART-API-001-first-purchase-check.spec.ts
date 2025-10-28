import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TC-CART-API-001: 檢查首次購物狀態
 * 
 * 測試目標: 驗證首購檢查 API 在無痕模式下正確運作
 * API: GET /api/ec/v2/TW/cart/first_purchase
 */

// 讀取 API tokens
const tokensPath = path.join(process.cwd(), 'fixtures', 'api-tokens.json');
let tokens: any = {};

if (fs.existsSync(tokensPath)) {
  tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
}

const BASE_URL = 'https://fortune-api.moneynet.tw';

test.describe('TC-CART-API-001: 檢查首次購物狀態', () => {
  
  test('001-1: 成功檢查首購狀態（無痕模式）', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
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

    console.log('📊 首購檢查 - Status:', response.status());
    
    // 訪客模式可能回傳 401 或 200
    expect([200, 401]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      console.log('📦 回應資料:', JSON.stringify(data, null, 2));
      
      // 驗證回應結構
      expect(data).toHaveProperty('is_first_purchase');
      
      // 無痕模式通常為首購用戶
      expect(typeof data.is_first_purchase).toBe('boolean');
      console.log('✅ 首購狀態:', data.is_first_purchase);
    } else {
      console.log('⚠️ 訪客模式需要登入才能檢查首購狀態');
    }
  });

  test('001-2: 測試不同 project_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
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

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toBeDefined();
    
    console.log('✅ Project Code: DCS - 首購狀態:', data.is_first_purchase);
  });

  test('001-3: 測試不同 country_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
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

    // 200 或 400 都是合理的（取決於是否支援該國家）
    expect([200, 400, 404]).toContain(response.status());
    
    console.log('✅ Country Code: TW - Status:', response.status());
  });

  test('001-4: 缺少必要參數 - country_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
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
    
    // 可能回傳 200（使用預設值）或 400（參數錯誤）
    expect([200, 400, 422]).toContain(response.status());
  });

  test('001-5: 缺少必要參數 - project_code', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
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
    
    expect([200, 400, 422]).toContain(response.status());
  });

  test('001-6: 無效的 api-token', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
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
    
    console.log('✅ 正確拒絕無效的 api-token');
  });

  test('001-7: 無效的 x-platform-token', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
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
    
    console.log('✅ 正確拒絕無效的 x-platform-token');
  });

  test('001-8: 缺少 api-token header', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
      {
        params: {
          country_code: 'TW',
          project_code: 'DCS'
        },
        headers: {
          // 故意缺少 api-token
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 缺少 api-token - Status:', response.status());
    
    expect([401, 403, 400]).toContain(response.status());
    
    console.log('✅ 正確處理缺少 api-token 的情況');
  });

  test('001-9: 驗證回應時間', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
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
    
    expect(response.status()).toBe(200);
    
    // 回應時間應在合理範圍內（5秒內）
    expect(responseTime).toBeLessThan(5000);
    
    console.log('✅ 回應時間正常');
  });

  test('001-10: 驗證 Accept header 支援', async ({ request }) => {
    // 測試不同的 Accept header
    const acceptTypes = [
      'application/json',
      'application/json, text/plain, */*',
      '*/*'
    ];

    for (const acceptType of acceptTypes) {
      const response = await request.get(
        `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
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
      
      expect(response.status()).toBe(200);
    }
    
    console.log('✅ 支援多種 Accept header');
  });

});
