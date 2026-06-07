const API_URL = "https://script.google.com/macros/s/AKfycbywlPCxT1cqr5uDpoy-t6Oj0Kq4b03z0n5U2JowWWhj72rNPoimbceRqq-l5bmBTaDUfw/exec";

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
    submitBtn.innerText = "CONNECTING..."; 
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
    submitBtn.innerText = "CONNECT";
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
}