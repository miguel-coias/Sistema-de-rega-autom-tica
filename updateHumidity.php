<?php
// ======================================================
// Plant Monitor - updateHumidity.php
// Atualizar humidade da planta
// ======================================================

require_once "config.php";
checkLogin();

$userId = $_SESSION["user_id"];

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    jsonResponse(false, "Método inválido.");
}

$plantId = intval($_POST["plant_id"] ?? 0);
$humidity = intval($_POST["humidity"] ?? -1);

if ($plantId <= 0) {
    jsonResponse(false, "Planta inválida.");
}

if ($humidity < 0 || $humidity > 100) {
    jsonResponse(false, "Valor de humidade inválido.");
}

try {
    $stmt = $pdo->prepare("SELECT id FROM plants WHERE id = :plant AND user_id = :user LIMIT 1");
    $stmt->bindParam(":plant", $plantId);
    $stmt->bindParam(":user", $userId);
    $stmt->execute();

    if (!$stmt->fetch()) {
        jsonResponse(false, "Planta não encontrada.");
    }

    $stmt = $pdo->prepare("UPDATE plants SET humidity = :humidity, updated_at = NOW() WHERE id = :plant");
    $stmt->bindParam(":humidity", $humidity);
    $stmt->bindParam(":plant", $plantId);
    $stmt->execute();

    $stmt = $pdo->prepare("INSERT INTO humidity_history (plant_id, humidity, reading_date) VALUES (:plant, :humidity, NOW())");
    $stmt->bindParam(":plant", $plantId);
    $stmt->bindParam(":humidity", $humidity);
    $stmt->execute();

    $status = "Ideal";
    if ($humidity < 40) $status = "Regar";
    elseif ($humidity > 80) $status = "Demasiada Água";

    jsonResponse(true, "Humidade atualizada com sucesso.", ["humidity" => $humidity, "status" => $status]);
} catch (PDOException $e) {
    jsonResponse(false, $e->getMessage());
}
?>
