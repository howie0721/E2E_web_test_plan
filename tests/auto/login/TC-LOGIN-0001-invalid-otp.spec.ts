import { test } from '@playwright/test';
import accounts from '../../../fixtures/test-accounts.json';
import { LoginPage } from '../../../pages/login.page';

test.setTimeout(120000);

/**
 * TC-LOGIN-0002 手機號碼 OTP 錯誤登入失敗
 * 測試情境：輸入正確手機號碼後，輸入錯誤的 OTP 驗證碼
 * 預期結果：顯示「驗證碼過期，請重新傳送驗證碼！」錯誤訊息
 */
test('TC-LOGIN-0002 手機號碼 OTP 錯誤登入失敗', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillPhone(accounts.phone);
  await loginPage.submitPhone();
  
  // 輸入錯誤的 OTP（全部填 0）
  await loginPage.fillOTP('000000');
  
  // 驗證錯誤訊息顯示
  await loginPage.expectErrorMessage('驗證碼過期，請重新傳送驗證碼！');
});