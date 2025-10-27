import { test, expect } from '@playwright/test';

test.setTimeout(120000);

/**
 * TC-LOGIN-0501 登入狀態持久化（storageState 還原）
 * 測試情境：
 *   1. 建立乾淨的 context，驗證未登入狀態（應看到「登入/註冊」按鈕）
 *   2. 使用已儲存的 storageState 建立新 context，模擬已登入使用者
 *   3. 驗證登入狀態成功還原（應看到「我的點數」按鈕）
 * 預期結果：storageState 能正確還原登入狀態，無需重新登入
 * 用途：測試 session 持久化機制，確保使用者登入狀態可跨瀏覽器 context 保存
 */
test('TC-LOGIN-0501 登入狀態持久化（storageState 還原）', async ({ browser }) => {
  // 1) 建立乾淨的 context，確認未登入
  const cleanCtx = await browser.newContext();
  const cleanPage = await cleanCtx.newPage();
  await cleanPage.goto('https://www.dogcatstar.com/');
  
  // 先點擊 #my-account-anchor 再找登入/註冊按鈕
  await cleanPage.locator('#my-account-anchor:visible').click();
  const loginBtn = cleanPage.locator('button:has-text("登入/註冊")');
  await expect(loginBtn).toBeVisible({ timeout: 5000 });

  // 2) 使用已儲存的 storageState 建立新的 context（模擬使用者已登入）
  const storageStatePath = 'fixtures/authStorageState.json';
  const loggedCtx = await browser.newContext({ storageState: storageStatePath });
  const loggedPage = await loggedCtx.newPage();
  await loggedPage.goto('https://www.dogcatstar.com/');

  // 3) 進入會員區，驗證登入後的元素出現（以專案中常用的『我的點數』按鈕作為已登入判斷）
  await loggedPage.locator('#my-account-anchor:visible').click();
  const myPoints = loggedPage.locator('button:has-text("我的點數")');
  await expect(myPoints).toBeVisible({ timeout: 10000 });

  // 4) 關閉 contexts
  await cleanCtx.close();
  await loggedCtx.close();
});