# API 自動化測試規劃

## 1. 關鍵 API 列舉（請依實際抓到的 API 補充）

| 功能         | 方法 | 路徑範例         | 備註           |
|--------------|------|--------------------------------------|----------------|
| **會員登入相關** |
| Token 登入頁面 | GET | https://www.dogcatstar.com/cosign/token_login_page?token={jwt_token} | JWT token 包含用戶資訊與重定向 URL |
| 檢查用戶是否已註冊 | GET | https://www.dogcatstar.com/dni/mu/user/registered?login_type=sms&identifier={phone} | 需帶 x-platform-token |
| 刷新用戶 Token | GET | https://www.dogcatstar.com/dni/mu/user/refresh_token | 登入後刷新 token |
| 會員登入 (cosign) | POST | https://cosign.pro/api/platform-sdk/otp-verification | 驗證 OTP，取得登入 token |
| 發送 OTP     | POST | https://cosign.pro/api/platform-sdk/otp | 取得 OTP 簡訊 |
| **購物車相關** |
| 首次購物檢查 | GET  | https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/first_purchase?country_code=TW&project_code=DCS | 需帶 api-token, x-platform-token |
| 查詢購物車快取 | GET  | https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/cart_request_cache | 需帶 api-token, x-platform-token |
| 結帳計算     | POST | https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate | 需帶 api-token, x-platform-token，見下方 payload |
| 計算訪客購物車優惠 | POST | https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate_guest_discount | 需帶 api-token, x-platform-token |
| **其他** |
| 查詢可用優惠券 | GET  | https://fortune-api.moneynet.tw/api/ec/coupons/available_coupons?country_code=TW&project_code=DCS&user_id=0 | 需帶 api-token, x-platform-token |
| 查詢結帳欄位配置 | GET | https://www.dogcatstar.com/dni/mu/checkout/fields?country_code=TW | 取得結帳表單欄位設定 |
| 查詢用戶地址資訊 | GET | https://fortune-api.moneynet.tw/api/ec/user/address_info?country_code=TW&project_code=DCS | 需帶 api-token, x-platform-token |

> 以上 API 路徑皆從實際 HAR 檔案中提取。

---

## 2. API 呼叫方式分析與測試方法規劃

### Token 登入頁面
- **呼叫方式**：GET `https://www.dogcatstar.com/cosign/token_login_page?token={jwt_token}`
- **JWT Token 內容** (解碼後):
  ```json
  {
    "iss": "cosign",
    "sub": "947743827",
    "platformId": 4,
    "accountType": "sms",
    "account": "+886920535721",
    "redirectUrl": "https://www.dogcatstar.com/my-account/?no-cache",
    "fallbackUrl": "https://www.dogcatstar.com/my-account/?no-cache",
    "iat": 1761535868,
    "exp": 1761536168
  }
  ```
- **測試方法**：
  - 正常 token 登入
  - 過期 token
  - 無效 token 格式
  - 缺少 redirectUrl
  - Token 簽名驗證失敗

### 檢查用戶是否已註冊
- **呼叫方式**：GET `https://www.dogcatstar.com/dni/mu/user/registered?login_type=sms&identifier={phone}`
- **必要 Header**：
  - `x-platform-token`：JWT token
  - `accept`: `application/json`
  - `referer`、`user-agent` 等標準 headers
- **測試方法**：
  - 已註冊用戶查詢
  - 未註冊用戶查詢
  - 無效手機號格式
  - 缺少 x-platform-token
  - Token 過期

### 刷新用戶 Token
- **呼叫方式**：GET `https://www.dogcatstar.com/dni/mu/user/refresh_token`
- **必要 Header**：
  - `accept`: `application/json, text/plain, */*`
  - `referer`、`user-agent` 等標準 headers
  - 需在已登入狀態 (cookie 或 session)
- **測試方法**：
  - 正常刷新
  - 未登入狀態刷新
  - Token 即將過期時刷新
  - 多次連續刷新

### 會員登入 (cosign OTP 驗證)
- **呼叫方式**：POST `https://cosign.pro/api/platform-sdk/otp-verification`，body 需帶 account、otpCode、purpose
- **範例**：
  ```json
  {
    "account": "+886912345678",
    "otpCode": "123456",
    "purpose": "login"
  }
  ```
- **測試方法**：
  - 正確 OTP 登入
  - 錯誤 OTP
  - OTP 過期
  - 缺少參數
  - 多次錯誤後鎖定
  - 重複使用同一 OTP

### 發送 OTP
- **呼叫方式**：POST `https://cosign.pro/api/platform-sdk/otp`，body 需帶 account、purpose
- **範例**：
  ```json
  {
    "account": "+886912345678",
    "purpose": "login"
  }
  ```
- **測試方法**：
  - 正常發送
  - 非法帳號格式
  - 缺少參數
  - 短時間內多次發送 (rate limiting)
  - 不同 purpose 測試


### 首次購物檢查
- **呼叫方式**：GET `https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/first_purchase?country_code=TW&project_code=DCS`
- **必要 Header**：
  - `api-token`：API 認證 token
  - `x-platform-token`：平台 JWT token
  - `origin`: `https://www.dogcatstar.com`
  - `referer`: `https://www.dogcatstar.com/`
  - `accept`: `application/json`
- **測試方法**：
  - 首次購物用戶
  - 已有購物記錄用戶
  - 未帶 token
  - Token 過期
  - 無效 country_code/project_code

### 查詢購物車快取
- **呼叫方式**：GET `https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/cart_request_cache`
- **必要 Header**：
  - `api-token`、`x-platform-token`、`origin`、`referer`
- **Response 範例**：返回購物車內容快取
- **測試方法**：
  - 空購物車
  - 有商品的購物車
  - 多種商品組合
  - 未帶 token
  - 快取過期處理

### 結帳計算
- **呼叫方式**：POST `https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate`
- **必要 Header**：
  - `api-token`、`x-platform-token`
  - `content-type: application/json`
  - `accept-language: zh_TW`
  - `origin`、`referer`、`user-agent`
- **完整 Payload 範例**：
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
- **測試方法**：
  - 正常計算單一商品
  - 多商品組合計算
  - 應用優惠券計算
  - 不同配送方式
  - 不同付款方式
  - 缺少必要欄位
  - 商品庫存不足
  - 數量為 0 或負數
  - 未帶 token
  - 無效 SKU

### 計算訪客購物車優惠
- **呼叫方式**：POST `https://fortune-api.moneynet.tw/api/ec/v2/TW/cart/calculate_guest_discount`
- **必要 Header**：`api-token`, `x-platform-token`
- **範例 Payload**：
  ```json
  {
    "should_request": true,
    "country_code": "TW",
    "order_items": [],
    "applied_shipping_method_id": null
  }
  ```
- **測試方法**：
  - 訪客有可用優惠
  - 訪客無可用優惠
  - 空購物車
  - 缺少 token
  - 無效 country_code

### 查詢可用優惠券
- **呼叫方式**：GET `https://fortune-api.moneynet.tw/api/ec/coupons/available_coupons?country_code=TW&project_code=DCS&user_id=0`
- **必要 Header**：`api-token`, `x-platform-token`
- **測試方法**：
  - 有可用優惠券
  - 無可用優惠券
  - 訪客查詢 (user_id=0)
  - 會員查詢 (帶 user_id)
  - 缺少 token
  - 無效參數

### 查詢結帳欄位配置
- **呼叫方式**：GET `https://www.dogcatstar.com/dni/mu/checkout/fields?country_code=TW`
- **必要 Header**：標準 HTTP headers
- **測試方法**：
  - 正常查詢
  - 不同 country_code
  - 無效 country_code
  - 驗證欄位配置正確性

### 查詢用戶地址資訊
- **呼叫方式**：GET `https://fortune-api.moneynet.tw/api/ec/user/address_info?country_code=TW&project_code=DCS`
- **必要 Header**：`api-token`, `x-platform-token`
- **測試方法**：
  - 已有地址的用戶
  - 無地址的用戶
  - 多個地址的用戶
  - 未登入用戶
  - Token 過期

### 其他測試建議
- **認證與授權測試**：
  - Token 過期處理
  - Token 格式錯誤
  - 跨域請求 (CORS)
  - Rate limiting 測試
  - Token 刷新機制
  
- **安全測試**：
  - SQL injection
  - XSS 攻擊
  - CSRF 防護
  - API 參數篡改
  - 敏感資訊洩露
  
- **效能測試**：
  - 高併發請求
  - 壓力測試
  - 負載測試
  - API 回應時間監控
  
- **邊界值與異常測試**：
  - 超大 payload
  - 特殊字元處理
  - 空值、null 值處理
  - 數值邊界 (INT_MAX, 負數等)
  - 陣列長度限制
  
- **整合測試場景**：
  - 完整購物流程：瀏覽商品 → 加入購物車 → 應用優惠券 → 結帳 → 付款
  - 登入流程：發送 OTP → 驗證 OTP → Token 登入 → Token 刷新
  - 購物車同步：多裝置購物車同步、登入前後購物車合併

---

## 3. 工具與自動化建議

### 推薦工具
- **API 測試框架**：
  - Postman + Newman (視覺化 + CI/CD)
  - Playwright API Testing (與 E2E 整合)
  - Rest Assured (Java)
  - pytest + requests (Python)
  
- **Mock/Stub 工具**：
  - MSW (Mock Service Worker)
  - WireMock
  - JSON Server
  
- **效能測試**：
  - Apache JMeter
  - k6
  - Artillery

### 驗證重點
1. **HTTP 狀態碼**：200, 201, 400, 401, 403, 404, 500 等
2. **Response Schema**：使用 JSON Schema 驗證
3. **資料正確性**：欄位值、型別、格式
4. **錯誤訊息**：清晰、一致、國際化
5. **Headers**：Content-Type, CORS, Cache-Control 等
6. **效能指標**：回應時間、吞吐量

### 測試資料管理
- **Fixture 管理**：
  - 預先準備測試用戶資料
  - 商品資料集
  - 優惠券資料
  - 地址資料
  
- **資料隔離**：
  - 每個測試使用獨立資料
  - 測試後清理資料
  - 使用測試環境專用資料庫

### CI/CD 整合
- **持續整合**：
  - Jenkins Pipeline
  - GitHub Actions
  - GitLab CI
  
- **執行策略**：
  - 每次 commit 執行冒煙測試
  - 每日執行完整測試套件
  - 定期執行效能測試
  
- **報告與通知**：
  - HTML 測試報告
  - Slack/Email 通知
  - 失敗自動重試機制

### API 文檔與契約測試
- **API 規格**：
  - OpenAPI/Swagger 文檔
  - API Blueprint
  
- **契約測試**：
  - Pact (消費者驅動契約測試)
  - Spring Cloud Contract
  
---

## 4. 測試案例設計範例

### TC-API-LOGIN-001: 正常 OTP 登入流程
**前置條件**：
- 有效的測試手機號碼
- OTP 服務正常運作

**測試步驟**：
1. POST `/api/platform-sdk/otp` 發送 OTP
2. 驗證回應狀態碼 200
3. 取得 OTP 碼 (從簡訊或測試 API)
4. POST `/api/platform-sdk/otp-verification` 驗證 OTP
5. 驗證回應包含有效的 JWT token
6. GET `/cosign/token_login_page?token={jwt}` 登入
7. 驗證重定向到正確頁面

**預期結果**：
- 所有 API 回應狀態碼 200
- Token 格式正確且可解碼
- 成功登入並重定向

### TC-API-CART-001: 完整購物車結帳流程
**前置條件**：
- 用戶已登入
- 有效的 api-token 和 x-platform-token

**測試步驟**：
1. GET `/api/ec/v2/TW/cart/first_purchase` 檢查首購狀態
2. GET `/api/ec/v2/TW/cart/cart_request_cache` 查詢購物車
3. POST `/api/ec/v2/TW/cart/calculate` 計算結帳金額
4. GET `/api/ec/coupons/available_coupons` 查詢可用優惠券
5. POST `/api/ec/v2/TW/cart/calculate` 應用優惠券重新計算
6. GET `/api/ec/user/address_info` 取得配送地址
7. GET `/dni/mu/checkout/fields` 取得結帳欄位配置

**預期結果**：
- 所有 API 正常回應
- 金額計算正確
- 優惠券正確應用
- 地址資訊完整

### TC-API-AUTH-001: Token 過期處理
**測試步驟**：
1. 使用過期的 x-platform-token 呼叫任意需要認證的 API
2. 驗證回應狀態碼 401
3. GET `/dni/mu/user/refresh_token` 刷新 token
4. 使用新 token 重試原 API
5. 驗證成功回應

**預期結果**：
- 過期 token 正確被拒絕
- Token 刷新成功
- 新 token 可正常使用

---

## 5. 實作建議與最佳實踐

### 測試組織結構
```
api-tests/
├── config/
│   ├── env.json              # 環境配置
│   └── test-data.json        # 測試資料
├── fixtures/
│   ├── users.json            # 用戶資料
│   ├── products.json         # 商品資料
│   └── coupons.json          # 優惠券資料
├── helpers/
│   ├── auth-helper.js        # 認證輔助函數
│   ├── api-client.js         # API 客戶端
│   └── data-generator.js    # 測試資料生成
├── tests/
│   ├── auth/                 # 認證相關測試
│   ├── cart/                 # 購物車測試
│   ├── checkout/             # 結帳測試
│   └── integration/          # 整合測試
└── reports/                  # 測試報告
```

### 關鍵實作要點
1. **環境變數管理**：使用 .env 檔案管理不同環境的配置
2. **Token 管理**：實作 token 自動刷新機制
3. **重試機制**：網路不穩定時自動重試
4. **並行執行**：獨立測試可並行提升速度
5. **日誌記錄**：詳細記錄請求/回應便於除錯

---

> **實作步驟總結**：
> 1. ✅ 已從 HAR 檔案提取所有關鍵 API 路徑
> 2. ✅ 已分析 API 呼叫方式、Headers、Payload 結構
> 3. ✅ 已設計測試方法與測試案例
> 4. ⏭️ 下一步：可選擇 Postman、Playwright API 或其他工具開始實作自動化測試
