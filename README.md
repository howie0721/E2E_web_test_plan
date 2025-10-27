# Playwright E2E & API 自動化測試專案

本專案為 **DogCatStar 電商平台**的 E2E 與 API 自動化測試專案，採用 **Playwright** 測試框架，涵蓋登入、購物車、結帳等核心業務流程，並整合 API 測試，提供完整的測試覆蓋與可維護性。

---

## 📋 目錄

- [專案架構](#專案架構)
- [技術選型](#技術選型)
- [快速開始](#快速開始)
- [測試執行](#測試執行)
- [測試案例說明](#測試案例說明)
- [設計理念](#設計理念)
- [未來擴充方向](#未來擴充方向)

---

## 🏗️ 專案架構

專案採用**分層架構**設計，確保高內聚、低耦合，便於維護與擴充。

```
Shepherdtech_Interview_final/
├── docs/                          # 測試計畫與文件
│   ├── api-test-plan.md          # API 測試規劃
│   ├── blackbox-test-plan.md     # 黑箱測試計畫
│   ├── cart-coupon-test-plan.md  # 購物車與優惠券測試
│   └── testcases.md              # 測試案例清單
├── fixtures/                      # 測試資料與認證狀態
│   ├── authStorageState.json    # 手機登入認證狀態
│   ├── authStorageStateLine.json # LINE 登入認證狀態
│   ├── api-tokens.json           # API 測試用 tokens
│   └── test-accounts.json        # 測試帳號資訊
├── helpers/                       # 共用輔助函式
│   ├── apiClient.ts              # API 客戶端封裝
│   ├── addProductByIndex.ts      # 商品加入購物車
│   ├── assertCartItemCount.ts    # 購物車數量驗證
│   ├── clearCart.ts              # 清空購物車
│   ├── closePopup.ts             # 關閉彈窗
│   └── selectSpecsAndAddToCart.ts # 選擇規格並加入購物車
├── pages/                         # Page Object Model
│   └── login.page.ts             # 登入頁面物件
├── tests/                         # 測試案例
│   ├── cart/                     # 購物車測試
│   │   ├── TC-CART-0001-add-from-product.spec.ts
│   │   ├── TC-CART-0002-add-multiple.spec.ts
│   │   ├── TC-CART-0003-add-different-products.spec.ts
│   │   ├── TC-CART-0004-persist-after-login.spec.ts
│   │   └── TC-CART-0005-add-without-login.spec.ts
│   ├── login/                    # 登入測試
│   │   ├── auth.spec.ts          # 認證狀態產生
│   │   ├── TC-LOGIN-0001-success.spec.ts
│   │   ├── TC-LOGIN-0002-invalid-otp.spec.ts
│   │   ├── TC-LOGIN-0003-empty-fields.spec.ts
│   │   ├── TC-LOGIN-0101-line-success.spec.ts
│   │   └── TC-LOGIN-0501-session-persist.spec.ts
│   └── api/                      # API 測試
│       ├── auth/                 # 會員/權限 API
│       │   └── auth-api.spec.ts
│       ├── cart/                 # 購物車 API
│       │   ├── cart-api.spec.ts
│       │   ├── cart-coupon-api.spec.ts
│       │   └── cart-user-api.spec.ts
│       ├── checkout/             # 結帳 API
│       │   └── checkout-api.spec.ts
│       └── integration/          # 跨 API 整合測試
│           └── cart-checkout-integration.spec.ts
├── playwright.config.ts           # Playwright 設定檔
└── package.json                   # 專案依賴與腳本

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
git clone <repository-url>
cd Shepherdtech_Interview_final

# 安裝依賴
npm install

# 安裝 Playwright 瀏覽器
npx playwright install
```

### 環境設定

1. **測試帳號設定**  
   複製範例檔案並填入測試帳號資訊：
   ```bash
   cp fixtures/test-accounts.json.example fixtures/test-accounts.json
   cp fixtures/api-tokens.json.example fixtures/api-tokens.json
   cp fixtures/authStorageState.json.example fixtures/authStorageState.json
   ```
   然後編輯這些檔案，填入你的測試帳號資訊。

2. **API Token 設定**  
   編輯 `fixtures/api-tokens.json`，填入有效的 `accessToken` 與 `refreshToken`（可從瀏覽器開發者工具取得）。

3. **產生認證狀態**  
   ```bash
   npx playwright test tests/login/auth.spec.ts
   ```

   **注意**：`fixtures/` 目錄下的敏感資料文件已加入 `.gitignore`，不會被提交到 git。

---

## ▶️ 測試執行

### E2E 測試

```bash
# 執行所有測試
npx playwright test

# 執行特定測試套件
npx playwright test tests/cart
npx playwright test tests/login

# 執行單一測試檔案
npx playwright test tests/cart/TC-CART-0001-add-from-product.spec.ts

# UI 模式執行（可視化）
npx playwright test --ui

# 瀏覽器可見模式（headed mode）
npx playwright test --headed

# 指定瀏覽器
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### API 測試

```bash
# 執行所有 API 測試
npx playwright test tests/api

# 執行特定 API 測試
npx playwright test tests/api/cart
npx playwright test tests/api/checkout
npx playwright test tests/api/integration

# 查看測試報告
npx playwright show-report
```

### 除錯模式

```bash
# Debug 模式
npx playwright test --debug

# 產生 Trace（可上傳至 trace.playwright.dev）
npx playwright test --trace on
```

---

## 📝 測試案例說明

### 登入測試 (`tests/login/`)

| 測試案例 | 說明 | 檔案 |
|---------|------|------|
| TC-LOGIN-0001 | 手機號碼登入成功 | `TC-LOGIN-0001-success.spec.ts` |
| TC-LOGIN-0002 | 無效 OTP | `TC-LOGIN-0002-invalid-otp.spec.ts` |
| TC-LOGIN-0003 | 空白欄位驗證 | `TC-LOGIN-0003-empty-fields.spec.ts` |
| TC-LOGIN-0101 | LINE 登入成功 | `TC-LOGIN-0101-line-success.spec.ts` |
| TC-LOGIN-0501 | Session 持久化 | `TC-LOGIN-0501-session-persist.spec.ts` |

### 購物車測試 (`tests/cart/`)

| 測試案例 | 說明 | 檔案 |
|---------|------|------|
| TC-CART-0001 | 商品頁加入購物車 | `TC-CART-0001-add-from-product.spec.ts` |
| TC-CART-0002 | 多次加入同商品 | `TC-CART-0002-add-multiple.spec.ts` |
| TC-CART-0003 | 加入不同商品 | `TC-CART-0003-add-different-products.spec.ts` |
| TC-CART-0004 | 登入後購物車持久化 | `TC-CART-0004-persist-after-login.spec.ts` |
| TC-CART-0005 | 未登入加入購物車 | `TC-CART-0005-add-without-login.spec.ts` |

### API 測試 (`tests/api/`)

#### 購物車 API (`tests/api/cart/`)
- TC-API-CART-001: 查詢購物車快取
- TC-API-CART-002: 權限驗證（缺少 token）
- TC-API-CART-003: 首次購物狀態查詢
- TC-API-CART-004: 計算結帳金額
- TC-API-CART-005: 查詢可用優惠券
- TC-API-USER-001: 查詢用戶地址資訊

#### 結帳 API (`tests/api/checkout/`)
- TC-API-CHECKOUT-001: 正常結帳流程
- TC-API-CHECKOUT-002: 缺少必要欄位
- TC-API-CHECKOUT-003: 權限驗證

#### 會員/權限 API (`tests/api/auth/`)
- TC-API-AUTH-001: 無 token 驗證
- TC-API-AUTH-002: 錯誤 token 驗證

#### 整合測試 (`tests/api/integration/`)
- 會員完整購物流程（購物車 → 結帳 → 優惠券 → 地址）

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
  - `apiClient.ts`：統一管理 API 請求與 token
  - `clearCart.ts`：清空購物車的共用邏輯
  - `assertCartItemCount.ts`：驗證購物車數量
- **優點**：提高程式碼重用性，降低維護成本。

#### `/tests` - 以功能域分組
- **目的**：依業務功能分類測試案例，清晰易懂。
- **結構**：
  - `login/`：登入相關測試
  - `cart/`：購物車相關測試
  - `api/`：API 測試（再細分 auth、cart、checkout、integration）
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

## 📊 測試報告

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

---

## 🤝 貢獻指南

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/new-test`)
3. 提交變更 (`git commit -m 'Add new test case'`)
4. 推送至分支 (`git push origin feature/new-test`)
5. 發起 Pull Request

---

## 📄 授權

本專案僅供面試與技術展示使用，未經許可不得用於商業用途。

---

## 📞 聯絡方式

如有任何問題或建議，歡迎聯絡：
- **Email**: [howie0721@gmail.com]
- **GitHub**: [howie0721]

---

**感謝您的閱讀！祝測試順利！** 🎉
