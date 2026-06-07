const user = JSON.parse(localStorage.getItem("user"));

const userActions = document.getElementById("user-actions");

if(user){
    const displayName = user.name || user.account || "會員";

    userActions.innerHTML = `
        <span>哈嘍，${displayName}</span>

        <a href="#" id="logout-btn" class="member-btn"> 登出 </a>
    `;

    document.getElementById("logout-btn").addEventListener("click",(e)=>{

        e.preventDefault();
        localStorage.removeItem("user");
        location.reload();
    });
}