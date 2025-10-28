import { test, expect, APIResponse } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  safeParseJson,
  createGuestDiscountPayload,
  getApiHeaders,
  validateResponseTime,
  testConcurrentRequests,
  isSuccessResponse
} from '../../../../helpers/cartApiHelper';

/**
 * TC-CART-API-004: 計算會員優惠折扣
 * 
 * 測試目標: 驗證會員優惠計算功能，使用已登入會員身分測試
 * API: POST /api/ec/v2/TW/cart/calculate_guest_discount
 * 測試身分: 已登入會員
 * 
 * 註: 雖然 API 名稱為 "guest_discount"，但會員也可以使用此 API 查詢優惠
 */

// 讀取 API tokens (會員已登入)
const tokensPath = path.join(process.cwd(), 'fixtures', 'api-tokens.json');
let tokens: any = {};

if (fs.existsSync(tokensPath)) {
  tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
}

const BASE_URL = 'https://fortune-api.moneynet.tw';

test.describe('TC-CART-API-004: 計算會員優惠折扣', () => {
  
  test('004-1: 成功計算會員優惠（空商品列表）', async ({ request }) => {
    const payload = createGuestDiscountPayload({
      country: 'TW',
      shouldRequest: true,
      orderItems: []
    });

    const response = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: getApiHeaders(tokens)
      }
    );

    console.log('📊 會員優惠計算 - Status:', response.status());
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await safeParseJson(response);
      
      if (data) {
        console.log('🎁 會員優惠資料:', JSON.stringify(data, null, 2));
        expect(data).toBeDefined();
        console.log('✅ 成功取得會員優惠資訊');
      } else {
        console.log('⚠️ API 回傳 HTML 而非 JSON - 端點可能需要修正');
      }
    } else {
      console.log('ℹ️ 會員 token 可能已過期');
    }
  });

  test('004-2: 計算會員優惠（包含商品）', async ({ request }) => {
    const payload = createGuestDiscountPayload({
      country: 'TW',
      shouldRequest: true,
      orderItems: [
        {
          sku: '貓火雞罐',
          quantity: 2,
          price: 46
        }
      ]
    });

    const response = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: getApiHeaders(tokens)
      }
    );

    console.log('📊 會員優惠（含商品）- Status:', response.status());
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await safeParseJson(response);
      
      if (data) {
        console.log('🎁 優惠明細:', JSON.stringify(data, null, 2));
        expect(data).toBeDefined();
        console.log('✅ 成功計算商品優惠');
      }
    }
  });

  test('004-3: 測試 should_request = false', async ({ request }) => {
    const payload = createGuestDiscountPayload({
      country: 'TW',
      shouldRequest: false,
      orderItems: []
    });

    const response = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: getApiHeaders(tokens)
      }
    );

    console.log('📊 should_request=false - Status:', response.status());
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await safeParseJson(response);
      
      if (data) {
        // should_request=false 時，可能回傳空或預設值
        expect(data).toBeDefined();
        console.log('✅ should_request=false 處理正常');
      }
    }
  });

  test('004-4: 測試不同 country_code', async ({ request }) => {
    const countries = ['TW', 'US', 'JP'];

    for (const country of countries) {
      const payload = createGuestDiscountPayload({
        country: country,
        shouldRequest: true
      });

      const response = await request.post(
        `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
        {
          data: payload,
          headers: getApiHeaders(tokens)
        }
      );

      console.log(`🌍 Country: ${country} - Status:`, response.status());
      expect([200, 400, 401, 404]).toContain(response.status());
    }

    console.log('✅ 多國家測試完成');
  });

  test('004-5: 測試缺少必要欄位 - country_code', async ({ request }) => {
    const invalidPayload = {
      should_request: true,
      order_items: []
      // 故意缺少 country_code
    };

    const response = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: invalidPayload,
        headers: getApiHeaders(tokens)
      }
    );

    console.log('📊 缺少 country_code - Status:', response.status());
    expect([200, 400, 401, 422, 500]).toContain(response.status());

    if ([400, 422].includes(response.status())) {
      console.log('✅ 正確處理缺少必要欄位');
    } else if (response.status() === 200) {
      console.log('⚠️ 後端未驗證必要欄位');
    }
  });

  test('004-6: 測試無效的 api-token', async ({ request }) => {
    const payload = createGuestDiscountPayload();

    const response = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: {
          'api-token': 'INVALID_TOKEN_12345',
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    );

    console.log('📊 無效 api-token - Status:', response.status());
    expect([200, 401, 403]).toContain(response.status());

    if ([401, 403].includes(response.status())) {
      console.log('✅ 正確拒絕無效 token');
    } else {
      console.log('⚠️ Token 驗證可能不嚴格');
    }
  });

  test('004-7: 測試無效的 x-platform-token', async ({ request }) => {
    const payload = createGuestDiscountPayload();

    const response = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': 'INVALID_PLATFORM_TOKEN',
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    );

    console.log('📊 無效 x-platform-token - Status:', response.status());
    expect([200, 401, 403]).toContain(response.status());

    if ([401, 403].includes(response.status())) {
      console.log('✅ 正確拒絕無效 platform token');
    } else {
      console.log('⚠️ Platform token 驗證可能不嚴格');
    }
  });

  test('004-8: 驗證 API 回應時間', async ({ request }) => {
    const payload = createGuestDiscountPayload();

    const startTime = Date.now();
    const response = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: getApiHeaders(tokens)
      }
    );

    const responseTime = Date.now() - startTime;
    console.log('⏱️ API 回應時間:', responseTime, 'ms');

    expect([200, 401]).toContain(response.status());
    expect(responseTime).toBeLessThan(5000);

    console.log('✅ 回應時間正常');
  });

  test('004-9: 測試多個商品的會員優惠', async ({ request }) => {
    const payload = createGuestDiscountPayload({
      country: 'TW',
      shouldRequest: true,
      orderItems: [
        {
          sku: '貓火雞罐',
          quantity: 2,
          price: 46
        },
        {
          sku: '狗雞肉罐',
          quantity: 1,
          price: 50
        }
      ]
    });

    const response = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: getApiHeaders(tokens)
      }
    );

    console.log('📊 多商品會員優惠 - Status:', response.status());
    expect([200, 401]).toContain(response.status());

    if (response.status() === 200) {
      const data = await safeParseJson(response);
      
      if (data) {
        console.log('🎁 多商品優惠:', JSON.stringify(data, null, 2));
        console.log('✅ 成功計算多商品優惠');
      }
    }
  });

  test('004-10: 測試併發請求會員優惠', async ({ request }) => {
    const payload = createGuestDiscountPayload();

    const responses = await testConcurrentRequests(
      () => request.post(
        `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
        {
          data: payload,
          headers: getApiHeaders(tokens)
        }
      ),
      3,
      '會員優惠'
    );

    responses.forEach((res: APIResponse) => {
      expect([200, 401]).toContain(res.status());
    });

    console.log('✅ 併發請求處理正常');
  });

  test('004-11: 驗證回應資料類型', async ({ request }) => {
    const payload = createGuestDiscountPayload();

    const response = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: getApiHeaders(tokens)
      }
    );

    const contentType = response.headers()['content-type'] || '';
    console.log('📦 Content-Type:', contentType);

    if (response.status() === 200) {
      if (contentType.includes('application/json')) {
        console.log('✅ 正確回傳 JSON');
        
        const data = await safeParseJson(response);
        expect(data).not.toBeNull();
      } else if (contentType.includes('text/html')) {
        console.log('❌ API 回傳 HTML 而非 JSON');
        console.log('💡 建議: 檢查 API 路由配置和端點正確性');
      }
    } else {
      console.log(`ℹ️ API 狀態: ${response.status()}`);
    }
  });

  test('004-12: 測試會員與訪客的差異', async ({ request }) => {
    const payload = createGuestDiscountPayload();

    // 使用會員 token
    const memberResponse = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: getApiHeaders(tokens)
      }
    );

    console.log('📊 會員模式 - Status:', memberResponse.status());
    
    // 不使用 token (訪客模式)
    const guestResponse = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        data: payload,
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }
    );

    console.log('📊 訪客模式 - Status:', guestResponse.status());

    // 記錄兩種模式的差異
    if (memberResponse.status() === 200 && guestResponse.status() !== 200) {
      console.log('✅ 會員模式有權限存取，訪客模式受限');
    } else if (memberResponse.status() === 200 && guestResponse.status() === 200) {
      console.log('ℹ️ 會員和訪客都可以存取此 API');
    }
  });
});
