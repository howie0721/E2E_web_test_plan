import { Page, expect } from '@playwright/test';

/**
 * LoginPage - 封裝會員登入相關操作
 * 提供手機登入、Email 登入、OTP 驗證等共用方法
 */
export class LoginPage {
  constructor(private page: Page) {}

  /**
   * 前往登入頁面
   * 1. 開啟首頁
   * 2. 點擊會員圖示 (#my-account-anchor)
   * 3. 點擊「登入/註冊」按鈕進入登入表單
   */
  async goto() {
    await this.page.goto('https://www.dogcatstar.com/');
    await this.page.locator('#my-account-anchor:visible').click();
    await this.page.locator('button:has-text("登入/註冊")').click();
  }

  /**
   * 填寫手機號碼
   * @param phone 手機號碼（不含國碼）
   */
  async fillPhone(phone: string) {
    await this.page.locator('text=+886').waitFor({ state: 'visible' });
    await this.page.fill('input[name="username"]', phone);
  }

  /**
   * 送出手機號碼登入表單
   * 點擊「登入/註冊」按鈕送出手機號碼，觸發 OTP 簡訊發送
   */
  async submitPhone() {
    await this.page.locator('button:has-text("登入/註冊")').click();
  }

  /**
   * 切換到 Email 登入頁籤
   * 在登入表單中切換至使用 Email 登入的模式
   */
  async switchToEmailLogin() {
    await this.page.locator('button:has-text("使用 電子信箱 登入")').click();
  }

  /**
   * 填寫 Email 地址
   * @param email Email 地址
   */
  async fillEmail(email: string) {
    await this.page.fill('input[name="email"]', email);
  }

  /**
   * 點擊確認按鈕（Email 登入流程）
   * 加入穩定性優化：等待可見、可點擊、滾動至可視範圍、微延遲、強制點擊
   * 用於 Email 登入送出後觸發 OTP 發送
   */
  async clickConfirmButton() {
    const confirmBtn = this.page.getByRole('button', { name: '確認', exact: true });
    await confirmBtn.waitFor({ state: 'visible' });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300); // 等待可能的動畫
    await confirmBtn.click({ force: true });
  }

  /**
   * 填寫 OTP 驗證碼
   * @param otp 驗證碼（每個字元會填入對應的輸入框）
   * 支援手機與 Email 登入的 OTP 輸入
   */
  async fillOTP(otp: string) {
    await this.page.waitForSelector('input[type="tel"]', { state: 'visible', timeout: 10000 });
    const otpInputs = await this.page.locator('input[type="tel"]').all();
    const digits = otp.split('');
    for (let i = 0; i < otpInputs.length && i < digits.length; i++) {
      await otpInputs[i].fill(digits[i]);
    }
  }

  /**
   * 等待使用者手動輸入 OTP（用於需要真實 OTP 的測試）
   * @param timeout 等待時間（毫秒），預設 30 秒
   */
  async waitForOTPInput(timeout = 30000) {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * 驗證錯誤訊息是否顯示
   * @param errorMessage 預期的錯誤訊息文字
   */
  async expectErrorMessage(errorMessage: string) {
    await expect(this.page.locator(`text=${errorMessage}`)).toBeVisible();
  }

  /**
   * 驗證登入成功
   * 前往會員中心並檢查「我的點數」按鈕是否出現（已登入狀態的標誌）
   */
  async expectLoginSuccess() {
    await expect(this.page.locator('button:has-text("我的點數")')).toBeVisible();
  }

  /**
   * 進入會員中心
   * 點擊會員圖示以展開會員選單或進入會員頁面
   */
  async openMyAccount() {
    await this.page.locator('#my-account-anchor:visible').click();
  }

  /**
   * 驗證登入/註冊按鈕狀態
   * @param shouldBeDisabled 是否應為 disabled 狀態
   */
  async expectLoginButtonState(shouldBeDisabled: boolean) {
    const loginButton = this.page.locator('button:has-text("登入/註冊")');
    if (shouldBeDisabled) {
      await expect(loginButton).toBeDisabled();
    } else {
      await expect(loginButton).toBeEnabled();
    }
  }

  /**
   * 點擊 LINE 登入按鈕
   * 用於啟動 LINE OAuth 登入流程
   */
  async clickLineLogin() {
    await this.page.locator('button:has-text("LINE")').click();
  }

  /**
   * 點擊 Google 登入按鈕
   * 用於啟動 Google OAuth 登入流程
   */
  async clickGoogleLogin() {
    await this.page.locator('button:has-text("Google")').click();
  }

  /**
   * 點擊 Facebook 登入按鈕
   * 用於啟動 Facebook OAuth 登入流程
   */
  async clickFacebookLogin() {
    await this.page.locator('button:has-text("Facebook")').click();
  }

  /**
   * 等待 OAuth 授權後跳轉回原站
   * @param timeout 等待時間（毫秒），預設 30 秒
   */
  async waitForOAuthCallback(timeout = 30000) {
    await this.page.waitForURL('https://www.dogcatstar.com/my-account/?no-cache', { timeout });
  }
}
