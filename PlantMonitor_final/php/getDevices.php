<?php
// ======================================================
// Plant Monitor - getDevices.php
// Obter todos os dispositivos HM-10 do utilizador
// ======================================================

require_once "config.php";
checkLogin();

$userId = $_SESSION["user_id"];

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    jsonResponse(false, "Método inválido.");
}

try {
    $sql = "
        SELECT
            id,
            device_name,
            bluetooth_id,
            paired_at
        FROM devices
        WHERE user_id = :user_id
        ORDER BY device_name ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":user_id", $userId);
    $stmt->execute();

    jsonResponse(true, "Dispositivos carregados com sucesso.", $stmt->fetchAll());
} catch (PDOException $e) {
    jsonResponse(false, $e->getMessage());
}
?>
