import { test } from '@playwright/test';
import { CartPage } from '../../pages/cart.page';
import { HomePage } from '../../pages/home.page';
import { ProductPage } from '../../pages/product.page';

const storageStatePath = 'fixtures/authStorageState.json';
test.use({ storageState: storageStatePath });
test.setTimeout(60000);

/**
 * TC-CART-0002 重複加入同一商品
 * 測試情境：
 *   1. 清空購物車
 *   2. 進入首頁，點擊第一個商品，進入商品頁
 *   3. 選擇規格並加入購物車
 *   4. 回到首頁，再次點擊同一商品，重複加入購物車
 *   5. 驗證購物車內商品數量正確（同商品數量應為 2）
 * 預期結果：購物車該商品數量為 2
 */
test('TC-CART-0002 重複加入同一商品', async ({ page }) => {
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

    // 4. 回到首頁，再次點擊同一商品，重複加入購物車
    await homePage.navigate();
    await homePage.clickProductByIndex(0);
    await productPage.selectSpecsAndAddToCart();

    // 5. 驗證購物車內商品數量正確（同商品數量應為 2）
    await cartPage.verifyItemCount(2);
});