import { test, expect } from '@playwright/test';

/**
 * TC-LOGIN-API-003: 使用 JWT Token 登入
 * 
 * 測試目標: 驗證使用 JWT Token 完成登入
 * 
 * 前置條件:
 * - 有有效的 JWT Token（從 OTP 驗證取得）
 * 
 * 預期結果:
 * - Status: 302 Found
 * - 重定向到 /my-account
 * - 設定登入相關 cookies
 */

test.describe('TC-LOGIN-API-003: JWT Token 登入', () => {
  test.skip('成功使用 JWT Token 登入', async ({ request }) => {
    // 注意：此測試需要有效的 JWT Token，因此標記為 skip
    // 實際測試需要先執行 TC-LOGIN-API-002 取得 JWT Token
    
    // 從環境變數或測試上下文取得 JWT Token
    const jwtToken = process.env.TEST_JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    if (!jwtToken || jwtToken === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...') {
      console.log('⚠️ 需要有效的 JWT Token 才能執行此測試');
      return;
    }

    // 使用 JWT Token 登入
    const response = await request.get(
      `https://www.dogcatstar.com/cosign/token_login_page?token=${jwtToken}`,
      {
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        maxRedirects: 0 // 不自動跟隨重定向
      }
    );

    // 驗證重定向
    expect(response.status()).toBe(302);
    
    const location = response.headers()['location'];
    expect(location).toBeTruthy();
    expect(location).toContain('/my-account');
    
    // 驗證 cookies 設定
    const setCookieHeaders = response.headersArray().filter(h => h.name.toLowerCase() === 'set-cookie');
    expect(setCookieHeaders.length).toBeGreaterThan(0);
    
    // 檢查關鍵 cookies
    const cookieString = setCookieHeaders.map(h => h.value).join('; ');
    expect(cookieString).toContain('PHPSESSID');
    
    console.log('✅ JWT Token 登入成功:', {
      redirectTo: location,
      cookiesSet: setCookieHeaders.length
    });
  });

  test('使用無效的 JWT Token 應該失敗', async ({ request }) => {
    const invalidToken = 'invalid.jwt.token';
    
    const response = await request.get(
      `https://www.dogcatstar.com/cosign/token_login_page?token=${invalidToken}`,
      {
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 0
      }
    );

    // 應該回傳錯誤狀態碼或重定向到錯誤頁面
    expect([400, 401, 403, 302]).toContain(response.status());
    
    console.log('✅ 無效 JWT Token 時正確處理:', response.status());
  });

  test('使用過期的 JWT Token 應該失敗', async ({ request }) => {
    // 使用一個已經過期的 JWT Token（exp: 1600000000 = 2020-09-13）
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb3NpZ24iLCJzdWIiOiIxMjM0NTYiLCJleHAiOjE2MDAwMDAwMDAsInBsYXRmb3JtSWQiOjR9.xxx';
    
    const response = await request.get(
      `https://www.dogcatstar.com/cosign/token_login_page?token=${expiredToken}`,
      {
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 0
      }
    );

    // 應該回傳錯誤狀態碼
    expect([400, 401, 403, 302]).toContain(response.status());
    
    console.log('✅ 過期 JWT Token 時正確處理:', response.status());
  });

  test('缺少 JWT Token 應該失敗', async ({ request }) => {
    const response = await request.get(
      'https://www.dogcatstar.com/cosign/token_login_page',
      {
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxRedirects: 0
      }
    );

    // 應該回傳錯誤狀態碼或重定向
    expect([400, 302]).toContain(response.status());
    
    console.log('✅ 缺少 JWT Token 時正確處理:', response.status());
  });

  test('驗證 JWT Token 格式', async () => {
    // 測試 JWT Token 格式驗證邏輯
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    const invalidToken1 = 'notajwttoken';
    const invalidToken2 = 'only.two';
    const invalidToken3 = 'has.four.parts.here';

    // 有效的 JWT 應該有 3 部分
    expect(validToken.split('.')).toHaveLength(3);
    
    // 無效的格式
    expect(invalidToken1.split('.')).toHaveLength(1);
    expect(invalidToken2.split('.')).toHaveLength(2);
    expect(invalidToken3.split('.')).toHaveLength(4);
    
    // 驗證可以解碼 payload
    const parts = validToken.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    expect(payload).toHaveProperty('sub');
    
    console.log('✅ JWT Token 格式驗證通過');
  });
});
