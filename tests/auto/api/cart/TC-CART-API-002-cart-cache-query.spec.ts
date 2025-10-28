import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TC-CART-API-002: 查詢購物車快取
 * 
 * 測試目標: 驗證購物車快取查詢功能
 * API: GET /api/ec/v2/TW/cart/cart_request_cache
 */

// 讀取 API tokens
const tokensPath = path.join(process.cwd(), 'fixtures', 'api-tokens.json');
let tokens: any = {};

if (fs.existsSync(tokensPath)) {
  tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
}

const BASE_URL = 'https://fortune-api.moneynet.tw';
const WEB_URL = 'https://www.dogcatstar.com';

test.describe('TC-CART-API-002: 查詢購物車快取', () => {
  
  test('002-1: 成功查詢購物車快取（空購物車）', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 購物車快取查詢 - Status:', response.status());
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log('📦 購物車快取資料:', JSON.stringify(data, null, 2));
    
    // 驗證回應是否為有效的 JSON
    expect(data).toBeDefined();
    
    // 如果有 items 欄位，應該是陣列
    if (data.items) {
      expect(Array.isArray(data.items)).toBe(true);
      console.log('🛒 購物車商品數量:', data.items.length);
    }
    
    console.log('✅ 購物車快取查詢成功');
  });

  test('002-2: 驗證購物車快取資料結構', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`,
          'accept': 'application/json'
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // 驗證可能存在的欄位
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      const item = data.items[0];
      
      console.log('📦 商品資料結構:', JSON.stringify(item, null, 2));
      
      // 驗證商品基本欄位（如果存在）
      if (item.sku) {
        expect(typeof item.sku).toBe('string');
        console.log('✅ SKU 欄位存在:', item.sku);
      }
      
      if (item.quantity !== undefined) {
        expect(typeof item.quantity).toBe('number');
        console.log('✅ 數量欄位存在:', item.quantity);
      }
    } else {
      console.log('ℹ️ 購物車為空，無法驗證商品結構');
    }
  });

  test('002-3: 測試缺少 origin header', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          // 故意缺少 origin
          'referer': `${WEB_URL}/`,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 缺少 origin - Status:', response.status());
    
    // 可能回傳 200（不嚴格檢查）或 403（CORS 錯誤）
    expect([200, 403]).toContain(response.status());
  });

  test('002-4: 測試缺少 referer header', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'origin': WEB_URL,
          // 故意缺少 referer
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 缺少 referer - Status:', response.status());
    
    expect([200, 403]).toContain(response.status());
  });

  test('002-5: 無效的 api-token', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': 'invalid_token_67890',
          'x-platform-token': tokens.platformToken,
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 無效 api-token - Status:', response.status());
    
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 正確拒絕無效的 api-token');
  });

  test('002-6: 無效的 x-platform-token', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': 'invalid_platform_token',
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`,
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 無效 x-platform-token - Status:', response.status());
    
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 正確拒絕無效的 x-platform-token');
  });

  test('002-7: 測試錯誤的 origin', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'origin': 'https://malicious-site.com',
          'referer': 'https://malicious-site.com/',
          'accept': 'application/json'
        }
      }
    );

    console.log('📊 錯誤的 origin - Status:', response.status());
    
    // 可能回傳 200（不嚴格檢查）或 403（CORS 拒絕）
    expect([200, 403]).toContain(response.status());
  });

  test('002-8: 驗證 API 回應時間', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`,
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

  test('002-9: 測試併發請求購物車快取', async ({ request }) => {
    const requests = Array(3).fill(null).map(() => 
      request.get(
        `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
        {
          headers: {
            'api-token': tokens.apiToken,
            'x-platform-token': tokens.platformToken,
            'origin': WEB_URL,
            'referer': `${WEB_URL}/`,
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

  test('002-10: 驗證回應 Content-Type', async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`,
          'accept': 'application/json'
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    console.log('📦 Content-Type:', contentType);
    
    // 應該回傳 JSON 格式
    expect(contentType).toContain('application/json');
    
    console.log('✅ Content-Type 正確');
  });

});
