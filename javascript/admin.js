const API_URL = "https://script.google.com/macros/s/AKfycbxnY7cjEpEQVw1fniXITsiu5ElHkoStvbbZFQa12SsMAfiYehpAw5_0Q_MEntsK19njrw/exec";

// 1. 安全檢查：驗證是否具備管理員權限
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
    alert("偵測到非法存取，您不具備管理權限。");
    window.location.href = "index.html"; // 被抓到就踢回首頁
} else {
    document.getElementById("admin-name").innerText = `權限者: ${user.name} (ADMIN)`;
}

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadOrders();
});

// 2. 讀取並渲染庫存列表
function loadProducts() {
    fetch(`${API_URL}?action=getProducts`)
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                const tbody = document.getElementById("products-list");
                tbody.innerHTML = "";
                response.products.forEach(p => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td style="font-family: monospace;">${p.id}</td>
                        <td><strong>${p.name}</strong></td>
                        <td>NT$ ${p.price}</td>
                        <td id="stock-display-${p.id}" style="${p.stock <= 3 ? 'color:#FF4646;font-weight:bold;' : ''}">${p.stock}</td>
                        <td>
                            <input type="number" class="stock-input" id="input-${p.id}" value="${p.stock}" min="0">
                            <button class="save-btn" id="btn-${p.id}" onclick="updateStock('${p.id}')">更新</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                document.getElementById("products-loading").style.display = "none";
                document.getElementById("products-table").style.display = "table";
            }
        });
}

// 3. 讀取並渲染訂單清單 (新增刪除按鈕功能)
function loadOrders() {
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "getOrders",
            adminAccount: user.account
        })
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            const tbody = document.getElementById("orders-list");
            tbody.innerHTML = "";
            
            if(response.orders.length === 0) {
                // 🌟 注意：因為多加了一欄「操作」，這裡的 colspan 記得從 4 改成 5
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#666;">當前暫無任何交易訂單。</td></tr>`;
            } else {
                response.orders.forEach(o => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>
                            <span class="badge-order">${o.orderId}</span><br>
                            <span style="font-size:0.75rem; color:#666;">${o.date}</span>
                        </td>
                        <td>
                            帳號: <span style="color:#00A3FF;">${o.userAccount}</span><br>
                            收件: <strong>${o.customerName}</strong> (${o.phone})<br>
                            地址: <span style="font-size:0.8rem; color:#aaa;">${o.address}</span>
                        </td>
                        <td style="color:#ffb800; font-size:0.85rem;">${o.items}</td>
                        <td>
                            <strong style="color:#FF4646;">${o.totalPrice}</strong><br>
                            <span style="font-size:0.75rem; color:#555;">折扣碼: ${o.promoCode}</span>
                        </td>
                        <td>
                            <button class="save-btn" id="del-btn-${o.orderId}" style="background-color: #FF4646;" onclick="deleteOrder('${o.orderId}')">刪除</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
            document.getElementById("orders-loading").style.display = "none";
            document.getElementById("orders-table").style.display = "table";
        } else {
            document.getElementById("orders-loading").innerText = response.message;
        }
    })
    .catch(err => {
        document.getElementById("orders-loading").innerText = "物流中斷，無法取得資料。";
    });
}

// 發送刪除訂單請求
function deleteOrder(orderId) {
    // 安全二次確認，避免管理員手滑點錯
    if (!confirm(`確定要永久刪除訂單【${orderId}】嗎？此操作不可逆！`)) {
        return;
    }

    const delBtn = document.getElementById(`del-btn-${orderId}`);
    
    // 鎖定按鈕，防止連續點擊
    if (delBtn) {
        delBtn.disabled = true;
        delBtn.innerText = "刪除中...";
        delBtn.style.opacity = "0.6";
        delBtn.style.cursor = "not-allowed";
    }

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "deleteOrder",
            adminAccount: user.account, // 傳遞管理員帳號供後端安全檢查
            orderId: orderId
        })
    })
    .then(res => res.json())
    .then(response => {
        alert(response.message);
        if (response.success) {
            // 刪除成功後，重新讀取訂單列表刷新畫面
            loadOrders();
        }
    })
    .catch(err => alert("通訊失敗，無法刪除訂單。"))
    .finally(() => {
        // 如果解鎖時按鈕還存在（通常重新 loadOrders 後就不存在了，但寫著安全）
        if (delBtn) {
            delBtn.disabled = false;
            delBtn.innerText = "刪除";
            delBtn.style.opacity = "";
            delBtn.style.cursor = "pointer";
        }
    });
}

// 4. 發送更新庫存請求 (已加入防重複點擊鎖定機制)
function updateStock(productId) {
    const inputElement = document.getElementById(`input-${productId}`);
    const btnElement = document.getElementById(`btn-${productId}`);
    const newStock = inputElement.value;
    
    // 🌟 步驟一：立即鎖定按鈕與輸入框，更改文字提示，防止重複點擊
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerText = "更新中...";
        // 幫按鈕加上稍微透明或灰色的感覺（若 CSS 沒有寫，這裡可以直接加點 inline style 提示管理員）
        btnElement.style.opacity = "0.6";
        btnElement.style.cursor = "not-allowed";
    }
    if (inputElement) {
        inputElement.disabled = true;
    }

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "updateStock",
            adminAccount: user.account,
            productId: productId,
            newStock: parseInt(newStock)
        })
    })
    .then(res => res.json())
    .then(response => {
        alert(response.message);
        if (response.success) {
            // 即時在畫面上更新最新數字，免去全頁刷新的等待
            const display = document.getElementById(`stock-display-${productId}`);
            display.innerText = newStock;
            if(parseInt(newStock) <= 3) {
                display.style.color = "#FF4646";
                display.style.fontWeight = "bold";
            } else {
                display.style.color = "";
                display.style.fontWeight = "";
            }
        }
    })
    .catch(err => alert("通訊失敗，無法修改庫存。"))
    .finally(() => {
        // 🌟 步驟二：無論連線成功、失敗還是被試算表打槍，最終（finally）都要把按鈕與輸入框解鎖恢復
        if (btnElement) {
            btnElement.disabled = false;
            btnElement.innerText = "更新";
            btnElement.style.opacity = "";
            btnElement.style.cursor = "pointer";
        }
        if (inputElement) {
            inputElement.disabled = false;
        }
    });
}