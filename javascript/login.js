const API_URL = "https://script.google.com/macros/s/AKfycbyupmB7DOZn13-bXwUTJ6Z0k_LLYBj-Crl8FiqJNBDSzcLk8geiQrk-Bth0eS5684hJfg/exec";

/* ======================================================
   LOGIN
====================================================== */

const form = document.getElementById("login-form");
const submitBtn = form.querySelector(".login-submit");

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const account = document.getElementById("account").value;
    const password = document.getElementById("password").value;

    if(!account || !password){
        alert("請輸入帳號密碼");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "登入中..."; 
    submitBtn.style.opacity = "0.6";
    submitBtn.style.cursor = "not-allowed";

    try{
        const response =
        await fetch(API_URL,{
            method:"POST",
            body:JSON.stringify({
                action:"login",
                account:account,
                password:password
            })
        });

        const result = await response.json();

        console.log(result);

        if(result.success){
            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            window.location.href = "index.html";
        }
        else{
            alert(result.message);
            
            resetSubmitButton();
        }

    }
    catch(error){
        console.error(error);
        alert("伺服器錯誤");
        
        resetSubmitButton();
    }
});

function resetSubmitButton() {
    submitBtn.disabled = false;
    submitBtn.innerText = "登入";
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
}