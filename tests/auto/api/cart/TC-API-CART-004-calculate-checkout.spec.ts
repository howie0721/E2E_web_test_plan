import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../../helpers/apiClient';
import tokens from '../../../../fixtures/api-tokens.json';

test.describe('購物車 API 測試', () => {
  let apiClient: any;

  test.beforeAll(async () => {
    apiClient = await createApiClient();
    apiClient.setTokens(tokens['api-token'], tokens['x-platform-token']);
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test('TC-API-CART-004: 應該成功計算結帳金額', async () => {
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
    console.log('計算結帳金額 API 回傳:', data);
    expect(data).toBeDefined();
    expect(data.data).toHaveProperty('total');
  });
});
