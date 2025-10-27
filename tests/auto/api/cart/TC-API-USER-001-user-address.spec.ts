import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../../helpers/apiClient';
import tokens from '../../../../fixtures/api-tokens.json';

test.describe('會員地址 API 測試', () => {
  let apiClient: any;

  test.beforeAll(async () => {
    apiClient = await createApiClient();
    apiClient.setTokens(tokens['api-token'], tokens['x-platform-token']);
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test('TC-API-USER-001: 應該成功查詢用戶地址資訊', async () => {
    const response = await apiClient.getUserAddress('TW', 'DCS');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    const data = await response.json();
    console.log('查詢用戶地址資訊 API 回傳:', data);
    expect(data).toBeDefined();
    expect(data).toHaveProperty('data');
  });
});
