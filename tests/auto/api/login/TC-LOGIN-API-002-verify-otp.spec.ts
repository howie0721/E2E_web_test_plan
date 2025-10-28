import { test, expect } from '@playwright/test';
import apiTokens from '../../../../fixtures/api-tokens.json';
import testAccounts from '../../../../fixtures/test-accounts.json';

/**
 * TC-LOGIN-API-002: 驗證 OTP 並取得 JWT Token
 * 
 * 測試目標: 驗證 OTP 驗證功能與 JWT Token 取得
 * 
 * 前置條件:
 * - 已成功發送 OTP
 * - 有有效的 OTP 碼（測試環境可用固定碼）
 * 
 * 預期結果:
 * - Status: 200 OK
 * - 回傳有效的 JWT Token
 * - JWT Token 結構正確（3段，用.分隔）
 */

test.describe('TC-LOGIN-API-002: 驗證 OTP', () => {
  // 輔助函數：發送 OTP
  async function sendOTP(request: any, phone: string) {
    const response = await request.post(
      'https://cosign.pro/api/platform-sdk/otp',
      {
        headers: {
          'content-type': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'origin': 'https://www.dogcatstar.com',
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        },
        data: {
          account: phone,
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
    return response;
  }

  test.skip('成功驗證 OTP 並取得 JWT Token', async ({ request }) => {
    // 注意：此測試需要真實的 OTP 碼，因此標記為 skip
    // 在測試環境中，可以配置 mock OTP 來啟用此測試
    
    const testPhone = `+886${testAccounts.phone}`;
    
    // Step 1: 先發送 OTP
    const otpResponse = await sendOTP(request, testPhone);
    expect(otpResponse.status()).toBe(201);
    
    // Step 2: 驗證 OTP（需要真實的 OTP 碼）
    const testOTP = process.env.TEST_OTP || '123456';
    
    const response = await request.post(
      'https://cosign.pro/api/platform-sdk/otp-verification',
      {
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'origin': 'https://www.dogcatstar.com',
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        },
        data: {
          account: testPhone,
          otpCode: testOTP,
          purpose: 'login'
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('token');
    expect(data.success).toBe(true);
    expect(data.token).toBeTruthy();
    
    // 驗證 JWT Token 格式（3 段，用 . 分隔）
    const tokenParts = data.token.split('.');
    expect(tokenParts).toHaveLength(3);
    
    // 解碼 JWT payload（不驗證簽名）
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
    expect(payload).toHaveProperty('sub'); // 用戶 ID
    expect(payload).toHaveProperty('exp'); // 過期時間
    expect(payload).toHaveProperty('platformId'); // 平台 ID
    expect(payload).toHaveProperty('accountType'); // 帳號類型
    
    console.log('✅ OTP 驗證成功，JWT Token 取得:', {
      userId: payload.sub,
      platformId: payload.platformId,
      accountType: payload.accountType,
      expireAt: new Date(payload.exp * 1000).toISOString()
    });
  });

  test('驗證錯誤的 OTP 碼應該失敗', async ({ request }) => {
    const testPhone = `+886${testAccounts.phone}`;
    
    // 先發送 OTP
    await sendOTP(request, testPhone);
    
    // 使用明顯錯誤的 OTP
    const response = await request.post(
      'https://cosign.pro/api/platform-sdk/otp-verification',
      {
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'origin': 'https://www.dogcatstar.com',
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        },
        data: {
          account: testPhone,
          otpCode: '000000', // 錯誤的 OTP
          purpose: 'login'
        }
      }
    );

    // 應該回傳錯誤狀態碼
    expect([400, 401, 403]).toContain(response.status());
    
    console.log('✅ 錯誤 OTP 時正確回傳錯誤:', response.status());
  });

  test('驗證 OTP - 缺少必要欄位應該失敗', async ({ request }) => {
    const response = await request.post(
      'https://cosign.pro/api/platform-sdk/otp-verification',
      {
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'origin': 'https://www.dogcatstar.com',
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        },
        data: {
          // 缺少 account 和 otpCode
          purpose: 'login'
        }
      }
    );

    // 應該回傳錯誤狀態碼
    expect([400, 422]).toContain(response.status());
    
    console.log('✅ 缺少必要欄位時正確回傳錯誤:', response.status());
  });

  test('驗證 OTP - 無效的 Token 應該失敗', async ({ request }) => {
    const response = await request.post(
      'https://cosign.pro/api/platform-sdk/otp-verification',
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
          otpCode: '123456',
          purpose: 'login'
        }
      }
    );

    // 應該回傳未授權或禁止錯誤
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 無效 Token 時正確回傳錯誤:', response.status());
  });
});
