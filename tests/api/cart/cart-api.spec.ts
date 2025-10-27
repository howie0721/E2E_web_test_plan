import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../helpers/apiClient';
import tokens from '../../../fixtures/api-tokens.json';

/**
 * TC-API-CART-001: 查詢購物車快取
 * 
 * 測試目標：驗證購物車快取 API 是否正常運作
 * 前置條件：有效的 api-token 和 x-platform-token
 */
test.describe('購物車 API 測試', () => {
  let apiClient: any;

  test.beforeAll(async () => {
    apiClient = await createApiClient();
    apiClient.setTokens(tokens['api-token'], tokens['x-platform-token']);
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test('TC-API-CART-001: 應該成功查詢購物車快取', async () => {
    // 執行 API 呼叫
    const response = await apiClient.getCartCache();

    // 驗證狀態碼
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

  // 驗證回應格式
  const data = await response.json();
  console.log('購物車快取 API 回傳:', data);
  expect(data).toBeDefined();

  // 驗證 headers
  const headers = response.headers();
  expect(headers['content-type']).toContain('application/json');
  });

  test('TC-API-CART-002: 缺少 api-token 應該回傳 401', async () => {
    // 建立臨時客戶端，只設定 platform-token
    const tempClient = await createApiClient();
    tempClient.setTokens('', tokens['x-platform-token']);

    const response = await tempClient.getCartCache();

    // 印出 response 狀態碼與內容
    console.log('缺少 api-token 回傳狀態:', response.status());
    let data = undefined;
    try {
      data = await response.json();
      console.log('缺少 api-token 回傳內容:', data);
    } catch (e) {
      console.log('缺少 api-token 無回傳 JSON');
    }

    // 驗證狀態碼
    expect(response.status()).toBe(401);

    await tempClient.dispose();
  });

  test('TC-API-CART-003: 應該成功查詢首次購物狀態', async () => {
    const response = await apiClient.checkFirstPurchase();

    // 印出 response 狀態碼與內容
    console.log('查詢首次購物狀態 回傳狀態:', response.status());
    let data = undefined;
    try {
      data = await response.json();
      console.log('查詢首次購物狀態 回傳內容:', data);
    } catch (e) {
      console.log('查詢首次購物狀態無回傳 JSON');
    }

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    // 此 API 回傳內容可能為空，不強制解析 JSON
  });

  test('TC-API-CART-004: 應該成功計算結帳金額', async () => {
    // 準備測試資料
    const payload = {
      billing_country: 'TW',
      project_code: 'DCS',
      country_code: 'TW',
      order_items: [
        {
          sku: '貓火雞罐',
          project_code: 'DCS',
          quantity: 1,
          is_addon: false,
          is_addon_v2: false,
        },
      ],
      manual_input_coupon_ids: [],
      applied_shipping_method_id: 2,
      language: 'zh_TW',
      cart_values: {
        cart: {
          items: [
            {
              cartItemId: 32611,
              product_id: 32602,
              variation_id: 32611,
              quantity: 1,
              sku: '貓火雞罐',
              delivery_class: 'normal',
              project_code: 'DCS',
              sale_price: 46,
              stock: 491,
            },
          ],
          addonItems: [],
        },
        rewardPoints: {
          userInputRewardPoints: 0,
          isUserAppliedRewardPoints: false,
        },
        coupon: {
          manualInputCouponIds: [],
        },
        billing: {
          billingCountry: 'TW',
        },
        shipping: {
          appliedShippingMethodId: 2,
          deliveryTimeSlot: '09:00 - 13:00',
        },
        payment: {
          appliedPaymentMethodId: null,
        },
        invoice: {
          refundStatement: true,
          receiptType: 'non_business_einvoice',
        },
      },
    };

    const response = await apiClient.calculateCheckout(payload);

    // 驗證狀態碼
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // 驗證回應資料
  const data = await response.json();
  console.log('計算結帳金額 API 回傳:', data);
  expect(data).toBeDefined();
  // 根據實際 API 回傳結構，total 在 data.data.total
  expect(data.data).toHaveProperty('total');
  });
});
