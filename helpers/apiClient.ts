import { request, APIRequestContext } from '@playwright/test';

/**
 * API 客戶端 - 統一管理所有 API 呼叫
 */
export class ApiClient {
  private context: APIRequestContext | null = null;
  private apiToken: string = '';
  private platformToken: string = '';

  /**
   * 初始化 API 客戶端
   */
  async init() {
    this.context = await request.newContext({
      baseURL: 'https://fortune-api.moneynet.tw',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'https://www.dogcatstar.com',
        'Referer': 'https://www.dogcatstar.com/',
      },
    });
  }

  /**
   * 設定認證 tokens
   */
  setTokens(apiToken: string, platformToken: string) {
    this.apiToken = apiToken;
    this.platformToken = platformToken;
  }

  /**
   * 取得帶有認證 headers 的請求配置
   */
  private getAuthHeaders() {
    return {
      'api-token': this.apiToken,
      'x-platform-token': this.platformToken,
    };
  }

  /**
   * 檢查首次購物狀態
   */
  async checkFirstPurchase(countryCode: string = 'TW', projectCode: string = 'DCS') {
    if (!this.context) throw new Error('API client not initialized');
    
    return await this.context.get(
      `/api/ec/v2/${countryCode}/cart/first_purchase?country_code=${countryCode}&project_code=${projectCode}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * 查詢購物車快取
   */
  async getCartCache() {
    if (!this.context) throw new Error('API client not initialized');
    
    return await this.context.get(
      '/api/ec/v2/TW/cart/cart_request_cache',
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * 計算結帳金額
   */
  async calculateCheckout(payload: any) {
    if (!this.context) throw new Error('API client not initialized');
    
    return await this.context.post(
      '/api/ec/v2/TW/cart/calculate',
      {
        headers: {
          ...this.getAuthHeaders(),
          'accept-language': 'zh_TW',
        },
        data: payload,
      }
    );
  }

  /**
   * 查詢可用優惠券
   */
  async getAvailableCoupons(userId: number = 0, countryCode: string = 'TW', projectCode: string = 'DCS') {
    if (!this.context) throw new Error('API client not initialized');
    
    return await this.context.get(
      `/api/ec/coupons/available_coupons?country_code=${countryCode}&project_code=${projectCode}&user_id=${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * 查詢用戶地址資訊
   */
  async getUserAddress(countryCode: string = 'TW', projectCode: string = 'DCS') {
    if (!this.context) throw new Error('API client not initialized');
    
    return await this.context.get(
      `/api/ec/user/address_info?country_code=${countryCode}&project_code=${projectCode}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * 關閉 API 客戶端
   */
  async dispose() {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }
}

/**
 * 建立新的 API 客戶端實例
 */
export async function createApiClient(): Promise<ApiClient> {
  const client = new ApiClient();
  await client.init();
  return client;
}
