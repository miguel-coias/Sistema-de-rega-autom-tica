<?php
// ======================================================
// Plant Monitor - getPlants.php
// Obter todas as plantas do utilizador
// ======================================================

require_once "config.php";
checkLogin();

$userId = $_SESSION["user_id"];

try {
    $sql = "
        SELECT
            plants.id,
            plants.name,
            plants.humidity,
            plants.last_watered,
            plants.type_id,
            plants.device_id,
            plant_types.name AS type,
            devices.device_name,
            devices.bluetooth_id
        FROM plants
        LEFT JOIN plant_types ON plants.type_id = plant_types.id
        LEFT JOIN devices ON plants.device_id = devices.id
        WHERE plants.user_id = :user_id
        ORDER BY plants.name ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":user_id", $userId);
    $stmt->execute();

    jsonResponse(true, "Plantas carregadas com sucesso.", $stmt->fetchAll());
} catch (PDOException $e) {
    jsonResponse(false, $e->getMessage());
}
?>
