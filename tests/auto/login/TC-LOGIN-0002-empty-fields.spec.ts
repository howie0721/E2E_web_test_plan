import { test } from '@playwright/test';
import { LoginPage } from '../../../pages/login.page';

test.setTimeout(30000);

/**
 * TC-LOGIN-0002 手機號碼欄位為空時按鈕不可點擊
 * 測試情境：進入登入頁面但不填寫任何資料
 * 預期結果：「登入/註冊」按鈕應為 disabled 狀態
 */
test('TC-LOGIN-0003 手機號碼欄位為空時按鈕不可點擊', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // 驗證登入/註冊按鈕為 disabled
  await loginPage.expectLoginButtonState(true);
});