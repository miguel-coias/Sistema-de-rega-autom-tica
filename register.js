// =====================================================
// Plant Monitor - register.js
// Registo com PHP + fetch
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");
    const name = document.getElementById("name");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const terms = document.getElementById("terms");
    const showPasswords = document.getElementById("showPasswords");
    const registerMessage = document.getElementById("registerMessage");

    if (showPasswords && password && confirmPassword) {
        showPasswords.addEventListener("change", function () {
            const type = this.checked ? "text" : "password";
            password.type = type;
            confirmPassword.type = type;
        });
    }

    if (!registerForm) return;

    registerForm.addEventListener("submit", async function (event) {

        // Impede sempre o submit nativo, mesmo que a validação falhe
        // abaixo — é isto que faltava e que fazia o browser navegar
        // para php/register.php e mostrar o JSON em bruto.
        event.preventDefault();

        registerMessage.textContent = "";
        registerMessage.classList.remove("success-message");

        const nameValue = name.value.trim();
        const usernameValue = username.value.trim();
        const emailValue = email.value.trim();
        const passwordValue = password.value.trim();
        const confirmPasswordValue = confirmPassword.value.trim();

        if (
            nameValue === "" ||
            usernameValue === "" ||
            emailValue === "" ||
            passwordValue === "" ||
            confirmPasswordValue === ""
        ) {
            registerMessage.textContent = "Preenche todos os campos.";
            return;
        }

        if (passwordValue !== confirmPasswordValue) {
            registerMessage.textContent = "As palavras-passe não coincidem.";
            return;
        }

        if (passwordValue.length < 6) {
            registerMessage.textContent = "A palavra-passe deve ter pelo menos 6 caracteres.";
            return;
        }

        if (terms && !terms.checked) {
            registerMessage.textContent = "Tens de aceitar os Termos e Condições.";
            return;
        }

        try {
            const response = await fetch("php/register.php", {
                method: "POST",
                body: new FormData(registerForm),
                credentials: "same-origin"
            });

            const result = await response.json();
            registerMessage.textContent = result.message;

            if (result.success) {
                registerMessage.classList.add("success-message");

                setTimeout(function () {
                    window.location.href = "login.html";
                }, 900);
            }
        } catch (error) {
            console.error(error);
            registerMessage.textContent = "Erro ao comunicar com o servidor.";
        }
    });
});
