import { test } from '@playwright/test';
import accounts from '../../../fixtures/test-accounts.json';
import { LoginPage } from '../../../pages/login.page';

test.setTimeout(120000);

/**
 * TC-LOGIN-0402 Email 驗證失敗
 * 測試情境：使用 Email 登入後，輸入錯誤的 OTP 驗證碼
 * 預期結果：顯示「驗證碼過期，請重新傳送驗證碼！」錯誤訊息
 * 註：此測試已優化按鈕點擊穩定性，可連續多次執行
 */
test('TC-LOGIN-0402 Email 驗證失敗', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // 切換到 Email 登入
  await loginPage.switchToEmailLogin();
  
  // 填寫 Email 並送出（使用優化過的穩定點擊）
  await loginPage.fillEmail(accounts.email);
  await loginPage.clickConfirmButton();
  
  // 輸入錯誤的 OTP（全部填 0）
  await loginPage.fillOTP('000000');
  
  // 驗證錯誤訊息顯示
  await loginPage.expectErrorMessage('驗證碼過期，請重新傳送驗證碼！');
});