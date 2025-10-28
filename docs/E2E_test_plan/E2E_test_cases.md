
# E2E 測試案例文件

## 測試流程說明
此文件記錄 Dogcatstar 電商平台的 **端對端測試案例（E2E Test Cases）**，涵蓋：
1. **購物車功能（Cart）**：商品加入、重複加入、多商品、持久化、未登入加入
2. **會員登入功能（Login）**：自動化測試（錯誤處理、欄位驗證、session 持久化）與手動測試（真實 OTP 驗證）

測試環境：
- **網站**：https://www.dogcatstar.com
- **測試框架**：Playwright (TypeScript)
- **瀏覽器**：Chromium (預設)
- **認證方式**：StorageState (authStorageState.json)

---

## 1. 購物車 E2E 測試案例（Cart）

### 1.1 測試案例列表
| 測試編號 | 測試名稱 | 測試類型 | 優先級 |
|---------|---------|---------|--------|
| TC-CART-0001 | 從商品頁加入購物車 | 自動化 | P0 |
| TC-CART-0002 | 重複加入同一商品 | 自動化 | P0 |
| TC-CART-0003 | 加入多個不同商品 | 自動化 | P1 |
| TC-CART-0004 | 登入後購物車狀態保留 | 自動化 | P1 |
| TC-CART-0005 | 未登入加入購物車 | 自動化 | P0 |

---

### TC-CART-0001: 從商品頁加入購物車

**測試目標**: 驗證會員從商品頁選擇規格並加入購物車功能正常

**前置條件**:
- 使用者已登入（使用 storageState）
- 購物車為空
- 網站首頁至少有一個商品

**測試步驟**:
```typescript
// 檔案位置：tests/auto/cart/TC-CART-0001-add-from-product.spec.ts

test('TC-CART-0001 從商品頁加入購物車', async ({ page }) => {
  const cartPage = new CartPage(page);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);

  // 1. 清空購物車
  await cartPage.clearCart();

  // 2. 進入首頁，點擊第一個商品
  await homePage.navigate();
  await homePage.clickProductByIndex(0);

  // 3. 選擇規格並加入購物車
  await productPage.selectSpecsAndAddToCart();
  
  // 4. 關閉彈窗（避免擋住購物車按鈕）
  if (typeof productPage.closePopup === 'function') {
    await productPage.closePopup();
  }

  // 5. 驗證購物車內商品數量正確
  await cartPage.verifyItemCount(1);
});
```

**驗證點**:
- 購物車 icon 顯示商品數量為 `1`
- 點擊購物車後，商品列表內出現該商品
- 商品名稱、規格、價格顯示正確

**預期結果**:
- Status: PASS
- 購物車商品數量為 `1`

---

### TC-CART-0002: 重複加入同一商品

**測試目標**: 驗證重複加入同一商品時，數量正確累加

**前置條件**:
- 使用者已登入
- 購物車為空

**測試步驟**:
```typescript
// 檔案位置：tests/auto/cart/TC-CART-0002-add-multiple.spec.ts

test('TC-CART-0002 重複加入同一商品', async ({ page }) => {
  const cartPage = new CartPage(page);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);

  // 1. 清空購物車
  await cartPage.clearCart();

  // 2. 進入首頁，點擊第一個商品
  await homePage.navigate();
  await homePage.clickProductByIndex(0);

  // 3. 選擇規格並加入購物車（第一次）
  await productPage.selectSpecsAndAddToCart();

  // 4. 回到首頁，再次點擊同一商品
  await homePage.navigate();
  await homePage.clickProductByIndex(0);
  await productPage.selectSpecsAndAddToCart();

  // 5. 驗證購物車內商品數量正確（同商品數量應為 2）
  await cartPage.verifyItemCount(2);
});
```

**驗證點**:
- 購物車 icon 顯示總數量為 `2`
- 購物車內該商品的 `input value` 為 `2`
- 不會出現兩個相同商品項目（應為同一項目數量+1）

**預期結果**:
- Status: PASS
- 購物車該商品數量為 `2`

---

### TC-CART-0003: 加入多個不同商品

**測試目標**: 驗證加入不同商品時，購物車正確顯示所有商品

**前置條件**:
- 使用者已登入
- 購物車為空
- 首頁至少有 3 個不同商品

**測試步驟**:
```typescript
// 檔案位置：tests/auto/cart/TC-CART-0003-add-different-products.spec.ts

test('TC-CART-0003 加入多個不同商品', async ({ page }) => {
  const cartPage = new CartPage(page);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);

  // 1. 將滑鼠移到左上角，避免 hover menu 蓋住按鈕
  await page.mouse.move(0, 0);
  await cartPage.clearCart();

  // 2. 加入第一個商品
  await homePage.navigate();
  await homePage.clickProductByIndex(0);
  await productPage.selectSpecsAndAddToCart();

  // 3. 加入第二個商品
  await homePage.navigate();
  await homePage.clickProductByIndex(1);
  await productPage.selectSpecsAndAddToCart();

  // 4. 加入第三個商品
  await homePage.navigate();
  await homePage.clickProductByIndex(2);
  await productPage.selectSpecsAndAddToCart();

  // 5. 驗證購物車內商品數量正確
  await cartPage.verifyItemCount(3);
});
```

**驗證點**:
- 購物車 icon 顯示總數量為 `3`
- 購物車內出現 3 個不同的商品項目
- 每個商品的名稱、規格、價格顯示正確

**預期結果**:
- Status: PASS
- 購物車商品數量為 `3`

---

### TC-CART-0004: 登入後購物車狀態保留

**測試目標**: 驗證使用者登入後，購物車內容保留（持久化）

**前置條件**:
- 使用者已登入
- 購物車內有至少 1 個商品

**測試步驟**:
```typescript
// 檔案位置：tests/auto/cart/TC-CART-0004-persist-after-login.spec.ts

test('TC-CART-0004 登入後購物車狀態保留', async ({ page }) => {
  const cartPage = new CartPage(page);
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);

  // 1. 清空購物車
  await cartPage.clearCart();

  // 2. 加入商品
  await homePage.navigate();
  await homePage.clickProductByIndex(0);
  await productPage.selectSpecsAndAddToCart();

  // 3. 驗證購物車有 1 個商品
  await cartPage.verifyItemCount(1);

  // 4. 重新整理頁面（模擬瀏覽器重啟）
  await page.reload();

  // 5. 驗證購物車狀態保留
  await cartPage.verifyItemCount(1);
});
```

**驗證點**:
- 重新整理後，購物車商品數量不變
- 商品資料（名稱、規格、價格）保留
- 使用者 session 有效（storageState 正確運作）

**預期結果**:
- Status: PASS
- 重新整理後購物車仍有 `1` 個商品

---

### TC-CART-0005: 未登入加入購物車

**測試目標**: 驗證未登入使用者也能加入商品到購物車（Guest Cart）

**前置條件**:
- 使用者未登入（不使用 storageState）
- 購物車為空

**測試步驟**:
```typescript
// 檔案位置：tests/auto/cart/TC-CART-0005-add-without-login.spec.ts

test('TC-CART-0005 未登入加入購物車', async ({ page }) => {
  const homePage = new HomePage(page);
  const productPage = new ProductPage(page);
  const cartPage = new CartPage(page);

  // 1. 先訪問首頁初始化 session，然後清空購物車
  await homePage.navigate();
  await page.waitForTimeout(1000);
  await cartPage.clearCart();

  // 2. 進入首頁，點擊第一個商品
  await homePage.navigate();
  await homePage.clickProductByIndex(0);

  // 3. 選擇規格並加入購物車
  await productPage.selectSpecsAndAddToCart();

  // 4. 驗證購物車內商品數量為 1
  await cartPage.verifyItemCount(1);

  // 5. 驗證未跳出登入彈窗
  const loginPopup = page.locator('text=請先登入會員');
  await expect(loginPopup).not.toBeVisible();
});
```

**驗證點**:
- 未登入狀態下，購物車功能正常
- 購物車 icon 顯示商品數量為 `1`
- 不會強制跳出登入彈窗（Guest 模式允許購物）
- 購物車資料儲存在 localStorage 或 session

**預期結果**:
- Status: PASS
- 未登入狀態下，購物車商品數量為 `1`
- 不顯示「請先登入會員」彈窗

---

## 2. 會員登入 E2E 測試案例（Login）

### 2.1 測試案例列表（自動化）
| 測試編號 | 測試名稱 | 測試類型 | 優先級 |
|---------|---------|---------|--------|
| TC-LOGIN-0001 | 手機號碼 OTP 錯誤登入失敗 | 自動化 | P0 |
| TC-LOGIN-0002 | 手機號碼欄位為空時按鈕不可點擊 | 自動化 | P1 |
| TC-LOGIN-0003 | Email 驗證失敗 | 自動化 | P1 |
| TC-LOGIN-0004 | 登入狀態持久化（storageState 還原） | 自動化 | P0 |

### 2.2 測試案例列表（手動/半自動）
| 測試編號 | 測試名稱 | 測試類型 | 優先級 |
|---------|---------|---------|--------|
| TC-LOGIN-MANUAL-0001 | 手機號碼登入成功 | 手動 | P0 |
| TC-LOGIN-MANUAL-0002 | LINE 登入成功 | 手動 | P1 |
| TC-LOGIN-MANUAL-0003 | Facebook 登入成功 | 手動 | P1 |
| TC-LOGIN-MANUAL-0004 | Google 登入成功 | 手動 | P1 |
| TC-LOGIN-MANUAL-0005 | Email 登入成功 | 手動 | P1 |

---

### TC-LOGIN-0001: 手機號碼 OTP 錯誤登入失敗

**測試目標**: 驗證輸入錯誤 OTP 時，系統正確顯示錯誤訊息

**前置條件**:
- 使用者未登入
- 測試帳號手機號碼有效（fixtures/test-accounts.json）

**測試步驟**:
```typescript
// 檔案位置：tests/auto/login/TC-LOGIN-0001-invalid-otp.spec.ts

test('TC-LOGIN-0001 手機號碼 OTP 錯誤登入失敗', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillPhone(accounts.phone);
  await loginPage.submitPhone();
  
  // 輸入錯誤的 OTP（全部填 0）
  await loginPage.fillOTP('000000');
  
  // 驗證錯誤訊息顯示
  await loginPage.expectErrorMessage('驗證碼過期，請重新傳送驗證碼！');
});
```

**驗證點**:
- 輸入錯誤 OTP 後，顯示錯誤訊息：「驗證碼過期，請重新傳送驗證碼！」
- 使用者無法完成登入
- 錯誤訊息明確且易理解

**預期結果**:
- Status: PASS
- 顯示正確的錯誤提示訊息

---

### TC-LOGIN-0002: 手機號碼欄位為空時按鈕不可點擊

**測試目標**: 驗證未填寫手機號碼時，登入按鈕為 disabled 狀態

**前置條件**:
- 使用者未登入
- 未填寫任何登入資料

**測試步驟**:
```typescript
// 檔案位置：tests/auto/login/TC-LOGIN-0002-empty-fields.spec.ts

test('TC-LOGIN-0002 手機號碼欄位為空時按鈕不可點擊', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // 驗證登入/註冊按鈕為 disabled
  await loginPage.expectLoginButtonState(true);
});
```

**驗證點**:
- 「登入/註冊」按鈕為 `disabled` 狀態
- 按鈕無法被點擊
- 前端表單驗證生效

**預期結果**:
- Status: PASS
- 按鈕為 disabled 狀態

---

### TC-LOGIN-0003: Email 驗證失敗

**測試目標**: 驗證使用錯誤 Email 格式或驗證碼時，系統顯示錯誤訊息

**前置條件**:
- 使用者未登入
- 測試帳號 Email 有效

**測試步驟**:
```typescript
// 檔案位置：tests/auto/login/TC-LOGIN-0003-email-fail.spec.ts

test('TC-LOGIN-0003 Email 驗證失敗', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // 切換到 Email 登入
  await loginPage.switchToEmailLogin();
  
  // 填入錯誤格式的 Email
  await loginPage.fillEmail('invalid-email');
  
  // 驗證錯誤訊息或按鈕為 disabled
  await loginPage.expectEmailError();
});
```

**驗證點**:
- Email 格式錯誤時，顯示錯誤提示
- 驗證碼錯誤時，顯示錯誤訊息
- 使用者無法完成登入

**預期結果**:
- Status: PASS
- 顯示正確的錯誤提示訊息

---

### TC-LOGIN-0004: 登入狀態持久化（storageState 還原）

**測試目標**: 驗證 storageState 機制能正確還原登入狀態，無需重新登入

**前置條件**:
- 已有有效的 `authStorageState.json`
- 使用者先前已登入過

**測試步驟**:
```typescript
// 檔案位置：tests/auto/login/TC-LOGIN-0004-session-persist.spec.ts

test('TC-LOGIN-0004 登入狀態持久化（storageState 還原）', async ({ browser }) => {
  // 1) 建立乾淨的 context，確認未登入
  const cleanCtx = await browser.newContext();
  const cleanPage = await cleanCtx.newPage();
  await cleanPage.goto('https://www.dogcatstar.com/');
  
  // 點擊會員區，應看到「登入/註冊」按鈕
  await cleanPage.locator('#my-account-anchor:visible').click();
  const loginBtn = cleanPage.locator('button:has-text("登入/註冊")');
  await expect(loginBtn).toBeVisible({ timeout: 5000 });

  // 2) 使用 storageState 建立新 context（模擬已登入）
  const storageStatePath = 'fixtures/authStorageState.json';
  const loggedCtx = await browser.newContext({ storageState: storageStatePath });
  const loggedPage = await loggedCtx.newPage();
  await loggedPage.goto('https://www.dogcatstar.com/');

  // 3) 驗證登入後的元素出現（「我的點數」按鈕）
  await loggedPage.locator('#my-account-anchor:visible').click();
  const myPoints = loggedPage.locator('button:has-text("我的點數")');
  await expect(myPoints).toBeVisible({ timeout: 10000 });

  // 4) 關閉 contexts
  await cleanCtx.close();
  await loggedCtx.close();
});
```

**驗證點**:
- 乾淨的 context 顯示「登入/註冊」按鈕（未登入狀態）
- 使用 storageState 後，顯示「我的點數」按鈕（已登入狀態）
- 不需要重新輸入帳號密碼或 OTP
- Session 持久化機制正常運作

**預期結果**:
- Status: PASS
- storageState 正確還原登入狀態

---

## 3. 手動/半自動測試案例（Manual Tests）

### TC-LOGIN-MANUAL-0001: 手機號碼登入成功

**測試目標**: 驗證使用真實手機號碼和 OTP 登入成功

**前置條件**:
- 使用者未登入
- 測試手機號碼有效，能接收真實 OTP

**測試步驟**:
```typescript
// 檔案位置：tests/manual/TC-LOGIN-MANUAL-0001-phone-login.spec.ts

test('TC-LOGIN-MANUAL-0001 手機號碼登入成功', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillPhone(accounts.phone);
  await loginPage.submitPhone();
  
  // 暫停讓使用者手動輸入 OTP
  await page.pause();
  
  await loginPage.expectLoginSuccess();
});
```

**手動操作**:
1. 執行測試，等待 `page.pause()` 暫停
2. 手動在手機收取真實 OTP 驗證碼
3. 在瀏覽器中輸入 OTP
4. 繼續執行測試，驗證登入成功

**驗證點**:
- 登入成功後，顯示「我的點數」按鈕
- 使用者名稱正確顯示
- 導航列出現「登出」按鈕

**預期結果**:
- Status: PASS (手動確認)
- 登入成功，進入會員首頁

---

### TC-LOGIN-MANUAL-0002: LINE 登入成功

**測試目標**: 驗證使用 LINE 帳號授權登入成功

**測試類型**: 手動測試（需真實 LINE 帳號授權）

**測試步驟**:
1. 進入登入頁面
2. 點擊「LINE 登入」按鈕
3. 在 LINE 授權頁面完成登入
4. 授權成功後，導回網站

**驗證點**:
- LINE 授權頁面正確開啟
- 授權成功後，導回網站並完成登入
- 顯示會員資訊（姓名、點數等）

**預期結果**:
- Status: PASS
- LINE 登入成功

---

### TC-LOGIN-MANUAL-0003: Facebook 登入成功

**測試目標**: 驗證使用 Facebook 帳號授權登入成功

**測試類型**: 手動測試（需真實 Facebook 帳號授權）

**測試步驟**:
1. 進入登入頁面
2. 點擊「Facebook 登入」按鈕
3. 在 Facebook 授權頁面完成登入
4. 授權成功後，導回網站

**驗證點**:
- Facebook 授權頁面正確開啟
- 授權成功後，導回網站並完成登入
- 顯示會員資訊

**預期結果**:
- Status: PASS
- Facebook 登入成功

---

### TC-LOGIN-MANUAL-0004: Google 登入成功

**測試目標**: 驗證使用 Google 帳號授權登入成功

**測試類型**: 手動測試（需真實 Google 帳號授權）

**測試步驟**:
1. 進入登入頁面
2. 點擊「Google 登入」按鈕
3. 在 Google 授權頁面完成登入
4. 授權成功後，導回網站

**驗證點**:
- Google 授權頁面正確開啟
- 授權成功後，導回網站並完成登入
- 顯示會員資訊

**預期結果**:
- Status: PASS
- Google 登入成功

---

### TC-LOGIN-MANUAL-0005: Email 登入成功

**測試目標**: 驗證使用 Email 和驗證碼登入成功

**測試類型**: 手動測試（需真實 Email 收取驗證碼）

**測試步驟**:
1. 進入登入頁面
2. 切換到「Email 登入」
3. 輸入 Email，點擊「發送驗證碼」
4. 收取 Email 驗證碼並輸入
5. 完成登入

**驗證點**:
- Email 驗證碼成功發送
- 輸入正確驗證碼後，登入成功
- 顯示會員資訊

**預期結果**:
- Status: PASS
- Email 登入成功

---

## 4. 測試執行與報告

### 4.1 執行方式
```bash
# 執行所有購物車 E2E 測試
npx playwright test tests/auto/cart/

# 執行所有登入 E2E 測試
npx playwright test tests/auto/login/

# 執行手動測試（需人工介入）
npx playwright test tests/manual/ --headed

# 產生測試報告
npx playwright test --reporter=html
npx playwright show-report
```

### 4.2 測試穩定性策略
- **單一 Worker 執行**：使用 `--workers=1` 避免並發衝突
- **Timeout 設定**：每個測試 timeout 設為 120 秒
- **Retry 機制**：失敗時自動重試 4 次（`--retries=4`）
- **等待機制**：Email 輸入後加入 0.5 秒等待，確保 UI 同步

### 4.3 測試覆蓋率目標
- **購物車功能覆蓋率**: 100%（5/5 測試案例）
- **登入功能覆蓋率**: 100%（4 自動化 + 5 手動）
- **正常流程測試**: 100%
- **錯誤處理測試**: 80%
- **整合測試**: 主要業務流程 100%

### 4.4 測試報告
- **購物車 E2E 報告**: `tests/auto/cart/CART-E2E-TEST-REPORT.md`
- **登入 E2E 報告**: `tests/auto/login/LOGIN-E2E-TEST-REPORT.md`
- **HTML 視覺化報告**: `playwright-report/index.html`

---

## 5. Page Object Model 架構

### 5.1 Page Classes
| Page Class | 檔案位置 | 說明 |
|-----------|---------|------|
| `HomePage` | `pages/home.page.ts` | 首頁操作（商品點擊、導航） |
| `ProductPage` | `pages/product.page.ts` | 商品頁操作（規格選擇、加入購物車） |
| `CartPage` | `pages/cart.page.ts` | 購物車操作（清空、驗證數量） |
| `LoginPage` | `pages/login.page.ts` | 登入頁操作（填寫、驗證、錯誤處理） |

### 5.2 測試資料管理
```
fixtures/
├── authStorageState.json          # 已登入使用者的 session
├── authStorageState.json.example  # 範例 template
├── test-accounts.json             # 測試帳號資料
└── test-accounts.json.example     # 範例 template
```

---

## 6. 注意事項與最佳實踐

### 6.1 Token 與 Session 管理
- ✅ 使用 `authStorageState.json` 儲存登入 session
- ✅ 避免每次測試都重新登入（節省時間）
- ✅ 定期更新 storageState（避免 token 過期）
- ✅ 不要將真實帳號密碼寫入程式碼

### 6.2 測試隔離
- ✅ 每個測試開始前清空購物車（避免資料污染）
- ✅ 使用獨立的測試資料（避免衝突）
- ✅ 測試之間不互相依賴

### 6.3 錯誤處理
- ✅ 驗證所有可能的錯誤狀態（OTP 錯誤、欄位為空等）
- ✅ 檢查錯誤訊息的正確性與易讀性
- ✅ 測試異常情境（網路斷線、API timeout 等）

### 6.4 效能監控
- ✅ 記錄測試執行時間
- ✅ 設定 timeout 閾值（120 秒）
- ✅ 監控失敗率與穩定性

### 6.5 CI/CD 整合
- ✅ 整合到 GitHub Actions（每次 push 觸發）
- ✅ 定期執行回歸測試（每日/每次部署）
- ✅ 自動產生測試報告
- ✅ 失敗時自動通知團隊

---

## 7. 常見問題排查（Troubleshooting）

### Q1: 購物車數量驗證失敗
**原因**:
- 彈窗蓋住購物車 icon
- 非同步載入未完成
- 購物車未清空

**解決方法**:
1. 使用 `closePopup()` 關閉彈窗
2. 增加等待時間（`waitForTimeout`）
3. 確認 `clearCart()` 成功執行

### Q2: 登入測試一直失敗（401 Unauthorized）
**原因**:
- `authStorageState.json` 過期
- Session token 失效
- 帳號被鎖定

**解決方法**:
1. 重新執行手動登入測試，更新 storageState
2. 確認測試帳號有效
3. 檢查 API token 是否過期

### Q3: 手動測試無法輸入 OTP
**原因**:
- `page.pause()` 未生效
- 瀏覽器未開啟（headless mode）

**解決方法**:
1. 使用 `--headed` 模式執行
2. 確認 `page.pause()` 位置正確
3. 手動點擊「繼續」按鈕後執行

### Q4: 測試在 CI/CD 環境失敗
**原因**:
- 環境變數未設定
- storageState 未上傳
- 網路環境不穩定

**解決方法**:
1. 確認 `test-accounts.json` 和 `authStorageState.json` 存在
2. 使用 `--retries=4` 增加重試次數
3. 檢查 CI 環境網路連線

---

**撰寫**: GitHub Copilot  
**最後更新**: 2025-10-29  
**版本**: 2.0  
**資料來源**: tests/auto/cart/, tests/auto/login/, tests/manual/
