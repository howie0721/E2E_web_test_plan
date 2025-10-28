import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * CartPage - 購物車頁面
 * 負責購物車相關操作（清空、驗證數量等）
 */
export class CartPage extends BasePage {
    // Locators
    private readonly emptyCartMessageSelector = 'text=購物車中沒有商品';
    private readonly cartCardSelector = '[data-testid="paper-card-main-normal"]';
    private readonly removeButtonSelector = 'div[data-testid="paper-card-main-normal"] button.xjyslct.xjbqb8w.xng3xce.xc342km.x9f619.x1ypdohk.x1s07b3s.x3nfvp2.xln7xf2.xo45yj3.x1ghz6dp.x1dmc9kt.x1hc1fzr.x1a2a7pz.x1n2onr6.x1hl2dhg.x6mezaz.x87ps6o.xxymvpz.x12oqio5.xo1l8bm.xb52pt7.xy9syeq.x3d248p.xjwks3b.xzqw0bv.x6s0dn4.x1qlqyl8.xl56j7k.x15x72sd.x1717udv';
    private readonly cartBadgeSelector = '#cart-badge:visible';
    private readonly quantityInputSelector = 'input[type="number"]';

    constructor(page: Page) {
        super(page);
    }

    /**
     * 導航到購物車頁面
     */
    async navigate() {
        await this.goto('cart/');
    }

    /**
     * 清空購物車內所有商品
     */
    async clearCart() {
    await this.navigate();
    await this.closePopup();
    // 關閉 popup 後，將滑鼠移到左上角，避免 hover menu 蓋住按鈕
    await this.page.mouse.move(0, 0);
        
        // 關閉可能阻擋的 portal 元素
        const portalOverlay = this.page.locator('#pets-portal-provider-0');
        if (await portalOverlay.count() > 0) {
            await portalOverlay.evaluate(el => el.remove()).catch(() => {});
        }
        
        // 等待頁面完全載入
        await this.page.waitForTimeout(2000);

        // 檢查購物車是否已經為空
        const emptyMessage = this.page.locator(this.emptyCartMessageSelector);
        if (await emptyMessage.isVisible().catch(() => false)) {
            // 購物車已經是空的
            return;
        }

        // 等待購物車卡片出現（如果有）
        const cartCard = this.page.locator(this.cartCardSelector);
        if (await cartCard.count() > 0) {
            await cartCard.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        }

        // 反覆移除所有商品，最多嘗試 20 次
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            // 每次嘗試前都關閉可能出現的 portal
            const portal = this.page.locator('#pets-portal-provider-0');
            if (await portal.count() > 0) {
                await portal.evaluate(el => el.remove()).catch(() => {});
            }

            // 每次嘗試前都把滑鼠移到左上角，避免 hover menu 蓋住移除按鈕
            await this.page.mouse.move(0, 0);

            const removeBtnSelector = this.page.locator(this.removeButtonSelector);
            const isVisible = await removeBtnSelector.first().isVisible().catch(() => false);

            if (!isVisible) {
                // 沒有更多移除按鈕了
                break;
            }

            // 使用 force click 來繞過覆蓋檢查
            await removeBtnSelector.first().click({ force: true });
            await this.page.waitForTimeout(500);
            await this.closePopup();
            attempts++;
        }

        // 確認購物車為空（增加 timeout）
        await this.page.locator(this.emptyCartMessageSelector).waitFor({ 
            state: 'visible',
            timeout: 10000 
        });
        await this.closePopup();
    }

    /**
     * 點擊購物車徽章開啟購物車
     */
    async openCart() {
        await this.page.locator(this.cartBadgeSelector).click();
        await this.closePopup();
    }

    /**
     * 獲取購物車內所有商品的總數量
     * @returns 購物車商品總數
     */
    async getTotalItemCount(): Promise<number> {
        // 等待商品 input 出現
        await this.page.locator(this.quantityInputSelector).first().waitFor({ 
            state: 'visible', 
            timeout: 20000 
        });

        const inputLocators = await this.page.locator(this.quantityInputSelector).all();
        let total = 0;

        for (const input of inputLocators) {
            const value = await input.inputValue();
            total += Number(value);
        }

        return total;
    }

    /**
     * 驗證購物車商品總數量
     * @param expectedCount 預期數量
     */
    async verifyItemCount(expectedCount: number) {
        await this.openCart();
        const actualCount = await this.getTotalItemCount();
        expect(actualCount).toBe(expectedCount);
    }
}
