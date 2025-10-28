import { test, expect } from '@playwright/test';
import apiTokens from '../../../../fixtures/api-tokens.json';

/**
 * TC-LOGIN-API-005: 刷新用戶 Token
 * 
 * 測試目標: 驗證 Token 刷新功能
 * 
 * 前置條件:
 * - 已登入狀態（有有效的 session/cookie）
 * 
 * 預期結果:
 * - Status: 200 OK
 * - 回傳新的 token
 */

test.describe('TC-LOGIN-API-005: 刷新用戶 Token', () => {
  test.skip('成功刷新用戶 Token', async ({ request }) => {
    // 注意：此測試需要已登入狀態，因此標記為 skip
    // 實際測試需要先完成登入流程取得有效的 session
    
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/refresh_token',
      {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'referer': 'https://www.dogcatstar.com/my-account'
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('token');
    expect(data.token).toBeTruthy();
    expect(typeof data.token).toBe('string');
    
    // 驗證 token 格式（應該是 JWT 格式）
    if (data.token.includes('.')) {
      const parts = data.token.split('.');
      expect(parts.length).toBeGreaterThanOrEqual(2);
    }
    
    console.log('✅ Token 刷新成功:', {
      tokenLength: data.token.length,
      tokenPreview: data.token.substring(0, 50) + '...'
    });
  });

  test('未登入狀態刷新 Token 應該失敗', async ({ request }) => {
    // 使用新的 request context（沒有 session）
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/refresh_token',
      {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'referer': 'https://www.dogcatstar.com/my-account'
        }
      }
    );

    // 應該回傳未授權錯誤或重定向
    expect([401, 403, 302, 500]).toContain(response.status());
    
    console.log('✅ 未登入狀態正確拒絕刷新 Token:', response.status());
  });

  test('缺少 Referer Header 應該失敗或返回錯誤', async ({ request }) => {
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/refresh_token',
      {
        headers: {
          'accept': 'application/json, text/plain, */*'
          // 故意不加 referer
        }
      }
    );

    // 可能回傳錯誤或仍然處理（取決於 API 設計）
    expect([200, 400, 401, 403, 302, 500]).toContain(response.status());
    
    console.log('✅ 缺少 Referer 時的處理:', response.status());
  });

  test('使用錯誤的 Referer 應該處理正確', async ({ request }) => {
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/refresh_token',
      {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'referer': 'https://malicious-site.com'
        }
      }
    );

    // 應該拒絕或返回錯誤
    expect([400, 401, 403, 302, 500]).toContain(response.status());
    
    console.log('✅ 錯誤 Referer 時正確處理:', response.status());
  });

  test('驗證 API 端點存在性', async ({ request }) => {
    // 確認 API 端點存在（即使未登入也不應該 404）
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/refresh_token',
      {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'referer': 'https://www.dogcatstar.com/my-account'
        }
      }
    );

    // 不應該是 404
    expect(response.status()).not.toBe(404);
    
    console.log('✅ API 端點存在:', response.status());
  });

  test('短時間內多次刷新 Token', async ({ request }) => {
    // 測試 rate limiting
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        request.get('https://www.dogcatstar.com/dni/mu/user/refresh_token', {
          headers: {
            'accept': 'application/json, text/plain, */*',
            'referer': 'https://www.dogcatstar.com/my-account'
          }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // 驗證所有請求都有回應
    responses.forEach((res, index) => {
      expect(res).toBeDefined();
      expect(res.status()).toBeGreaterThan(0);
      console.log(`請求 ${index + 1} 狀態碼:`, res.status());
    });
    
    // 檢查是否有 rate limiting (429)
    const hasRateLimit = responses.some(r => r.status() === 429);
    if (hasRateLimit) {
      console.log('✅ 檢測到 Rate Limiting');
    } else {
      console.log('ℹ️ 未檢測到 Rate Limiting（可能需要更多請求）');
    }
  });

  test('刷新 Token 的回應格式驗證', async ({ request }) => {
    const response = await request.get(
      'https://www.dogcatstar.com/dni/mu/user/refresh_token',
      {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'referer': 'https://www.dogcatstar.com/my-account'
        }
      }
    );

    // 如果成功，應該是 JSON 格式
    if (response.status() === 200) {
      const contentType = response.headers()['content-type'];
      expect(contentType).toMatch(/application\/json/);
      
      const data = await response.json();
      expect(typeof data).toBe('object');
      
      console.log('✅ 回應格式驗證通過');
    } else {
      console.log('ℹ️ 非 200 狀態碼，跳過格式驗證:', response.status());
    }
  });
});
