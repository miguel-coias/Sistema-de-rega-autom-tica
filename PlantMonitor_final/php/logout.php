<?php
// ======================================================
// Plant Monitor
// logout.php
// Terminar sessão do utilizador
// ======================================================

require_once "config.php";

// ======================================================
// Limpar todas as variáveis da sessão
// ======================================================

$_SESSION = [];

// ======================================================
// Eliminar o cookie da sessão
// ======================================================

if(ini_get("session.use_cookies")){

    $params = session_get_cookie_params();

    setcookie(

        session_name(),

        "",

        time() - 42000,

        $params["path"],

        $params["domain"],

        $params["secure"],

        $params["httponly"]

    );

}

// ======================================================
// Destruir a sessão
// ======================================================

session_destroy();

// ======================================================
// Se foi chamado por JavaScript (fetch)
// ======================================================

if(

    isset($_SERVER["HTTP_X_REQUESTED_WITH"]) &&

    strtolower($_SERVER["HTTP_X_REQUESTED_WITH"]) == "xmlhttprequest"

){

    jsonResponse(

        true,

        "Sessão terminada com sucesso."

    );

}

// ======================================================
// Caso contrário redireciona
// ======================================================

header("Location: ../login.html");

exit();

?>