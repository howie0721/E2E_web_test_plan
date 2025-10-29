# 登入 API 測試文件

## 測試流程說明
此文件記錄完整的登入流程，從訪客頁面到完成 OTP 登入的所有 API 互動。

**測試範圍**: 涵蓋訪客模式與會員模式的 API 互動流程。

**主要流程步驟**：
1. 進入訪客會員中心頁面 (visitor-my-account)
2. 輸入手機號碼，發送 OTP
3. 輸入 OTP 驗證碼
4. 使用 JWT Token 完成登入
5. 跳轉至會員中心 (my-account)

---

## 1. 登入相關 API 列表

### 1.1 OTP 驗證流程
| API 端點 | 方法 | 用途 |
|---------|------|------|
| `/api/platform-sdk/otp` | POST | 發送 OTP 簡訊 |
| `/api/platform-sdk/otp-verification` | POST | 驗證 OTP 碼，取得 JWT Token |
| `/cosign/token_login_page` | GET | 使用 JWT Token 完成登入 |

### 1.2 會員狀態查詢
| API 端點 | 方法 | 用途 |
|---------|------|------|
| `/dni/mu/user/registered` | GET | 檢查手機號碼是否已註冊 |
| `/dni/mu/user/refresh_token` | GET | 刷新用戶 Token |
| `/api/platform-sdk/user` | GET | 取得用戶資訊 |

### 1.3 平台配置
| API 端點 | 方法 | 用途 |
|---------|------|------|
| `/dni/mu/configuration` | GET | 取得平台配置（登入選項、支援的國家等） |

---

## 2. 詳細 API 規格與規則

### 2.1 發送 OTP
**API**: `POST https://cosign.pro/api/platform-sdk/otp`

**用途**: 發送 OTP 簡訊驗證碼到指定手機號碼

**必要 Headers**:
```
content-type: application/json
accept: application/json
x-platform-token: {platform_token}
origin: https://www.dogcatstar.com
referer: https://www.dogcatstar.com/visitor-my-account
```

**Request Body 範例**:
```json
{
  "account": "+886912345678",
  "countryCode": "TW",
  "otpTemplateSettingKey": "TW_zh_TW",
  "recaptchaToken": "SKIP_FOR_TESTING",
  "type": "sms",
  "redirectUrl": "https://www.dogcatstar.com/my-account/?no-cache",
  "fallbackUrl": "https://www.dogcatstar.com/my-account/?no-cache",
  "purpose": "login",
  "validateUrl": "https://www.dogcatstar.com/my-account/?validate=registerOrLogin"
}
```

**主要欄位說明**:
- `account`: 手機號碼（含國碼，如 +886912345678）
- `countryCode`: 國家代碼（TW=台灣）
- `otpTemplateSettingKey`: OTP 簡訊範本設定（語系）
- `recaptchaToken`: reCAPTCHA 驗證 token（測試時可用 SKIP）
- `type`: 驗證類型（sms=簡訊、email=Email）
- `redirectUrl`: 登入成功後跳轉頁面
- `fallbackUrl`: 登入失敗時跳轉頁面
- `purpose`: 用途（login=登入、register=註冊）
- `validateUrl`: 驗證成功後的 callback URL

**規則**:
- 手機號碼必須包含國碼（+886）
- 同一手機號碼有發送頻率限制（通常 60 秒內不可重複發送）
- 系統有 rate limiting（短時間內發送過多會被拒絕）
- 測試環境可使用 `recaptchaToken: "SKIP"` 跳過驗證
- 正式環境必須通過 Google reCAPTCHA 驗證

**預期回應**:
- **201 Created**: 成功發送 OTP
  ```json
  {
    "success": true,
    "message": "OTP sent successfully"
  }
  ```
- **400 Bad Request**: 參數錯誤（手機號碼格式錯誤、缺少必要欄位）
- **401 Unauthorized**: x-platform-token 無效或過期
- **403 Forbidden**: reCAPTCHA 驗證失敗、IP 被封鎖
- **429 Too Many Requests**: 觸發 rate limit（短時間內發送過多）
- **500 Internal Server Error**: 伺服器錯誤（SMS 服務異常）

---

### 2.2 驗證 OTP
**API**: `POST https://cosign.pro/api/platform-sdk/otp-verification`

**用途**: 驗證用戶輸入的 OTP 碼，驗證成功後取得 JWT Token

**必要 Headers**:
```
content-type: application/json
accept: application/json
x-platform-token: {platform_token}
origin: https://www.dogcatstar.com
referer: https://www.dogcatstar.com/visitor-my-account
```

**Request Body 範例**:
```json
{
  "account": "+886912345678",
  "otpCode": "123456",
  "purpose": "login"
}
```

**主要欄位說明**:
- `account`: 手機號碼（必須與發送 OTP 時一致）
- `otpCode`: 用戶收到的 6 位數 OTP 驗證碼
- `purpose`: 用途（login=登入、register=註冊）

**規則**:
- OTP 碼通常為 6 位數字
- OTP 有效期限通常為 5 分鐘
- 同一 OTP 只能使用一次
- 連續輸入錯誤 OTP 超過次數（如 5 次）會被鎖定
- 驗證成功後回傳 JWT Token，有效期限通常為 5 分鐘

**預期回應**:
- **200 OK**: 驗證成功，回傳 JWT Token
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "219870407",
      "account": "+886912345678",
      "accountType": "sms"
    }
  }
  ```
- **400 Bad Request**: OTP 碼錯誤、已過期、參數錯誤
- **401 Unauthorized**: x-platform-token 無效
- **403 Forbidden**: 連續錯誤次數過多，帳號被鎖定
- **410 Gone**: OTP 已過期
- **429 Too Many Requests**: 驗證請求過於頻繁

**JWT Token 結構** (解碼後):
```json
{
  "iss": "cosign",
  "sub": "219870407",
  "platformId": 4,
  "accountType": "sms",
  "account": "+886920535721",
  "redirectUrl": "https://www.dogcatstar.com/my-account/?no-cache",
  "fallbackUrl": "https://www.dogcatstar.com/my-account/?no-cache",
  "identitySecret": "227106551",
  "iat": 1761636943,
  "nbf": 1761636943,
  "exp": 1761637243,
  "jti": "344734f6-9eed-4f6d-bc61-fc5d3880c3c1"
}
```

**JWT 欄位說明**:
- `iss`: 發行者（cosign）
- `sub`: 用戶 ID
- `platformId`: 平台 ID（4=Dogcatstar）
- `accountType`: 帳號類型（sms、email、line、google 等）
- `account`: 帳號（手機號碼或 Email）
- `redirectUrl`: 登入成功後跳轉 URL
- `fallbackUrl`: 登入失敗時跳轉 URL
- `identitySecret`: 身分密鑰
- `iat`: Token 發行時間
- `nbf`: Token 生效時間
- `exp`: Token 過期時間（通常 5 分鐘後）
- `jti`: Token 唯一 ID（防止重放攻擊）

---

### 2.3 JWT Token 登入
**API**: `GET https://www.dogcatstar.com/cosign/token_login_page?token={jwt_token}`

**用途**: 使用 JWT Token 完成登入，設定 session/cookie，並跳轉到會員中心

**必要 Query Parameters**:
- `token`: 從 OTP 驗證 API 取得的 JWT Token

**必要 Headers**:
```
accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

**規則**:
- JWT Token 必須有效且未過期
- Token 只能使用一次（防止重放攻擊）
- 登入成功後會設定多個 cookies（session、auth token 等）
- 自動重定向到 `redirectUrl`（通常為 my-account/?no-cache）

**預期回應**:
- **302 Found**: 成功登入，重定向到會員中心
  - `Location` Header: `https://www.dogcatstar.com/my-account/?no-cache`
  - 設定多個 cookies：
    ```
    Set-Cookie: PHPSESSID=...
    Set-Cookie: wordpress_logged_in_...=...
    Set-Cookie: wp_woocommerce_session_...=...
    ```
- **401 Unauthorized**: JWT Token 無效或已使用
- **403 Forbidden**: Token 過期
- **400 Bad Request**: Token 格式錯誤

---

### 2.4 檢查手機號碼是否已註冊
**API**: `GET https://www.dogcatstar.com/dni/mu/user/registered?login_type=sms&identifier={phone}`

**用途**: 檢查手機號碼是否已註冊，用於判斷登入或註冊流程

**必要 Headers**:
```
accept: application/json
x-platform-token: {platform_token}
referer: https://www.dogcatstar.com/visitor-my-account
```

**Query Parameters**:
- `login_type`: 登入類型（sms、email、line 等）
- `identifier`: 手機號碼或 Email

**規則**:
- 用於登入頁面判斷要顯示「登入」或「註冊」
- 訪客模式下也可查詢
- 不洩漏用戶敏感資訊

**預期回應**:
- **200 OK**: 成功查詢
  ```json
  {
    "registered": true
  }
  ```
  或
  ```json
  {
    "registered": false
  }
  ```
- **401 Unauthorized**: Token 無效

---

### 2.5 刷新用戶 Token
**API**: `GET https://www.dogcatstar.com/dni/mu/user/refresh_token`

**用途**: 刷新 x-platform-token，延長登入狀態

**必要 Headers**:
```
accept: application/json, text/plain, */*
referer: https://www.dogcatstar.com/my-account
```

**規則**:
- 必須在已登入狀態（有效的 session/cookie）
- 通常在 Token 即將過期時自動呼叫
- 回傳新的 x-platform-token

**預期回應**:
- **200 OK**: 成功刷新
  ```json
  {
    "token": "new_platform_token_here"
  }
  ```
- **401 Unauthorized**: 未登入或 session 無效

---

### 2.6 取得用戶資訊
**API**: `GET https://cosign.pro/api/platform-sdk/user`

**用途**: 取得當前登入用戶的完整資訊

**必要 Headers**:
```
accept: application/json
x-platform-token: {platform_token}
```

**規則**:
- 必須在已登入狀態
- 用於會員中心顯示用戶資料

**預期回應**:
- **200 OK**: 成功取得用戶資訊
  ```json
  {
    "id": "219870407",
    "account": "+886920535721",
    "accountType": "sms",
    "email": "user@example.com",
    "name": "王小明",
    "phone": "+886920535721",
    "avatar": "https://...",
    "createdAt": "2023-01-01T00:00:00Z"
  }
  ```
- **401 Unauthorized**: Token 無效或未登入

---

### 2.7 取得平台配置
**API**: `GET https://www.dogcatstar.com/dni/mu/configuration`

**用途**: 取得平台登入選項、支援的國家、語系等配置

**必要 Headers**:
```
accept: application/json
```

**規則**:
- 無需認證，公開 API
- 用於前端顯示登入選項（手機、Email、Line、Google 等）

**預期回應**:
- **200 OK**: 成功取得配置
  ```json
  {
    "loginMethods": ["sms", "email", "line", "google", "facebook"],
    "supportedCountries": ["TW", "HK", "SG"],
    "defaultLanguage": "zh_TW",
    "otpExpireMinutes": 5
  }
  ```

---

## 3. 手動測試方法（Postman）

### 3.1 環境設定
建立 Postman Environment，設定以下變數：
```json
{
  "api_token": "your_api_token_here",
  "platform_token": "your_platform_token_here",
  "base_url": "https://cosign.pro",
  "web_url": "https://www.dogcatstar.com",
  "test_phone": "+886912345678",
  "jwt_token": ""
}
```

### 3.2 完整測試流程

#### 步驟 1：檢查手機號碼是否已註冊（選擇性）
1. 新增 GET 請求：`{{web_url}}/dni/mu/user/registered?login_type=sms&identifier={{test_phone}}`
2. Headers：
   - `accept`: `application/json`
   - `x-platform-token`: `{{platform_token}}`
   - `referer`: `{{web_url}}/visitor-my-account`
3. 點擊 Send
4. 驗證回應：
   - Status: 200 OK
   - Body: `{ "registered": true }` 或 `{ "registered": false }`

#### 步驟 2：發送 OTP
1. 新增 POST 請求：`{{base_url}}/api/platform-sdk/otp`
2. Headers：
   - `content-type`: `application/json`
   - `accept`: `application/json`
   - `x-platform-token`: `{{platform_token}}`
   - `origin`: `{{web_url}}`
   - `referer`: `{{web_url}}/visitor-my-account`
3. Body (raw/JSON)：
   ```json
   {
     "account": "{{test_phone}}",
     "countryCode": "TW",
     "otpTemplateSettingKey": "TW_zh_TW",
     "recaptchaToken": "SKIP_FOR_TESTING",
     "type": "sms",
     "redirectUrl": "{{web_url}}/my-account/?no-cache",
     "fallbackUrl": "{{web_url}}/my-account/?no-cache",
     "purpose": "login",
     "validateUrl": "{{web_url}}/my-account/?validate=registerOrLogin"
   }
   ```
4. 點擊 Send
5. 驗證回應：
   - Status: 201 Created
   - Body: `{ "success": true }`
6. 等待接收簡訊 OTP（實際環境）或使用測試 OTP

#### 步驟 3：驗證 OTP
1. 新增 POST 請求：`{{base_url}}/api/platform-sdk/otp-verification`
2. Headers：
   - `content-type`: `application/json`
   - `accept`: `application/json`
   - `x-platform-token`: `{{platform_token}}`
   - `origin`: `{{web_url}}`
   - `referer`: `{{web_url}}/visitor-my-account`
3. Body (raw/JSON)：
   ```json
   {
     "account": "{{test_phone}}",
     "otpCode": "123456",
     "purpose": "login"
   }
   ```
   （將 `123456` 替換為實際收到的 OTP）
4. 點擊 Send
5. 驗證回應：
   - Status: 200 OK
   - Body 包含 JWT Token：
     ```json
     {
       "success": true,
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
     ```
6. 複製 `token` 欄位值，存到 Environment 變數 `jwt_token`

#### 步驟 4：使用 JWT Token 登入
1. 新增 GET 請求：`{{web_url}}/cosign/token_login_page?token={{jwt_token}}`
2. Headers：
   - `accept`: `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`
   - `user-agent`: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`
3. 在 Postman Settings 中，取消勾選「Automatically follow redirects」（以便觀察 302 回應）
4. 點擊 Send
5. 驗證回應：
   - Status: 302 Found
   - Headers 包含：
     - `Location`: `https://www.dogcatstar.com/my-account/?no-cache`
     - `Set-Cookie`: 多個 cookies（PHPSESSID、wordpress_logged_in 等）

#### 步驟 5：驗證登入狀態
1. 新增 GET 請求：`{{base_url}}/api/platform-sdk/user`
2. Headers：
   - `accept`: `application/json`
   - `x-platform-token`: `{{platform_token}}`
3. 點擊 Send
4. 驗證回應：
   - Status: 200 OK
   - Body 包含完整用戶資訊（id、account、email 等）

#### 步驟 6：刷新 Token（選擇性）
1. 新增 GET 請求：`{{web_url}}/dni/mu/user/refresh_token`
2. Headers：
   - `accept`: `application/json, text/plain, */*`
   - `referer`: `{{web_url}}/my-account`
3. 點擊 Send
4. 驗證回應：
   - Status: 200 OK
   - Body: `{ "token": "new_platform_token" }`

---

## 4. 自動化測試案例設計

### 4.1 測試案例架構
```
tests/api/login/
├── TC-LOGIN-API-001-send-otp.spec.ts
├── TC-LOGIN-API-002-verify-otp.spec.ts
├── TC-LOGIN-API-003-jwt-login.spec.ts
├── TC-LOGIN-API-004-check-registered.spec.ts
├── TC-LOGIN-API-005-refresh-token.spec.ts
├── TC-LOGIN-API-006-get-user-info.spec.ts
├── TC-LOGIN-API-007-complete-flow.spec.ts
└── TC-LOGIN-API-008-error-handling.spec.ts
```

---

### TC-LOGIN-API-001: 發送 OTP
**測試目標**: 驗證 OTP 發送功能正常運作

**前置條件**:
- 有效的 api-token 和 x-platform-token
- 有效的測試手機號碼

**測試步驟**:
```typescript
import { test, expect } from '@playwright/test';

test('TC-LOGIN-API-001: 發送 OTP 簡訊', async ({ request }) => {
  const response = await request.post(
    'https://cosign.pro/api/platform-sdk/otp',
    {
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'origin': 'https://www.dogcatstar.com',
        'referer': 'https://www.dogcatstar.com/visitor-my-account'
      },
      data: {
        account: process.env.TEST_PHONE,
        countryCode: 'TW',
        otpTemplateSettingKey: 'TW_zh_TW',
        recaptchaToken: 'SKIP_FOR_TESTING',
        type: 'sms',
        redirectUrl: 'https://www.dogcatstar.com/my-account/?no-cache',
        fallbackUrl: 'https://www.dogcatstar.com/my-account/?no-cache',
        purpose: 'login',
        validateUrl: 'https://www.dogcatstar.com/my-account/?validate=registerOrLogin'
      }
    }
  );

  expect(response.status()).toBe(201);
  
  const data = await response.json();
  expect(data).toHaveProperty('success');
  expect(data.success).toBe(true);
});
```

**預期結果**:
- Status: 201 Created
- `success: true`

---

### TC-LOGIN-API-002: 驗證 OTP
**測試目標**: 驗證 OTP 驗證功能與 JWT Token 取得

**前置條件**:
- 已成功發送 OTP
- 有有效的 OTP 碼（測試環境可用固定碼）

**測試步驟**:
```typescript
test('TC-LOGIN-API-002: 驗證 OTP 並取得 JWT Token', async ({ request }) => {
  // 先發送 OTP（實際測試中可能需要等待或使用 mock OTP）
  await request.post('https://cosign.pro/api/platform-sdk/otp', {
    headers: {
      'content-type': 'application/json',
      'x-platform-token': process.env.PLATFORM_TOKEN
    },
    data: {
      account: process.env.TEST_PHONE,
      countryCode: 'TW',
      type: 'sms',
      purpose: 'login'
    }
  });

  // 驗證 OTP（測試環境使用固定 OTP）
  const response = await request.post(
    'https://cosign.pro/api/platform-sdk/otp-verification',
    {
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'origin': 'https://www.dogcatstar.com',
        'referer': 'https://www.dogcatstar.com/visitor-my-account'
      },
      data: {
        account: process.env.TEST_PHONE,
        otpCode: process.env.TEST_OTP || '123456',
        purpose: 'login'
      }
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toHaveProperty('success');
  expect(data).toHaveProperty('token');
  expect(data.success).toBe(true);
  expect(data.token).toBeTruthy();
  
  // 驗證 JWT Token 格式（3 段，用 . 分隔）
  const tokenParts = data.token.split('.');
  expect(tokenParts).toHaveLength(3);
  
  // 解碼 JWT payload（不驗證簽名）
  const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
  expect(payload).toHaveProperty('sub'); // 用戶 ID
  expect(payload).toHaveProperty('exp'); // 過期時間
  expect(payload.account).toBe(process.env.TEST_PHONE);
});
```

**預期結果**:
- Status: 200 OK
- 回傳有效的 JWT Token
- JWT Token 結構正確

---

### TC-LOGIN-API-003: JWT Token 登入
**測試目標**: 驗證使用 JWT Token 完成登入

**前置條件**:
- 有有效的 JWT Token（從 OTP 驗證取得）

**測試步驟**:
```typescript
test('TC-LOGIN-API-003: 使用 JWT Token 登入', async ({ request }) => {
  // 先取得 JWT Token
  const otpVerifyRes = await request.post(
    'https://cosign.pro/api/platform-sdk/otp-verification',
    {
      headers: {
        'content-type': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN
      },
      data: {
        account: process.env.TEST_PHONE,
        otpCode: process.env.TEST_OTP,
        purpose: 'login'
      }
    }
  );
  
  const { token: jwtToken } = await otpVerifyRes.json();

  // 使用 JWT Token 登入
  const response = await request.get(
    `https://www.dogcatstar.com/cosign/token_login_page?token=${jwtToken}`,
    {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      maxRedirects: 0 // 不自動跟隨重定向
    }
  );

  expect(response.status()).toBe(302);
  
  const location = response.headers()['location'];
  expect(location).toContain('/my-account');
  
  // 驗證 cookies 設定
  const cookies = response.headers()['set-cookie'];
  expect(cookies).toBeDefined();
  expect(cookies).toContain('PHPSESSID');
});
```

**預期結果**:
- Status: 302 Found
- 重定向到 `/my-account`
- 設定登入相關 cookies

---

### TC-LOGIN-API-004: 檢查手機號碼是否已註冊
**測試目標**: 驗證手機號碼註冊狀態查詢

**測試步驟**:
```typescript
test('TC-LOGIN-API-004: 檢查手機號碼是否已註冊', async ({ request }) => {
  const response = await request.get(
    'https://www.dogcatstar.com/dni/mu/user/registered',
    {
      params: {
        login_type: 'sms',
        identifier: process.env.TEST_PHONE
      },
      headers: {
        'accept': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN,
        'referer': 'https://www.dogcatstar.com/visitor-my-account'
      }
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toHaveProperty('registered');
  expect(typeof data.registered).toBe('boolean');
});
```

**預期結果**:
- Status: 200 OK
- 回傳 `{ "registered": true/false }`

---

### TC-LOGIN-API-005: 刷新 Token
**測試目標**: 驗證 Token 刷新功能

**前置條件**:
- 已登入狀態（有有效的 session）

**測試步驟**:
```typescript
test('TC-LOGIN-API-005: 刷新用戶 Token', async ({ request }) => {
  // 先完成登入流程（略）
  
  const response = await request.get(
    'https://www.dogcatstar.com/dni/mu/user/refresh_token',
    {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'referer': 'https://www.dogcatstar.com/my-account'
      }
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toHaveProperty('token');
  expect(data.token).toBeTruthy();
});
```

**預期結果**:
- Status: 200 OK
- 回傳新的 token

---

### TC-LOGIN-API-006: 取得用戶資訊
**測試目標**: 驗證用戶資訊查詢

**前置條件**:
- 已登入狀態

**測試步驟**:
```typescript
test('TC-LOGIN-API-006: 取得登入用戶資訊', async ({ request }) => {
  const response = await request.get(
    'https://cosign.pro/api/platform-sdk/user',
    {
      headers: {
        'accept': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN
      }
    }
  );

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data).toHaveProperty('id');
  expect(data).toHaveProperty('account');
  expect(data.account).toBe(process.env.TEST_PHONE);
});
```

**預期結果**:
- Status: 200 OK
- 回傳完整用戶資訊

---

### TC-LOGIN-API-007: 完整登入流程整合測試
**測試目標**: 驗證完整的登入流程 API 互動

**測試步驟**:
```typescript
test('TC-LOGIN-API-007: 完整登入流程', async ({ request }) => {
  // Step 1: 檢查手機號碼是否已註冊
  const registeredRes = await request.get(
    'https://www.dogcatstar.com/dni/mu/user/registered',
    {
      params: { login_type: 'sms', identifier: process.env.TEST_PHONE },
      headers: {
        'accept': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN
      }
    }
  );
  expect(registeredRes.status()).toBe(200);
  
  // Step 2: 發送 OTP
  const otpRes = await request.post(
    'https://cosign.pro/api/platform-sdk/otp',
    {
      headers: {
        'content-type': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN
      },
      data: {
        account: process.env.TEST_PHONE,
        countryCode: 'TW',
        type: 'sms',
        purpose: 'login',
        recaptchaToken: 'SKIP_FOR_TESTING'
      }
    }
  );
  expect(otpRes.status()).toBe(201);
  
  // Step 3: 驗證 OTP，取得 JWT Token
  const verifyRes = await request.post(
    'https://cosign.pro/api/platform-sdk/otp-verification',
    {
      headers: {
        'content-type': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN
      },
      data: {
        account: process.env.TEST_PHONE,
        otpCode: process.env.TEST_OTP,
        purpose: 'login'
      }
    }
  );
  expect(verifyRes.status()).toBe(200);
  const { token: jwtToken } = await verifyRes.json();
  
  // Step 4: 使用 JWT Token 登入
  const loginRes = await request.get(
    `https://www.dogcatstar.com/cosign/token_login_page?token=${jwtToken}`,
    {
      maxRedirects: 0
    }
  );
  expect(loginRes.status()).toBe(302);
  
  // Step 5: 驗證登入狀態
  const userRes = await request.get(
    'https://cosign.pro/api/platform-sdk/user',
    {
      headers: {
        'accept': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN
      }
    }
  );
  expect(userRes.status()).toBe(200);
  
  console.log('✅ 完整登入流程 API 測試通過');
});
```

**預期結果**:
- 所有 API 呼叫成功
- 流程順序正確
- 最終成功登入

---

## 5. 錯誤處理測試案例

### TC-LOGIN-API-ERR-001: 發送 OTP 無效 Token
```typescript
test('TC-LOGIN-API-ERR-001: 無效 Token 發送 OTP', async ({ request }) => {
  const response = await request.post(
    'https://cosign.pro/api/platform-sdk/otp',
    {
      headers: {
        'content-type': 'application/json',
        'x-platform-token': 'invalid_token'
      },
      data: {
        account: process.env.TEST_PHONE,
        countryCode: 'TW',
        type: 'sms',
        purpose: 'login'
      }
    }
  );

  expect([401, 403]).toContain(response.status());
});
```

### TC-LOGIN-API-ERR-002: 錯誤的 OTP 碼
```typescript
test('TC-LOGIN-API-ERR-002: 驗證錯誤的 OTP 碼', async ({ request }) => {
  // 先發送 OTP
  await request.post('https://cosign.pro/api/platform-sdk/otp', {
    headers: { 'x-platform-token': process.env.PLATFORM_TOKEN },
    data: { account: process.env.TEST_PHONE, type: 'sms', purpose: 'login' }
  });

  // 驗證錯誤的 OTP
  const response = await request.post(
    'https://cosign.pro/api/platform-sdk/otp-verification',
    {
      headers: {
        'content-type': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN
      },
      data: {
        account: process.env.TEST_PHONE,
        otpCode: '000000', // 錯誤的 OTP
        purpose: 'login'
      }
    }
  );

  expect([400, 401]).toContain(response.status());
});
```

### TC-LOGIN-API-ERR-003: 過期的 JWT Token
```typescript
test('TC-LOGIN-API-ERR-003: 使用過期的 JWT Token', async ({ request }) => {
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.xxx';
  
  const response = await request.get(
    `https://www.dogcatstar.com/cosign/token_login_page?token=${expiredToken}`,
    {
      maxRedirects: 0
    }
  );

  expect([401, 403]).toContain(response.status());
});
```

### TC-LOGIN-API-ERR-004: 無效的手機號碼格式
```typescript
test('TC-LOGIN-API-ERR-004: 無效的手機號碼格式', async ({ request }) => {
  const response = await request.post(
    'https://cosign.pro/api/platform-sdk/otp',
    {
      headers: {
        'content-type': 'application/json',
        'x-platform-token': process.env.PLATFORM_TOKEN
      },
      data: {
        account: '0912345678', // 缺少國碼
        countryCode: 'TW',
        type: 'sms',
        purpose: 'login'
      }
    }
  );

  expect([400, 422]).toContain(response.status());
});
```

### TC-LOGIN-API-ERR-005: Rate Limiting
```typescript
test('TC-LOGIN-API-ERR-005: OTP 發送 Rate Limiting', async ({ request }) => {
  // 短時間內連續發送多次 OTP
  const requests = [];
  for (let i = 0; i < 11; i++) {
    requests.push(
      request.post('https://cosign.pro/api/platform-sdk/otp', {
        headers: { 'x-platform-token': process.env.PLATFORM_TOKEN },
        data: {
          account: process.env.TEST_PHONE,
          type: 'sms',
          purpose: 'login'
        }
      })
    );
  }
  
  const responses = await Promise.all(requests);
  
  // 至少有一個請求應該回傳 429
  const hasRateLimit = responses.some(r => r.status() === 429);
  expect(hasRateLimit).toBe(true);
});
```

---

## 6. 測試執行與報告

### 6.1 執行方式
```bash
# 執行所有登入 API 測試
npx playwright test tests/api/login/

# 執行單一測試案例
npx playwright test tests/api/login/TC-LOGIN-API-001-send-otp.spec.ts

# 產生測試報告
npx playwright test --reporter=html

# Debug 模式執行
npx playwright test --debug
```

### 6.2 測試覆蓋率目標
- API 端點覆蓋率: 100%
- 正常流程測試: 100%
- 錯誤處理測試: 90%
- 整合測試: 主要業務流程 100%

### 6.3 測試資料管理
建立 `fixtures/login-test-data.json`:
```json
{
  "test_accounts": [
    {
      "phone": "+886912345678",
      "otp": "123456",
      "name": "測試用戶1"
    },
    {
      "phone": "+886987654321",
      "otp": "654321",
      "name": "測試用戶2"
    }
  ],
  "test_tokens": {
    "api_token": "test_api_token",
    "platform_token": "test_platform_token"
  },
  "error_scenarios": {
    "invalid_phone": "0912345678",
    "wrong_otp": "000000",
    "expired_jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.xxx"
  }
}
```

---

## 7. 注意事項與最佳實踐

### 7.1 OTP 處理
- ✅ 測試環境使用固定 OTP 或 mock API
- ✅ 正式環境謹慎測試，避免濫發簡訊
- ✅ 實作 OTP 自動讀取（測試環境）
- ✅ 設定 OTP 有效期限與重試次數

### 7.2 Token 安全
- ✅ 不要將 Token 寫在測試檔案中
- ✅ 使用環境變數或加密儲存
- ✅ JWT Token 用完即銷毀
- ✅ 定期更換測試用 Token

### 7.3 測試隔離
- ✅ 每個測試使用獨立的測試帳號
- ✅ 避免測試之間的依賴
- ✅ 測試後清理 session/cookie

### 7.4 Rate Limiting
- ✅ 測試時控制請求頻率
- ✅ 設定重試機制（指數退避）
- ✅ 監控 429 回應並適當處理

### 7.5 錯誤處理
- ✅ 驗證所有錯誤狀態碼
- ✅ 檢查錯誤訊息清晰度
- ✅ 測試各種異常場景

### 7.6 CI/CD 整合
- ✅ 整合到 CI/CD pipeline
- ✅ 定期執行測試（每日/每次部署）
- ✅ 自動產生測試報告
- ✅ 失敗時自動通知

---

## 8. 常見問題排查

### Q1: OTP 一直收不到
**原因**:
- 手機號碼格式錯誤（缺少國碼）
- 簡訊服務商問題
- 手機訊號不良
- 短時間內發送過多（被 rate limit）

**解決方法**:
1. 確認手機號碼格式：+886912345678
2. 等待 1-2 分鐘再重試
3. 檢查垃圾簡訊匣
4. 聯絡客服確認帳號狀態

### Q2: OTP 驗證一直回傳 400
**原因**:
- OTP 碼錯誤
- OTP 已過期（超過 5 分鐘）
- OTP 已被使用過
- 手機號碼不一致

**解決方法**:
1. 確認輸入的 OTP 正確
2. 重新發送 OTP
3. 確認手機號碼與發送 OTP 時一致
4. 檢查 OTP 有效期限

### Q3: JWT Token 登入回傳 401
**原因**:
- Token 已過期（超過 5 分鐘）
- Token 已被使用過（重放攻擊防護）
- Token 格式錯誤
- Token 簽名驗證失敗

**解決方法**:
1. 重新驗證 OTP 取得新 Token
2. 確認 Token 完整（3 段，用 . 分隔）
3. Token 取得後立即使用
4. 不要重複使用同一 Token

### Q4: 無法刷新 Token
**原因**:
- 未登入或 session 已失效
- Cookie 被清除
- 跨域請求未帶 credentials

**解決方法**:
1. 確認已完成登入流程
2. 檢查 cookies 是否正確設定
3. API 請求加上 `credentials: 'include'`
4. 重新登入

### Q5: CORS 錯誤
**原因**:
- 缺少 `origin` 或 `referer` header
- 跨域請求被拒絕
- 不支援的 HTTP method

**解決方法**:
1. 加上正確的 `origin` 和 `referer`
2. 確認 API 端點支援 CORS
3. 使用 Postman 時可忽略（不受 CORS 限制）

---

## 9. JWT Token 深入解析

### 9.1 JWT 結構
JWT 由三部分組成，用 `.` 分隔：
```
header.payload.signature
```

### 9.2 Header 範例
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 9.3 Payload 範例
```json
{
  "iss": "cosign",
  "sub": "219870407",
  "platformId": 4,
  "accountType": "sms",
  "account": "+886920535721",
  "redirectUrl": "https://www.dogcatstar.com/my-account/?no-cache",
  "fallbackUrl": "https://www.dogcatstar.com/my-account/?no-cache",
  "identitySecret": "227106551",
  "iat": 1761636943,
  "nbf": 1761636943,
  "exp": 1761637243,
  "jti": "344734f6-9eed-4f6d-bc61-fc5d3880c3c1"
}
```

### 9.4 手動解碼 JWT（測試用）
```javascript
// 分割 JWT Token
const parts = jwtToken.split('.');
const payload = parts[1];

// Base64 解碼
const decoded = Buffer.from(payload, 'base64').toString('utf-8');
const data = JSON.parse(decoded);

console.log('用戶 ID:', data.sub);
console.log('過期時間:', new Date(data.exp * 1000).toISOString());
console.log('帳號:', data.account);
```

### 9.5 線上 JWT 解碼工具
- https://jwt.io/
- 貼上 JWT Token 即可查看內容（不驗證簽名）

---

**撰寫**: GitHub Copilot  
**最後更新**: 2025-10-29  
**版本**: 1.1  
**資料來源**: 登入流程 HAR 檔案分析（訪客與會員模式）
