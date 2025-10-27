import { test } from '@playwright/test';
import accounts from '../../../fixtures/test-accounts.json';
import { LoginPage } from '../../../pages/login.page';

const storageStatePath = 'fixtures/authStorageState.json';

test.setTimeout(60000);

/**
 * 登入成功並儲存 storageState
 * 
 * 用途：此測試用於建立並儲存已登入的瀏覽器狀態（cookies、localStorage 等）
 *      供後續測試重用，避免每次測試都需要重新登入
 * 
 * 測試流程：
 *   1. 進入登入頁面
 *   2. 輸入手機號碼並送出
 *   3. 手動輸入真實 OTP 驗證碼（使用 page.pause()）
 *   4. 驗證登入成功
 *   5. 將登入狀態儲存到 fixtures/authStorageState.json
 * 
 * 執行時機：
 *   - 當 storageState 過期或失效時
 *   - 需要更新測試帳號的登入狀態時
 *   - 首次設定測試環境時
 * 
 * 使用方式：
 *   其他測試可透過 test.use({ storageState: 'fixtures/authStorageState.json' })
 *   或 browser.newContext({ storageState: '...' }) 來載入已登入狀態
 */
test('登入成功並儲存 storageState', async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // 輸入手機號碼並送出
  await loginPage.fillPhone(accounts.phone);
  await loginPage.submitPhone();
  
  // 暫停讓使用者手動輸入 OTP
  await page.pause();
  
  // 驗證登入成功
  await loginPage.expectLoginSuccess();
  
  // 儲存登入狀態到檔案
  await context.storageState({ path: storageStatePath });
  console.log(`✅ 登入狀態已儲存至 ${storageStatePath}`);
});
