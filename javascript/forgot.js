const API_URL = "https://script.google.com/macros/s/AKfycbwAzaLSzaNKE28jdL-E8CXsUVbBE7BOVlTI0fx2_p0jb-nlIfdKJXJnjWZfzcKykDIjJA/exec";

/* ======================================================
   FORGOT / RESET PASSWORD SYSTEM
====================================================== */

const form = document.getElementById("forgot-form");
const submitBtn = document.getElementById("forgot-submit");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const account = document.getElementById("forgot-account").value.trim();
    const name = document.getElementById("forgot-name").value.trim();
    const newPassword = document.getElementById("forgot-new-password").value.trim();

    if (!account || !name || !newPassword) {
        alert("請完整填寫所有欄位");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "OVERWRITING...";
    submitBtn.style.opacity = "0.6";
    submitBtn.style.cursor = "not-allowed";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                action: "resetPassword",
                account: account,
                name: name,
                newPassword: newPassword
            })
        });

        const result = await response.json();

        console.log(result);

        if (result.success) {
            alert("密碼重設成功！請使用新密碼重新連接系統。");
            window.location.href = "login.html";
        } else {

            alert(result.message);
            resetSubmitButton();
        }

    } catch (error) {
        console.error(error);
        alert("安全連線失敗，請稍後再試");
        resetSubmitButton();
    }
});

function resetSubmitButton() {
    submitBtn.disabled = false;
    submitBtn.innerText = "RESET PASSWORD";
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
}