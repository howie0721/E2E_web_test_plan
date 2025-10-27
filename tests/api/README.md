# API 測試說明文件

## 目錄結構

```
tests/api/
├── auth/                    # 認證相關 API 測試
├── cart/                    # 購物車 API 測試
│   └── cart-api.spec.ts    # 範例：購物車快取、計算
├── checkout/                # 結帳 API 測試
└── integration/             # 整合測試（跨 API 流程）
```

## 如何執行

### 執行所有 API 測試
```bash
npx playwright test tests/api
```

### 執行特定分類測試
```bash
# 只執行購物車 API 測試
npx playwright test tests/api/cart

# 只執行認證 API 測試
npx playwright test tests/api/auth
```

### 執行單一測試檔案
```bash
npx playwright test tests/api/cart/cart-api.spec.ts
```

## 配置說明

### API Tokens 管理
- Token 存放位置：`fixtures/api-tokens.json`
- 包含：`api-token` 和 `x-platform-token`
- **注意**：Token 會過期，需定期更新

### API 客戶端
- 位置：`helpers/apiClient.ts`
- 功能：封裝所有 API 呼叫、統一管理 headers 與認證

## 測試案例設計原則

### 1. 正常流程測試
- 驗證 API 正常運作
- 檢查狀態碼、回應格式、資料正確性

### 2. 異常處理測試
- 缺少必要參數
- 無效的 token
- 錯誤的資料格式

### 3. 邊界值測試
- 最大/最小值
- 空值、null 值
- 特殊字元

## 與 E2E 測試的整合

### 在 E2E 測試中使用 API 輔助

```typescript
import { test } from '@playwright/test';
import { createApiClient } from '../helpers/apiClient';

test('快速準備測試資料', async ({ page }) => {
  // 使用 API 快速加入商品
  const apiClient = await createApiClient();
  await apiClient.addToCart({ sku: '貓火雞罐', quantity: 2 });
  
  // 然後驗證 UI
  await page.goto('/cart');
  // ... UI 驗證
  
  await apiClient.dispose();
});
```

## 最佳實踐

1. **Token 管理**：使用 fixture 集中管理，避免硬編碼
2. **客戶端重用**：在 beforeAll 初始化，afterAll 清理
3. **錯誤處理**：每個測試都要驗證預期的錯誤回應
4. **資料隔離**：測試後清理資料，避免互相影響
5. **清晰命名**：測試名稱應清楚描述測試目的

## 進階功能

### 待實作功能
- [ ] 自動 token 刷新機制
- [ ] 測試資料生成器
- [ ] API mock/stub 支援
- [ ] 效能測試整合
- [ ] API 契約測試

## 參考文件
- 完整 API 規劃：`docs/api-test-plan.md`
- HAR 檔案：專案根目錄
