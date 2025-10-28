import { test, expect } from '@playwright/test';
import apiTokens from '../../../../fixtures/api-tokens.json';
import testAccounts from '../../../../fixtures/test-accounts.json';

/**
 * TC-LOGIN-API-004: 檢查手機號碼是否已註冊
 * 
 * 測試目標: 驗證手機號碼註冊狀態查詢
 * 
 * 前置條件:
 * - 有效的 x-platform-token
 * - 測試手機號碼
 * 
 * 預期結果:
 * - Status: 200 OK
 * - 回傳 { "registered": true/false }
 */

test.describe('TC-LOGIN-API-004: 檢查手機號碼是否已註冊', () => {
  test('檢查已註冊的手機號碼', async ({ request }) => {
    const testPhone = `+886${testAccounts.phone}`;
    
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/registered',
      {
        params: {
          login_type: 'sms',
          identifier: testPhone
        },
        headers: {
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('is_registered');
    expect(typeof data.is_registered).toBe('boolean');
    
    console.log('✅ 手機號碼註冊狀態查詢成功:', {
      phone: testPhone,
      registered: data.is_registered
    });
  });

  test('檢查未註冊的手機號碼', async ({ request }) => {
    // 使用一個不太可能註冊的測試號碼
    const unregisteredPhone = '+886900000001';
    
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/registered',
      {
        params: {
          login_type: 'sms',
          identifier: unregisteredPhone
        },
        headers: {
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('is_registered');
    expect(typeof data.is_registered).toBe('boolean');
    
    console.log('✅ 未註冊手機號碼查詢成功:', {
      phone: unregisteredPhone,
      registered: data.is_registered
    });
  });

  test('檢查 Email 類型的帳號', async ({ request }) => {
    const testEmail = testAccounts.email;
    
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/registered',
      {
        params: {
          login_type: 'email',
          identifier: testEmail
        },
        headers: {
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('is_registered');
    expect(typeof data.is_registered).toBe('boolean');
    
    console.log('✅ Email 註冊狀態查詢成功:', {
      email: testEmail,
      registered: data.is_registered
    });
  });

  test('無效的 Token 應該失敗', async ({ request }) => {
    const testPhone = `+886${testAccounts.phone}`;
    
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/registered',
      {
        params: {
          login_type: 'sms',
          identifier: testPhone
        },
        headers: {
          'accept': 'application/json',
          'x-platform-token': 'invalid_token_12345',
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        }
      }
    );

    // 應該回傳未授權錯誤
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 無效 Token 時正確回傳錯誤:', response.status());
  });

  test('缺少必要參數應該失敗', async ({ request }) => {
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/registered',
      {
        params: {
          // 缺少 login_type 和 identifier
        },
        headers: {
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        }
      }
    );

    // 應該回傳錯誤狀態碼
    expect([400, 422]).toContain(response.status());
    
    console.log('✅ 缺少必要參數時正確回傳錯誤:', response.status());
  });

  test('無效的手機號碼格式應該失敗', async ({ request }) => {
    const invalidPhone = '12345'; // 無效格式
    
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/registered',
      {
        params: {
          login_type: 'sms',
          identifier: invalidPhone
        },
        headers: {
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'referer': 'https://www.dogcatstar.com/visitor-my-account'
        }
      }
    );

    // 應該回傳錯誤狀態碼或 false
    if (response.status() === 200) {
      const data = await response.json();
      expect(data.is_registered).toBe(false);
    } else {
      expect([400, 422]).toContain(response.status());
    }
    
    console.log('✅ 無效手機號碼格式處理正確:', response.status());
  });

  test('支援不同的登入類型', async ({ request }) => {
    const loginTypes = ['sms', 'email'];
    const testPhone = `+886${testAccounts.phone}`;
    
    for (const loginType of loginTypes) {
      const identifier = loginType === 'sms' ? testPhone : testAccounts.email;
      
      const response = await request.get(
        'https://www.dogcatstar.com/dni/mu/user/registered',
        {
          params: {
            login_type: loginType,
            identifier: identifier
          },
          headers: {
            'accept': 'application/json',
            'x-platform-token': apiTokens['x-platform-token'],
            'referer': 'https://www.dogcatstar.com/visitor-my-account'
          }
        }
      );

      expect(response.status()).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('is_registered');
      
      console.log(`✅ ${loginType} 類型查詢成功:`, data.is_registered);
    }
  });
});
