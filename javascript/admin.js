const API_URL = "https://script.google.com/macros/s/AKfycbyupmB7DOZn13-bXwUTJ6Z0k_LLYBj-Crl8FiqJNBDSzcLk8geiQrk-Bth0eS5684hJfg/exec";

// 1. 安全檢查：驗證是否具備管理員權限
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") {
    alert("偵測到非法存取，您不具備管理權限。");
    window.location.href = "index.html"; 
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

// 3. 讀取並渲染訂單清單 (新增狀態控管功能)
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
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#666;">當前暫無任何交易訂單。</td></tr>`;
            } else {
                response.orders.forEach(o => {
                    const tr = document.createElement("tr");
                    
                    // 🌟 判定目前的狀態與對應霓虹配色
                    const currentStatus = o.status || "待處理";
                    let statusColor = "#FF4646"; // 待處理 = 紅
                    if (currentStatus === "處理中") statusColor = "#00A3FF"; // 藍
                    if (currentStatus === "已出貨") statusColor = "#FFB800"; // 黃
                    if (currentStatus === "已完成") statusColor = "#00FF66"; // 綠

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
                            <button class="save-btn" id="status-btn-${o.orderId}" 
                                    style="background-color: transparent; border: 1px solid ${statusColor}; color: ${statusColor}; min-width: 90px;" 
                                    onclick="nextOrderStatus('${o.orderId}', '${currentStatus}')">
                                ${currentStatus} ➔
                            </button>
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

// 🌟 全新新增：點擊按鈕切換下一個狀態
function nextOrderStatus(orderId, currentStatus) {
    // 定義狀態流轉順序
    const statusFlow = {
        "待處理": "處理中",
        "處理中": "已出貨",
        "已出貨": "已完成",
        "已完成": "待處理" // 點到最後可以循環回最起點，方便手滑調錯時點回來
    };

    const nextStatus = statusFlow[currentStatus] || "待處理";
    const statusBtn = document.getElementById(`status-btn-${orderId}`);

    // 鎖定按鈕防止重覆點擊
    if (statusBtn) {
        statusBtn.disabled = true;
        statusBtn.innerText = "變更中...";
        statusBtn.style.opacity = "0.5";
    }

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "updateOrderStatus",
            adminAccount: user.account,
            orderId: orderId,
            nextStatus: nextStatus
        })
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            // 變更成功直接重新渲染列表，展示最新配色
            loadOrders();
        } else {
            alert(response.message);
            loadOrders(); // 如果出錯就刷回原本狀態
        }
    })
    .catch(err => {
        alert("通訊失敗，無法變更訂單狀態。");
        loadOrders();
    });
}

// 發送刪除訂單請求
function deleteOrder(orderId) {
    if (!confirm(`確定要永久刪除訂單【${orderId}】嗎？此操作不可逆！`)) {
        return;
    }

    const delBtn = document.getElementById(`del-btn-${orderId}`);
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
            adminAccount: user.account,
            orderId: orderId
        })
    })
    .then(res => res.json())
    .then(response => {
        alert(response.message);
        if (response.success) {
            loadOrders();
        }
    })
    .catch(err => alert("通訊失敗，無法刪除訂單。"));
}

// 發送更新庫存請求 
function updateStock(productId) {
    const inputElement = document.getElementById(`input-${productId}`);
    const btnElement = document.getElementById(`btn-${productId}`);
    const newStock = inputElement.value;
    
    if (btnElement) {
        btnElement.disabled = true;
        btnElement.innerText = "更新中...";
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