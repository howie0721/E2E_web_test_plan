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

  test('TC-API-CART-001: 應該成功查詢購物車快取', async () => {
    const response = await apiClient.getCartCache();
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const data = await response.json();
    console.log('購物車快取 API 回傳:', data);
    expect(data).toBeDefined();
    const headers = response.headers();
    expect(headers['content-type']).toContain('application/json');
  });
});
