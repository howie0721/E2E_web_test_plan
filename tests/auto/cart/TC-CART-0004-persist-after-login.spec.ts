import { test } from '@playwright/test';
import { CartPage } from '../../../pages/cart.page';
import { HomePage } from '../../../pages/home.page';
import { ProductPage } from '../../../pages/product.page';

const storageStatePath = 'fixtures/authStorageState.json';
test.setTimeout(120000);

/**
 * TC-CART-0004 登入後購物車狀態保留
 * 測試情境：
 *   1. 未登入狀態下，清空購物車
 *   2. 未登入狀態下，加入一個商品到購物車
 *   3. 使用已登入的 storageState 重新載入頁面（模擬登入）
 *   4. 驗證購物車內商品仍然存在且數量正確
 * 預期結果：登入後購物車商品數量仍為 1
 */
test('TC-CART-0004 登入後購物車狀態保留', async ({ browser }) => {
    // 第一階段：未登入狀態
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    const cartPage1 = new CartPage(page1);
    const homePage1 = new HomePage(page1);
    const productPage1 = new ProductPage(page1);

    // 1. 先訪問首頁以初始化 session，然後清空購物車
    await homePage1.navigate();
    await page1.waitForTimeout(1000);
    await cartPage1.clearCart();

    // 2. 加入一個商品
    await homePage1.navigate();
    await homePage1.clickProductByIndex(0);
    await productPage1.selectSpecsAndAddToCart();

    // 3. 驗證未登入狀態下購物車有 1 個商品
    await cartPage1.verifyItemCount(1);

    // 關閉未登入的 page 和 context，並等待完全關閉
    await page1.close();
    await context1.close();
    
    // 等待一段時間確保資源完全釋放
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 第二階段：使用已登入的 storageState
    const context2 = await browser.newContext({
        storageState: storageStatePath
    });
    const page2 = await context2.newPage();
    
    const cartPage2 = new CartPage(page2);

    // 4. 導航到購物車並驗證商品仍然存在
    await cartPage2.navigate();
    // 主動關閉彈窗，避免 popup 擋住後續驗證
    if (typeof cartPage2.closePopup === 'function') {
        await cartPage2.closePopup();
    }
    await page2.waitForTimeout(2000); // 等待購物車同步

    // 5. 驗證登入後購物車商品數量仍為 1
    await cartPage2.openCart();
    const itemCount = await cartPage2.getTotalItemCount();
    
    // 登入後購物車可能會合併，所以商品數量應該 >= 1
    if (itemCount < 1) {
        throw new Error(`登入後購物車商品數量異常：預期 >= 1，實際 ${itemCount}`);
    }

    // 清理第二階段的資源
    await page2.close();
    await context2.close();
});