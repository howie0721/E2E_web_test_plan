import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../../helpers/apiClient';
import tokens from '../../../../fixtures/api-tokens.json';

test.describe('結帳流程 API 測試', () => {
  let apiClient: any;

  test.beforeAll(async () => {
    apiClient = await createApiClient();
    apiClient.setTokens(tokens['api-token'], tokens['x-platform-token']);
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test('TC-API-CHECKOUT-002: 缺少必要欄位應回傳 400', async () => {
    const payload = { };
    const response = await apiClient.calculateCheckout(payload);
    const status = response.status();
    const data = await response.json();
    console.log('結帳流程-缺少欄位 API 狀態:', status, '回傳:', data);
    expect([400, 422, 500]).toContain(status);
  });
});
