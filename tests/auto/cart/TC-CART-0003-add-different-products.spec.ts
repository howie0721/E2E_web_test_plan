import { test } from '@playwright/test';
import { CartPage } from '../../../pages/cart.page';
import { HomePage } from '../../../pages/home.page';
import { ProductPage } from '../../../pages/product.page';

const storageStatePath = 'fixtures/authStorageState.json';
test.use({ storageState: storageStatePath });
test.setTimeout(120000);

/**
 * TC-CART-0003 加入多個不同商品
 * 測試情境：
 *   1. 清空購物車
 *   2. 進入首頁，點擊第一個商品，選擇規格並加入購物車
 *   3. 回到首頁，點擊第二個商品，選擇規格並加入購物車
 *   4. 回到首頁，點擊第三個商品，選擇規格並加入購物車
 *   5. 驗證購物車內商品數量正確（應為 3）
 * 預期結果：購物車商品數量為 3
 */
test('TC-CART-0003 加入多個不同商品', async ({ page }) => {
    const cartPage = new CartPage(page);
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);

    // 1. 清空購物車前，先把滑鼠移到左上角，避免 hover menu 蓋住按鈕
    await page.mouse.move(0, 0);
    await cartPage.clearCart();

    // 2. 加入第一個商品
    await homePage.navigate();
    await homePage.clickProductByIndex(0);
    await productPage.selectSpecsAndAddToCart();

    // 3. 加入第二個商品
    await homePage.navigate();
    await homePage.clickProductByIndex(1);
    await productPage.selectSpecsAndAddToCart();

    // 4. 加入第三個商品
    await homePage.navigate();
    await homePage.clickProductByIndex(2);
    await productPage.selectSpecsAndAddToCart();

    // 5. 驗證購物車內商品數量正確
    await cartPage.verifyItemCount(3);
});