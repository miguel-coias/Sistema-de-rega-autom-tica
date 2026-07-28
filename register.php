<?php
// ======================================================
// Plant Monitor
// register.php
// Registo de novos utilizadores
// ======================================================

require_once "config.php";

// Apenas aceita pedidos POST

if($_SERVER["REQUEST_METHOD"] != "POST"){

    jsonResponse(false,"Método inválido.");

}

// ======================================================
// Receber dados
// ======================================================

$name = cleanInput($_POST["name"] ?? "");

$username = cleanInput($_POST["username"] ?? "");

$email = cleanInput($_POST["email"] ?? "");

$password = $_POST["password"] ?? "";

$confirmPassword = $_POST["confirmPassword"] ?? "";

// ======================================================
// Validar campos
// ======================================================

if(

    empty($name) ||

    empty($username) ||

    empty($email) ||

    empty($password) ||

    empty($confirmPassword)

){

    jsonResponse(false,"Preencha todos os campos.");

}

// ======================================================
// Validar Email
// ======================================================

if(!filter_var($email,FILTER_VALIDATE_EMAIL)){

    jsonResponse(false,"Email inválido.");

}

// ======================================================
// Confirmar Password
// ======================================================

if($password != $confirmPassword){

    jsonResponse(false,"As palavras-passe não coincidem.");

}

// ======================================================
// Tamanho mínimo da Password
// ======================================================

if(strlen($password) < 6){

    jsonResponse(false,"A palavra-passe deve ter pelo menos 6 caracteres.");

}

try{

    // ==================================================
    // Verificar Email
    // ==================================================

    $sql = "SELECT id FROM users WHERE email = :email";

    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":email",$email);

    $stmt->execute();

    if($stmt->fetch()){

        jsonResponse(false,"Este email já está registado.");

    }

    // ==================================================
    // Verificar Username
    // ==================================================

    $sql = "SELECT id FROM users WHERE username = :username";

    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":username",$username);

    $stmt->execute();

    if($stmt->fetch()){

        jsonResponse(false,"Este nome de utilizador já existe.");

    }

    // ==================================================
    // Encriptar Password
    // ==================================================

    $hashedPassword = password_hash(

        $password,

        PASSWORD_DEFAULT

    );

    // ==================================================
    // Inserir Utilizador
    // ==================================================

    $sql = "

        INSERT INTO users(

            name,

            username,

            email,

            password

        )

        VALUES(

            :name,

            :username,

            :email,

            :password

        )

    ";

    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":name",$name);

    $stmt->bindParam(":username",$username);

    $stmt->bindParam(":email",$email);

    $stmt->bindParam(":password",$hashedPassword);

    $stmt->execute();

    // ==================================================
    // Resposta
    // ==================================================

    jsonResponse(

        true,

        "Conta criada com sucesso."

    );

}
catch(PDOException $e){

    jsonResponse(false,$e->getMessage());

}

?>