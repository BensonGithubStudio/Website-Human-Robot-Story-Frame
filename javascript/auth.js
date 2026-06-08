// 讀取瀏覽器儲存的登入資料
const user = JSON.parse(localStorage.getItem("user"));

// 同時抓取桌機版與手機版的容器
const desktopUserActions = document.getElementById("user-actions");
const mobileUserActions = document.getElementById("mobile-user-actions");

if (user) {
    const displayName = user.name || user.account || "會員";

    // 🌟 核心增強：檢查是否為管理員，若是則生成一個指向 admin.html 的按鈕
    let adminLinkHtml = "";
    if (user.role === "admin") {
        // 這裡設定管理控制台按鈕的樣式，使用 font-weight 與橘黃色/藍色等與普通按鈕區隔（可依外觀自行調整 CSS 類名）
        adminLinkHtml = `<a href="admin.html" class="login-btn" style="border-color: #ffb800; color: #ffb800; margin-right: 10px;">控制台</a>`;
    }

    if (desktopUserActions) {
        desktopUserActions.innerHTML = `
            <span class="welcome-text">哈嘍，${displayName}</span>
            ${adminLinkHtml} <a href="#" id="logout-btn" class="login-btn">登出</a>
        `;
    }

    if (mobileUserActions) {
        mobileUserActions.innerHTML = `
            <span>哈嘍，${displayName}</span>
            <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center;">
                ${adminLinkHtml} <a href="#" id="mobile-logout-btn" class="login-btn">登出</a>
            </div>
        `;
    }

    // 幫桌機版與手機版的登出按鈕都綁定事件處理
    bindLogoutEvent("logout-btn");
    bindLogoutEvent("mobile-logout-btn");
}

// 封裝登入按鈕綁定的輔助函式
function bindLogoutEvent(buttonId) {
    const btn = document.getElementById(buttonId);
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("user");
            localStorage.removeItem("shopping-cart"); // 登出時順便清空購物車，保障隱私
            location.reload();
        });
    }
}

/* ======================================================
   ✨ 新增：手機版漢堡選單的開關邏輯控制
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const menuClose = document.getElementById("menu-close");
    const mobilePanel = document.getElementById("mobile-nav-panel");

    if (menuToggle && mobilePanel && menuClose) {
        // 點擊漢堡鈕展開選單
        menuToggle.addEventListener("click", () => {
            mobilePanel.classList.add("active");
        });

        // 點擊 X 關閉選單
        menuClose.addEventListener("click", () => {
            mobilePanel.classList.remove("active");
        });
    }
});