// ⚠️ 請替換成你原本發送訂單的 Google Apps Script (GAS) 網路應用程式網址
const API_URL = "https://script.google.com/macros/s/AKfycbxnY7cjEpEQVw1fniXITsiu5ElHkoStvbbZFQa12SsMAfiYehpAw5_0Q_MEntsK19njrw/exec"; 

document.addEventListener("DOMContentLoaded", () => {
    checkUserAndLoadHistory();
});

function checkUserAndLoadHistory() {
    const historyContainer = document.getElementById("history-container");
    const historyLoading = document.getElementById("history-loading");
    const userDisplay = document.getElementById("user-display-terminal");

    // 1. 讀取 localStorage 內的使用者登入資料 (配合你的 auth.js 邏輯)
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser || !currentUser.account) {
        // 未登入處理
        userDisplay.innerHTML = `<span style="color: #FF4646;">【存取拒絕】偵測到未授權連線。請先登入系統。</span>`;
        historyLoading.innerHTML = `
            <button class="buy-btn" onclick="location.href='login.html'" style="border-color:#FF4646; color:#FF4646;">
                立刻前往帳號登入
            </button>
        `;
        return;
    }

    // 已登入，更換介面上的使用者提示
    userDisplay.innerHTML = `已成功連線。目前帳號：<span style="color: #FFB800; font-family: monospace;">${currentUser.account}</span>`;

    // 2. 向後端發送請求，取得當前帳號的所有歷史訂單
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "getUserOrders",
            userAccount: currentUser.account
        })
    })
    .then(res => res.json())
    .then(response => {
        historyLoading.style.display = "none";
        historyContainer.style.display = "block";

        if (response.success && response.orders.length > 0) {
            historyContainer.innerHTML = ""; // 清空

            response.orders.forEach(order => {
                const card = document.createElement("div");
                
                // 設定高度配合世界觀的賽博朋克終端卡片樣式
                card.className = "product-card";
                card.style.flexDirection = "column";
                card.style.padding = "25px";
                card.style.marginBottom = "25px";
                card.style.background = "rgba(15, 15, 22, 0.9)";
                card.style.border = "1px solid rgba(255, 184, 0, 0.15)";
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255, 184, 0, 0.2); padding-bottom: 12px; margin-bottom: 15px;">
                        <div>
                            <span style="font-size: 0.75rem; color: #888; display: block; margin-bottom: 2px;">訂單流水號</span>
                            <strong style="color: #FFB800; font-family: monospace; font-size: 1.1rem;">#${order.orderId}</strong>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 0.75rem; color: #888; display: block; margin-bottom: 2px;">時間戳記</span>
                            <span style="color: #aaa; font-size: 0.9rem; font-family: monospace;">${order.date}</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 10px; line-height: 1.6;">
                        <span style="color: #888; font-size: 0.9rem;">提取品項清單：</span><br>
                        <strong style="color: #00A3FF; font-size: 1.05rem;">${order.items}</strong>
                    </div>

                    <div style="margin-bottom: 15px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.02); font-size: 0.85rem; color: #aaa;">
                        <div><strong>收件人：</strong>${order.customerName}</div>
                        <div><strong>聯絡電話：</strong>${order.phone}</div>
                        <div><strong>配送通訊：</strong>${order.address}</div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                        <span style="font-size: 0.8rem; color: #555; font-family: monospace;">認證折扣碼: ${order.promoCode || 'NONE'}</span>
                        <div>
                            <span style="font-size: 0.85rem; color:#888; margin-right: 5px;">總計結算</span>
                            <strong style="color: #FF4646; font-size: 1.4rem; font-family: monospace;">NT$ ${order.totalPrice}</strong>
                        </div>
                    </div>
                `;
                
                // 懸停動態效果美化 (利用 JavaScript 動態注入 hover 線條改色)
                card.addEventListener("mouseenter", () => card.style.borderColor = "#FFB800");
                card.addEventListener("mouseleave", () => card.style.borderColor = "rgba(255, 184, 0, 0.15)");
                
                historyContainer.appendChild(card);
            });
        } else {
            historyContainer.innerHTML = `
                <div style="text-align: center; color: #555; padding: 40px; font-family: monospace;">
                    【尚無紀錄】目前資料庫中查無任何屬於您的交易資料。
                </div>
            `;
        }
    })
    .catch(err => {
        historyLoading.style.display = "none";
        historyContainer.style.display = "block";
        historyContainer.innerHTML = `
            <div style="text-align: center; color: #FF4646; padding: 40px; font-family: monospace;">
                【連線失敗】加密傳輸協定中斷，無法與雲端資料庫取得連線。
            </div>
        `;
    });
}