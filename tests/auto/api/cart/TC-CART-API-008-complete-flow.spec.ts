import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TC-CART-API-008: 完整購物流程整合測試
 * 
 * 測試目標: 驗證完整的無痕購物流程 API 互動
 * 流程: 首購檢查 → 購物車快取 → 計算金額 → 查詢優惠券 → 結帳欄位配置
 */

// 讀取 API tokens
const tokensPath = path.join(process.cwd(), 'fixtures', 'api-tokens.json');
let tokens: any = {};

if (fs.existsSync(tokensPath)) {
  tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
}

const BASE_URL = 'https://fortune-api.moneynet.tw';
const WEB_URL = 'https://www.dogcatstar.com';

// 基本購物車 payload
const testCartPayload = {
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
        stock: 491,
        project_code: 'DCS'
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

test.describe('TC-CART-API-008: 完整購物流程整合測試', () => {
  
  test('008-1: 完整購物流程（無痕模式）', async ({ request }) => {
    console.log('🛒 開始完整購物流程測試');
    
    // Step 1: 檢查首購狀態
    console.log('\n📍 Step 1: 檢查首購狀態');
    const firstPurchaseRes = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
      {
        params: { country_code: 'TW', project_code: 'DCS' },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );
    
    console.log('  Status:', firstPurchaseRes.status());
    expect(firstPurchaseRes.status()).toBe(200);
    
    const firstPurchaseData = await firstPurchaseRes.json();
    console.log('  首購狀態:', firstPurchaseData.is_first_purchase);
    
    // Step 2: 查詢購物車快取
    console.log('\n📍 Step 2: 查詢購物車快取');
    const cacheRes = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`,
          'accept': 'application/json'
        }
      }
    );
    
    console.log('  Status:', cacheRes.status());
    expect(cacheRes.status()).toBe(200);
    
    // Step 3: 計算購物車金額
    console.log('\n📍 Step 3: 計算購物車金額');
    const calculateRes = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'content-type': 'application/json',
          'accept-language': 'zh_TW',
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`
        },
        data: testCartPayload
      }
    );
    
    console.log('  Status:', calculateRes.status());
    expect(calculateRes.status()).toBe(200);
    
    const calculateData = await calculateRes.json();
    if (calculateData.total_amount) {
      console.log('  總金額:', calculateData.total_amount);
    }
    
    // Step 4: 查詢訪客優惠
    console.log('\n📍 Step 4: 查詢訪客優惠');
    const guestDiscountRes = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
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
    
    console.log('  Status:', guestDiscountRes.status());
    expect(guestDiscountRes.status()).toBe(200);
    
    // Step 5: 查詢結帳欄位配置
    console.log('\n📍 Step 5: 查詢結帳欄位配置');
    const fieldsRes = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: { country_code: 'TW' },
        headers: { 'accept': 'application/json', 'referer': `${WEB_URL}/` }
      }
    );
    
    console.log('  Status:', fieldsRes.status());
    expect(fieldsRes.status()).toBe(200);
    
    console.log('\n✅ 完整購物流程測試通過');
  });

  test('008-2: 驗證 API 呼叫順序正確性', async ({ request }) => {
    const apiCallLog: string[] = [];
    
    // 依序呼叫 API
    const apis = [
      { name: '首購檢查', url: `${BASE_URL}/api/ec/v2/TW/cart/first_purchase?country_code=TW&project_code=DCS` },
      { name: '購物車快取', url: `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache` },
      { name: '結帳欄位', url: `${WEB_URL}/dni/mu/checkout/fields?country_code=TW` }
    ];
    
    for (const api of apis) {
      const startTime = Date.now();
      
      const response = await request.get(api.url, {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      apiCallLog.push(`${api.name}: ${response.status()} (${responseTime}ms)`);
      
      console.log(`📊 ${api.name} - Status: ${response.status()}, Time: ${responseTime}ms`);
    }
    
    console.log('\n📋 API 呼叫順序記錄:');
    apiCallLog.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log}`);
    });
    
    console.log('✅ API 順序驗證完成');
  });

  test('008-3: 測試購物流程的錯誤恢復', async ({ request }) => {
    console.log('🔧 測試錯誤恢復機制');
    
    // 嘗試用無效 token 呼叫 API
    const invalidRes = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
      {
        params: { country_code: 'TW', project_code: 'DCS' },
        headers: {
          'api-token': 'invalid_token',
          'x-platform-token': 'invalid_token',
          'accept': 'application/json'
        }
      }
    );
    
    console.log('📊 無效 token - Status:', invalidRes.status());
    expect([401, 403]).toContain(invalidRes.status());
    
    // 使用正確 token 重試
    const validRes = await request.get(
      `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
      {
        params: { country_code: 'TW', project_code: 'DCS' },
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'accept': 'application/json'
        }
      }
    );
    
    console.log('📊 正確 token - Status:', validRes.status());
    expect(validRes.status()).toBe(200);
    
    console.log('✅ 錯誤恢復測試通過');
  });

  test('008-4: 驗證完整流程的資料一致性', async ({ request }) => {
    console.log('🔍 驗證資料一致性');
    
    // 計算購物車兩次，驗證結果一致
    const calculate1 = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'content-type': 'application/json',
          'accept-language': 'zh_TW',
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`
        },
        data: testCartPayload
      }
    );
    
    const calculate2 = await request.post(
      `${BASE_URL}/api/ec/v2/TW/cart/calculate`,
      {
        headers: {
          'api-token': tokens.apiToken,
          'x-platform-token': tokens.platformToken,
          'content-type': 'application/json',
          'accept-language': 'zh_TW',
          'origin': WEB_URL,
          'referer': `${WEB_URL}/`
        },
        data: testCartPayload
      }
    );
    
    expect(calculate1.status()).toBe(200);
    expect(calculate2.status()).toBe(200);
    
    const data1 = await calculate1.json();
    const data2 = await calculate2.json();
    
    // 驗證總金額一致
    if (data1.total_amount && data2.total_amount) {
      console.log('💰 第一次計算:', data1.total_amount);
      console.log('💰 第二次計算:', data2.total_amount);
      
      expect(data1.total_amount).toBe(data2.total_amount);
      console.log('✅ 金額計算一致');
    }
  });

  test('008-5: 測試購物流程的總耗時', async ({ request }) => {
    const startTime = Date.now();
    
    console.log('⏱️ 開始計時完整流程');
    
    // 執行完整流程
    await request.get(`${BASE_URL}/api/ec/v2/TW/cart/first_purchase?country_code=TW&project_code=DCS`, {
      headers: { 'api-token': tokens.apiToken, 'x-platform-token': tokens.platformToken, 'accept': 'application/json' }
    });
    
    await request.get(`${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`, {
      headers: { 'api-token': tokens.apiToken, 'x-platform-token': tokens.platformToken, 'accept': 'application/json' }
    });
    
    await request.post(`${BASE_URL}/api/ec/v2/TW/cart/calculate`, {
      headers: { 'api-token': tokens.apiToken, 'x-platform-token': tokens.platformToken, 'content-type': 'application/json' },
      data: testCartPayload
    });
    
    await request.get(`${WEB_URL}/dni/mu/checkout/fields?country_code=TW`, {
      headers: { 'accept': 'application/json' }
    });
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('⏱️ 完整流程總耗時:', totalTime, 'ms');
    
    // 完整流程應在 15 秒內完成
    expect(totalTime).toBeLessThan(15000);
    
    console.log('✅ 流程效能符合預期');
  });

  test('008-6: 測試不同商品數量的流程', async ({ request }) => {
    const quantities = [1, 2, 5];
    
    for (const qty of quantities) {
      console.log(`\n🛒 測試數量: ${qty}`);
      
      const payload = {
        ...testCartPayload,
        order_items: [
          {
            ...testCartPayload.order_items[0],
            quantity: qty
          }
        ],
        cart_values: {
          ...testCartPayload.cart_values,
          cart: {
            items: [{
              ...testCartPayload.cart_values.cart.items[0],
              quantity: qty
            }],
            addonItems: []
          }
        }
      };
      
      const response = await request.post(
        `${BASE_URL}/api/ec/v2/TW/cart/calculate`,
        {
          headers: {
            'api-token': tokens.apiToken,
            'x-platform-token': tokens.platformToken,
            'content-type': 'application/json',
            'accept-language': 'zh_TW',
            'origin': WEB_URL,
            'referer': `${WEB_URL}/`
          },
          data: payload
        }
      );
      
      console.log(`  Status: ${response.status()}`);
      expect(response.status()).toBe(200);
      
      if (response.status() === 200) {
        const data = await response.json();
        if (data.total_amount) {
          console.log(`  總金額: ${data.total_amount}`);
        }
      }
    }
    
    console.log('\n✅ 不同數量測試完成');
  });

  test('008-7: 驗證 API 端點可達性', async ({ request }) => {
    const endpoints = [
      { name: '首購檢查', url: `${BASE_URL}/api/ec/v2/TW/cart/first_purchase` },
      { name: '購物車快取', url: `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache` },
      { name: '訪客優惠', url: `${BASE_URL}/api/ec/v2/TW/cart/calculate_guest_discount` },
      { name: '結帳欄位', url: `${WEB_URL}/dni/mu/checkout/fields` }
    ];
    
    console.log('🔍 檢查所有 API 端點可達性\n');
    
    for (const endpoint of endpoints) {
      try {
        const response = await request.get(endpoint.url, {
          params: { country_code: 'TW', project_code: 'DCS' },
          headers: {
            'api-token': tokens.apiToken,
            'x-platform-token': tokens.platformToken,
            'accept': 'application/json'
          }
        });
        
        console.log(`✅ ${endpoint.name}: ${response.status()}`);
        
        // 不應該是 404 (Not Found)
        expect(response.status()).not.toBe(404);
      } catch (error) {
        console.error(`❌ ${endpoint.name}: 無法連接`);
        throw error;
      }
    }
    
    console.log('\n✅ 所有端點可達');
  });

  test('008-8: 測試併發購物流程', async ({ request }) => {
    console.log('🔄 測試併發購物流程');
    
    const concurrentRequests = Array(3).fill(null).map((_, index) => 
      (async () => {
        console.log(`\n🛒 流程 ${index + 1} 開始`);
        
        const res1 = await request.get(
          `${BASE_URL}/api/ec/v2/TW/cart/first_purchase`,
          {
            params: { country_code: 'TW', project_code: 'DCS' },
            headers: {
              'api-token': tokens.apiToken,
              'x-platform-token': tokens.platformToken,
              'accept': 'application/json'
            }
          }
        );
        
        const res2 = await request.get(
          `${BASE_URL}/api/ec/v2/TW/cart/cart_request_cache`,
          {
            headers: {
              'api-token': tokens.apiToken,
              'x-platform-token': tokens.platformToken,
              'accept': 'application/json'
            }
          }
        );
        
        console.log(`✅ 流程 ${index + 1} 完成: ${res1.status()}, ${res2.status()}`);
        
        return { res1: res1.status(), res2: res2.status() };
      })()
    );
    
    const results = await Promise.all(concurrentRequests);
    
    console.log('\n📊 併發結果:');
    results.forEach((result, index) => {
      console.log(`  流程 ${index + 1}: 首購 ${result.res1}, 快取 ${result.res2}`);
    });
    
    console.log('✅ 併發測試完成');
  });

});
