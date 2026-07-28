<?php
// ======================================================
// Plant Monitor
// login.php
// Login do utilizador
// ======================================================

require_once "config.php";

// Apenas aceita pedidos POST

if($_SERVER["REQUEST_METHOD"] != "POST"){

    jsonResponse(false,"Método inválido.");

}

// Receber dados

$email = cleanInput($_POST["email"] ?? "");

$password = $_POST["password"] ?? "";

// Verificar campos

if(empty($email) || empty($password)){

    jsonResponse(false,"Preencha todos os campos.");

}

try{

    // Procurar utilizador

    $sql = "SELECT * FROM users WHERE email = :email LIMIT 1";

    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":email",$email);

    $stmt->execute();

    $user = $stmt->fetch();

    // Verifica se existe

    if(!$user){

        jsonResponse(false,"Email ou palavra-passe incorretos.");

    }

    // Verificar password

    if(!password_verify($password,$user["password"])){

        jsonResponse(false,"Email ou palavra-passe incorretos.");

    }

    // Criar sessão

    $_SESSION["user_id"] = $user["id"];

    $_SESSION["username"] = $user["username"];

    $_SESSION["name"] = $user["name"];

    $_SESSION["email"] = $user["email"];

    // Resposta

    jsonResponse(

        true,

        "Login efetuado com sucesso.",

        [

            "id"=>$user["id"],

            "name"=>$user["name"],

            "username"=>$user["username"],

            "email"=>$user["email"]

        ]

    );

}
catch(PDOException $e){

    jsonResponse(false,$e->getMessage());

}

?>