const API_URL = "https://script.google.com/macros/s/AKfycbwAzaLSzaNKE28jdL-E8CXsUVbBE7BOVlTI0fx2_p0jb-nlIfdKJXJnjWZfzcKykDIjJA/exec";

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
    submitBtn.innerText = "註冊中...";
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
    submitBtn.innerText = "註冊帳號";
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
}