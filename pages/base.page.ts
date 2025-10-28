import { Page } from '@playwright/test';

/**
 * BasePage - 所有頁面的基類
 * 包含通用功能如關閉彈窗
 */
export class BasePage {
    protected page: Page;
    protected baseUrl = 'https://www.dogcatstar.com/';

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * 關閉彈窗（支援多種選擇器）
     */
    async closePopup() {
        const popupSelectors = [
            'button[data-testid="popup-close-button"]',  // 右上角 X 按鈕（優先）
            'button[data-testid="popup-dont-show"]',     // 左下角「今日不再顯示」按鈕
            'button[aria-label="關閉"]',
            'button:has-text("關閉")',
            '[data-testid="popup-close-button"]',         // 防止有非 button 的 close
            '[data-testid="popup-dont-show"]'
        ];

        for (const selector of popupSelectors) {
            const popup = this.page.locator(selector).first();
            if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
                // 僅點擊 tagName 為 BUTTON 的元素，避免誤點 <a>
                const tagName = await popup.evaluate(el => el.tagName).catch(() => '');
                if (tagName && tagName.toUpperCase() === 'BUTTON') {
                    await popup.click({ force: true }).catch(() => {});
                    await this.page.waitForTimeout(500);
                    break;
                }
            }
        }
    }

    /**
     * 導航到指定 URL
     */
    async goto(path: string = '') {
        await this.page.goto(this.baseUrl + path);
        await this.closePopup();
    }
}
