import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../../helpers/apiClient';
import tokens from '../../../../fixtures/api-tokens.json';

test.describe('購物車 API 測試', () => {
  test('TC-API-CART-002: 缺少 api-token 應該回傳 401', async () => {
    const tempClient = await createApiClient();
    tempClient.setTokens('', tokens['x-platform-token']);
    const response = await tempClient.getCartCache();
    console.log('缺少 api-token 回傳狀態:', response.status());
    let data = undefined;
    try {
      data = await response.json();
      console.log('缺少 api-token 回傳內容:', data);
    } catch (e) {
      console.log('缺少 api-token 無回傳 JSON');
    }
    expect(response.status()).toBe(401);
    await tempClient.dispose();
  });
});
