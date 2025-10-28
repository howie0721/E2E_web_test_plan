# 專案架構說明文件

## 📚 目錄
- [專案概述](#專案概述)
- [目錄結構](#目錄結構)
- [核心設計模式](#核心設計模式)
- [各層級職責](#各層級職責)
- [測試分類與策略](#測試分類與策略)
- [資料流與認證機制](#資料流與認證機制)
- [未來優化方向](#未來優化方向)

---

## 專案概述

本專案是基於 **Playwright** 框架建立的企業級 E2E & API 自動化測試專案，針對 DogCatStar 電商平台的核心業務流程（登入、購物車、結帳）提供全面測試覆蓋。

### 核心特色
- ✅ **分層架構設計**：清晰的職責劃分，高內聚低耦合
- ✅ **Page Object Model**：提升測試可讀性與可維護性
- ✅ **E2E + API 雙軌測試**：完整覆蓋 UI 與後端邏輯
- ✅ **Storage State 認證機制**：避免重複登入，加速測試執行
- ✅ **詳細測試報告**：每個模組都有完整的執行報告與分析

---

## 目錄結構

```
dogcatstar_E2E_test_plan/
│
├── 📂 docs/                                    # 📖 文件資料夾
│   ├── api_test_plan/                         # API 測試計畫與規格
│   │   ├── cart-api-test.md                   # 購物車 API 測試計畫
│   │   └── login-api-test.md                  # 登入 API 測試計畫
│   ├── Challenge/                             # 專案挑戰與解決方案
│   │   ├── ai-collab-plan.md                  # AI 協作計畫
│   │   ├── blackbox-test-plan.md              # 黑箱測試計畫
│   │   ├── cart-coupon-test-plan.md           # 購物車優惠券測試計畫
│   │   └── e2e-stubbing-plan.md               # E2E Stubbing 策略
│   ├── Test_System_Architecture/              # 測試系統架構文件
│   │   ├── Project Architecture.md            # 本文件
│   │   ├── Playwright_Test_Plan.md            # Playwright 測試計畫
│   │   └── testcases.md                       # 測試案例清單
│   ├── presentation_flow.md                   # 簡報流程
│   └── Task.md                                # 任務清單
│
├── 📂 fixtures/                                # 🔐 測試資料與認證狀態
│   ├── authStorageState.json                  # 登入後的 Storage State（已登入狀態）
│   ├── authStorageState.json.example          # Storage State 範例檔案
│   ├── api-tokens.json                        # API 測試用 tokens（accessToken, refreshToken）
│   ├── api-tokens.json.example                # API tokens 範例檔案
│   ├── test-accounts.json                     # 測試帳號資訊（手機、Email）
│   └── test-accounts.json.example             # 測試帳號範例檔案
│
├── 📂 helpers/                                 # 🛠️ 共用輔助工具
│   └── cartApiHelper.ts                       # 購物車 API 輔助函式（API 請求封裝）
│
├── 📂 pages/                                   # 📄 Page Object Model（POM）
│   ├── base.page.ts                           # 基礎頁面類別（共用方法）
│   ├── cart.page.ts                           # 購物車頁面物件
│   ├── home.page.ts                           # 首頁物件
│   ├── login.page.ts                          # 登入頁面物件
│   └── product.page.ts                        # 商品頁面物件
│
├── 📂 tests/                                   # 🧪 測試案例
│   ├── auto/                                  # 自動化測試（可完全自動執行）
│   │   ├── api/                               # API 測試
│   │   │   ├── cart/                          # 購物車 API 測試
│   │   │   │   ├── CART-API-TEST-REPORT.md   # 購物車 API 測試報告
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
│   │   │   ├── CART-E2E-TEST-REPORT.md        # 購物車 E2E 測試報告
│   │   │   ├── TC-CART-0001-add-from-product.spec.ts
│   │   │   ├── TC-CART-0002-add-multiple-v2.spec.ts
│   │   │   ├── TC-CART-0003-add-different-products.spec.ts
│   │   │   ├── TC-CART-0004-persist-after-login.spec.ts
│   │   │   └── TC-CART-0005-add-without-login.spec.ts
│   │   └── login/                             # 登入 E2E 測試
│   │       ├── LOGIN-E2E-TEST-REPORT.md       # 登入 E2E 測試報告
│   │       ├── TC-LOGIN-0001-invalid-otp.spec.ts
│   │       ├── TC-LOGIN-0002-empty-fields.spec.ts
│   │       ├── TC-LOGIN-0003-email-fail.spec.ts
│   │       └── TC-LOGIN-0004-session-persist.spec.ts
│   └── manual/                                # 半自動測試（需人工介入）
│       ├── auth.spec.ts                       # 產生認證狀態腳本
│       ├── TC-LOGIN-MANUAL-0001-phone-login.spec.ts
│       ├── TC-LOGIN-MANUAL-0002-line-login.spec.ts
│       ├── TC-LOGIN-MANUAL-0003-facebook-login.spec.ts
│       ├── TC-LOGIN-MANUAL-0004-google-login.spec.ts.ts
│       └── TC-LOGIN-MANUAL-0005-email-login.spec.ts
│
├── 📂 playwright-report/                       # 📊 測試報告輸出
│   └── index.html                             # Playwright HTML 報告
│
├── 📂 test-results/                            # 🗂️ 測試執行結果（截圖、trace）
│
├── playwright.config.ts                        # ⚙️ Playwright 配置檔案
├── package.json                                # 📦 專案依賴管理
└── README.md                                   # 📋 專案說明文件
```

---

## 核心設計模式

### 1. Page Object Model (POM)

**目的**：將頁面元素與操作邏輯封裝到獨立的類別中，提升測試可讀性與可維護性。

#### 結構
```
pages/
├── base.page.ts      # 基礎類別，提供共用方法（如 goto、waitForElement）
├── login.page.ts     # 登入頁面（封裝登入流程、OTP 輸入、OAuth）
├── cart.page.ts      # 購物車頁面（加入購物車、數量變更、清空購物車）
├── product.page.ts   # 商品頁面（選擇商品、規格、加入購物車）
└── home.page.ts      # 首頁（導覽、搜尋）
```

#### 範例：`login.page.ts`
```typescript
export class LoginPage {
  constructor(private page: Page) {}

  // 封裝操作
  async goto() { ... }
  async fillPhone(phone: string) { ... }
  async fillEmail(email: string) { ... }
  async clickConfirmButton() { ... }
  async fillOTP(otp: string) { ... }
  
  // 封裝斷言
  async expectLoginSuccess() { ... }
  async expectErrorMessage(message: string) { ... }
}
```

#### 優點
- 當 UI 改變時，只需修改 Page Object，測試案例無需變動
- 提升測試案例可讀性，如：`await loginPage.fillEmail(email)` 比直接 locator 更易懂
- 方便團隊協作，統一元素定位與操作邏輯

---

### 2. 分層架構

```
┌─────────────────────────────────────────┐
│         Test Cases (tests/)            │  ← 測試案例層（業務邏輯）
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Page Objects (pages/)             │  ← 頁面物件層（UI 操作封裝）
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│       Helpers (helpers/)               │  ← 工具層（API 請求、共用邏輯）
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Fixtures (fixtures/)              │  ← 資料層（測試資料、認證狀態）
└─────────────────────────────────────────┘
```

---

### 3. Storage State 認證機制

**目的**：避免每個測試都重新登入，節省執行時間。

#### 工作流程
1. **一次性登入**：執行 `tests/manual/auth.spec.ts`，產生 `fixtures/authStorageState.json`
2. **重用狀態**：測試案例透過 `storageState` 載入已登入狀態
3. **快速執行**：省略登入步驟，直接進入測試核心邏輯

#### 配置範例（`playwright.config.ts`）
```typescript
{
  name: 'loggedIn',
  use: {
    storageState: './fixtures/authStorageState.json',
  },
}
```

---

## 各層級職責

### 📂 `/pages` - 頁面物件層
| 檔案 | 職責 | 主要方法 |
|------|------|---------|
| `base.page.ts` | 基礎類別，提供共用方法 | `goto()`, `waitForElement()` |
| `login.page.ts` | 登入頁面操作與驗證 | `fillPhone()`, `fillEmail()`, `fillOTP()`, `clickConfirmButton()` |
| `cart.page.ts` | 購物車頁面操作與驗證 | `getCartItemCount()`, `clearCart()`, `updateQuantity()` |
| `product.page.ts` | 商品頁面操作 | `selectProduct()`, `addToCart()` |
| `home.page.ts` | 首頁操作 | `goto()`, `search()` |

---

### 📂 `/helpers` - 工具層
| 檔案 | 職責 | 主要函式 |
|------|------|---------|
| `cartApiHelper.ts` | 購物車 API 請求封裝 | `getCartCache()`, `calculateCheckout()`, `getAvailableCoupons()` |

**未來可擴充**：
- `loginApiHelper.ts`：登入 API 封裝（發送 OTP、驗證 OTP、刷新 Token）
- `dataFactory.ts`：測試資料生成（Faker.js）
- `dbHelper.ts`：資料庫初始化與清理

---

### 📂 `/fixtures` - 資料層
| 檔案 | 用途 | 格式 |
|------|------|------|
| `authStorageState.json` | 已登入狀態的 Storage State | JSON（cookies, localStorage） |
| `api-tokens.json` | API 測試用的 accessToken & refreshToken | JSON |
| `test-accounts.json` | 測試帳號資訊（手機、Email） | JSON |

**注意**：這些檔案已加入 `.gitignore`，不會被提交到 git。

---

### 📂 `/tests` - 測試案例層

#### 測試分類

| 類別 | 路徑 | 說明 | 執行方式 |
|------|------|------|---------|
| **E2E 測試** | `tests/auto/cart/`, `tests/auto/login/` | 模擬真實用戶操作，驗證完整流程 | 完全自動 |
| **API 測試** | `tests/auto/api/cart/`, `tests/auto/api/login/` | 直接驗證後端邏輯，快速回饋 | 完全自動 |
| **手動測試** | `tests/manual/` | 需人工介入（如輸入真實 OTP、OAuth 授權） | 半自動 |

#### 測試命名規範
- **E2E 測試**：`TC-<模組>-<編號>-<描述>.spec.ts`
  - 範例：`TC-CART-0001-add-from-product.spec.ts`
- **API 測試**：`TC-<模組>-API-<編號>-<描述>.spec.ts`
  - 範例：`TC-CART-API-001-first-purchase-check.spec.ts`

---

## 測試分類與策略

### E2E 測試 vs API 測試

| 項目 | E2E 測試 | API 測試 |
|------|---------|---------|
| **測試範圍** | 完整流程（UI + 後端） | 後端邏輯 |
| **執行速度** | 較慢（需載入頁面、等待 UI） | 快速（直接 HTTP 請求） |
| **適用情境** | 用戶旅程、UI 交互、跨頁面流程 | 後端邏輯、權限驗證、資料驗證 |
| **維護成本** | 較高（UI 變動需同步修改） | 較低（API 介面相對穩定） |
| **測試覆蓋** | 模擬真實用戶行為 | 驗證 API 契約與邏輯 |

### 測試金字塔建議
```
       ┌──────────┐
       │  E2E 測試  │  ← 少量，驗證核心流程
       ├──────────┤
       │ API 測試  │  ← 中等數量，驗證後端邏輯
       ├──────────┤
       │ 單元測試  │  ← 大量，驗證元件功能
       └──────────┘
```

---

## 資料流與認證機制

### 登入流程（E2E）
```
1. 用戶輸入手機/Email
   ↓
2. 點擊「確認」按鈕
   ↓
3. 後端發送 OTP
   ↓
4. 用戶輸入 OTP
   ↓
5. 後端驗證 OTP
   ↓
6. 返回 JWT Token
   ↓
7. 前端儲存 Token 至 localStorage
   ↓
8. 重導向至會員中心
```

### 登入流程（API）
```
1. POST /api/auth/send-otp
   ↓
2. POST /api/auth/verify-otp → 返回 accessToken & refreshToken
   ↓
3. GET /api/user/info (附帶 accessToken)
   ↓
4. 當 accessToken 過期 → POST /api/auth/refresh-token
```

### 購物車流程
```
1. 加入商品至購物車（未登入：存 localStorage，已登入：存後端）
   ↓
2. 查詢購物車（GET /api/cart/cache）
   ↓
3. 計算結帳金額（POST /api/cart/calculate）
   ↓
4. 查詢可用優惠券（GET /api/cart/available-coupons）
   ↓
5. 查詢用戶地址（GET /api/user/address）
   ↓
6. 送出訂單（POST /api/checkout）
```

---

## 未來優化方向

### 🚀 CI/CD 整合優化

#### 1. GitHub Actions 設定
**預計新增檔案**：
```
.github/
└── workflows/
    ├── test.yml                    # 主測試流程
    ├── test-e2e.yml                # E2E 測試流程
    ├── test-api.yml                # API 測試流程
    └── test-nightly.yml            # 每日夜間回歸測試
```

**test.yml 範例**：
```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test tests/auto/api
      - run: npx playwright test tests/auto/cart --workers=1
      - run: npx playwright test tests/auto/login --workers=1
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

#### 2. 測試結果通知
**預計新增檔案**：
```
scripts/
├── notify-slack.js                 # Slack 通知腳本
├── notify-email.js                 # Email 通知腳本
└── upload-report.js                # 上傳報告至 S3/Azure
```

#### 3. 測試環境管理
**預計新增檔案**：
```
config/
├── env.test.json                   # 測試環境配置
├── env.staging.json                # Staging 環境配置
└── env.production.json             # Production 環境配置（唯讀測試）
```

---

### 📊 測試資料管理優化

#### 1. 測試資料工廠
**預計新增檔案**：
```
helpers/
├── dataFactory.ts                  # 測試資料生成（Faker.js）
├── testDataBuilder.ts              # Builder Pattern 建立測試資料
└── dbSeeder.ts                     # 資料庫初始化腳本
```

**dataFactory.ts 範例**：
```typescript
import { faker } from '@faker-js/faker';

export const generateTestUser = () => ({
  email: faker.internet.email(),
  phone: `09${faker.string.numeric(8)}`,
  name: faker.person.fullName(),
  address: faker.location.streetAddress(),
});

export const generateTestProduct = () => ({
  name: faker.commerce.productName(),
  price: faker.number.int({ min: 100, max: 5000 }),
  sku: faker.string.alphanumeric(8).toUpperCase(),
});
```

#### 2. 資料清理腳本
**預計新增檔案**：
```
scripts/
├── cleanup-test-data.js            # 清理測試資料
├── reset-test-accounts.js          # 重置測試帳號
└── generate-fixtures.js            # 產生 fixtures 資料
```

---

### 🧪 測試覆蓋率與報告優化

#### 1. 測試覆蓋率追蹤
**預計新增檔案**：
```
scripts/
├── generate-coverage-report.js     # 產生覆蓋率報告
└── upload-coverage.js              # 上傳至 Codecov/Coveralls
```

#### 2. Allure 報告整合
**預計新增檔案**：
```
allure-results/                     # Allure 測試結果
allure-report/                      # Allure HTML 報告
playwright.config.ts                # 新增 Allure reporter
```

**playwright.config.ts 範例**：
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html'],
    ['allure-playwright'],           // 新增 Allure reporter
    ['json', { outputFile: 'test-results.json' }],
  ],
});
```

#### 3. 自動化測試報告生成
**預計新增檔案**：
```
scripts/
├── generate-test-summary.js        # 產生測試摘要
├── generate-markdown-report.js     # 產生 Markdown 報告
└── compare-test-results.js         # 比較歷史測試結果
```

---

### 🔍 測試穩定性與效能優化

#### 1. Retry 與容錯機制
**playwright.config.ts 優化**：
```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,   // CI 環境自動重試
  workers: process.env.CI ? 1 : 4,   // CI 環境單 worker，本地並行
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});
```

#### 2. Visual Regression Testing
**預計新增檔案**：
```
tests/visual/
├── homepage.visual.spec.ts         # 首頁視覺回歸測試
├── cart.visual.spec.ts             # 購物車視覺回歸測試
└── login.visual.spec.ts            # 登入頁視覺回歸測試
```

**範例**：
```typescript
test('homepage visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

#### 3. 效能測試整合
**預計新增檔案**：
```
tests/performance/
├── page-load.perf.spec.ts          # 頁面載入效能測試
└── api-response-time.perf.spec.ts  # API 回應時間測試
```

---

### 🛠️ Helper 重構與擴充

#### 1. API Helper 完整化
**預計新增檔案**：
```
helpers/
├── apiClient.ts                    # 統一 API 請求封裝（基礎類別）
├── cartApiHelper.ts                # 購物車 API（已存在）
├── loginApiHelper.ts               # 登入 API
├── orderApiHelper.ts               # 訂單 API
├── userApiHelper.ts                # 用戶 API
└── productApiHelper.ts             # 商品 API
```

**apiClient.ts 範例**：
```typescript
export class ApiClient {
  constructor(private baseURL: string, private token?: string) {}

  async get(endpoint: string) { ... }
  async post(endpoint: string, data: any) { ... }
  async put(endpoint: string, data: any) { ... }
  async delete(endpoint: string) { ... }
  
  setToken(token: string) { ... }
  refreshToken() { ... }
}
```

#### 2. Page Object 擴充
**預計新增檔案**：
```
pages/
├── checkout.page.ts                # 結帳頁面
├── order.page.ts                   # 訂單查詢頁面
├── member.page.ts                  # 會員中心頁面
└── search.page.ts                  # 搜尋結果頁面
```

---

### 📦 測試模組化與可重用性提升

#### 1. Custom Fixtures
**預計新增檔案**：
```
fixtures/
├── customFixtures.ts               # 自訂 Fixtures（登入狀態、購物車狀態）
└── testData.ts                     # 測試資料 Fixtures
```

**customFixtures.ts 範例**：
```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { CartPage } from '../pages/cart.page';

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },
  loggedInUser: async ({ page }, use) => {
    // 自動登入並提供用戶資訊
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.quickLogin();
    await use({ email: 'test@example.com', token: '...' });
  },
});
```

#### 2. 共用測試邏輯抽取
**預計新增檔案**：
```
tests/shared/
├── loginSteps.ts                   # 登入步驟共用邏輯
├── cartSteps.ts                    # 購物車步驟共用邏輯
└── checkoutSteps.ts                # 結帳步驟共用邏輯
```

---

### 📋 測試管理與追蹤

#### 1. 測試案例管理工具整合
**預計整合**：
- TestRail
- Zephyr
- Azure Test Plans

**預計新增檔案**：
```
scripts/
├── sync-testrail.js                # 同步測試結果至 TestRail
└── generate-test-matrix.js         # 產生測試矩陣
```

#### 2. 測試標籤與分類
**playwright.config.ts 優化**：
```typescript
// 測試標籤範例
test.describe('Login @smoke @priority-high', () => {
  test('TC-LOGIN-0001', async ({ page }) => { ... });
});

test.describe('Cart @regression @priority-medium', () => {
  test('TC-CART-0001', async ({ page }) => { ... });
});
```

**執行特定標籤**：
```bash
npx playwright test --grep @smoke       # 只執行 smoke 測試
npx playwright test --grep @regression  # 只執行 regression 測試
```

---

### 🔐 安全性與權限測試

#### 1. 安全性測試
**預計新增檔案**：
```
tests/security/
├── auth-security.spec.ts           # 認證安全測試（SQL Injection、XSS）
├── api-security.spec.ts            # API 權限測試
└── session-security.spec.ts        # Session 安全測試
```

#### 2. OWASP Top 10 測試
**預計新增檔案**：
```
tests/security/owasp/
├── injection.spec.ts               # SQL Injection 測試
├── broken-auth.spec.ts             # 破損認證測試
├── sensitive-data.spec.ts          # 敏感資料外洩測試
└── xml-external-entities.spec.ts   # XXE 測試
```

---

### 📱 跨裝置與跨瀏覽器測試

#### 1. RWD 測試
**預計新增檔案**：
```
tests/responsive/
├── mobile.spec.ts                  # 手機版測試
├── tablet.spec.ts                  # 平板版測試
└── desktop.spec.ts                 # 桌面版測試
```

**playwright.config.ts 優化**：
```typescript
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
    { name: 'tablet', use: { ...devices['iPad Pro'] } },
  ],
});
```

---

### 📈 持續優化建議

#### 短期目標（1-2 個月）
1. ✅ 完成 CI/CD 整合（GitHub Actions）
2. ✅ 建立測試資料工廠（Faker.js）
3. ✅ 新增 Allure 報告
4. ✅ 實作自動通知機制（Slack/Email）

#### 中期目標（3-6 個月）
1. ✅ 擴充 Page Object（結帳、訂單、會員中心）
2. ✅ 完善 API Helper（登入、訂單、用戶、商品）
3. ✅ 實作 Visual Regression Testing
4. ✅ 整合測試管理工具（TestRail）

#### 長期目標（6-12 個月）
1. ✅ 完整的安全性測試覆蓋（OWASP Top 10）
2. ✅ 效能測試整合（Lighthouse / k6）
3. ✅ 多語系測試覆蓋
4. ✅ 無障礙測試（Accessibility Testing）

---

## 總結

本專案採用**分層架構 + Page Object Model + E2E & API 雙軌測試**的設計，確保高內聚、低耦合、易維護。透過持續優化與擴充，將建立完善的企業級自動化測試框架，提升測試效率與專案品質。

---

**文件維護者**：Howie  
**最後更新**：2025-01-29  
**版本**：v1.0
