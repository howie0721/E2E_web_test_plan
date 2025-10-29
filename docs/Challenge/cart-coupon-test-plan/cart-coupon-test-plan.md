# 購物車「選擇優惠券」測試案例規劃

## 目錄
- [1. 架構規劃](#1-架構規劃)
- [2. 優惠券變因分析](#2-優惠券變因分析)
- [3. 測試案例設計脈絡](#3-測試案例設計脈絡)
- [4. 詳細測試案例](#4-詳細測試案例)
- [5. 測試資料設計](#5-測試資料設計)
- [6. 實作建議](#6-實作建議)

---

## 1. 架構規劃

### 1.1 測試分層設計

```
Shepherdtech_Interview_final/
├── pages/
│   ├── cart.page.ts              # 購物車頁面 POM
│   ├── coupon.page.ts            # 優惠券選擇頁面 POM
│   └── checkout.page.ts          # 結帳頁面 POM
├── fixtures/
│   ├── coupons.json              # 優惠券測試資料
│   │   ├── valid-coupons         # 有效優惠券
│   │   ├── expired-coupons       # 過期優惠券
│   │   ├── amount-coupons        # 滿額優惠券
│   │   ├── shipping-coupons      # 免運優惠券
│   │   └── product-coupons       # 單品優惠券
│   └── cart-scenarios.json       # 購物車情境測資
├── helpers/
│   ├── couponFactory.ts          # 優惠券資料工廠
│   ├── cartApiMock.ts            # 購物車 API Mock
│   ├── couponApiStub.ts          # 優惠券 API Stub
│   └── waitForCouponApply.ts     # 優惠券套用等待工具
└── tests/
    └── cart/
        └── coupon/
            ├── TC-COUPON-0001-apply-valid.spec.ts
            ├── TC-COUPON-0002-apply-expired.spec.ts
            ├── TC-COUPON-0003-amount-threshold.spec.ts
            ├── TC-COUPON-0004-multiple-switch.spec.ts
            └── TC-COUPON-0005-cart-change.spec.ts
```

### 1.2 Page Object Model (POM) 設計

#### `pages/coupon.page.ts`
```typescript
export class CouponPage {
  // 選擇優惠券
  async selectCoupon(couponId: string): Promise<void>
  
  // 輸入優惠券代碼
  async enterCouponCode(code: string): Promise<void>
  
  // 驗證優惠券折抵金額
  async getDiscountAmount(): Promise<number>
  
  // 取得可用優惠券清單
  async getAvailableCoupons(): Promise<string[]>
  
  // 移除優惠券
  async removeCoupon(): Promise<void>
  
  // 取得錯誤訊息
  async getErrorMessage(): Promise<string>
}
```

### 1.3 測試資料工廠 (Factory Pattern)

#### `helpers/couponFactory.ts`
```typescript
export class CouponFactory {
  // 產生有效優惠券
  static createValidCoupon(options?: Partial<Coupon>): Coupon
  
  // 產生過期優惠券
  static createExpiredCoupon(): Coupon
  
  // 產生滿額優惠券
  static createAmountCoupon(threshold: number): Coupon
  
  // 產生單品優惠券
  static createProductCoupon(productId: string): Coupon
  
  // 產生免運優惠券
  static createShippingCoupon(): Coupon
}
```

---

## 2. 優惠券變因分析

### 2.1 優惠券屬性變因

| 變因類別 | 可能值 | 影響範圍 |
|---------|--------|---------|
| **優惠券狀態** | 有效 / 過期 / 已使用 / 已領完 | 是否可選擇 |
| **優惠券類型** | 折價券 / 折扣券 / 免運券 / 滿額券 / 贈品券 | 折抵方式與顯示 |
| **適用商品** | 全站 / 指定分類 / 指定商品 / 排除商品 | 商品變動時的有效性 |
| **使用門檻** | 無門檻 / 滿額 / 滿件 / 新會員限定 / 舊會員限定 | 是否可用 |
| **使用限制** | 單次 / 多次 / 每人限用 / 每帳號限用 | 重複使用驗證 |
| **疊加規則** | 可疊加 / 互斥 / 優先順序 | 多券選擇邏輯 |
| **時效性** | 有效期限 / 發放時間 / 使用時段 | 時間驗證 |

### 2.2 購物車狀態變因

| 變因類別 | 可能值 | 影響範圍 |
|---------|--------|---------|
| **商品數量** | 0 / 1 / 多項 / 超過上限 | 滿件券有效性 |
| **商品金額** | 低於門檻 / 剛好門檻 / 高於門檻 | 滿額券有效性 |
| **商品類型** | 一般商品 / 促銷商品 / 排除商品 | 優惠券適用性 |
| **運送方式** | 宅配 / 超商取貨 / 自取 | 免運券有效性 |

### 2.3 用戶狀態變因

| 變因類別 | 可能值 | 影響範圍 |
|---------|--------|---------|
| **登入狀態** | 已登入 / 未登入 / Token 過期 | 會員專屬券 |
| **會員等級** | 新會員 / 舊會員 / VIP | 限定券種 |
| **已用次數** | 0 / 1 / 達上限 | 每人限用券 |

### 2.4 系統狀態變因

| 變因類別 | 可能值 | 影響範圍 |
|---------|--------|---------|
| **API 狀態** | 正常 / Timeout / 500 錯誤 | 錯誤處理 |
| **網路狀態** | 正常 / 斷線 / 延遲 | 重試機制 |
| **並發操作** | 單裝置 / 多裝置 / 多分頁 | 資料同步 |

---

## 3. 測試案例設計脈絡

### 3.1 思考脈絡流程圖

```
優惠券選擇測試設計思考流程
│
├─ 1. 識別所有變因（狀態、類型、門檻、限制）
│   ↓
├─ 2. 定義優惠券與購物車的組合情境
│   ↓
├─ 3. 設計正向測試（Happy Path）
│   ├─ 有效優惠券可正常套用
│   ├─ 折抵金額計算正確
│   └─ 優惠券可切換與移除
│   ↓
├─ 4. 設計負向測試（Negative Cases）
│   ├─ 過期/無效/已用過優惠券
│   ├─ 未達門檻無法使用
│   ├─ 排除商品不可用
│   └─ 權限不足（未登入、非會員）
│   ↓
├─ 5. 設計邊界測試（Edge Cases）
│   ├─ 剛好達到/未達到門檻
│   ├─ 多張優惠券疊加規則
│   ├─ 優惠券與促銷衝突
│   └─ 商品變動導致優惠券失效
│   ↓
├─ 6. 設計異常測試（Exception Handling）
│   ├─ API 回傳錯誤
│   ├─ 網路異常
│   ├─ 並發操作衝突
│   └─ 快速切換優惠券
│   ↓
└─ 7. 設計整合測試（Integration）
    ├─ 購物車 → 優惠券 → 結帳流程
    ├─ 多裝置同步
    └─ 前後端資料一致性
```

### 3.2 測試案例分類

#### **Level 1: 基礎功能測試（P0）**
- ✅ 選擇有效優惠券
- ✅ 優惠券正確折抵金額
- ✅ 移除優惠券
- ✅ 切換不同優惠券

#### **Level 2: 業務規則測試（P1）**
- ⚠️ 滿額券門檻驗證
- ⚠️ 單品券商品限制
- ⚠️ 免運券運送方式限制
- ⚠️ 會員限定券權限驗證

#### **Level 3: 邊界與異常測試（P1）**
- ⚠️ 剛好達到/未達到門檻
- ⚠️ 優惠券過期/已用完
- ⚠️ 購物車商品變動
- ⚠️ 多張優惠券疊加規則

#### **Level 4: 系統穩定性測試（P2）**
- 🔄 API 異常處理
- 🔄 網路斷線重連
- 🔄 並發操作同步
- 🔄 快速切換/重複點擊

---

## 4. 詳細測試案例

### 4.1 正向情境測試

#### TC-COUPON-0001: 選擇有效優惠券並套用
- **前置條件**：已登入，購物車有商品
- **測試步驟**：
  1. 前往購物車頁面
  2. 點擊「選擇優惠券」
  3. 選擇有效優惠券「SAVE100」
  4. 點擊「套用」
- **預期結果**：
  - 優惠券成功套用
  - 折抵金額顯示「-$100」
  - 總金額正確扣除

#### TC-COUPON-0002: 切換不同優惠券
- **前置條件**：已登入，購物車有商品，已套用優惠券 A
- **測試步驟**：
  1. 點擊「更換優惠券」
  2. 選擇優惠券 B
  3. 點擊「套用」
- **預期結果**：
  - 優惠券 A 被移除
  - 優惠券 B 成功套用
  - 折抵金額更新為優惠券 B 的折抵

#### TC-COUPON-0003: 手動輸入優惠券代碼
- **前置條件**：已登入，購物車有商品
- **測試步驟**：
  1. 點擊「輸入優惠券代碼」
  2. 輸入「SAVE200」
  3. 點擊「套用」
- **預期結果**：
  - 優惠券成功套用
  - 折抵金額顯示「-$200」

### 4.2 業務規則測試

#### TC-COUPON-0101: 滿額券門檻驗證（未達門檻）
- **前置條件**：已登入，購物車金額 $400
- **測試步驟**：
  1. 選擇滿 $500 折 $100 優惠券
  2. 點擊「套用」
- **預期結果**：
  - 顯示「尚未達到使用門檻，還差 $100」
  - 優惠券不可選擇（呈灰色或 disabled）

#### TC-COUPON-0102: 滿額券門檻驗證（達到門檻）
- **前置條件**：已登入，購物車金額 $500
- **測試步驟**：
  1. 選擇滿 $500 折 $100 優惠券
  2. 點擊「套用」
- **預期結果**：
  - 優惠券成功套用
  - 折抵金額顯示「-$100」

#### TC-COUPON-0103: 單品券商品限制
- **前置條件**：已登入，購物車有「商品 A」與「商品 B」
- **測試步驟**：
  1. 選擇「商品 A 專用 9 折券」
  2. 點擊「套用」
- **預期結果**：
  - 優惠券成功套用
  - 僅「商品 A」享有 9 折
  - 「商品 B」不受影響

#### TC-COUPON-0104: 會員限定券權限驗證
- **前置條件**：已登入（新會員），購物車有商品
- **測試步驟**：
  1. 選擇「舊會員專屬券」
  2. 點擊「套用」
- **預期結果**：
  - 顯示「此優惠券僅限舊會員使用」
  - 優惠券不可選擇

### 4.3 負向與異常測試

#### TC-COUPON-0201: 輸入無效優惠券代碼
- **前置條件**：已登入，購物車有商品
- **測試步驟**：
  1. 輸入優惠券代碼「INVALID123」
  2. 點擊「套用」
- **預期結果**：
  - 顯示「優惠券代碼無效」
  - 優惠券不套用

#### TC-COUPON-0202: 輸入過期優惠券代碼
- **前置條件**：已登入，購物車有商品
- **測試步驟**：
  1. 輸入過期優惠券代碼「EXPIRED2024」
  2. 點擊「套用」
- **預期結果**：
  - 顯示「優惠券已過期」
  - 優惠券不套用

#### TC-COUPON-0203: 重複使用已用過的優惠券
- **前置條件**：已登入，優惠券「ONETIME」已使用過
- **測試步驟**：
  1. 選擇優惠券「ONETIME」
  2. 點擊「套用」
- **預期結果**：
  - 顯示「此優惠券已使用過」
  - 優惠券不可選擇

#### TC-COUPON-0204: 優惠券已領完
- **前置條件**：已登入，優惠券「LIMITED100」僅剩 0 張
- **測試步驟**：
  1. 選擇優惠券「LIMITED100」
  2. 點擊「套用」
- **預期結果**：
  - 顯示「此優惠券已領完」
  - 優惠券不可選擇

### 4.4 邊界值測試

#### TC-COUPON-0301: 剛好達到滿額門檻
- **前置條件**：已登入，購物車金額 $500
- **測試步驟**：
  1. 選擇滿 $500 折 $100 優惠券
  2. 點擊「套用」
- **預期結果**：
  - 優惠券成功套用
  - 折抵金額顯示「-$100」

#### TC-COUPON-0302: 差 $1 未達門檻
- **前置條件**：已登入，購物車金額 $499
- **測試步驟**：
  1. 選擇滿 $500 折 $100 優惠券
  2. 點擊「套用」
- **預期結果**：
  - 顯示「尚未達到使用門檻，還差 $1」
  - 優惠券不可選擇

#### TC-COUPON-0303: 套用後移除商品導致未達門檻
- **前置條件**：已登入，購物車金額 $500，已套用滿 $500 折 $100 優惠券
- **測試步驟**：
  1. 移除一項商品，使金額降為 $400
  2. 觀察優惠券狀態
- **預期結果**：
  - 優惠券自動失效並移除
  - 顯示「因商品異動，優惠券已失效」
  - 總金額更新為 $400

### 4.5 多券疊加測試

#### TC-COUPON-0401: 可疊加優惠券同時套用
- **前置條件**：已登入，購物車金額 $1000
- **測試步驟**：
  1. 套用「滿 $500 折 $100」優惠券
  2. 再套用「免運券」
- **預期結果**：
  - 兩張優惠券同時生效
  - 折抵金額：-$100 + 免運費

#### TC-COUPON-0402: 互斥優惠券無法同時套用
- **前置條件**：已登入，購物車金額 $1000
- **測試步驟**：
  1. 套用「滿 $500 折 $100」優惠券
  2. 嘗試套用「全站 9 折券」（互斥）
- **預期結果**：
  - 顯示「此優惠券與已選擇的優惠券互斥」
  - 提示「是否更換優惠券？」

### 4.6 並發與同步測試

#### TC-COUPON-0501: 多分頁同時操作優惠券
- **前置條件**：已登入，開啟 2 個分頁
- **測試步驟**：
  1. 分頁 A 套用優惠券 A
  2. 分頁 B 套用優惠券 B
  3. 觀察兩個分頁的優惠券狀態
- **預期結果**：
  - 最後套用的優惠券生效
  - 兩個分頁自動同步至相同狀態

#### TC-COUPON-0502: 快速連續切換優惠券
- **前置條件**：已登入，購物車有商品
- **測試步驟**：
  1. 快速連續點擊優惠券 A、B、C
- **預期結果**：
  - 不產生重複請求
  - 最後選擇的優惠券生效

### 4.7 API 異常測試

#### TC-COUPON-0601: API 回傳 500 錯誤
- **前置條件**：Mock API 回傳 500 錯誤
- **測試步驟**：
  1. 選擇優惠券
  2. 點擊「套用」
- **預期結果**：
  - 顯示「系統異常，請稍後再試」
  - 優惠券不套用

#### TC-COUPON-0602: API Timeout
- **前置條件**：Mock API 延遲 30 秒
- **測試步驟**：
  1. 選擇優惠券
  2. 點擊「套用」
- **預期結果**：
  - 顯示載入中（Spinner）
  - 10 秒後顯示「請求逾時，請重試」

---

## 5. 測試資料設計

### 5.1 優惠券測試資料（`fixtures/coupons.json`）

```json
{
  "valid-coupons": [
    {
      "id": "SAVE100",
      "type": "amount",
      "discount": 100,
      "threshold": 0,
      "status": "active",
      "expiry": "2026-12-31"
    },
    {
      "id": "SAVE500",
      "type": "amount",
      "discount": 100,
      "threshold": 500,
      "status": "active",
      "expiry": "2026-12-31"
    }
  ],
  "expired-coupons": [
    {
      "id": "EXPIRED2024",
      "type": "amount",
      "discount": 200,
      "threshold": 0,
      "status": "expired",
      "expiry": "2024-12-31"
    }
  ],
  "product-coupons": [
    {
      "id": "PRODUCT-A-10OFF",
      "type": "percentage",
      "discount": 10,
      "applicable_products": ["product-a"],
      "status": "active",
      "expiry": "2026-12-31"
    }
  ],
  "shipping-coupons": [
    {
      "id": "FREESHIP",
      "type": "shipping",
      "discount": "free",
      "threshold": 0,
      "status": "active",
      "expiry": "2026-12-31"
    }
  ]
}
```

### 5.2 購物車情境測資（`fixtures/cart-scenarios.json`）

```json
{
  "below-threshold": {
    "total": 400,
    "items": [{ "id": "product-a", "price": 400, "quantity": 1 }]
  },
  "at-threshold": {
    "total": 500,
    "items": [{ "id": "product-a", "price": 500, "quantity": 1 }]
  },
  "above-threshold": {
    "total": 1000,
    "items": [{ "id": "product-a", "price": 1000, "quantity": 1 }]
  },
  "mixed-products": {
    "total": 800,
    "items": [
      { "id": "product-a", "price": 500, "quantity": 1 },
      { "id": "product-b", "price": 300, "quantity": 1 }
    ]
  }
}
```

---

## 6. 實作建議

### 6.1 使用 API Stubbing 提高穩定性

#### 範例：Mock 優惠券 API
```typescript
// helpers/couponApiStub.ts
// Mock 優惠券 API，根據不同情境 scenario 回傳對應結果
// @param page Playwright Page 物件
// @param scenario 'empty' | 'timeout' | 'error' | 其他
//   - 'empty'   ：回傳空優惠券清單
//   - 'timeout' ：模擬 API 請求逾時（30 秒）
//   - 'error'   ：回傳 500 錯誤
//   - 其他      ：正常通過，不攔截
export async function mockCouponAPI(page: Page, scenario: string) {
  await page.route('**/api/ec/coupons/available_coupons', async route => {
    if (scenario === 'empty') {
      // 回傳空資料，模擬沒有可用優惠券
      await route.fulfill({ json: { data: [] } });
    } else if (scenario === 'timeout') {
      // 延遲 30 秒，模擬 API timeout
      await new Promise(resolve => setTimeout(resolve, 30000));
    } else if (scenario === 'error') {
      // 回傳 500 錯誤，模擬伺服器異常
      await route.fulfill({ status: 500 });
    } else {
      // 其他情境，正常通過
      await route.continue();
    }
  });
}
```

### 6.2 參數化測試

```typescript
const couponScenarios = [
  { code: 'SAVE100', expected: -100, shouldPass: true },
  { code: 'EXPIRED2024', expected: 0, shouldPass: false },
  { code: 'INVALID', expected: 0, shouldPass: false },
];

couponScenarios.forEach(({ code, expected, shouldPass }) => {
  test(`優惠券 ${code} 測試`, async ({ page }) => {
    await couponPage.enterCouponCode(code);
    const discount = await couponPage.getDiscountAmount();
    if (shouldPass) {
      expect(discount).toBe(expected);
    } else {
      const error = await couponPage.getErrorMessage();
      expect(error).toContain('無效');
    }
  });
});
```

### 6.3 等待策略

```typescript
// helpers/waitForCouponApply.ts
export async function waitForCouponApply(page: Page) {
  // 等待 API 回應
  await page.waitForResponse(resp => 
    resp.url().includes('/api/ec/coupons/apply') && resp.status() === 200
  );
  
  // 等待折抵金額更新
  await page.waitForSelector('.discount-amount:not(:empty)');
  
  // 等待載入動畫消失
  await page.waitForSelector('.loading-spinner', { state: 'hidden' });
}
```

### 6.4 測試執行策略

- **並行執行**：不同類型的優惠券測試可並行
- **隔離環境**：每個測試使用獨立的購物車狀態
- **資料清理**：測試後清除已套用的優惠券
- **重試機制**：API 相關測試允許 1-2 次重試

---

## 7. 總結

### 7.1 設計重點

1. **變因識別**：優惠券狀態、類型、門檻、限制、購物車狀態、用戶狀態
2. **分層測試**：正向 → 業務規則 → 邊界 → 異常 → 整合
3. **資料驅動**：使用 fixtures 與工廠模式產生多樣測試資料
4. **穩定性優先**：使用 API Stubbing 減少對真實後端的依賴
5. **可維護性**：POM + Helper + Factory 分層架構

### 7.2 優先級建議

| 優先級 | 測試類型 | 預估案例數 |
|-------|---------|-----------|
| P0 | 基礎功能（套用、移除、切換） | 5-8 個 |
| P1 | 業務規則（門檻、限制、權限） | 10-15 個 |
| P1 | 邊界與異常（過期、無效、商品變動） | 8-12 個 |
| P2 | 系統穩定性（並發、API 異常） | 5-8 個 |

---

> **本文件為購物車優惠券測試案例規劃與設計脈絡，提供完整的架構、變因分析、測試案例與實作建議。**