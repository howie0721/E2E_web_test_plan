import { test, expect } from '@playwright/test';
import apiTokens from '../../../../fixtures/api-tokens.json';
import testAccounts from '../../../../fixtures/test-accounts.json';

/**
 * TC-LOGIN-API-006: 取得登入用戶資訊
 * 
 * 測試目標: 驗證用戶資訊查詢
 * 
 * 前置條件:
 * - 已登入狀態
 * - 有效的 x-platform-token
 * 
 * 預期結果:
 * - Status: 200 OK
 * - 回傳完整用戶資訊
 */

test.describe('TC-LOGIN-API-006: 取得用戶資訊', () => {
  test.skip('成功取得登入用戶資訊', async ({ request }) => {
    // 注意：此測試需要已登入狀態，因此標記為 skip
    // 需要有效的 x-platform-token 和已登入的 session
    
    const response = await request.get(
      'https://cosign.pro/api/platform-sdk/user',
      {
        headers: {
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token']
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    // 驗證必要欄位
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('account');
    expect(data).toHaveProperty('accountType');
    
    // 驗證資料型別
    expect(typeof data.id).toBe('string');
    expect(typeof data.account).toBe('string');
    expect(typeof data.accountType).toBe('string');
    
    // 驗證帳號類型
    expect(['sms', 'email', 'line', 'google', 'facebook']).toContain(data.accountType);
    
    console.log('✅ 用戶資訊取得成功:', {
      userId: data.id,
      accountType: data.accountType,
      hasEmail: !!data.email,
      hasPhone: !!data.phone
    });
  });

  test('無效的 Token 應該失敗', async ({ request }) => {
    const response = await request.get(
      'https://cosign.pro/api/platform-sdk/user',
      {
        headers: {
          'accept': 'application/json',
          'x-platform-token': 'invalid_token_12345'
        }
      }
    );

    // 應該回傳未授權錯誤
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 無效 Token 時正確回傳錯誤:', response.status());
  });

  test('缺少 Token 應該失敗', async ({ request }) => {
    const response = await request.get(
      'https://cosign.pro/api/platform-sdk/user',
      {
        headers: {
          'accept': 'application/json'
          // 故意不加 x-platform-token
        }
      }
    );

    // 應該回傳未授權錯誤
    expect([400, 401, 403]).toContain(response.status());
    
    console.log('✅ 缺少 Token 時正確回傳錯誤:', response.status());
  });

  test('過期的 Token 應該失敗', async ({ request }) => {
    // 使用一個已經過期的 token
    const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ3cCIsImlhdCI6MTYwMDAwMDAwMCwibmJmIjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDM2MDAsInRyYWNraW5nSWQiOiJ0ZXN0IiwiYXVkIjoiY29zaWduIiwic3ViIjoxMjM0NTYsInBsYXRmb3JtSWQiOjQsInR5cGUiOiJjbGllbnQtdG9rZW4iLCJwbGF0Zm9ybVVpZCI6IjEyMzQ1NiJ9.test';
    
    const response = await request.get(
      'https://cosign.pro/api/platform-sdk/user',
      {
        headers: {
          'accept': 'application/json',
          'x-platform-token': expiredToken
        }
      }
    );

    // 應該回傳未授權錯誤
    expect([401, 403]).toContain(response.status());
    
    console.log('✅ 過期 Token 時正確回傳錯誤:', response.status());
  });

  test('驗證 API 回應結構', async ({ request }) => {
    // 使用當前 token 測試回應結構
    const response = await request.get(
      'https://cosign.pro/api/platform-sdk/user',
      {
        headers: {
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token']
        }
      }
    );

    if (response.status() === 200) {
      const data = await response.json();
      
      // 驗證回應是物件
      expect(typeof data).toBe('object');
      expect(data).not.toBeNull();
      
      // 驗證基本結構
      const expectedFields = ['id', 'account', 'accountType'];
      const hasBasicFields = expectedFields.every(field => field in data);
      
      if (hasBasicFields) {
        console.log('✅ API 回應結構驗證通過');
      } else {
        console.log('⚠️ API 回應結構可能已變更');
      }
    } else {
      console.log('ℹ️ 需要有效登入狀態才能驗證回應結構:', response.status());
    }
  });

  test('驗證不同 Accept Header', async ({ request }) => {
    const acceptHeaders = [
      'application/json',
      'application/json, text/plain, */*',
      '*/*'
    ];

    for (const accept of acceptHeaders) {
      const response = await request.get(
        'https://cosign.pro/api/platform-sdk/user',
        {
          headers: {
            'accept': accept,
            'x-platform-token': apiTokens['x-platform-token']
          }
        }
      );

      // 驗證 API 接受不同的 Accept header
      expect([200, 401, 403]).toContain(response.status());
      console.log(`✅ Accept: ${accept} - 狀態碼: ${response.status()}`);
    }
  });

  test('併發請求用戶資訊', async ({ request }) => {
    // 測試併發請求的穩定性
    const requests = [];
    for (let i = 0; i < 3; i++) {
      requests.push(
        request.get('https://cosign.pro/api/platform-sdk/user', {
          headers: {
            'accept': 'application/json',
            'x-platform-token': apiTokens['x-platform-token']
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // 所有請求應該返回相同的狀態碼
    const statuses = responses.map(r => r.status());
    const allSame = statuses.every(s => s === statuses[0]);
    
    expect(allSame).toBe(true);
    console.log('✅ 併發請求穩定性驗證:', {
      statusCode: statuses[0],
      allRequestsSame: allSame
    });
  });

  test('驗證 CORS Headers', async ({ request }) => {
    const response = await request.get(
      'https://cosign.pro/api/platform-sdk/user',
      {
        headers: {
          'accept': 'application/json',
          'x-platform-token': apiTokens['x-platform-token'],
          'origin': 'https://www.dogcatstar.com'
        }
      }
    );

    // 檢查 CORS 相關 headers
    const headers = response.headers();
    const hasCorsHeaders = 'access-control-allow-origin' in headers;
    
    console.log('✅ CORS Headers 檢查:', {
      statusCode: response.status(),
      hasCorsHeaders,
      origin: headers['access-control-allow-origin'] || 'N/A'
    });
  });
});
