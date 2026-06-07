const API_URL = "https://script.google.com/macros/s/AKfycbywlPCxT1cqr5uDpoy-t6Oj0Kq4b03z0n5U2JowWWhj72rNPoimbceRqq-l5bmBTaDUfw/exec";

/* ======================================================
   REGISTER SYSTEM
====================================================== */

const form = document.getElementById("register-form");
const submitBtn = document.getElementById("reg-submit");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name").value.trim();
    const account = document.getElementById("reg-account").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    if (!account || !password) {
        alert("請輸入欲註冊的帳號與密碼");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "CREATING...";
    submitBtn.style.opacity = "0.6";
    submitBtn.style.cursor = "not-allowed";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "register",
                account: account,
                password: password,
                name: name,
                email: ""
            })
        });

        const result = await response.json();

        console.log(result);

        if (result.success) {
            alert("帳號註冊成功！將為您導向登入頁面。");
            window.location.href = "login.html";
        } else {
            alert(result.message);
            resetSubmitButton();
        }

    } catch (error) {
        console.error(error);
        alert("伺服器錯誤，請稍後再試");
        resetSubmitButton();
    }
});

function resetSubmitButton() {
    submitBtn.disabled = false;
    submitBtn.innerText = "CREATE ACCOUNT";
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
}