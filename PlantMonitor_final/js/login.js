// =====================================================
// Plant Monitor - login.js
// Login com PHP + fetch
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const showPassword = document.getElementById("showPassword");
    const loginMessage = document.getElementById("loginMessage");

    if (showPassword && password) {
        showPassword.addEventListener("change", function () {
            password.type = this.checked ? "text" : "password";
        });
    }

    if (!loginForm) return;

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        loginMessage.textContent = "";
        loginMessage.classList.remove("success-message");

        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();

        if (emailValue === "" || passwordValue === "") {
            loginMessage.textContent = "Preenche o email e a palavra-passe.";
            return;
        }

        try {
            const response = await fetch("php/login.php", {
                method: "POST",
                body: new FormData(loginForm),
                credentials: "same-origin"
            });

            const result = await response.json();
            loginMessage.textContent = result.message;

            if (result.success) {
                loginMessage.classList.add("success-message");

                if (result.data && result.data.name) {
                    localStorage.setItem("plantMonitorUserName", result.data.name);
                }

                setTimeout(function () {
                    window.location.href = "index.html";
                }, 700);
            }
        } catch (error) {
            console.error(error);
            loginMessage.textContent = "Erro ao comunicar com o servidor.";
        }
    });
});
