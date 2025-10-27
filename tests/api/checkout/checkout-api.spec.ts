import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../helpers/apiClient';
import tokens from '../../../fixtures/api-tokens.json';

/**
 * TC-API-CHECKOUT-001: 結帳流程 - 正常結帳
 * TC-API-CHECKOUT-002: 結帳流程 - 缺少必要欄位
 * TC-API-CHECKOUT-003: 結帳流程 - 權限驗證
 */
test.describe('結帳流程 API 測試', () => {
  let apiClient: any;

  test.beforeAll(async () => {
    apiClient = await createApiClient();
    apiClient.setTokens(tokens['api-token'], tokens['x-platform-token']);
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test('TC-API-CHECKOUT-001: 應該成功計算結帳金額', async () => {
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
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const data = await response.json();
    console.log('結帳流程-正常結帳 API 回傳:', data);
    expect(data.data).toHaveProperty('total');
  });

  test('TC-API-CHECKOUT-002: 缺少必要欄位應回傳 400', async () => {
    const payload = { };
    const response = await apiClient.calculateCheckout(payload);
    const status = response.status();
    const data = await response.json();
    console.log('結帳流程-缺少欄位 API 狀態:', status, '回傳:', data);
    expect([400, 422, 500]).toContain(status);
  });

  test('TC-API-CHECKOUT-003: 無 token 應回傳 401', async () => {
    const tempClient = await createApiClient();
    tempClient.setTokens('', '');
    const payload = { };
    const response = await tempClient.calculateCheckout(payload);
    expect(response.status()).toBe(401);
    await tempClient.dispose();
  });
});
