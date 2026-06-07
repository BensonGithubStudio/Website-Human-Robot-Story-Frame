const API_URL = "https://script.google.com/macros/s/AKfycbz-7I9cjFOvB1l_94uOjfWg4hm0EoOPDRwYHIPY9YQAYdrWXBHzg-fjBmupOoaPaYbtjw/exec";

/* ======================================================
   LOGIN
====================================================== */

const form = document.getElementById("login-form");

form.addEventListener("submit", async (e)=>{

    e.preventDefault();

    const account = document.getElementById("account").value;
    const password = document.getElementById("password").value;

    if(!account || !password){
        alert("請輸入帳號密碼");
        return;
    }

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

            /* 儲存登入資訊 */

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            alert("登入成功");

            window.location.href = "index.html";
        }
        else{
            alert(result.message);
        }

    }
    catch(error){
        console.error(error);

        alert("伺服器錯誤");
    }
});