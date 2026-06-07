/* ======================================================
   訊誆商城 TERMINAL LOGIC + SHOPPING CART SYSTEM
====================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 購物車側邊欄切換元素
    const cartToggle = document.getElementById("cart-toggle");
    const cartClose = document.getElementById("cart-close");
    const cartSidebar = document.getElementById("cart-sidebar");
    
    // 購物車資料渲染元素
    const cartItemsContainer = document.getElementById("cart-items");
    const cartCountBadge = document.getElementById("cart-count");
    const cartTotalText = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");

    // 結帳確認彈窗元素
    const modal = document.getElementById("purchase-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalMsg = document.getElementById("modal-msg");
    const cancelBtn = document.getElementById("modal-cancel");
    const confirmBtn = document.getElementById("modal-confirm");

    // 初始化購物車：從 localStorage 拿舊資料，沒有就建立空陣列 []
    let cart = JSON.parse(localStorage.getItem("shopping-cart")) || [];

    // 初始化畫面渲染
    updateCartUI();

    /* ==========================================
       1. 購物車側邊欄開啟/關閉控制
    ========================================== */
    cartToggle.addEventListener("click", () => cartSidebar.classList.add("active"));
    cartClose.addEventListener("click", () => cartSidebar.classList.remove("active"));

    /* ==========================================
       2. 商品卡片「加入購物車」點擊監聽
    ========================================== */
    const buyButtons = document.querySelectorAll(".buy-btn");
    buyButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const card = e.target.closest(".product-card");
            const id = card.getAttribute("data-id");
            const name = card.getAttribute("data-name");
            const price = parseInt(card.getAttribute("data-price"));

            // 🌟 登入防禦：檢查 user 是否存在
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) {
                window.location.href = "login.html";
                return;
            }

            // 檢查購物車內是不是已經存在該商品
            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity += 1; // 存在就數量加 1
            } else {
                // 不存在就新增一筆物件進去
                cart.push({ id, name, price, quantity: 1 });
            }

            // 儲存並更新畫面，且自動滑出購物車讓使用者知道加進去了
            saveCart();
            updateCartUI();
            cartSidebar.classList.add("active");
        });
    });

    /* ==========================================
       3. 核心功能：更新購物車介面與計算金額
    ========================================== */
    function updateCartUI() {
        // 清空原本的 HTML
        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="empty-msg">儲存晶片中尚無物資資料...</p>`;
            cartCountBadge.innerText = "0";
            cartTotalText.innerText = "NT$ 0";
            return;
        }

        let totalItemsCount = 0;
        let totalPriceSum = 0;

        // 循環渲染每一個商品
        cart.forEach(item => {
            totalItemsCount += item.quantity;
            totalPriceSum += item.price * item.quantity;

            const itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <span class="item-price">NT$ ${item.price}</span>
                </div>
                <div class="cart-item-amt">
                    <button class="amt-btn minus" data-id="${item.id}">-</button>
                    <span class="item-count">${item.quantity}</span>
                    <button class="amt-btn plus" data-id="${item.id}">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        // 更新右上角標籤與總金額
        cartCountBadge.innerText = totalItemsCount;
        cartTotalText.innerText = `NT$ ${totalPriceSum}`;

        // 為剛剛動態新增的 + 與 - 按鈕綁定監聽事件
        addAmountModifiers();
    }

    // 將購物車陣列永久儲存到瀏覽器中
    function saveCart() {
        localStorage.setItem("shopping-cart", JSON.stringify(cart));
    }

    /* ==========================================
       4. 加減數量按鈕事件處理
    ========================================== */
    function addAmountModifiers() {
        const plusButtons = document.querySelectorAll(".amt-btn.plus");
        const minusButtons = document.querySelectorAll(".amt-btn.minus");

        plusButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const item = cart.find(i => i.id === id);
                if (item) item.quantity += 1;
                saveCart();
                updateCartUI();
            });
        });

        minusButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const itemIndex = cart.findIndex(i => i.id === id);
                if (itemIndex > -1) {
                    cart[itemIndex].quantity -= 1;
                    // 如果數量歸零，直接從陣列移出該商品
                    if (cart[itemIndex].quantity <= 0) {
                        cart.splice(itemIndex, 1);
                    }
                }
                saveCart();
                updateCartUI();
            });
        });
    }

    /* ==========================================
       5. 終端結帳連線邏輯
    ========================================== */
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("購物車內沒有任何物資可以結帳。");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        
        modalTitle.innerText = "多重憑證結帳確認";
        modalMsg.innerText = `確使要將購物車內 ${cart.length} 項物資提交至中心資料庫嗎？\n(連線帳號: ${user.account})`;
        
        // 關閉側邊欄，打開精美確認彈窗
        cartSidebar.classList.remove("active");
        modal.classList.add("active");
    });

    cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

    confirmBtn.addEventListener("click", () => {
        modalTitle.innerText = "【核心寫入成功】";
        modalMsg.innerText = "您的訂單分配請求已成功批准！物流傳輸碼已綁定您的身分驗證碼。";
        confirmBtn.style.display = "none";
        cancelBtn.innerText = "關閉終端";

        // ✨ 結帳完畢：清空前端與本機的購物車內容
        cart = [];
        saveCart();
        updateCartUI();

        setTimeout(() => {
            modal.classList.remove("active");
            setTimeout(() => {
                confirmBtn.style.display = "inline-block";
                cancelBtn.innerText = "切斷終端";
            }, 300);
        }, 2500);
    });
});