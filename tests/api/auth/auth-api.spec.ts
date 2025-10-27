import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../helpers/apiClient';
import tokens from '../../../fixtures/api-tokens.json';

/**
 * TC-API-AUTH-001: 權限驗證 - 無 token
 * TC-API-AUTH-002: 權限驗證 - 錯誤 token
 */
test.describe('會員/權限 API 測試', () => {
  let apiClient: any;

  test.beforeAll(async () => {
    apiClient = await createApiClient();
    apiClient.setTokens(tokens['api-token'], tokens['x-platform-token']);
  });

  test.afterAll(async () => {
    await apiClient.dispose();
  });

  test('TC-API-AUTH-001: 無 token 應回傳 401', async () => {
    const tempClient = await createApiClient();
    tempClient.setTokens('', '');
    const response = await tempClient.getCartCache();
    expect(response.status()).toBe(401);
    await tempClient.dispose();
  });

  test('TC-API-AUTH-002: 錯誤 token 應回傳 401', async () => {
    const tempClient = await createApiClient();
    tempClient.setTokens('invalid', 'invalid');
    const response = await tempClient.getCartCache();
    expect(response.status()).toBe(401);
    await tempClient.dispose();
  });
});
