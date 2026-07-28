<?php
// ======================================================
// Plant Monitor - config.php
// Ligação à base de dados e funções comuns
// ======================================================

$host = "localhost";
$dbname = "plant_monitor";
$username = "root";
$password = "";
$charset = "utf8mb4";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=$charset",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "message" => "Erro na ligação à base de dados: " . $e->getMessage(),
        "data" => []
    ]);
    exit();
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function cleanInput($data) {
    return htmlspecialchars(stripslashes(trim($data ?? "")), ENT_QUOTES, "UTF-8");
}

function isLoggedIn() {
    return isset($_SESSION["user_id"]);
}

function checkLogin() {
    if (!isLoggedIn()) {
        jsonResponse(false, "Utilizador não autenticado.");
    }
}

function jsonResponse($success, $message, $data = []) {
    header("Content-Type: application/json");
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);
    exit();
}
?>
