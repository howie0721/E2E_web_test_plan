import { test } from '@playwright/test';
import accounts from '../../fixtures/test-accounts.json';
import { LoginPage } from '../../pages/login.page';

test.setTimeout(60000);

/**
 * TC-LOGIN-0001 會員登入成功（半自動）
 * 測試情境：使用手機號碼登入，手動輸入真實 OTP 驗證碼
 * 預期結果：登入成功後，應能看到「我的點數」按鈕（已登入狀態）
 * 註：此測試需要手動輸入 OTP，使用 page.pause() 暫停
 */
test('TC-LOGIN-0001 會員登入成功', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillPhone(accounts.phone);
  await loginPage.submitPhone();
  
  // 暫停讓使用者手動輸入 OTP
  await page.pause();
  
  await loginPage.expectLoginSuccess();
});