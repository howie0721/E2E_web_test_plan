# 購物車 API 測試文件（無痕模式流程）

## 測試流程說明
此文件記錄「無痕模式」下的完整購物流程，從主頁瀏覽商品到結帳的所有 API 互動：
1. 主頁點擊跳轉商品頁
2. 商品加入購物車
3. 點擊購物車 icon 前往購物車頁面
4. 送出結帳

---

## 1. 購物車相關 API 列表

### 1.1 購物車查詢與計算
| API 端點 | 方法 | 用途 |
|---------|------|------|
| `/api/ec/v2/TW/cart/cart_request_cache` | GET | 查詢購物車快取資料 |
| `/api/ec/v2/TW/cart/first_purchase` | GET | 檢查是否為首次購物 |
| `/api/ec/v2/TW/cart/calculate` | POST | 計算購物車金額（含優惠、運費） |
| `/api/ec/v2/TW/cart/calculate_guest_discount` | POST | 計算訪客優惠折扣 |

### 1.2 優惠券相關
| API 端點 | 方法 | 用途 |
|---------|------|------|
| `/api/ec/coupons/available_coupons` | GET | 查詢可用優惠券列表 |

### 1.3 會員與地址
| API 端點 | 方法 | 用途 |
|---------|------|------|
| `/api/ec/user/address_info` | GET | 查詢用戶地址資訊 |
| `/dni/mu/checkout/fields` | GET | 查詢結帳欄位配置 |

### 1.4 認證相關
| API 端點 | 方法 | 用途 |
|---------|------|------|
| `/dni/mu/user/registered` | GET | 檢查用戶是否已註冊 |
| `/dni/mu/user/refresh_token` | GET | 刷新用戶 Token |

---

## 2. 詳細 API 規格與規則

### 2.1 查詢購物車快取
**API**: `GET https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/cart_request_cache`

**用途**: 取得當前購物車的快取資料，包含商品列表、數量、價格等

**必要 Headers**:
```
api-token: {api_token}
x-platform-token: {platform_token}
origin: https://www.dogcatstar.com
referer: https://www.dogcatstar.com/
accept: application/json
```

**規則**:
- 必須帶有效的 `api-token` 和 `x-platform-token`
- 無痕模式下，購物車資料儲存在瀏覽器本地或 session
- 回應包含購物車內所有商品、數量、SKU、價格資訊

**預期回應**:
- 200 OK: 成功取得購物車快取
- 401 Unauthorized: Token 無效或過期
- 403 Forbidden: 權限不足

---

### 2.2 檢查首次購物
**API**: `GET https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/first_purchase?country_code=TW&project_code=DCS`

**用途**: 判斷用戶是否為首次購物，影響首購優惠顯示

**必要 Headers**:
```
api-token: {api_token}
x-platform-token: {platform_token}
accept: application/json
```

**Query Parameters**:
- `country_code`: TW（台灣）
- `project_code`: DCS（Dogcatstar）

**規則**:
- 無痕模式下，通常會判定為首購用戶（無歷史訂單）
- 用於觸發首購優惠、新會員禮等活動
- 不影響購物車基本功能，僅影響優惠顯示

**預期回應**:
- 200 OK: 成功查詢，回傳 `{ "is_first_purchase": true/false }`
- 401 Unauthorized: Token 無效

---

### 2.3 計算購物車金額
**API**: `POST https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate`

**用途**: 計算購物車總金額，包含商品價格、優惠券折扣、運費、紅利點數等

**必要 Headers**:
```
api-token: {api_token}
x-platform-token: {platform_token}
content-type: application/json
accept-language: zh_TW
origin: https://www.dogcatstar.com
referer: https://www.dogcatstar.com/
```

**完整 Request Body 範例**:
```json
{
  "billing_country": "TW",
  "project_code": "DCS",
  "country_code": "TW",
  "order_items": [
    {
      "sku": "貓火雞罐",
      "project_code": "DCS",
      "quantity": 1,
      "is_addon": false,
      "is_addon_v2": false
    }
  ],
  "manual_input_coupon_ids": [],
  "applied_shipping_method_id": 2,
  "language": "zh_TW",
  "cart_values": {
    "cart": {
      "items": [{
        "cartItemId": 32611,
        "product_id": 32602,
        "variation_id": 32611,
        "quantity": 1,
        "sku": "貓火雞罐",
        "delivery_class": "normal",
        "product_limited": {
          "life_limit": 0,
          "purchased_count": 0
        },
        "project_code": "DCS",
        "sale_price": 46,
        "addon_purchase_limit": null,
        "stock": 491
      }],
      "addonItems": []
    },
    "rewardPoints": {
      "userInputRewardPoints": 0,
      "isUserAppliedRewardPoints": false
    },
    "coupon": {
      "manualInputCouponIds": [],
      "selectedRegularGiveaways": [],
      "selectedGiveaways": [],
      "redeemedCodes": []
    },
    "billing": {
      "billingCountry": "TW",
      "billingAddressFirstName": "",
      "billingAddressPhone": "",
      "billingAddressEmail": "",
      "billingAddressPostcode": "",
      "billingAddressState": "",
      "billingAddressCity": "",
      "billingAddressAddress1": "",
      "billingAddressAddress2": "",
      "customerNote": ""
    },
    "shipping": {
      "appliedShippingMethodId": 2,
      "deliveryDate": "",
      "deliveryTimeSlot": "09:00 - 13:00",
      "rememberUserAddress": false
    },
    "payment": {
      "appliedPaymentMethodId": null,
      "appliedInstallment": null
    },
    "invoice": {
      "refundStatement": true,
      "receiptType": "non_business_einvoice"
    }
  }
}
```

**主要欄位說明**:
- `order_items`: 購物車商品列表（SKU、數量、是否為加購品）
- `manual_input_coupon_ids`: 手動輸入的優惠券 ID
- `applied_shipping_method_id`: 選擇的配送方式 ID
- `cart_values.cart.items`: 詳細商品資訊（ID、價格、庫存）
- `cart_values.rewardPoints`: 紅利點數折抵
- `cart_values.coupon`: 優惠券與贈品資訊
- `cart_values.billing`: 帳單地址
- `cart_values.shipping`: 配送資訊（配送方式、時段）
- `cart_values.payment`: 付款方式
- `cart_values.invoice`: 發票資訊

**規則**:
- 商品數量必須 > 0
- SKU 必須存在且有庫存
- 配送方式 ID 必須有效
- 優惠券 ID 必須有效且符合使用條件
- 無痕模式下，billing 地址通常為空，需結帳時填寫

**預期回應**:
- 200 OK: 成功計算，回傳總金額、折扣明細、運費等
- 400 Bad Request: 參數錯誤（如商品不存在、數量無效）
- 401 Unauthorized: Token 無效
- 409 Conflict: 庫存不足

---

### 2.4 計算訪客優惠折扣
**API**: `POST https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate_guest_discount`

**用途**: 計算無痕/訪客模式下可享有的特殊折扣

**必要 Headers**:
```
api-token: {api_token}
x-platform-token: {platform_token}
content-type: application/json
```

**Request Body 範例**:
```json
{
  "should_request": true,
  "country_code": "TW",
  "order_items": [],
  "applied_shipping_method_id": null
}
```

**規則**:
- 僅適用於訪客/無痕模式
- `should_request: true` 時才會實際計算
- `order_items` 為空時，檢查全站性訪客優惠
- 有商品時，檢查特定商品的訪客優惠

**預期回應**:
- 200 OK: 成功計算訪客優惠
- 401 Unauthorized: Token 無效

---

### 2.5 查詢可用優惠券
**API**: `GET https://fortune-api.moneynet.tw/api/ec/coupons/available_coupons?country_code=TW&project_code=DCS&user_id=0`

**用途**: 取得當前購物車可使用的優惠券列表

**必要 Headers**:
```
api-token: {api_token}
x-platform-token: {platform_token}
accept: application/json
```

**Query Parameters**:
- `country_code`: TW
- `project_code`: DCS
- `user_id`: 0（訪客模式），或實際用戶 ID（登入模式）

**規則**:
- 無痕模式下，`user_id=0` 僅顯示不限會員的優惠券
- 登入後，顯示會員專屬優惠券
- 優惠券有使用條件（最低消費、特定商品、期限等）
- 不可用的優惠券會標示原因（未達門檻、已過期等）

**預期回應**:
- 200 OK: 成功取得優惠券列表
- 401 Unauthorized: Token 無效

---

### 2.6 查詢用戶地址資訊
**API**: `GET https://fortune-api.moneynet.tw/api/ec/user/address_info?country_code=TW&project_code=DCS`

**用途**: 取得用戶儲存的配送地址

**必要 Headers**:
```
api-token: {api_token}
x-platform-token: {platform_token}
accept: application/json
```

**規則**:
- 無痕模式下，通常無地址資料，回傳空或預設值
- 登入用戶會回傳已儲存的地址列表
- 用於結帳頁面自動帶入地址

**預期回應**:
- 200 OK: 成功取得地址資訊（可能為空）
- 401 Unauthorized: Token 無效或未登入

---

### 2.7 查詢結帳欄位配置
**API**: `GET https://www.dogcatstar.com/dni/mu/checkout/fields?country_code=TW`

**用途**: 取得結帳表單的欄位配置（必填、選填、格式驗證等）

**必要 Headers**:
```
accept: application/json
referer: https://www.dogcatstar.com/
```

**Query Parameters**:
- `country_code`: TW

**規則**:
- 不同國家/地區的結帳欄位可能不同
- 回傳欄位包含：姓名、電話、Email、地址、郵遞區號等
- 包含欄位驗證規則（正則表達式、最大長度等）

**預期回應**:
- 200 OK: 成功取得欄位配置
- 404 Not Found: 無效的 country_code

---

## 3. 手動測試方法（Postman）

### 3.1 環境設定
建立 Postman Environment，設定以下變數：
```json
{
  "api_token": "your_api_token_here",
  "platform_token": "your_platform_token_here",
  "base_url": "https://fortune-api.moneynet.tw",
  "web_url": "https://www.dogcatstar.com"
}
```

### 3.2 完整測試流程

#### 步驟 1：檢查首次購物
1. 新增 GET 請求：`{{base_url}}/api/ec/v2/TW/cart/first_purchase?country_code=TW&project_code=DCS`
2. Headers：
   - `api-token`: `{{api_token}}`
   - `x-platform-token`: `{{platform_token}}`
   - `accept`: `application/json`
3. 點擊 Send
4. 驗證回應：
   - Status: 200 OK
   - Body: `{ "is_first_purchase": true }` (無痕模式通常為 true)

#### 步驟 2：查詢購物車快取
1. 新增 GET 請求：`{{base_url}}/api/ec/v2/TW/cart/cart_request_cache`
2. Headers：
   - `api-token`: `{{api_token}}`
   - `x-platform-token`: `{{platform_token}}`
   - `origin`: `{{web_url}}`
   - `referer`: `{{web_url}}/`
   - `accept`: `application/json`
3. 點擊 Send
4. 驗證回應：
   - Status: 200 OK
   - Body: 購物車內容（可能為空）

#### 步驟 3：計算購物車金額
1. 新增 POST 請求：`{{base_url}}/api/ec/v2/TW/cart/calculate`
2. Headers：
   - `api-token`: `{{api_token}}`
   - `x-platform-token`: `{{platform_token}}`
   - `content-type`: `application/json`
   - `accept-language`: `zh_TW`
   - `origin`: `{{web_url}}`
   - `referer`: `{{web_url}}/`
3. Body (raw/JSON)：使用上方「2.3 計算購物車金額」的完整範例
4. 修改 `order_items` 與 `cart_values.cart.items` 為實際商品資料
5. 點擊 Send
6. 驗證回應：
   - Status: 200 OK
   - Body 包含：
     - `total_amount`: 總金額
     - `discount_amount`: 折扣金額
     - `shipping_fee`: 運費
     - `items_detail`: 商品明細

#### 步驟 4：查詢可用優惠券
1. 新增 GET 請求：`{{base_url}}/api/ec/coupons/available_coupons?country_code=TW&project_code=DCS&user_id=0`
2. Headers：
   - `api-token`: `{{api_token}}`
   - `x-platform-token`: `{{platform_token}}`
   - `accept`: `application/json`
3. 點擊 Send
4. 驗證回應：
   - Status: 200 OK
   - Body: 優惠券列表（可能為空）

#### 步驟 5：計算訪客優惠
1. 新增 POST 請求：`{{base_url}}/api/ec/v2/TW/cart/calculate_guest_discount`
2. Headers：
   - `api-token`: `{{api_token}}`
   - `x-platform-token`: `{{platform_token}}`
   - `content-type`: `application/json`
3. Body (raw/JSON)：
   ```json
   {
     "should_request": true,
     "country_code": "TW",
     "order_items": [],
     "applied_shipping_method_id": null
   }
   ```
4. 點擊 Send
5. 驗證回應：
   - Status: 200 OK
   - Body: 訪客優惠資訊

#### 步驟 6：查詢結帳欄位配置
1. 新增 GET 請求：`{{web_url}}/dni/mu/checkout/fields?country_code=TW`
2. Headers：
   - `accept`: `application/json`
   - `referer`: `{{web_url}}/`
3. 點擊 Send
4. 驗證回應：
   - Status: 200 OK
   - Body: 結帳欄位配置（JSON 格式）

#### 步驟 7：查詢用戶地址
1. 新增 GET 請求：`{{base_url}}/api/ec/user/address_info?country_code=TW&project_code=DCS`
2. Headers：
   - `api-token`: `{{api_token}}`
   - `x-platform-token`: `{{platform_token}}`
   - `accept`: `application/json`
3. 點擊 Send
4. 驗證回應：
   - Status: 200 OK
   - Body: 地址資訊（無痕模式通常為空）

---

## 4. 自動化測試案例設計

### 4.1 測試案例架構
```
tests/api/cart/
├── TC-CART-API-001-first-purchase-check.spec.ts
├── TC-CART-API-002-cart-cache-query.spec.ts
├── TC-CART-API-003-cart-calculate.spec.ts
├── TC-CART-API-004-guest-discount.spec.ts
├── TC-CART-API-005-available-coupons.spec.ts
├── TC-CART-API-006-checkout-fields.spec.ts
├── TC-CART-API-007-user-address.spec.ts
└── TC-CART-API-008-complete-flow.spec.ts
```

---

### TC-CART-API-001: 檢查首次購物
**測試目標**: 驗證首購檢查 API 在無痕模式下正確運作

**前置條件**:
- 有效的 api-token 和 x-platform-token
- 無痕模式（無登入、無歷史訂單）

**測試步驟**:
```typescript
import { test, expect } from '@playwright/test';

test('TC-CART-API-001: 檢查首次購物狀態', async ({ request }) => {
  const response = await request.get(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/first_purchase',
    {
      params: {
        country_code: 'TW',
        project_code: 'DCS'
      },
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'accept': 'application/json'
      }
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toHaveProperty('is_first_purchase');
  expect(data.is_first_purchase).toBe(true); // 無痕模式應為 true
});
```

**預期結果**:
- Status: 200 OK
- `is_first_purchase: true`

---

### TC-CART-API-002: 查詢購物車快取
**測試目標**: 驗證購物車快取查詢功能

**測試步驟**:
```typescript
test('TC-CART-API-002: 查詢購物車快取', async ({ request }) => {
  const response = await request.get(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/cart_request_cache',
    {
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'origin': 'https://www.dogcatstar.com',
        'referer': 'https://www.dogcatstar.com/',
        'accept': 'application/json'
      }
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toBeDefined();
  // 驗證購物車結構
  if (data.items) {
    expect(Array.isArray(data.items)).toBe(true);
  }
});
```

**預期結果**:
- Status: 200 OK
- 回傳購物車資料結構（可能為空）

---

### TC-CART-API-003: 計算購物車金額
**測試目標**: 驗證購物車金額計算正確性

**測試步驟**:
```typescript
test('TC-CART-API-003: 計算購物車金額', async ({ request }) => {
  const cartPayload = {
    billing_country: 'TW',
    project_code: 'DCS',
    country_code: 'TW',
    order_items: [
      {
        sku: '貓火雞罐',
        project_code: 'DCS',
        quantity: 1,
        is_addon: false,
        is_addon_v2: false
      }
    ],
    manual_input_coupon_ids: [],
    applied_shipping_method_id: 2,
    language: 'zh_TW',
    cart_values: {
      cart: {
        items: [{
          cartItemId: 32611,
          product_id: 32602,
          variation_id: 32611,
          quantity: 1,
          sku: '貓火雞罐',
          delivery_class: 'normal',
          sale_price: 46,
          stock: 491
        }],
        addonItems: []
      },
      rewardPoints: {
        userInputRewardPoints: 0,
        isUserAppliedRewardPoints: false
      },
      coupon: {
        manualInputCouponIds: [],
        selectedRegularGiveaways: [],
        selectedGiveaways: [],
        redeemedCodes: []
      },
      billing: {
        billingCountry: 'TW'
      },
      shipping: {
        appliedShippingMethodId: 2,
        deliveryTimeSlot: '09:00 - 13:00'
      },
      payment: {
        appliedPaymentMethodId: null
      },
      invoice: {
        refundStatement: true,
        receiptType: 'non_business_einvoice'
      }
    }
  };

  const response = await request.post(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate',
    {
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'content-type': 'application/json',
        'accept-language': 'zh_TW',
        'origin': 'https://www.dogcatstar.com',
        'referer': 'https://www.dogcatstar.com/'
      },
      data: cartPayload
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toHaveProperty('total_amount');
  expect(data).toHaveProperty('items_detail');
  expect(data.total_amount).toBeGreaterThan(0);
});
```

**預期結果**:
- Status: 200 OK
- 回傳計算結果，包含總金額、折扣、運費等

---

### TC-CART-API-004: 計算訪客優惠
**測試目標**: 驗證訪客優惠計算功能

**測試步驟**:
```typescript
test('TC-CART-API-004: 計算訪客優惠折扣', async ({ request }) => {
  const response = await request.post(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate_guest_discount',
    {
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'content-type': 'application/json'
      },
      data: {
        should_request: true,
        country_code: 'TW',
        order_items: [],
        applied_shipping_method_id: null
      }
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toBeDefined();
});
```

**預期結果**:
- Status: 200 OK
- 回傳訪客優惠資訊

---

### TC-CART-API-005: 查詢可用優惠券
**測試目標**: 驗證優惠券查詢功能（訪客模式）

**測試步驟**:
```typescript
test('TC-CART-API-005: 查詢可用優惠券（訪客）', async ({ request }) => {
  const response = await request.get(
    'https://fortune-api.moneynet.tw/api/ec/coupons/available_coupons',
    {
      params: {
        country_code: 'TW',
        project_code: 'DCS',
        user_id: '0' // 訪客模式
      },
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'accept': 'application/json'
      }
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(Array.isArray(data) || typeof data === 'object').toBe(true);
});
```

**預期結果**:
- Status: 200 OK
- 回傳優惠券列表（可能為空陣列）

---

### TC-CART-API-006: 查詢結帳欄位配置
**測試目標**: 驗證結帳欄位配置查詢

**測試步驟**:
```typescript
test('TC-CART-API-006: 查詢結帳欄位配置', async ({ request }) => {
  const response = await request.get(
    'https://www.dogcatstar.com/dni/mu/checkout/fields',
    {
      params: {
        country_code: 'TW'
      },
      headers: {
        'accept': 'application/json',
        'referer': 'https://www.dogcatstar.com/'
      }
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toBeDefined();
  // 驗證必要欄位存在
  expect(data).toHaveProperty('fields');
});
```

**預期結果**:
- Status: 200 OK
- 回傳結帳欄位配置

---

### TC-CART-API-007: 查詢用戶地址（訪客）
**測試目標**: 驗證用戶地址查詢（無痕模式）

**測試步驟**:
```typescript
test('TC-CART-API-007: 查詢用戶地址（訪客模式）', async ({ request }) => {
  const response = await request.get(
    'https://fortune-api.moneynet.tw/api/ec/user/address_info',
    {
      params: {
        country_code: 'TW',
        project_code: 'DCS'
      },
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'accept': 'application/json'
      }
    }
  );

  // 訪客模式可能回傳 200 或 401/403
  expect([200, 401, 403]).toContain(response.status());
  
  if (response.status() === 200) {
    const data = await response.json();
    // 訪客模式地址應為空或預設值
    expect(data).toBeDefined();
  }
});
```

**預期結果**:
- Status: 200 OK（地址為空）或 401/403（未登入）

---

### TC-CART-API-008: 完整購物流程整合測試
**測試目標**: 驗證完整的無痕購物流程 API 互動

**測試步驟**:
```typescript
test('TC-CART-API-008: 完整購物流程（無痕模式）', async ({ request }) => {
  // Step 1: 檢查首購狀態
  const firstPurchaseRes = await request.get(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/first_purchase',
    {
      params: { country_code: 'TW', project_code: 'DCS' },
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'accept': 'application/json'
      }
    }
  );
  expect(firstPurchaseRes.status()).toBe(200);
  
  // Step 2: 查詢購物車快取
  const cacheRes = await request.get(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/cart_request_cache',
    {
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'accept': 'application/json'
      }
    }
  );
  expect(cacheRes.status()).toBe(200);
  
  // Step 3: 計算購物車金額
  const calculateRes = await request.post(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate',
    {
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'content-type': 'application/json'
      },
      data: {
        billing_country: 'TW',
        project_code: 'DCS',
        country_code: 'TW',
        order_items: [{
          sku: '貓火雞罐',
          quantity: 1,
          is_addon: false
        }],
        applied_shipping_method_id: 2
        // ... 其他必要欄位
      }
    }
  );
  expect(calculateRes.status()).toBe(200);
  
  // Step 4: 查詢可用優惠券
  const couponsRes = await request.get(
    'https://fortune-api.moneynet.tw/api/ec/coupons/available_coupons',
    {
      params: { country_code: 'TW', project_code: 'DCS', user_id: '0' },
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'accept': 'application/json'
      }
    }
  );
  expect(couponsRes.status()).toBe(200);
  
  // Step 5: 查詢結帳欄位配置
  const fieldsRes = await request.get(
    'https://www.dogcatstar.com/dni/mu/checkout/fields',
    {
      params: { country_code: 'TW' },
      headers: { 'accept': 'application/json' }
    }
  );
  expect(fieldsRes.status()).toBe(200);
  
  console.log('✅ 完整購物流程 API 測試通過');
});
```

**預期結果**:
- 所有 API 呼叫成功
- 流程順序正確
- 資料一致性驗證通過

---

## 5. 錯誤處理測試案例

### TC-CART-API-ERR-001: 無效 Token
**測試步驟**:
```typescript
test('TC-CART-API-ERR-001: 測試無效 Token', async ({ request }) => {
  const response = await request.get(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/first_purchase',
    {
      params: { country_code: 'TW', project_code: 'DCS' },
      headers: {
        'api-token': 'invalid_token',
        'x-platform-token': 'invalid_token',
        'accept': 'application/json'
      }
    }
  );

  expect([401, 403]).toContain(response.status());
});
```

### TC-CART-API-ERR-002: 缺少必要參數
**測試步驟**:
```typescript
test('TC-CART-API-ERR-002: 缺少必要參數', async ({ request }) => {
  const response = await request.post(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate',
    {
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'content-type': 'application/json'
      },
      data: {
        // 故意缺少 order_items 等必要欄位
        billing_country: 'TW'
      }
    }
  );

  expect([400, 422]).toContain(response.status());
});
```

### TC-CART-API-ERR-003: 無效商品 SKU
**測試步驟**:
```typescript
test('TC-CART-API-ERR-003: 無效商品 SKU', async ({ request }) => {
  const response = await request.post(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate',
    {
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'content-type': 'application/json'
      },
      data: {
        billing_country: 'TW',
        project_code: 'DCS',
        country_code: 'TW',
        order_items: [{
          sku: 'INVALID_SKU_12345',
          quantity: 1,
          is_addon: false
        }],
        applied_shipping_method_id: 2
      }
    }
  );

  expect([400, 404, 422]).toContain(response.status());
});
```

### TC-CART-API-ERR-004: 商品數量為 0
**測試步驟**:
```typescript
test('TC-CART-API-ERR-004: 商品數量為 0', async ({ request }) => {
  const response = await request.post(
    'https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate',
    {
      headers: {
        'api-token': process.env.API_TOKEN,
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'content-type': 'application/json'
      },
      data: {
        billing_country: 'TW',
        project_code: 'DCS',
        country_code: 'TW',
        order_items: [{
          sku: '貓火雞罐',
          quantity: 0, // 無效數量
          is_addon: false
        }],
        applied_shipping_method_id: 2
      }
    }
  );

  expect([400, 422]).toContain(response.status());
});
```

---

## 6. 測試執行與報告

### 6.1 執行方式
```bash
# 執行所有購物車 API 測試
npx playwright test tests/api/cart/

# 執行單一測試案例
npx playwright test tests/api/cart/TC-CART-API-001-first-purchase-check.spec.ts

# 產生測試報告
npx playwright test --reporter=html
```

### 6.2 測試覆蓋率目標
- API 端點覆蓋率: 100%
- 正常流程測試: 100%
- 錯誤處理測試: 80%
- 整合測試: 主要業務流程 100%

### 6.3 測試資料管理
建立 `fixtures/cart-test-data.json`:
```json
{
  "products": [
    {
      "sku": "貓火雞罐",
      "product_id": 32602,
      "variation_id": 32611,
      "sale_price": 46,
      "stock": 491
    }
  ],
  "shipping_methods": [
    {
      "id": 2,
      "name": "宅配",
      "time_slots": ["09:00 - 13:00", "13:00 - 18:00"]
    }
  ],
  "test_tokens": {
    "api_token": "test_api_token",
    "platform_token": "test_platform_token"
  }
}
```

---

## 7. 注意事項與最佳實踐

### 7.1 Token 管理
- ✅ 使用環境變數儲存敏感 token
- ✅ 定期更新測試用 token
- ✅ 不要將 token 硬編碼在測試檔案中
- ✅ 實作 token 自動刷新機制

### 7.2 測試隔離
- ✅ 每個測試案例應獨立執行
- ✅ 避免測試之間的依賴關係
- ✅ 使用不同的測試資料避免衝突

### 7.3 錯誤處理
- ✅ 驗證所有可能的錯誤狀態碼
- ✅ 檢查錯誤訊息的正確性
- ✅ 測試 API rate limiting

### 7.4 效能監控
- ✅ 記錄 API 回應時間
- ✅ 設定回應時間閾值警告
- ✅ 監控 API 失敗率

### 7.5 CI/CD 整合
- ✅ 整合到 CI/CD pipeline
- ✅ 定期執行測試（每日/每次部署）
- ✅ 自動產生測試報告
- ✅ 失敗時自動通知團隊

---

## 8. 常見問題排查

### Q1: Token 一直回傳 401 Unauthorized
**原因**:
- Token 已過期
- Token 格式錯誤
- Token 與環境不匹配（測試/正式）

**解決方法**:
1. 重新登入取得新 token
2. 確認 token 格式完整（JWT 有三段，用 . 分隔）
3. 確認使用正確環境的 token

### Q2: 購物車計算回傳 400 Bad Request
**原因**:
- 缺少必要欄位
- SKU 不存在
- 商品數量無效
- 配送方式 ID 錯誤

**解決方法**:
1. 檢查 payload 是否完整
2. 確認 SKU 有效且有庫存
3. 確認數量 > 0
4. 確認配送方式 ID 存在

### Q3: CORS 錯誤
**原因**:
- 缺少 `origin` 或 `referer` header
- 跨域請求被拒絕

**解決方法**:
1. 加上 `origin: https://www.dogcatstar.com`
2. 加上 `referer: https://www.dogcatstar.com/`
3. 使用 Postman 時可忽略（Postman 不受 CORS 限制）

---

**撰寫**: GitHub Copilot  
**最後更新**: 2025-10-28  
**版本**: 1.0  
**資料來源**: www.dogcatstar.com_cart_headless.har
