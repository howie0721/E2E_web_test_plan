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
            'button[data-testid="popup-dont-show"]',
            'button[aria-label="關閉"]',
            'button:has-text("今日不再顯示")',
            'button:has-text("關閉")',
            '#pets-portal-provider-0 button', // 雙十一 popup 關閉按鈕
        ];

        for (const selector of popupSelectors) {
            const popup = this.page.locator(selector);
            if (await popup.isVisible({ timeout: 1000 }).catch(() => false)) {
                await popup.click().catch(() => {});
                await this.page.waitForTimeout(500);
                break;
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
