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

  test('TC-API-CART-003: 應該成功查詢首次購物狀態', async () => {
    const response = await apiClient.checkFirstPurchase();
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
  });
});
