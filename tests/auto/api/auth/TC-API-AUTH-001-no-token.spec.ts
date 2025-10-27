import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../../helpers/apiClient';

test.describe('會員/權限 API 測試', () => {
  test('TC-API-AUTH-001: 無 token 應回傳 401', async () => {
    const tempClient = await createApiClient();
    tempClient.setTokens('', '');
    const response = await tempClient.getCartCache();
    expect(response.status()).toBe(401);
    await tempClient.dispose();
  });
});
