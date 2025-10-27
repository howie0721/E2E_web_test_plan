import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * HomePage - 首頁
 * 負責首頁相關操作
 */
export class HomePage extends BasePage {
    // Locators
    private readonly productLinkSelector = 'a.woocommerce-LoopProduct-link.woocommerce-loop-product__link';

    constructor(page: Page) {
        super(page);
    }

    /**
     * 導航到首頁
     */
    async navigate() {
        await this.goto('');
    }

    /**
     * 點擊指定索引的商品
     * @param index 商品索引（0-based）
     */
    async clickProductByIndex(index: number = 0) {
        await this.closePopup();
        await this.page.locator(this.productLinkSelector).first().waitFor({ state: 'visible' });
        const productLinks = await this.page.locator(this.productLinkSelector).all();
        
        if (productLinks.length === 0) {
            throw new Error('找不到商品連結');
        }
        
        if (productLinks.length <= index) {
            throw new Error(`商品索引超出範圍。總商品數：${productLinks.length}，請求索引：${index}`);
        }
        
        await productLinks[index].click();
        await this.page.waitForTimeout(8000);
        await this.closePopup();
    }
}
