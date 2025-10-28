import { test, expect } from '@playwright/test';
import apiTokens from '../../../../fixtures/api-tokens.json';
import testAccounts from '../../../../fixtures/test-accounts.json';

/**
 * TC-LOGIN-API-001: 發送 OTP 簡訊
 * 
 * 測試目標: 驗證 OTP 發送功能正常運作
 * 
 * 前置條件:
 * - 有效的 x-platform-token
 * - 有效的測試手機號碼
 * 
 * 預期結果:
 * - Status: 201 Created
 * - success: true
 */

test.describe('TC-LOGIN-API-001: 發送 OTP', () => {
  test('成功發送 OTP 簡訊', async ({ request }) => {
    const response = await request.post(
      'https://cosign.pro/api/platform-sdk/otp',
      {
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'origin': 'https://www.dogcatstar.com',
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        },
        data: {
          account: `+886${testAccounts.phone}`,
          countryCode: 'TW',
          otpTemplateSettingKey: 'TW_zh_TW',
          recaptchaToken: 'SKIP_FOR_TESTING',
          type: 'sms',
          redirectUrl: 'https://www.dogcatstar.com/my-account/?no-cache',
          fallbackUrl: 'https://www.dogcatstar.com/my-account/?no-cache',
          purpose: 'login',
          validateUrl: 'https://www.dogcatstar.com/my-account/?validate=registerOrLogin'
        }
      }
    );

    // 驗證回應狀態碼
    expect(response.status()).toBe(201);
    
    // 驗證回應內容
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data.success).toBe(true);
    
    console.log('✅ OTP 發送成功:', data);
  });

  test('發送 OTP - 缺少必要欄位應該失敗', async ({ request }) => {
    const response = await request.post(
      'https://cosign.pro/api/platform-sdk/otp',
      {
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'origin': 'https://www.dogcatstar.com',
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        },
        data: {
          // 缺少 account 欄位
          countryCode: 'TW',
          type: 'sms',
          purpose: 'login'
        }
      }
    );

    // 應該回傳錯誤狀態碼
    expect([400, 422]).toContain(response.status());
    
    console.log('✅ 缺少必要欄位時正確回傳錯誤:', response.status());
  });

  test('發送 OTP - 無效的 Token 應該失敗', async ({ request }) => {
    const response = await request.post(
      'https://cosign.pro/api/platform-sdk/otp',
      {
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
          'x-platform-token': 'invalid_token_12345',
          'origin': 'https://www.dogcatstar.com',
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        },
        data: {
          account: `+886${testAccounts.phone}`,
          countryCode: 'TW',
          type: 'sms',
          purpose: 'login'
        }
      }
    );

    // 應該回傳未授權或禁止錯誤
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 無效 Token 時正確回傳錯誤:', response.status());
  });
});
