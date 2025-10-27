import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../../helpers/apiClient';
import tokens from '../../../../fixtures/api-tokens.json';

/**
 * Integration Test: 完整購物流程
 * 1. 查詢購物車快取
 * 2. 計算結帳金額
 * 3. 查詢可用優惠券
 * 4. 查詢用戶地址資訊
 * 5. 驗證所有步驟皆成功
 */
test.describe('整合測試：會員完整購物流程', () => {
  let apiClient: any;

  test.beforeAll(async () => {
    apiClient = await createApiClient();
    apiClient.setTokens(tokens['api-token'], tokens['x-platform-token']);
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test('會員完整購物流程', async () => {
    // 1. 查詢購物車快取
    const cartRes = await apiClient.getCartCache();
    expect(cartRes.ok()).toBeTruthy();
    const cartData = await cartRes.json();
    console.log('購物車快取:', cartData);

    // 2. 計算結帳金額
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
      cart_values: cartData.data?.cart_values || {},
    };
    const checkoutRes = await apiClient.calculateCheckout(payload);
    expect(checkoutRes.ok()).toBeTruthy();
    const checkoutData = await checkoutRes.json();
    console.log('結帳金額:', checkoutData);
    expect(checkoutData.data).toHaveProperty('total');

    // 3. 查詢可用優惠券
    const couponRes = await apiClient.getAvailableCoupons(362822, 'TW', 'DCS');
    expect(couponRes.ok()).toBeTruthy();
    const couponData = await couponRes.json();
    console.log('可用優惠券:', couponData);
    expect(Array.isArray(couponData.data)).toBeTruthy();

    // 4. 查詢用戶地址資訊
    const addressRes = await apiClient.getUserAddress('TW', 'DCS');
    expect(addressRes.ok()).toBeTruthy();
    const addressData = await addressRes.json();
    console.log('用戶地址資訊:', addressData);
    expect(addressData).toHaveProperty('data');
  });
});
