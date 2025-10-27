import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { ProductPage } from '../../pages/product.page';
import { CartPage } from '../../pages/cart.page';

test.setTimeout(90000);

/**
 * TC-CART-0005 未登入加入購物車
 * 測試情境：
 *   1. 未登入狀態下，清空購物車
 *   2. 進入首頁，點擊第一個商品，進入商品頁
 *   3. 選擇規格並加入購物車
 *   4. 驗證購物車內商品數量為 1
 * 預期結果：購物車該商品數量為 1，且不會跳出登入彈窗
 */
test('TC-CART-0005 未登入加入購物車', async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // 1. 先訪問首頁初始化 session，然後清空購物車
    await homePage.navigate();
    await page.waitForTimeout(1000);
    await cartPage.clearCart();

    // 2. 進入首頁，點擊第一個商品
    await homePage.navigate();
    await homePage.clickProductByIndex(0);

    // 3. 選擇規格並加入購物車
    await productPage.selectSpecsAndAddToCart();

    // 4. 驗證購物車內商品數量為 1
    await cartPage.verifyItemCount(1);

    // 5. 驗證未跳出登入彈窗（檢查常見登入提示文字）
    const loginPopup = page.locator('text=請先登入會員');
    await expect(loginPopup).not.toBeVisible();
});