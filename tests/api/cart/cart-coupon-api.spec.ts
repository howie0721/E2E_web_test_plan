import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../helpers/apiClient';
import tokens from '../../../fixtures/api-tokens.json';

/**
 * TC-API-CART-005: 查詢可用優惠券
 * 
 * 測試目標：驗證查詢可用優惠券 API 是否正常運作
 * 前置條件：有效的 api-token 和 x-platform-token
 */
test.describe('購物車優惠券 API 測試', () => {
  let apiClient: any;

  test.beforeAll(async () => {
    apiClient = await createApiClient();
    apiClient.setTokens(tokens['api-token'], tokens['x-platform-token']);
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test('TC-API-CART-005: 應該成功查詢可用優惠券', async () => {
    const response = await apiClient.getAvailableCoupons(362822, 'TW', 'DCS');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const data = await response.json();
    console.log('查詢可用優惠券 API 回傳:', data);
    expect(data).toBeDefined();
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('TC-API-CART-006: 缺少 token 應該回傳 401', async () => {
    const tempClient = await createApiClient();
    tempClient.setTokens('', '');
    const response = await tempClient.getAvailableCoupons(362822, 'TW', 'DCS');
    expect(response.status()).toBe(401);
    await tempClient.dispose();
  });
});
