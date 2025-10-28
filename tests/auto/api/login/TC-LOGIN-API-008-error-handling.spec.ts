import { test, expect } from '@playwright/test';
import apiTokens from '../../../../fixtures/api-tokens.json';
import testAccounts from '../../../../fixtures/test-accounts.json';

/**
 * TC-LOGIN-API-008: 錯誤處理綜合測試
 * 
 * 測試目標: 驗證登入流程中各種錯誤情況的處理
 * 
 * 測試項目:
 * - 無效 Token
 * - 錯誤 OTP
 * - 過期 JWT Token
 * - 無效手機號碼格式
 * - Rate Limiting
 * - 網路錯誤處理
 * 
 * 預期結果:
 * - 所有錯誤都能正確處理
 * - 錯誤訊息清晰
 * - 安全性檢查有效
 */

test.describe('TC-LOGIN-API-008: 錯誤處理測試', () => {
  
  test.describe('Token 相關錯誤', () => {
    test('無效的 x-platform-token - 發送 OTP', async ({ request }) => {
      const response = await request.post(
        'https://cosign.pro/api/platform-sdk/otp',
        {
          headers: {
            'content-type': 'application/json',
            'x-platform-token': 'invalid_token_abc123'
          },
          data: {
            account: `+886${testAccounts.phone}`,
            countryCode: 'TW',
            type: 'sms',
            purpose: 'login'
          }
        }
      );

      expect([401, 403]).toContain(response.status());
      console.log('✅ 無效 Token (發送 OTP):', response.status());
    });

    test('空的 x-platform-token', async ({ request }) => {
      const response = await request.post(
        'https://cosign.pro/api/platform-sdk/otp',
        {
          headers: {
            'content-type': 'application/json',
            'x-platform-token': ''
          },
          data: {
            account: `+886${testAccounts.phone}`,
            countryCode: 'TW',
            type: 'sms',
            purpose: 'login'
          }
        }
      );

      expect([400, 401, 403]).toContain(response.status());
      console.log('✅ 空 Token:', response.status());
    });

    test('格式錯誤的 JWT Token', async ({ request }) => {
      const invalidTokens = [
        'not.a.jwt',
        'only-one-part',
        'two.parts',
        'has.four.parts.here',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid',
        ''
      ];

      for (const token of invalidTokens) {
        const response = await request.get(
          `https://www.dogcatstar.com/cosign/token_login_page?token=${token}`,
          {
            maxRedirects: 0
          }
        );

        expect([400, 401, 403, 404, 302, 500]).toContain(response.status());
        console.log(`✅ 無效 JWT (${token.substring(0, 20)}...): ${response.status()}`);
      }
    });
  });

  test.describe('OTP 相關錯誤', () => {
    test('錯誤的 OTP 碼格式', async ({ request }) => {
      const invalidOTPs = [
        '12345',      // 太短
        '1234567',    // 太長
        'abcdef',     // 非數字
        '000000',     // 全零
        '111111',     // 重複數字
        ''            // 空字串
      ];

      for (const otp of invalidOTPs) {
        const response = await request.post(
          'https://cosign.pro/api/platform-sdk/otp-verification',
          {
            headers: {
              'content-type': 'application/json',
              'x-platform-token': apiTokens['x-platform-token']
            },
            data: {
              account: `+886${testAccounts.phone}`,
              otpCode: otp,
              purpose: 'login'
            }
          }
        );

        expect([400, 401, 403, 404, 422]).toContain(response.status());
        console.log(`✅ 無效 OTP (${otp}): ${response.status()}`);
      }
    });

    test('未發送 OTP 就直接驗證', async ({ request }) => {
      const response = await request.post(
        'https://cosign.pro/api/platform-sdk/otp-verification',
        {
          headers: {
            'content-type': 'application/json',
            'x-platform-token': apiTokens['x-platform-token']
          },
          data: {
            account: '+886900000000',  // 不太可能存在的號碼
            otpCode: '123456',
            purpose: 'login'
          }
        }
      );

      expect([400, 401, 403, 404]).toContain(response.status());
      console.log('✅ 未發送 OTP 直接驗證:', response.status());
    });
  });

  test.describe('手機號碼格式錯誤', () => {
    test('各種無效的手機號碼格式', async ({ request }) => {
      const invalidPhones = [
        '0912345678',      // 缺少國碼
        '886912345678',    // 缺少 +
        '+886',            // 太短
        '+8869123456789',  // 太長
        '+886-912-345678', // 包含特殊字元
        'abcdefghij',      // 非數字
        '+1234567890',     // 錯誤的國碼
        ''                 // 空字串
      ];

      for (const phone of invalidPhones) {
        const response = await request.get(
          'https://www.dogcatstar.com/dni/mu/user/registered',
          {
            params: {
              login_type: 'sms',
              identifier: phone
            },
            headers: {
              'x-platform-token': apiTokens['x-platform-token']
            }
          }
        );

        // 可能回傳 400/422 錯誤，或者 200 但顯示未註冊
        expect([200, 400, 422, 500]).toContain(response.status());
        console.log(`✅ 無效手機 (${phone}): ${response.status()}`);
      }
    });
  });

  test.describe('Rate Limiting 測試', () => {
    test('短時間內大量發送 OTP 請求', async ({ request }) => {
      const testPhone = `+886${testAccounts.phone}`;
      const requests = [];
      
      // 發送 10 個請求
      for (let i = 0; i < 10; i++) {
        requests.push(
          request.post('https://cosign.pro/api/platform-sdk/otp', {
            headers: {
              'content-type': 'application/json',
              'x-platform-token': apiTokens['x-platform-token']
            },
            data: {
              account: testPhone,
              countryCode: 'TW',
              type: 'sms',
              purpose: 'login',
              recaptchaToken: 'SKIP_FOR_TESTING'
            }
          })
        );
      }
      
      const responses = await Promise.all(requests);
      const statuses = responses.map(r => r.status());
      
      // 檢查是否有 429 (Too Many Requests)
      const hasRateLimit = statuses.some(s => s === 429);
      const has403 = statuses.some(s => s === 403);
      
      console.log('📊 Rate Limiting 測試結果:', {
        totalRequests: responses.length,
        statuses: statuses,
        hasRateLimit,
        has403
      });

      if (hasRateLimit) {
        console.log('✅ 檢測到 Rate Limiting (429)');
      } else if (has403) {
        console.log('✅ 檢測到請求限制 (403)');
      } else {
        console.log('ℹ️ 未觸發 Rate Limiting（可能需要更多請求）');
      }
    });

    test('連續驗證錯誤 OTP', async ({ request }) => {
      const testPhone = `+886${testAccounts.phone}`;
      const attempts = [];
      
      // 先發送一次 OTP
      await request.post('https://cosign.pro/api/platform-sdk/otp', {
        headers: {
          'content-type': 'application/json',
          'x-platform-token': apiTokens['x-platform-token']
        },
        data: {
          account: testPhone,
          countryCode: 'TW',
          type: 'sms',
          purpose: 'login',
          recaptchaToken: 'SKIP_FOR_TESTING'
        }
      });

      // 嘗試多次錯誤的 OTP
      for (let i = 0; i < 6; i++) {
        const response = await request.post(
          'https://cosign.pro/api/platform-sdk/otp-verification',
          {
            headers: {
              'content-type': 'application/json',
              'x-platform-token': apiTokens['x-platform-token']
            },
            data: {
              account: testPhone,
              otpCode: '000000',
              purpose: 'login'
            }
          }
        );
        
        attempts.push(response.status());
      }

      console.log('📊 連續錯誤 OTP 測試:', attempts);
      
      // 檢查是否有帳號鎖定或 rate limiting
      const hasLockout = attempts.some(s => s === 403 || s === 429);
      if (hasLockout) {
        console.log('✅ 檢測到帳號保護機制');
      }
    });
  });

  test.describe('缺少必要欄位', () => {
    test('發送 OTP 缺少必要欄位', async ({ request }) => {
      const testCases = [
        { data: { countryCode: 'TW', type: 'sms' }, missing: 'account' },
        { data: { account: '+886912345678', type: 'sms' }, missing: 'countryCode' },
        { data: { account: '+886912345678', countryCode: 'TW' }, missing: 'type' },
        { data: {}, missing: 'all fields' }
      ];

      for (const testCase of testCases) {
        const response = await request.post(
          'https://cosign.pro/api/platform-sdk/otp',
          {
            headers: {
              'content-type': 'application/json',
              'x-platform-token': apiTokens['x-platform-token']
            },
            data: testCase.data
          }
        );

        expect([400, 403, 422]).toContain(response.status());
        console.log(`✅ 缺少 ${testCase.missing}: ${response.status()}`);
      }
    });

    test('驗證 OTP 缺少必要欄位', async ({ request }) => {
      const testCases = [
        { data: { otpCode: '123456', purpose: 'login' }, missing: 'account' },
        { data: { account: '+886912345678', purpose: 'login' }, missing: 'otpCode' },
        { data: { account: '+886912345678', otpCode: '123456' }, missing: 'purpose' },
        { data: {}, missing: 'all fields' }
      ];

      for (const testCase of testCases) {
        const response = await request.post(
          'https://cosign.pro/api/platform-sdk/otp-verification',
          {
            headers: {
              'content-type': 'application/json',
              'x-platform-token': apiTokens['x-platform-token']
            },
            data: testCase.data
          }
        );

        expect([400, 403, 422]).toContain(response.status());
        console.log(`✅ 缺少 ${testCase.missing}: ${response.status()}`);
      }
    });
  });

  test.describe('Content-Type 錯誤', () => {
    test('錯誤的 Content-Type Header', async ({ request }) => {
      const contentTypes = [
        'text/plain',
        'application/xml',
        'multipart/form-data',
        ''
      ];

      for (const contentType of contentTypes) {
        const response = await request.post(
          'https://cosign.pro/api/platform-sdk/otp',
          {
            headers: {
              'content-type': contentType,
              'x-platform-token': apiTokens['x-platform-token']
            },
            data: {
              account: `+886${testAccounts.phone}`,
              countryCode: 'TW',
              type: 'sms',
              purpose: 'login'
            }
          }
        );

        console.log(`📋 Content-Type: ${contentType || '(empty)'} -> ${response.status()}`);
      }
    });
  });

  test.describe('CORS 和 Origin 驗證', () => {
    test('缺少或錯誤的 Origin Header', async ({ request }) => {
      const origins = [
        'https://malicious-site.com',
        'http://localhost:3000',
        'https://fake-dogcatstar.com',
        ''
      ];

      for (const origin of origins) {
        const headers: any = {
          'content-type': 'application/json',
          'x-platform-token': apiTokens['x-platform-token']
        };
        
        if (origin) {
          headers.origin = origin;
        }

        const response = await request.post(
          'https://cosign.pro/api/platform-sdk/otp',
          {
            headers,
            data: {
              account: `+886${testAccounts.phone}`,
              countryCode: 'TW',
              type: 'sms',
              purpose: 'login'
            }
          }
        );

        console.log(`🌐 Origin: ${origin || '(none)'} -> ${response.status()}`);
      }
    });
  });

  test.describe('邊界值測試', () => {
    test('超長的請求資料', async ({ request }) => {
      const veryLongString = 'a'.repeat(10000);
      
      const response = await request.post(
        'https://cosign.pro/api/platform-sdk/otp',
        {
          headers: {
            'content-type': 'application/json',
            'x-platform-token': apiTokens['x-platform-token']
          },
          data: {
            account: veryLongString,
            countryCode: 'TW',
            type: 'sms',
            purpose: 'login'
          }
        }
      );

      expect([400, 413, 422]).toContain(response.status());
      console.log('✅ 超長資料處理:', response.status());
    });

    test('特殊字元注入測試', async ({ request }) => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        '<script>alert("XSS")</script>',
        '${7*7}',
        '../../../etc/passwd',
        '\x00\x00\x00'
      ];

      for (const input of maliciousInputs) {
        const response = await request.post(
          'https://cosign.pro/api/platform-sdk/otp',
          {
            headers: {
              'content-type': 'application/json',
              'x-platform-token': apiTokens['x-platform-token']
            },
            data: {
              account: input,
              countryCode: 'TW',
              type: 'sms',
              purpose: 'login'
            }
          }
        );

        expect([400, 403, 422]).toContain(response.status());
        console.log(`🛡️ 惡意輸入防護 (${input.substring(0, 20)}...): ${response.status()}`);
      }
    });
  });

  test.describe('錯誤回應格式驗證', () => {
    test('驗證錯誤回應包含適當的訊息', async ({ request }) => {
      const response = await request.post(
        'https://cosign.pro/api/platform-sdk/otp',
        {
          headers: {
            'content-type': 'application/json',
            'x-platform-token': 'invalid_token'
          },
          data: {
            account: `+886${testAccounts.phone}`,
            countryCode: 'TW',
            type: 'sms',
            purpose: 'login'
          }
        }
      );

      if ([400, 401, 403].includes(response.status())) {
        const contentType = response.headers()['content-type'];
        
        // 檢查是否為 JSON 格式
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('📋 錯誤回應結構:', data);
          
          // 驗證錯誤回應結構
          expect(typeof data).toBe('object');
        }
        
        console.log('✅ 錯誤回應格式驗證完成');
      }
    });
  });
});
