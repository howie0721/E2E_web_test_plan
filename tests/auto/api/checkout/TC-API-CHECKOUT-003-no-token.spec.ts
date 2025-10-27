import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../../helpers/apiClient';

test.describe('結帳流程 API 測試', () => {
  test('TC-API-CHECKOUT-003: 無 token 應回傳 401', async () => {
    const tempClient = await createApiClient();
    tempClient.setTokens('', '');
    const payload = { };
    const response = await tempClient.calculateCheckout(payload);
    expect(response.status()).toBe(401);
    await tempClient.dispose();
  });
});
