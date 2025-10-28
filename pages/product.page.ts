import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * ProductPage - 商品頁面
 * 負責商品頁相關操作（選擇規格、加入購物車等）
 */
export class ProductPage extends BasePage {
    // Locators
    private readonly reactRootSelector = '#react-root';
    private readonly specGroupSelector = 'div.x78zum5.xdt5ytf.x1pidvrl div.x78zum5.x1a02dak.x1pidvrl';
    private readonly addToCartBtnSelector = 'button[data-testid="button-add-to-cart"]';

    constructor(page: Page) {
        super(page);
    }

    /**
     * 等待商品頁面加載完成
     */
    async waitForPageLoad() {
        await this.page.locator(this.reactRootSelector).waitFor({ state: 'visible' });
        await this.closePopup();
    }

    /**
     * 選擇所有規格 group 的第一個可選選項
     * 會跳過「加入購物車」按鈕和已選擇的選項
     */
    async selectFirstAvailableSpecs() {
        await this.closePopup();
        const specGroupLocator = this.page.locator(this.specGroupSelector);
        const groupCount = await specGroupLocator.count();

        for (let i = 0; i < groupCount; i++) {
            const group = specGroupLocator.nth(i);
            
            // 只選擇有文字內容的按鈕（排除純 SVG 按鈕）
            const optionButtonsLocator = group.locator('button').filter({ hasNotText: '' });
            const buttonCount = await optionButtonsLocator.count();

            for (let j = 0; j < buttonCount; j++) {
                const btn = optionButtonsLocator.nth(j);
                const text = (await btn.textContent())?.trim() || '';
                
                // 跳過「加入購物車」按鈕和空按鈕
                if (text.includes('加入購物車') || text === '') continue;
                
                // 檢查是否已選
                const isSelected = await btn.getAttribute('data-testid') === 'selected';
                if (isSelected) break;
                
                // 點擊第一個可選按鈕
                await btn.click();
                await this.page.waitForTimeout(300);
                break;
            }
        }
    }

    /**
     * 點擊加入購物車按鈕
     */
    async clickAddToCart() {
        await this.closePopup();
        await this.page.waitForTimeout(500);
        
        // 使用 data-testid + 文字過濾，確保點擊正確的按鈕
        const addToCartBtn = this.page
            .locator(this.addToCartBtnSelector)
            .filter({ hasText: '加入購物車' })
            .first();
        
        await addToCartBtn.waitFor({ state: 'visible' });
        await addToCartBtn.click();
        await this.closePopup();
    }

    /**
     * 選擇規格並加入購物車（一次性操作）
     */
    async selectSpecsAndAddToCart() {
        await this.waitForPageLoad();
        // 進入商品頁面後多等5秒，確保規格載入完成
        await this.page.waitForTimeout(5000);
        await this.selectFirstAvailableSpecs();
        await this.clickAddToCart();
    }
}
