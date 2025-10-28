/**
 * 購物車 API 測試輔助函數
 * 用於處理常見的 API 測試情境
 */

import { APIResponse } from '@playwright/test';

/**
 * 處理可能回傳 HTML 或 JSON 的 API 回應
 */
export async function safeParseJson(response: APIResponse): Promise<any | null> {
  try {
    const contentType = response.headers()['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/html')) {
      console.log('⚠️ API 回傳 HTML 而非 JSON');
      const text = await response.text();
      console.log('📄 HTML 內容前 200 字:', text.substring(0, 200));
      return null;
    } else {
      return await response.json();
    }
  } catch (error) {
    console.log('❌ JSON 解析失敗:', error);
    return null;
  }
}

/**
 * 驗證 API 回應狀態（考慮訪客模式限制）
 */
export function validateGuestApiResponse(
  status: number,
  expectedStatuses: number[] = [200, 401]
): boolean {
  if (expectedStatuses.includes(status)) {
    if (status === 401) {
      console.log('ℹ️ API 需要認證 (401 - 訪客模式預期行為)');
    } else if (status === 200) {
      console.log('✅ API 回應成功 (200)');
    }
    return true;
  }
  
  console.log(`❌ 非預期狀態碼: ${status}`);
  return false;
}

/**
 * 建立購物車計算的基本 payload
 */
export function createCartCalculatePayload(options: {
  sku?: string;
  quantity?: number;
  country?: string;
  language?: string;
} = {}) {
  const {
    sku = '貓火雞罐',
    quantity = 1,
    country = 'TW',
    language = 'zh_TW'
  } = options;

  return {
    billing_country: country,
    project_code: 'DCS',
    country_code: country,
    order_items: [
      {
        sku: sku,
        project_code: 'DCS',
        quantity: quantity,
        is_addon: false,
        is_addon_v2: false
      }
    ],
    manual_input_coupon_ids: [],
    applied_shipping_method_id: 2,
    language: language,
    cart_values: {
      cart: {
        items: [{
          cartItemId: 32611,
          product_id: 32602,
          variation_id: 32611,
          quantity: quantity,
          sku: sku,
          delivery_class: 'normal',
          product_limited: {
            life_limit: 0,
            purchased_count: 0
          },
          project_code: 'DCS',
          sale_price: 46,
          addon_purchase_limit: null,
          stock: 491
        }],
        addonItems: []
      },
      rewardPoints: {
        userInputRewardPoints: 0,
        spendableRewardPointsLimit: 0
      },
      coupon: {
        couponIds: [],
        inputCouponCode: ''
      }
    }
  };
}

/**
 * 建立訪客優惠折扣的基本 payload
 */
export function createGuestDiscountPayload(options: {
  country?: string;
  shouldRequest?: boolean;
  orderItems?: any[];
} = {}) {
  const {
    country = 'TW',
    shouldRequest = true,
    orderItems = []
  } = options;

  return {
    country_code: country,
    should_request: shouldRequest,
    order_items: orderItems
  };
}

/**
 * 記錄 API 測試結果
 */
export function logTestResult(testName: string, passed: boolean, message?: string) {
  const emoji = passed ? '✅' : '❌';
  console.log(`${emoji} ${testName}`);
  if (message) {
    console.log(`   ${message}`);
  }
}

/**
 * 驗證 API 回應時間
 */
export function validateResponseTime(
  startTime: number,
  maxTime: number = 5000,
  testName: string = 'API'
): boolean {
  const responseTime = Date.now() - startTime;
  console.log(`⏱️ ${testName} 回應時間: ${responseTime}ms`);
  
  if (responseTime < maxTime) {
    console.log(`✅ 回應時間在合理範圍內 (< ${maxTime}ms)`);
    return true;
  } else {
    console.log(`⚠️ 回應時間過長 (> ${maxTime}ms)`);
    return false;
  }
}

/**
 * 取得常用的 API headers
 */
export function getApiHeaders(tokens: any, additionalHeaders: Record<string, string> = {}) {
  return {
    'api-token': tokens.apiToken || '',
    'x-platform-token': tokens.platformToken || '',
    'accept': 'application/json',
    'content-type': 'application/json',
    ...additionalHeaders
  };
}

/**
 * 檢查 API 是否需要認證
 */
export function isAuthenticationRequired(status: number): boolean {
  return status === 401 || status === 403;
}

/**
 * 檢查 API 是否為成功回應
 */
export function isSuccessResponse(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * 建立併發請求測試
 */
export async function testConcurrentRequests(
  requestFn: () => Promise<APIResponse>,
  count: number = 3,
  testName: string = 'API'
): Promise<APIResponse[]> {
  console.log(`🔄 測試併發請求 (${count} 個請求)...`);
  
  const promises = Array(count).fill(null).map(() => requestFn());
  const responses = await Promise.all(promises);
  
  console.log(`📊 ${testName} 併發請求結果:`);
  responses.forEach((res, index) => {
    console.log(`  請求 ${index + 1}: Status ${res.status()}`);
  });
  
  return responses;
}
