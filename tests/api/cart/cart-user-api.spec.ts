import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../helpers/apiClient';
import tokens from '../../../fixtures/api-tokens.json';

/**
 * TC-API-USER-001: 查詢用戶地址資訊
 * 
 * 測試目標：驗證查詢用戶地址資訊 API 是否正常運作
 * 前置條件：有效的 api-token 和 x-platform-token
 */
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

  test('TC-API-USER-002: 缺少 token 應該回傳 401', async () => {
    const tempClient = await createApiClient();
    tempClient.setTokens('', '');
    const response = await tempClient.getUserAddress('TW', 'DCS');
    expect(response.status()).toBe(401);
    await tempClient.dispose();
  });
});
