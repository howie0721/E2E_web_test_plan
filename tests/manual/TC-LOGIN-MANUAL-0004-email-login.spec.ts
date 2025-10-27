import { test } from '@playwright/test';
import accounts from '../../fixtures/test-accounts.json';
import { LoginPage } from '../../pages/login.page';

test.setTimeout(60000);

/**
 * TC-LOGIN-0401 Email 登入成功（半自動）
 * 測試情境：使用 Email 登入，手動輸入真實 OTP 驗證碼
 * 預期結果：登入成功後，應能看到「我的點數」按鈕（已登入狀態）
 * 註：此測試需要手動輸入 OTP，使用 page.pause() 暫停
 */
test('TC-LOGIN-0401 Email 登入成功', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // 切換到 Email 登入
  await loginPage.switchToEmailLogin();
  
  // 填寫 Email 並送出
  await loginPage.fillEmail(accounts.email);
  await loginPage.clickConfirmButton();
  
  // 暫停讓使用者手動輸入 OTP
  await page.pause();
  
  await loginPage.expectLoginSuccess();
});