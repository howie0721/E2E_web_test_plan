import { test } from '@playwright/test';
import { CartPage } from '../../../pages/cart.page';
import { HomePage } from '../../../pages/home.page';
import { ProductPage } from '../../../pages/product.page';

const storageStatePath = 'fixtures/authStorageState.json';
test.use({ storageState: storageStatePath });
test.setTimeout(120000);

/**
 * TC-CART-0001 從商品頁加入購物車
 * 測試情境：
 *   1. 清空購物車
 *   2. 進入首頁，點擊第一個商品，進入商品頁
 *   3. 選擇規格並加入購物車
 *   4. 驗證購物車內商品數量正確
 * 預期結果：購物車商品數量為 1
 */
test('TC-CART-0001 從商品頁加入購物車', async ({ page }) => {
    const cartPage = new CartPage(page);
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);

    // 1. 清空購物車
    await cartPage.clearCart();

    // 2. 進入首頁，點擊第一個商品
    await homePage.navigate();
    await homePage.clickProductByIndex(0);

    // 3. 選擇規格並加入購物車
    await productPage.selectSpecsAndAddToCart();

    // 4. 驗證購物車內商品數量正確
    await cartPage.verifyItemCount(1);
});