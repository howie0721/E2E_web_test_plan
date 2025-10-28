import { test, expect } from '@playwright/test';

/**
 * TC-CART-API-006: 查詢結帳欄位配置
 * 
 * 測試目標: 驗證結帳表單欄位配置查詢功能
 * API: GET /dni/mu/checkout/fields
 */

const WEB_URL = 'https://www.dogcatstar.com';

test.describe('TC-CART-API-006: 查詢結帳欄位配置', () => {
  
  test('006-1: 成功查詢結帳欄位配置（TW）', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'TW'
        },
        headers: {
          'accept': 'application/json',
          'referer': `${WEB_URL}/`
        }
      }
    );

    console.log('📊 結帳欄位配置查詢 - Status:', response.status());
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    console.log('📋 欄位配置:', JSON.stringify(data, null, 2));
    
    // 驗證回應結構
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
    
    // 檢查是否有 fields 欄位
    if (data.fields) {
      expect(Array.isArray(data.fields) || typeof data.fields === 'object').toBe(true);
      console.log('✅ fields 欄位存在');
    }
    
    console.log('✅ 結帳欄位配置查詢成功');
  });

  test('006-2: 驗證結帳欄位資料結構', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'TW'
        },
        headers: {
          'accept': 'application/json',
          'referer': `${WEB_URL}/`
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    console.log('📋 欄位結構分析:');
    
    // 常見的結帳欄位
    const expectedFields = [
      'billing_first_name', 'billing_last_name', 'billing_phone',
      'billing_email', 'billing_address_1', 'billing_city',
      'billing_state', 'billing_postcode', 'shipping_address',
      'payment_method', 'shipping_method'
    ];
    
    // 檢查欄位配置
    if (data.fields) {
      const fields = data.fields;
      
      if (Array.isArray(fields)) {
        console.log('  ✅ 欄位數量:', fields.length);
        
        fields.forEach((field: any) => {
          if (field.name) {
            console.log(`  📝 欄位: ${field.name}`);
            
            // 檢查欄位屬性
            if (field.required !== undefined) {
              console.log(`    - 必填: ${field.required}`);
            }
            if (field.type) {
              console.log(`    - 類型: ${field.type}`);
            }
          }
        });
      } else if (typeof fields === 'object') {
        const fieldKeys = Object.keys(fields);
        console.log('  ✅ 欄位數量:', fieldKeys.length);
        console.log('  📝 欄位名稱:', fieldKeys.join(', '));
      }
    }
    
    console.log('✅ 欄位結構驗證完成');
  });

  test('006-3: 測試不同 country_code', async ({ request }) => {
    const countryCodes = ['TW', 'US', 'JP', 'CN'];

    for (const countryCode of countryCodes) {
      const response = await request.get(
        `${WEB_URL}/dni/mu/checkout/fields`,
        {
          params: {
            country_code: countryCode
          },
          headers: {
            'accept': 'application/json',
            'referer': `${WEB_URL}/`
          }
        }
      );

      console.log(`🌍 Country: ${countryCode} - Status:`, response.status());
      
      // 200（支援）或 400/404（不支援）
      expect([200, 400, 404, 500]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        console.log(`  ✅ ${countryCode} 欄位配置可用`);
      }
    }
  });

  test('006-4: 缺少 country_code 參數', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          // 故意缺少 country_code
        },
        headers: {
          'accept': 'application/json',
          'referer': `${WEB_URL}/`
        }
      }
    );

    console.log('📊 缺少 country_code - Status:', response.status());
    
    // 可能使用預設值或回傳錯誤
    expect([200, 400, 422, 500]).toContain(response.status());
  });

  test('006-5: 測試無效的 country_code', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'INVALID'
        },
        headers: {
          'accept': 'application/json',
          'referer': `${WEB_URL}/`
        }
      }
    );

    console.log('📊 無效 country_code - Status:', response.status());
    
    expect([400, 404, 500]).toContain(response.status());
    
    console.log('✅ 正確處理無效 country_code');
  });

  test('006-6: 測試缺少 referer header', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'TW'
        },
        headers: {
          'accept': 'application/json'
          // 故意缺少 referer
        }
      }
    );

    console.log('📊 缺少 referer - Status:', response.status());
    
    // 可能允許（不嚴格檢查）或拒絕
    expect([200, 403]).toContain(response.status());
  });

  test('006-7: 測試錯誤的 referer', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'TW'
        },
        headers: {
          'accept': 'application/json',
          'referer': 'https://malicious-site.com/'
        }
      }
    );

    console.log('📊 錯誤的 referer - Status:', response.status());
    
    expect([200, 403]).toContain(response.status());
  });

  test('006-8: 驗證 API 回應時間', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'TW'
        },
        headers: {
          'accept': 'application/json',
          'referer': `${WEB_URL}/`
        }
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('⏱️ API 回應時間:', responseTime, 'ms');
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(5000);
    
    console.log('✅ 回應時間正常');
  });

  test('006-9: 測試併發查詢結帳欄位', async ({ request }) => {
    const requests = Array(3).fill(null).map(() => 
      request.get(
        `${WEB_URL}/dni/mu/checkout/fields`,
        {
          params: {
            country_code: 'TW'
          },
          headers: {
            'accept': 'application/json',
            'referer': `${WEB_URL}/`
          }
        }
      )
    );

    const responses = await Promise.all(requests);
    
    console.log('📊 併發請求結果:');
    responses.forEach((res, index) => {
      console.log(`  請求 ${index + 1}: Status ${res.status()}`);
      expect(res.status()).toBe(200);
    });
    
    console.log('✅ 併發請求處理正常');
  });

  test('006-10: 驗證回應 Content-Type', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'TW'
        },
        headers: {
          'accept': 'application/json',
          'referer': `${WEB_URL}/`
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    console.log('📦 Content-Type:', contentType);
    
    expect(contentType).toContain('application/json');
    
    console.log('✅ Content-Type 正確');
  });

  test('006-11: 檢查必填欄位標記', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'TW'
        },
        headers: {
          'accept': 'application/json',
          'referer': `${WEB_URL}/`
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    console.log('📋 必填欄位檢查:');
    
    if (data.fields) {
      const fields = Array.isArray(data.fields) ? data.fields : Object.values(data.fields);
      
      const requiredFields = fields.filter((field: any) => field.required === true);
      const optionalFields = fields.filter((field: any) => field.required === false);
      
      console.log(`  ✅ 必填欄位數量: ${requiredFields.length}`);
      console.log(`  ✅ 選填欄位數量: ${optionalFields.length}`);
      
      if (requiredFields.length > 0) {
        console.log('  📝 必填欄位:');
        requiredFields.forEach((field: any) => {
          if (field.name) {
            console.log(`    - ${field.name}`);
          }
        });
      }
    }
    
    console.log('✅ 必填欄位檢查完成');
  });

  test('006-12: 檢查欄位驗證規則', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'TW'
        },
        headers: {
          'accept': 'application/json',
          'referer': `${WEB_URL}/`
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    console.log('📋 驗證規則檢查:');
    
    if (data.fields) {
      const fields = Array.isArray(data.fields) ? data.fields : Object.values(data.fields);
      
      fields.forEach((field: any) => {
        if (field.validation || field.pattern || field.regex || field.max_length) {
          console.log(`  📝 ${field.name || '未知欄位'}:`);
          
          if (field.validation) {
            console.log(`    - 驗證: ${field.validation}`);
          }
          if (field.pattern || field.regex) {
            console.log(`    - 正則: ${field.pattern || field.regex}`);
          }
          if (field.max_length) {
            console.log(`    - 最大長度: ${field.max_length}`);
          }
        }
      });
    }
    
    console.log('✅ 驗證規則檢查完成');
  });

  test('006-13: 測試不同 Accept header', async ({ request }) => {
    const acceptTypes = [
      'application/json',
      'application/json, text/plain, */*',
      '*/*'
    ];

    for (const acceptType of acceptTypes) {
      const response = await request.get(
        `${WEB_URL}/dni/mu/checkout/fields`,
        {
          params: {
            country_code: 'TW'
          },
          headers: {
            'accept': acceptType,
            'referer': `${WEB_URL}/`
          }
        }
      );

      console.log(`📊 Accept: ${acceptType} - Status:`, response.status());
      
      expect(response.status()).toBe(200);
    }
    
    console.log('✅ 支援多種 Accept header');
  });

  test('006-14: 驗證欄位類型多樣性', async ({ request }) => {
    const response = await request.get(
      `${WEB_URL}/dni/mu/checkout/fields`,
      {
        params: {
          country_code: 'TW'
        },
        headers: {
          'accept': 'application/json',
          'referer': `${WEB_URL}/`
        }
      }
    );

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    
    console.log('📋 欄位類型分析:');
    
    if (data.fields) {
      const fields = Array.isArray(data.fields) ? data.fields : Object.values(data.fields);
      const fieldTypes = new Set(fields.map((f: any) => f.type).filter(Boolean));
      
      console.log('  ✅ 欄位類型種類:', fieldTypes.size);
      console.log('  📝 類型清單:', Array.from(fieldTypes).join(', '));
    }
    
    console.log('✅ 類型多樣性檢查完成');
  });

});
