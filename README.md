# Playwright E2E & API 自動化測試專案

本專案為 **DogCatStar 電商平台**的 E2E 與 API 自動化測試專案，採用 **Playwright** 測試框架，涵蓋登入、購物車、結帳等核心業務流程，並整合 API 測試，提供完整的測試覆蓋與可維護性。

---

## 📋 目錄

- [專案架構](#專案架構)
- [技術選型](#技術選型)
- [快速開始](#快速開始)
- [測試執行](#測試執行)
- [測試案例說明](#測試案例說明)
- [測試報告](#測試報告)
- [設計理念](#設計理念)
- [未來擴充方向](#未來擴充方向)
- [貢獻指南](#貢獻指南)
- [授權](#授權)
- [聯絡方式](#聯絡方式)

---

## 🏗️ 專案架構

專案採用**分層架構**設計，確保高內聚、低耦合，便於維護與擴充。詳細架構說明請參考 [Project Architecture.md](./docs/Test_System_Architecture/Project_Architecture.md)。

```
dogcatstar_E2E_test_plan/
├── docs/                                      # 文件資料夾
│   ├── api_test_plan/                         # API 測試計畫
│   │   ├── cart-api-test.md
│   │   └── login-api-test.md
│   ├── Challenge/                             # 專案挑戰與解決方案
│   │   ├── ai-collab-plan.md
│   │   ├── blackbox-test-plan.md
│   │   ├── cart-coupon-test-plan.md
│   │   └── e2e-stubbing-plan.md
│   ├── Test_System_Architecture/              # 測試系統架構文件
│   │   ├── Project_Architecture.md
│   │   ├── Playwright_Test_Plan.md
│   │   └── testcases.md
│   ├── presentation_flow.md
│   └── Task.md
├── fixtures/                                  # 測試資料與認證狀態
│   ├── authStorageState.json.example
│   ├── api-tokens.json.example
│   └── test-accounts.json.example
├── helpers/                                   # 共用輔助函式
│   └── cartApiHelper.ts                       # 購物車 API 輔助工具
├── pages/                                     # Page Object Model
│   ├── base.page.ts                           # 基礎頁面類別
│   ├── cart.page.ts                           # 購物車頁面
│   ├── login.page.ts                          # 登入頁面
│   ├── home.page.ts                           # 首頁
│   └── product.page.ts                        # 商品頁面
├── tests/
│   ├── auto/                                  # 自動化測試
│   │   ├── api/                               # API 測試
│   │   │   ├── cart/                          # 購物車 API 測試
│   │   │   │   ├── CART-API-TEST-REPORT.md
│   │   │   │   ├── TC-CART-API-001-first-purchase-check.spec.ts
│   │   │   │   ├── TC-CART-API-002-cart-cache-query.spec.ts
│   │   │   │   ├── TC-CART-API-003-cart-calculate.spec.ts
│   │   │   │   ├── TC-CART-API-004-guest-discount.spec.ts
│   │   │   │   ├── TC-CART-API-005-available-coupons.spec.ts
│   │   │   │   ├── TC-CART-API-006-checkout-fields.spec.ts
│   │   │   │   ├── TC-CART-API-007-user-address.spec.ts
│   │   │   │   └── TC-CART-API-008-complete-flow.spec.ts
│   │   │   └── login/                         # 登入 API 測試
│   │   │       ├── LOGIN-API-FINAL-TEST-REPORT.md
│   │   │       ├── TC-LOGIN-API-001-send-otp.spec.ts
│   │   │       ├── TC-LOGIN-API-002-verify-otp.spec.ts
│   │   │       ├── TC-LOGIN-API-003-jwt-login.spec.ts
│   │   │       ├── TC-LOGIN-API-004-check-registered.spec.ts
│   │   │       ├── TC-LOGIN-API-005-refresh-token.spec.ts
│   │   │       ├── TC-LOGIN-API-006-get-user-info.spec.ts
│   │   │       ├── TC-LOGIN-API-007-complete-flow.spec.ts
│   │   │       └── TC-LOGIN-API-008-error-handling.spec.ts
│   │   ├── cart/                              # 購物車 E2E 測試
│   │   │   ├── CART-E2E-TEST-REPORT.md
│   │   │   ├── TC-CART-0001-add-from-product.spec.ts
│   │   │   ├── TC-CART-0002-add-multiple.spec.ts
│   │   │   ├── TC-CART-0003-add-different-products.spec.ts
│   │   │   ├── TC-CART-0004-persist-after-login.spec.ts
│   │   │   └── TC-CART-0005-add-without-login.spec.ts
│   │   └── login/                             # 登入 E2E 測試
│   │       ├── LOGIN-E2E-TEST-REPORT.md
│   │       ├── TC-LOGIN-0001-invalid-otp.spec.ts
│   │       ├── TC-LOGIN-0002-empty-fields.spec.ts
│   │       ├── TC-LOGIN-0003-email-fail.spec.ts
│   │       └── TC-LOGIN-0004-session-persist.spec.ts
│   └── manual/                                # 需人工驗證的測試
│       ├── auth.spec.ts
│       ├── TC-LOGIN-MANUAL-0001-phone-login.spec.ts
│       ├── TC-LOGIN-MANUAL-0002-line-login.spec.ts
│       ├── TC-LOGIN-MANUAL-0003-facebook-login.spec.ts
│       ├── TC-LOGIN-MANUAL-0004-google-login.spec.ts
│       └── TC-LOGIN-MANUAL-0005-email-login.spec.ts
├── playwright.config.ts
└── package.json
```

---

## 🛠️ 技術選型

| 項目 | 技術/工具 | 說明 |
|------|----------|------|
| **測試框架** | Playwright | 跨瀏覽器支援、快速穩定、內建截圖/錄影 |
| **語言** | TypeScript | 型別安全、IDE 支援良好 |
| **設計模式** | Page Object Model (POM) | 提高測試可讀性與可維護性 |
| **API 測試** | Playwright API Context | 輕量、無需額外依賴 |
| **認證管理** | Storage State | 重用登入狀態，加速測試執行 |
| **報告** | Playwright HTML Report | 內建、視覺化、支援截圖/影片 |

---

## 🚀 快速開始

### 前置需求

- Node.js 18+ (LTS 版本)
- npm 或 yarn

### 安裝

```bash
# 複製專案
git clone https://github.com/howie0721/E2E_web_test_plan.git
cd dogcatstar_E2E_test_plan

# 安裝依賴
npm install

# 安裝 Playwright 瀏覽器
npx playwright install
```

### 環境設定

1. **測試帳號設定**  
   複製範例檔案並填入測試帳號資訊：
   ```bash
   # Windows PowerShell
   Copy-Item fixtures/test-accounts.json.example fixtures/test-accounts.json
   Copy-Item fixtures/api-tokens.json.example fixtures/api-tokens.json
   Copy-Item fixtures/authStorageState.json.example fixtures/authStorageState.json
   
   # Mac/Linux
   cp fixtures/test-accounts.json.example fixtures/test-accounts.json
   cp fixtures/api-tokens.json.example fixtures/api-tokens.json
   cp fixtures/authStorageState.json.example fixtures/authStorageState.json
   ```
   然後編輯這些檔案，填入你的測試帳號資訊。

2. **API Token 設定**  
   編輯 `fixtures/api-tokens.json`，填入有效的 `accessToken` 與 `refreshToken`（可從瀏覽器開發者工具取得）。

3. **產生認證狀態**  
   ```bash
   npx playwright test tests/manual/auth.spec.ts
   ```

   **注意**：`fixtures/` 目錄下的敏感資料文件已加入 `.gitignore`，不會被提交到 git。

---

## ▶️ 測試執行

### 基本執行

```bash
# 執行所有自動化測試
npx playwright test tests/auto

# 執行 E2E 測試
npx playwright test tests/auto/cart
npx playwright test tests/auto/login

# 執行 API 測試
npx playwright test tests/auto/api/cart
npx playwright test tests/auto/api/login

# 執行單一測試檔案
npx playwright test tests/auto/cart/TC-CART-0001-add-from-product.spec.ts
```

### 進階選項

```bash
# UI 模式執行（可視化）
npx playwright test --ui

# 瀏覽器可見模式（headed mode）
npx playwright test --headed

# 指定瀏覽器
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# 穩定性測試（單一 worker + 重試）
npx playwright test tests/auto/login --workers=1 --retries=4
```

### 除錯模式

```bash
# Debug 模式
npx playwright test --debug

# 產生 Trace（可上傳至 trace.playwright.dev）
npx playwright test --trace on

# 查看測試報告
npx playwright show-report
```

---

## 📝 測試案例說明

### 登入測試 (`tests/auto/login/`)

#### E2E 測試
| 測試案例 | 說明 | 檔案 |
|---------|------|------|
| TC-LOGIN-0001 | 無效 OTP 驗證 | `TC-LOGIN-0001-invalid-otp.spec.ts` |
| TC-LOGIN-0002 | 空白欄位驗證 | `TC-LOGIN-0002-empty-fields.spec.ts` |
| TC-LOGIN-0003 | Email 驗證失敗 | `TC-LOGIN-0003-email-fail.spec.ts` |
| TC-LOGIN-0004 | Session 持久化 | `TC-LOGIN-0004-session-persist.spec.ts` |

#### API 測試
| 測試案例 | 說明 | 檔案 |
|---------|------|------|
| TC-LOGIN-API-001 | 發送 OTP | `TC-LOGIN-API-001-send-otp.spec.ts` |
| TC-LOGIN-API-002 | 驗證 OTP | `TC-LOGIN-API-002-verify-otp.spec.ts` |
| TC-LOGIN-API-003 | JWT 登入 | `TC-LOGIN-API-003-jwt-login.spec.ts` |
| TC-LOGIN-API-004 | 檢查註冊狀態 | `TC-LOGIN-API-004-check-registered.spec.ts` |
| TC-LOGIN-API-005 | 刷新 Token | `TC-LOGIN-API-005-refresh-token.spec.ts` |
| TC-LOGIN-API-006 | 取得用戶資訊 | `TC-LOGIN-API-006-get-user-info.spec.ts` |
| TC-LOGIN-API-007 | 完整登入流程 | `TC-LOGIN-API-007-complete-flow.spec.ts` |
| TC-LOGIN-API-008 | 錯誤處理 | `TC-LOGIN-API-008-error-handling.spec.ts` |

### 購物車測試 (`tests/auto/cart/`)

#### E2E 測試
| 測試案例 | 說明 | 檔案 |
|---------|------|------|
| TC-CART-0001 | 商品頁加入購物車 | `TC-CART-0001-add-from-product.spec.ts` |
| TC-CART-0002 | 多次加入同商品 | `TC-CART-0002-add-multiple.spec.ts` |
| TC-CART-0003 | 加入不同商品 | `TC-CART-0003-add-different-products.spec.ts` |
| TC-CART-0004 | 登入後購物車持久化 | `TC-CART-0004-persist-after-login.spec.ts` |
| TC-CART-0005 | 未登入加入購物車 | `TC-CART-0005-add-without-login.spec.ts` |

#### API 測試
| 測試案例 | 說明 | 檔案 |
|---------|------|------|
| TC-CART-API-001 | 首購狀態檢查 | `TC-CART-API-001-first-purchase-check.spec.ts` |
| TC-CART-API-002 | 購物車快取查詢 | `TC-CART-API-002-cart-cache-query.spec.ts` |
| TC-CART-API-003 | 購物車計算 | `TC-CART-API-003-cart-calculate.spec.ts` |
| TC-CART-API-004 | 訪客折扣 | `TC-CART-API-004-guest-discount.spec.ts` |
| TC-CART-API-005 | 可用優惠券 | `TC-CART-API-005-available-coupons.spec.ts` |
| TC-CART-API-006 | 結帳欄位驗證 | `TC-CART-API-006-checkout-fields.spec.ts` |
| TC-CART-API-007 | 用戶地址資訊 | `TC-CART-API-007-user-address.spec.ts` |
| TC-CART-API-008 | 完整購物流程 | `TC-CART-API-008-complete-flow.spec.ts` |

### 手動測試 (`tests/manual/`)

這些測試需要人工介入（如輸入真實 OTP、OAuth 授權等）：

| 測試案例 | 說明 | 檔案 |
|---------|------|------|
| TC-LOGIN-MANUAL-0001 | 手機號碼登入 | `TC-LOGIN-MANUAL-0001-phone-login.spec.ts` |
| TC-LOGIN-MANUAL-0002 | LINE 登入 | `TC-LOGIN-MANUAL-0002-line-login.spec.ts` |
| TC-LOGIN-MANUAL-0003 | Facebook 登入 | `TC-LOGIN-MANUAL-0003-facebook-login.spec.ts` |
| TC-LOGIN-MANUAL-0004 | Google 登入 | `TC-LOGIN-MANUAL-0004-google-login.spec.ts` |
| TC-LOGIN-MANUAL-0005 | Email 登入 | `TC-LOGIN-MANUAL-0005-email-login.spec.ts` |

---

## 📊 測試報告

### Playwright HTML 報告

執行測試後，可透過以下指令查看報告：

```bash
# 開啟 HTML 報告
npx playwright show-report

# 報告位置
playwright-report/index.html
```

報告包含：
- 測試執行結果（通過/失敗）
- 執行時間
- 錯誤截圖
- 測試錄影（需設定）
- Trace 檔案（可上傳至 trace.playwright.dev）

### 測試報告文件

各模組測試執行後都會產生詳細的測試報告：

- **Cart E2E 測試報告**：`tests/auto/cart/CART-E2E-TEST-REPORT.md`
- **Login E2E 測試報告**：`tests/auto/login/LOGIN-E2E-TEST-REPORT.md`
- **Cart API 測試報告**：`tests/auto/api/cart/CART-API-TEST-REPORT.md`
- **Login API 測試報告**：`tests/auto/api/login/LOGIN-API-FINAL-TEST-REPORT.md`

---

## 💡 設計理念

### 1. 分層架構

#### `/pages` - Page Object Model (POM)
- **目的**：封裝頁面元素與操作，提高可讀性與可維護性。
- **範例**：`login.page.ts` 封裝登入頁面的所有操作（輸入手機、點擊按鈕等）。
- **優點**：當 UI 改變時，只需修改 Page Object，測試案例無需變動。

#### `/fixtures` - 測試資料與認證狀態
- **目的**：集中管理測試資料與登入狀態，避免重複登入。
- **檔案**：
  - `authStorageState.json`：手機登入後的 Storage State
  - `api-tokens.json`：API 測試用 tokens
  - `test-accounts.json`：測試帳號資訊
- **優點**：重用認證狀態，大幅縮短測試執行時間。

#### `/helpers` - 共用輔助函式
- **目的**：封裝常用操作與 API 呼叫，減少重複程式碼。
- **範例**：
  - `cartApiHelper.ts`：統一管理購物車相關 API 請求與 token
- **優點**：提高程式碼重用性，降低維護成本。

#### `/tests` - 以功能域分組
- **目的**：依業務功能分類測試案例，清晰易懂。
- **結構**：
  - `auto/login/`：登入 E2E 測試
  - `auto/cart/`：購物車 E2E 測試
  - `auto/api/login/`：登入 API 測試
  - `auto/api/cart/`：購物車 API 測試
  - `manual/`：需人工介入的測試
- **優點**：方便團隊成員快速找到對應測試，支援並行執行。

### 2. API 測試與 E2E 整合

- **E2E 測試**：模擬真實用戶操作，驗證完整流程。
- **API 測試**：直接驗證後端邏輯，快速回饋、易於除錯。
- **整合測試**：串接多個 API，驗證跨模組互動。

### 3. 可維護性設計

- **命名規範**：測試案例以 `TC-<模組>-<編號>` 命名，清楚標示測試範圍。
- **註解與文件**：每個測試檔案與 helper 都有清楚的註解說明。
- **型別安全**：使用 TypeScript，減少執行時錯誤。

---

## 🔮 未來擴充方向

### 1. 測試覆蓋擴充
- [ ] 結帳流程完整測試（付款、發票、物流）
- [ ] 會員中心功能（訂單查詢、點數兌換、會員資料編輯）
- [ ] 優惠券與促銷活動測試
- [ ] 跨瀏覽器與 RWD 測試

### 2. 自動化流程優化
- [ ] CI/CD 整合（GitHub Actions / Jenkins）
- [ ] 定時排程執行（每日回歸測試）
- [ ] 測試失敗自動通知（Slack / Email）
- [ ] 測試報告自動上傳與歷史追蹤

### 3. 測試資料管理
- [ ] 測試資料工廠（Faker.js / 自訂 Generator）
- [ ] 資料庫初始化與清理腳本
- [ ] 動態 Token 取得與刷新機制

### 4. 效能與穩定性
- [ ] 並行測試優化（Worker 配置）
- [ ] Retry 與容錯機制
- [ ] Visual Regression Testing（截圖比對）

### 5. 團隊協作
- [ ] 測試案例文件自動生成
- [ ] 測試覆蓋率報告（Allure / Coverage）
- [ ] 測試最佳實踐指南

---

## 🤝 貢獻指南

歡迎貢獻測試案例或改進建議！請遵循以下步驟：

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/new-test`)
3. 提交變更 (`git commit -m 'Add new test case'`)
4. 推送至分支 (`git push origin feature/new-test`)
5. 發起 Pull Request

### 貢獻規範

- 遵循現有的命名規範 (`TC-<模組>-<編號>-<描述>`)
- 為新測試案例撰寫清晰的註解
- 確保測試可獨立執行且穩定通過
- 更新相關文件（如測試案例清單、README）

---

## 📄 授權

本專案僅供面試與技術展示使用，未經許可不得用於商業用途。

---

## 📞 聯絡方式

如有任何問題或建議，歡迎聯絡：
- **Email**: howie0721@gmail.com
- **GitHub**: [howie0721](https://github.com/howie0721)

---

**感謝您的閱讀！祝測試順利！** 🎉
