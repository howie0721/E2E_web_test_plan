import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../../helpers/apiClient';
import tokens from '../../../../fixtures/api-tokens.json';

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
});
