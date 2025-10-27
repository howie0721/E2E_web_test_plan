import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test.setTimeout(120000);

/**
 * TC-LOGIN-0201 Google 登入成功（半自動）
 * 測試情境：使用 Google OAuth 登入，手動授權後驗證登入成功
 * 測試流程：
 *   1. 進入登入頁面，點擊 Google 登入按鈕
 *   2. 跳轉到 Google 授權頁（https://accounts.google.com）
 *   3. 手動輸入 Google 帳密並授權（使用 page.pause()）
 *   4. 授權後自動跳回原站（my-account/?no-cache）
 *   5. 驗證登入成功（看到「我的點數」按鈕）
 * 預期結果：Google OAuth 登入流程正常，登入狀態正確
 * 註：此測試為半自動，需手動完成 Google 授權步驟
 */
test('TC-LOGIN-0201 Google 登入成功（半自動）', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // 點擊 Google 登入按鈕
  await loginPage.clickGoogleLogin();
  
  // 等待跳轉到 Google 授權頁
  await page.waitForURL(/https:\/\/accounts\.google\.com/);
  
  // 暫停讓使用者手動輸入 Google 帳密與授權
  await page.pause();
  
  // 授權後自動跳回原站，驗證登入成功
  await loginPage.waitForOAuthCallback();
  await loginPage.expectLoginSuccess();
});