# E2E 測試中不適合直接串接的 API 盤點與 Network Stubbing 策略

## 目錄
- [1. 不適合 E2E 的 API 類型盤點](#1-不適合-e2e-的-api-類型盤點)
- [2. Network Stubbing 策略](#2-network-stubbing-策略)
- [3. Playwright 實作範例](#3-playwright-實作範例)
- [4. HAR 檔案使用策略](#4-har-檔案使用策略)
- [5. 測試穩定性最佳實踐](#5-測試穩定性最佳實踐)

---

## 1. 不適合 E2E 的 API 類型盤點

### 1.1 第三方金流與支付 API

#### 不適合原因
- ✗ 會產生真實交易與扣款
- ✗ 測試環境可能無沙盒模式
- ✗ 需要真實信用卡資訊
- ✗ 手續費與金流記錄難以清理

#### 相關 API 範例
```
POST /api/payment/tpay/charge
POST /api/payment/ecpay/checkout
POST /api/payment/linepay/confirm
```

#### 建議做法
- ✅ 使用 `page.route()` 攔截支付 API
- ✅ Mock 回傳「支付成功」或「支付失敗」
- ✅ 驗證前端 UI 流程（按鈕狀態、跳轉、提示訊息）
- ✅ 僅在「支付 API 專項測試」時使用沙盒環境

---

### 1.2 簡訊與 Email 發送 API (OTP)

#### 不適合原因
- ✗ 會發送真實簡訊/Email，產生成本
- ✗ OTP 需手動輸入，難以自動化
- ✗ 簡訊供應商可能有頻率限制
- ✗ 測試環境可能無法收到 OTP

#### 相關 API 範例
```
POST /api/auth/send-otp
POST /api/notification/send-email
POST /api/notification/send-sms
```

#### 建議做法
- ✅ Mock OTP 發送 API，直接回傳固定 OTP（如 `123456`）
- ✅ 或使用測試專用手機號碼（如 `+886900000000`）回傳固定 OTP
- ✅ 驗證「發送成功」提示與倒數計時
- ✅ 測試 OTP 驗證邏輯（正確/錯誤/過期）時使用固定 OTP

---

### 1.3 外部社群登入 API (OAuth)

#### 不適合原因
- ✗ 需跳轉至第三方網站（Google、Facebook、LINE）
- ✗ 依賴外部服務穩定性
- ✗ 帳號密碼管理困難
- ✗ 可能觸發人機驗證（CAPTCHA）

#### 相關 API 範例
```
GET /oauth/google/callback
GET /oauth/facebook/callback
GET /oauth/line/callback
POST /api/auth/social-login
```

#### 建議做法
- ✅ Mock OAuth callback，直接回傳已登入狀態
- ✅ 使用 `storageState` 預先載入登入狀態
- ✅ 僅在「社群登入專項測試」時走真實流程（使用測試帳號）
- ✅ 驗證前端登入後的 UI 變化（顯示會員名稱、登出按鈕等）

---

### 1.4 會員註冊與刪除 API

#### 不適合原因
- ✗ 會產生大量測試帳號，污染資料庫
- ✗ Email/手機號碼唯一性限制，難以重複測試
- ✗ 刪除操作不可逆，影響資料完整性
- ✗ 可能觸發 Email 驗證流程

#### 相關 API 範例
```
POST /api/auth/register
DELETE /api/user/account
POST /api/user/verify-email
```

#### 建議做法
- ✅ Mock 註冊 API，回傳「註冊成功」
- ✅ 使用預先建立的測試帳號（定期清理）
- ✅ 僅在「註冊流程專項測試」時走真實流程
- ✅ 測試後自動清理測試資料（使用 API 或資料庫腳本）

---

### 1.5 促銷/優惠券領取與核銷 API

#### 不適合原因
- ✗ 會影響優惠券庫存與發放數量
- ✗ 限量優惠券可能被測試消耗
- ✗ 已領取記錄難以還原
- ✗ 影響真實用戶權益

#### 相關 API 範例
```
POST /api/ec/coupons/claim
POST /api/ec/coupons/apply
POST /api/ec/coupons/redeem
GET /api/ec/coupons/available_coupons
```

#### 建議做法
- ✅ Mock 優惠券領取 API，回傳「領取成功」
- ✅ Mock 優惠券清單 API，回傳固定測試優惠券
- ✅ 驗證前端折抵邏輯與金額計算
- ✅ 使用測試專用優惠券代碼（不影響正式環境）

---

### 1.6 訂單建立與出貨通知 API

#### 不適合原因
- ✗ 會產生真實訂單記錄
- ✗ 可能觸發出貨、物流、發票等後續流程
- ✗ 影響庫存與銷售統計
- ✗ 訂單刪除可能有限制

#### 相關 API 範例
```
POST /api/ec/order/create
POST /api/ec/order/confirm
POST /api/logistics/ship
POST /api/invoice/issue
```

#### 建議做法
- ✅ Mock 訂單建立 API，回傳「訂單編號」與「訂單成功」
- ✅ 測試僅到「確認訂單」畫面，不實際送出
- ✅ 使用測試環境專用資料庫
- ✅ 驗證前端 UI（訂單摘要、金額、收件資訊）

---

### 1.7 即時庫存與價格查詢 API

#### 不適合原因
- ✗ 資料頻繁變動，難以預測結果
- ✗ 依賴外部資料來源（供應商、ERP）
- ✗ 測試結果不穩定（今天有庫存，明天可能缺貨）
- ✗ 價格可能受促銷、匯率影響

#### 相關 API 範例
```
GET /api/ec/product/stock
GET /api/ec/product/price
GET /api/ec/product/availability
```

#### 建議做法
- ✅ 使用 HAR 檔案錄製固定回應
- ✅ Mock 庫存 API，回傳固定庫存數量（如 100）
- ✅ 驗證「有庫存」與「無庫存」兩種情境的 UI 變化
- ✅ 定期更新 Mock 資料，確保與實際 API 格式一致

---

### 1.8 第三方數據分析與追蹤 API

#### 不適合原因
- ✗ 會產生虛假的分析數據
- ✗ 影響行銷與 GA 報表準確性
- ✗ 測試流量與真實流量混淆
- ✗ 可能觸發廣告成本

#### 相關 API 範例
```
POST /api/analytics/track-event
POST /api/marketing/conversion
GET /api/analytics/user-behavior
```

#### 建議做法
- ✅ Mock 或完全跳過追蹤 API
- ✅ 使用測試專用 GA ID 或追蹤碼
- ✅ 驗證前端是否正確呼叫追蹤 API（但不驗證資料內容）
- ✅ 於正式環境手動驗證追蹤數據

---

## 2. Network Stubbing 策略

### 2.1 Playwright Route API 攔截

#### 基本用法
```typescript
// 攔截 OTP 發送 API，回傳固定 OTP
await page.route('**/api/auth/send-otp', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      message: 'OTP 已發送',
      otp: '123456' // 測試專用固定 OTP
    })
  });
});
```

#### 條件式 Mock
```typescript
// 根據請求參數回傳不同結果
await page.route('**/api/ec/coupons/apply', async (route, request) => {
  const postData = request.postDataJSON();
  
  if (postData.coupon_code === 'VALID100') {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, discount: 100 })
    });
  } else if (postData.coupon_code === 'EXPIRED') {
    await route.fulfill({
      status: 400,
      body: JSON.stringify({ success: false, message: '優惠券已過期' })
    });
  } else {
    await route.continue(); // 其他情況走真實 API
  }
});
```

#### 模擬 API 延遲與錯誤
```typescript
// 模擬 API Timeout
await page.route('**/api/payment/charge', async route => {
  await new Promise(resolve => setTimeout(resolve, 30000)); // 延遲 30 秒
  await route.fulfill({ status: 504, body: 'Gateway Timeout' });
});

// 模擬 API 500 錯誤
await page.route('**/api/order/create', async route => {
  await route.fulfill({
    status: 500,
    body: JSON.stringify({ error: 'Internal Server Error' })
  });
});
```

---

### 2.2 使用 HAR 檔案重播

#### 錄製 HAR 檔案
```typescript
// 錄製 HAR
const context = await browser.newContext({
  recordHar: { path: 'fixtures/api-responses.har' }
});

// 執行測試流程（會自動錄製所有 API）
const page = await context.newPage();
await page.goto('https://www.dogcatstar.com');
// ... 操作流程

await context.close(); // HAR 檔案自動儲存
```

#### 重播 HAR 檔案
```typescript
// 重播 HAR（所有 API 回應都來自 HAR 檔案）
const context = await browser.newContext({
  recordHar: { 
    path: 'fixtures/api-responses.har',
    mode: 'replay' // 重播模式
  }
});

const page = await context.newPage();
// 所有 API 請求都會從 HAR 檔案取得回應，不會實際呼叫後端
```

#### HAR 檔案與 Route 混用
```typescript
// 大部分 API 用 HAR，特定 API 用 route mock
const context = await browser.newContext({
  recordHar: { 
    path: 'fixtures/api-responses.har',
    mode: 'replay'
  }
});

const page = await context.newPage();

// 覆寫特定 API（優先於 HAR）
await page.route('**/api/auth/send-otp', async route => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ otp: '123456' })
  });
});
```

---

### 2.3 Mock 第三方服務

#### Mock Google OAuth
```typescript
// 攔截 Google OAuth callback
await page.route('**/oauth/google/callback*', async route => {
  await route.fulfill({
    status: 302,
    headers: {
      'Location': 'https://www.dogcatstar.com/?login=success'
    }
  });
});

// 設定已登入狀態
await context.addCookies([
  {
    name: 'user_id',
    value: '362822',
    domain: 'www.dogcatstar.com',
    path: '/'
  }
]);
```

#### Mock 金流 API
```typescript
// 攔截支付 API
await page.route('**/api/payment/tpay/charge', async route => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({
      success: true,
      transaction_id: 'TEST_TXN_' + Date.now(),
      status: 'paid'
    })
  });
});
```

---

## 3. Playwright 實作範例

### 3.1 範例：Mock OTP 登入流程

```typescript
import { test, expect } from '@playwright/test';

test('Mock OTP 登入流程', async ({ page }) => {
  // 1. Mock OTP 發送 API
  await page.route('**/api/auth/send-otp', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        message: 'OTP 已發送',
        otp: '123456' // 固定 OTP
      })
    });
  });

  // 2. Mock OTP 驗證 API
  await page.route('**/api/auth/verify-otp', async (route, request) => {
    const postData = request.postDataJSON();
    
    if (postData.otp === '123456') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          token: 'mock-token-12345',
          user: { id: 362822, name: '測試用戶' }
        })
      });
    } else {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({
          success: false,
          message: 'OTP 錯誤'
        })
      });
    }
  });

  // 3. 執行登入流程
  await page.goto('https://www.dogcatstar.com/login');
  await page.fill('input[name="phone"]', '0912345678');
  await page.click('button:has-text("發送驗證碼")');
  
  // 驗證 OTP 發送成功提示
  await expect(page.locator('text=OTP 已發送')).toBeVisible();
  
  // 輸入固定 OTP
  await page.fill('input[name="otp"]', '123456');
  await page.click('button:has-text("登入")');
  
  // 驗證登入成功
  await expect(page).toHaveURL(/.*my-account/);
});
```

---

### 3.2 範例：Mock 優惠券套用

```typescript
test('Mock 優惠券套用流程', async ({ page }) => {
  // Mock 優惠券清單 API
  await page.route('**/api/ec/coupons/available_coupons', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        data: [
          { id: 'SAVE100', name: '折價 100 元', discount: 100 },
          { id: 'EXPIRED', name: '已過期優惠券', status: 'expired' }
        ]
      })
    });
  });

  // Mock 優惠券套用 API
  await page.route('**/api/ec/coupons/apply', async (route, request) => {
    const postData = request.postDataJSON();
    
    if (postData.coupon_id === 'SAVE100') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          discount: 100,
          total: 900 // 原價 1000 - 100
        })
      });
    } else {
      await route.fulfill({
        status: 400,
        body: JSON.stringify({
          success: false,
          message: '優惠券無效或已過期'
        })
      });
    }
  });

  // 執行測試流程
  await page.goto('https://www.dogcatstar.com/cart');
  await page.click('button:has-text("選擇優惠券")');
  await page.click('text=折價 100 元');
  await page.click('button:has-text("套用")');
  
  // 驗證折抵金額
  await expect(page.locator('.discount-amount')).toHaveText('-$100');
  await expect(page.locator('.total-amount')).toHaveText('$900');
});
```

---

### 3.3 範例:使用 HAR 檔案穩定測試

```typescript
test('使用 HAR 重播購物車流程', async ({ browser }) => {
  const context = await browser.newContext({
    recordHar: {
      path: 'fixtures/cart-flow.har',
      mode: 'replay' // 重播模式
    }
  });

  const page = await context.newPage();
  
  // 所有 API 都來自 HAR 檔案，不受後端變動影響
  await page.goto('https://www.dogcatstar.com');
  await page.click('text=加入購物車');
  
  // 驗證購物車數量（資料來自 HAR）
  await expect(page.locator('.cart-count')).toHaveText('1');
  
  await context.close();
});
```

---

## 4. HAR 檔案使用策略

### 4.1 HAR 檔案管理

#### 錄製策略
- ✅ 針對不同測試情境錄製獨立 HAR（如：有庫存、無庫存、有優惠券、無優惠券）
- ✅ 定期更新 HAR 檔案（建議每月或 API 改版後）
- ✅ 版本控管 HAR 檔案（加入 Git，方便回溯）

#### 檔案結構範例
```
fixtures/
├── har/
│   ├── cart-with-items.har       # 購物車有商品
│   ├── cart-empty.har             # 購物車空的
│   ├── coupon-available.har       # 有可用優惠券
│   ├── coupon-expired.har         # 優惠券過期
│   └── product-out-of-stock.har   # 商品無庫存
```

#### 自動更新 HAR
```typescript
// 定期錄製最新 HAR（可整合至 CI/CD）
test('錄製最新 API 回應', async ({ browser }) => {
  const context = await browser.newContext({
    recordHar: { 
      path: 'fixtures/har/latest.har',
      mode: 'record' // 錄製模式
    }
  });

  const page = await context.newPage();
  await page.goto('https://www.dogcatstar.com');
  // ... 執行完整流程
  await context.close(); // HAR 自動儲存
});
```

---

### 4.2 HAR 與 Mock 混用策略

```typescript
test('HAR + Route 混用', async ({ browser }) => {
  // 大部分 API 用 HAR
  const context = await browser.newContext({
    recordHar: { 
      path: 'fixtures/har/base.har',
      mode: 'replay'
    }
  });

  const page = await context.newPage();

  // 特定 API 用 route 覆寫（優先於 HAR）
  await page.route('**/api/auth/send-otp', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ otp: '123456' })
    });
  });

  // 執行測試（OTP 來自 route，其他 API 來自 HAR）
  await page.goto('https://www.dogcatstar.com/login');
});
```

---

## 5. 測試穩定性最佳實踐

### 5.1 Mock 策略選擇指南

| API 類型 | 建議策略 | 理由 |
|---------|---------|------|
| 登入認證 | 使用 `storageState` | 重用登入狀態，避免重複登入 |
| OTP 發送 | `page.route()` Mock | 避免真實簡訊成本 |
| 金流支付 | `page.route()` Mock | 避免真實交易 |
| 優惠券領取 | `page.route()` Mock | 避免消耗限量優惠券 |
| 商品查詢 | HAR 重播 | 資料穩定，格式固定 |
| 購物車計算 | HAR 重播 | 金額計算邏輯複雜 |
| 第三方社群登入 | `page.route()` Mock | 避免依賴外部服務 |
| 訂單建立 | `page.route()` Mock | 避免產生真實訂單 |

---

### 5.2 測試分層建議

#### Layer 1: 完全 Mock（最快、最穩定）
- 所有 API 都用 Mock 或 HAR
- 僅驗證前端 UI 邏輯與流程
- 適合：快速回歸測試、CI/CD

#### Layer 2: 部分 Mock（平衡）
- 核心業務 API 走真實（如購物車計算、會員查詢）
- 第三方/破壞性 API 用 Mock（如金流、OTP）
- 適合：日常開發測試

#### Layer 3: 最少 Mock（最真實）
- 僅 Mock 第三方與破壞性 API
- 其餘走真實環境
- 適合：上線前驗證、Staging 環境測試

---

### 5.3 實務建議總結

#### ✅ DO（推薦做法）
- ✅ 使用 `storageState` 重用登入狀態
- ✅ Mock 第三方服務（金流、社群登入、OTP）
- ✅ Mock 破壞性操作（訂單、優惠券、註冊）
- ✅ 使用 HAR 檔案穩定查詢型 API
- ✅ 定期更新 Mock 與 HAR 資料
- ✅ 在測試報告標註 Mock 範圍

#### ✗ DON'T（避免做法）
- ✗ 在 E2E 測試中走真實金流
- ✗ 發送真實 OTP 簡訊
- ✗ 消耗限量優惠券
- ✗ 產生真實訂單與交易
- ✗ 依賴外部服務穩定性（如 Google OAuth）
- ✗ 在正式環境執行破壞性測試

---

### 5.4 測試報告範例

#### 測試案例標註
```typescript
test('Mock OTP 登入流程 [MOCKED: OTP API]', async ({ page }) => {
  // 測試名稱標註哪些 API 已 Mock
});

test('真實購物車計算 [REAL API]', async ({ page }) => {
  // 測試名稱標註使用真實 API
});
```

#### 測試報告區分
```markdown
## 測試結果報告

### Mock API 測試（穩定性優先）
- ✅ Mock OTP 登入流程
- ✅ Mock 優惠券套用
- ✅ Mock 金流支付

### 真實 API 測試（功能驗證）
- ✅ 購物車金額計算
- ✅ 會員資料查詢
- ⚠️ 商品庫存查詢（使用 HAR）

### 完全真實測試（上線前驗證）
- ✅ 完整購物流程（不含實際付款）
```

---

## 6. 附錄：常見問題與解決方案

### Q1: HAR 檔案過大怎麼辦？
- **A**: 使用 `urlFilter` 只錄製特定 API
```typescript
const context = await browser.newContext({
  recordHar: { 
    path: 'fixtures/cart.har',
    urlFilter: '**/api/ec/**' // 只錄製購物車相關 API
  }
});
```

### Q2: Mock API 回應格式與真實 API 不一致？
- **A**: 定期檢查 API 文件，或錄製最新 HAR 作為參考

### Q3: 如何驗證 Mock 是否生效？
- **A**: 開啟 Playwright trace 或使用 `page.on('request')` 監聽
```typescript
page.on('request', request => {
  console.log('API 呼叫:', request.url());
});
```

### Q4: 測試環境與正式環境 API 不同？
- **A**: 使用環境變數切換 Mock 策略
```typescript
const useMock = process.env.TEST_ENV === 'ci';
if (useMock) {
  await page.route('**/api/**', mockHandler);
}
```

---

## 7. 總結

### 核心原則
1. **第三方/破壞性 API 一律 Mock**（金流、OTP、訂單、優惠券）
2. **查詢型 API 優先使用 HAR**（商品、會員、購物車）
3. **核心業務 API 可走真實**（金額計算、庫存查詢）
4. **測試分層執行**（快速回歸用 Mock，上線前用真實）
5. **定期更新 Mock 資料**（避免與實際 API 偏差）

### 預期效果
- 🚀 測試執行速度提升 50-80%（無需等待真實 API）
- 🎯 測試穩定性提升 90%+（不受外部服務影響）
- 💰 成本降低（無簡訊費、金流測試費）
- 🛡️ 避免資料污染（不影響正式環境）

---

> **本文件為 E2E 測試 API 盤點與 Network Stubbing 策略規劃，提供完整的實作範例與最佳實踐建議。**