const userData = localStorage.getItem("user");

if (userData) {
    try {
        const user = JSON.parse(userData);
        
        const userActions = document.getElementById("user-actions") || document.querySelector(".user-actions");
        
        if (userActions) {
            const displayName = user.name || user.account || "會員";

            userActions.innerHTML = `
                <span class="welcome-text">哈囉，${displayName}</span>
                <a href="#" id="logout-btn" class="logout-btn">登出</a>
            `;
            
            document.getElementById("logout-btn").addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("user"); 
                location.reload();  
            });
        }
    } catch (error) {
        console.error("【驗證系統】解析 localStorage 失敗:", error);
    }
}