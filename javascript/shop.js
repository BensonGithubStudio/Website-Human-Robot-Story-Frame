document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://script.google.com/macros/s/AKfycbyIDFIATJELVgP7XQ70Q5lZzlKsSk1KBYF3hktki3S7KbM719eLANN7Z9Z7EzEoLEKEPA/exec"; 

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
    const cancelBtn = document.getElementById("modal-cancel");
    const confirmBtn = document.getElementById("modal-confirm");

    // 初始化購物車
    let cart = JSON.parse(localStorage.getItem("shopping-cart")) || [];

    // 初始化畫面渲染
    updateCartUI();

    // 儲存資料方法
    function saveCart() {
        localStorage.setItem("shopping-cart", JSON.stringify(cart));
    }

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

            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) {
                alert("請先登入黑市終端系統。");
                window.location.href = "login.html";
                return;
            }

            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            saveCart();
            updateCartUI();
            cartSidebar.classList.add("active");
        });
    });

    /* ==========================================
       3. 核心功能：更新購物車介面與計算金額
    ========================================== */
    function updateCartUI() {
        cartItemsContainer.innerHTML = "";
        const shippingZone = document.getElementById("cart-shipping-zone");

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="empty-msg">尚無購物資料...</p>`;
            cartCountBadge.innerText = "0";
            cartTotalText.innerText = "NT$ 0";
            if(shippingZone) shippingZone.style.display = "none";
            return;
        }

        if(shippingZone) shippingZone.style.display = "block";

        let totalItemsCount = 0;
        let totalPriceSum = 0;

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

        cartCountBadge.innerText = totalItemsCount;
        cartTotalText.innerText = `NT$ ${totalPriceSum}`;

        addAmountModifiers();
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
       5. 終端結帳連線與配送驗證邏輯
    ========================================== */
    const districtData = {
        "臺北市": ["中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"],
        "新北市": ["板橋區", "三重區", "中和區", "永和區", "新莊區", "新店區", "樹林區", "鶯歌區", "三峽區", "淡水區", "汐止區", "瑞芳區", "土城區", "蘆洲區", "五股區", "泰山區", "林口區"],
        "台中市": ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區", "太平區", "大里區", "霧峰區", "烏日區"],
        "高雄市": ["新興區", "前金區", "苓雅區", "鹽埕區", "鼓山區", "旗津區", "前鎮區", "三民區", "楠梓區", "小港區", "左營區"]
    };

    const citySelect = document.getElementById("ship-city");
    const districtSelect = document.getElementById("ship-district");

    if (citySelect && districtSelect) {
        citySelect.addEventListener("change", () => {
            const selectedCity = citySelect.value;
            districtSelect.innerHTML = '<option value="" disabled selected>選擇鄉鎮區</option>';
            if (districtData[selectedCity]) {
                districtSelect.disabled = false;
                districtData[selectedCity].forEach(district => {
                    const option = document.createElement("option");
                    option.value = district;
                    option.innerText = district;
                    districtSelect.appendChild(option);
                });
            } else {
                districtSelect.disabled = true;
            }
        });
    }

    let validatedShippingInfo = null;

    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("購物車內沒有任何物品可以結帳。");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("請先登入系統。");
            window.location.href = "login.html";
            return;
        }

        const name = document.getElementById("ship-name").value.trim();
        const phone = document.getElementById("ship-phone").value.trim();
        const city = citySelect.value;
        const district = districtSelect.value;
        const address = document.getElementById("ship-address").value.trim();

        if (!name || !phone || !city || !district || !address) {
            alert("【核心錯誤】請在購物車內填妥完整的配送資料。");
            return;
        }
        if (phone.length < 9) {
            alert("【通訊錯誤】請輸入正確的聯絡電話。");
            return;
        }

        validatedShippingInfo = { name, phone, fullAddress: `${city}${district}${address}` };

        // 🌟 修正點 1：每次打開結帳彈窗時，必須初始化按鈕狀態，防範上一次失敗留下的狀態
        confirmBtn.style.display = "inline-block"; 
        cancelBtn.disabled = false;
        cancelBtn.innerText = "再想想";

        modalTitle.innerText = "訂單確認";
        const msgContainer = document.getElementById("modal-msg-container");
        msgContainer.innerHTML = `
            <p style="margin-bottom: 15px;">確認要送出這筆訂單嗎？</p>
            <div style="color: #ccc; font-size: 0.85rem; text-align: left; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 6px; border: 1px solid rgba(255,70,70,0.2); line-height: 1.6;">
                <strong>訂單資訊</strong><br>
                帳號：${user.account}<br>
                收件人：${name} (${phone})<br>
                目的地：<span style="color:#00A3FF;">${city}${district}${address}</span><br>
                總金額：<span style="color:#FF4646; font-weight:bold;">${cartTotalText.innerText}</span>
            </div>
        `;

        cartSidebar.classList.remove("active");
        modal.classList.add("active");
    });

    cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

    /* 正式將訂單與扣庫存機制對接到試算表 */
    confirmBtn.addEventListener("click", () => {
        if (!validatedShippingInfo) return;

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("登入逾期，請重新登入。");
            return;
        }

        // 1. 調整畫面為「正在傳輸中...」防止重複點擊
        modalTitle.innerText = "建立連線中...";
        const msgContainer = document.getElementById("modal-msg-container");
        msgContainer.innerHTML = `<p style="color: #FFB800;">正在與後端終端建立安全連線，請稍候...</p>`;
        confirmBtn.style.display = "none";
        cancelBtn.disabled = true; // 修正：應使用屬性形式 disabled = true 暫時停用取消鈕

        // 2. 打包要傳送給試算表後台的完整 JSON 結構
        const orderPayload = {
            action: "submitOrder",
            userAccount: user.account,
            totalPrice: cartTotalText.innerText,
            shipping: validatedShippingInfo,
            cart: cart // 內含物件陣列：[{id, name, price, quantity}, ...]
        };

        // 3. 發送非同步 POST 請求至 Google 試算表
        fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(orderPayload)
        })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                // 【情境 A：後台扣減庫存 & 寫入訂單成功】
                modalTitle.innerText = "訂單送出";
                msgContainer.innerHTML = `
                    <p style="color: #00A3FF; font-weight: bold; margin-bottom: 10px;">${response.message}</p>
                    <p style="font-size: 0.85rem; color: #888;">訂單編號：${response.orderId}<br>配送地址：${validatedShippingInfo.fullAddress}</p>
                `;
                
                cancelBtn.disabled = false;
                cancelBtn.innerText = "關閉";

                // 交易成功，清空前端購物車緩存
                cart = [];
                saveCart();
                updateCartUI();

                // 重設配送欄位
                const shippingForm = document.getElementById("shipping-form");
                if (shippingForm) shippingForm.reset();
                if (districtSelect) districtSelect.disabled = true;
                validatedShippingInfo = null;

                // 4 秒後自動關閉彈窗
                setTimeout(() => {
                    modal.classList.remove("active");
                    setTimeout(() => {
                        confirmBtn.style.display = "inline-block";
                        cancelBtn.innerText = "再想想";
                    }, 300);
                }, 4000);

            } else {
                // 【情境 B：後台傳回失敗（例如：庫存不足）】
                modalTitle.innerText = "交易被拒絕";
                msgContainer.innerHTML = `
                    <p style="color: #FF4646; font-weight: bold; margin-bottom: 10px;">系統回報錯誤：</p>
                    <p style="color: #fff; font-size: 0.9rem;">${response.message}</p>
                `;
                
                // 🌟 修正點 2：當後端拒絕時，允許使用者點擊「返回修改」，這時要把取消按鈕啟用
                cancelBtn.disabled = false;
                cancelBtn.innerText = "返回修改";
                
                // 註：這裡我們保持 confirmBtn 隱藏，強迫使用者必須點「返回修改」去購物車調整數量。
                // 當他們重新點擊「結帳」按鈕時，上面的「修正點 1」就會把確認購買按鈕重新顯示出來！
            }
        })
        .catch(err => {
            // 【情境 C：網路斷線或網址設定錯誤】
            console.error("傳輸失敗：", err);
            modalTitle.innerText = "連線失敗";
            msgContainer.innerHTML = `<p style="color: #FF4646;">連線逾時或網路異常，請確認你的 API_URL 是否正確，或稍後再試。</p>`;
            
            // 🌟 修正點 3：連線失敗時，也要恢復確認按鈕與取消按鈕，允許重試
            confirmBtn.style.display = "inline-block";
            cancelBtn.disabled = false;
            cancelBtn.innerText = "確認";
        });
    });
});