const user = JSON.parse(localStorage.getItem("user"));

const userActions = document.getElementById("user-actions");

if(user){
    userActions.innerHTML = `
        <span> ${user.account} </span>

        <a href="#" id="logout-btn" class="member-btn"> 登出 </a>
    `;

    document.getElementById("logout-btn").addEventListener("click",(e)=>{

        e.preventDefault();
        localStorage.removeItem("user");
        location.reload();
    });
}