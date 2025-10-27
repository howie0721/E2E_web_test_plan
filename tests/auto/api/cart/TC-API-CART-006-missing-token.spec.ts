import { test, expect } from '@playwright/test';
import { createApiClient } from '../../../../helpers/apiClient';

test.describe('購物車優惠券 API 測試', () => {
  test('TC-API-CART-006: 缺少 token 應該回傳 401', async () => {
    const tempClient = await createApiClient();
    tempClient.setTokens('', '');
    const response = await tempClient.getAvailableCoupons(362822, 'TW', 'DCS');
    expect(response.status()).toBe(401);
    await tempClient.dispose();
  });
});
