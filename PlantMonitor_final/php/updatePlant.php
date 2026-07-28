<?php
// ======================================================
// Plant Monitor - updatePlant.php
// Atualizar dados de uma planta
// ======================================================

require_once "config.php";
checkLogin();

$userId = $_SESSION["user_id"];

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    jsonResponse(false, "Método inválido.");
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    $data = $_POST;
}

$id = intval($data["id"] ?? 0);
$name = cleanInput($data["name"] ?? "");
$typeName = cleanInput($data["type_name"] ?? "");
$typeId = intval($data["type_id"] ?? 0);
$deviceId = intval($data["device_id"] ?? 0);

if ($id <= 0 || empty($name) || (empty($typeName) && $typeId <= 0)) {
    jsonResponse(false, "Preencha todos os campos.");
}

try {
    $stmt = $pdo->prepare("SELECT id, device_id FROM plants WHERE id = :id AND user_id = :user LIMIT 1");
    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":user", $userId);
    $stmt->execute();
    $plant = $stmt->fetch();

    if (!$plant) {
        jsonResponse(false, "Planta não encontrada.");
    }

    // Resolver o tipo de planta pelo nome. Isto evita erros se os IDs mudarem na base de dados.
    if (!empty($typeName)) {
        $stmt = $pdo->prepare("SELECT id FROM plant_types WHERE LOWER(name) = LOWER(:name) LIMIT 1");
        $stmt->bindParam(":name", $typeName);
        $stmt->execute();
        $type = $stmt->fetch();

        if ($type) {
            $typeId = intval($type["id"]);
        } else {
            $fallback = "Outra";
            $stmt = $pdo->prepare("SELECT id FROM plant_types WHERE LOWER(name) = LOWER(:name) LIMIT 1");
            $stmt->bindParam(":name", $fallback);
            $stmt->execute();
            $type = $stmt->fetch();
            $typeId = intval($type["id"] ?? 0);
        }
    }

    if ($typeId <= 0) {
        jsonResponse(false, "Tipo de planta inválido.");
    }

    // Verificar tipo de planta
    $stmt = $pdo->prepare("SELECT id FROM plant_types WHERE id = :id LIMIT 1");
    $stmt->bindParam(":id", $typeId);
    $stmt->execute();

    if (!$stmt->fetch()) {
        jsonResponse(false, "Tipo de planta inválido.");
    }

    if ($deviceId <= 0) {
        $deviceId = intval($plant["device_id"] ?? 0);
    }

    // Impedir que o mesmo dispositivo fique associado a mais do que uma
    // planta — mas sem barrar a própria planta que já o tinha.
    if ($deviceId > 0) {
        $stmt = $pdo->prepare("SELECT id FROM plants WHERE device_id = :device AND id != :id LIMIT 1");
        $stmt->bindParam(":device", $deviceId);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        if ($stmt->fetch()) {
            jsonResponse(false, "Este dispositivo já está associado a outra planta.");
        }
    }

    $sql = "
        UPDATE plants
        SET name = :name, type_id = :type, device_id = :device, updated_at = NOW()
        WHERE id = :id AND user_id = :user
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":type", $typeId);
    $stmt->bindParam(":device", $deviceId);
    $stmt->bindParam(":id", $id);
    $stmt->bindParam(":user", $userId);
    $stmt->execute();

    jsonResponse(true, "Planta atualizada com sucesso.");
} catch (PDOException $e) {
    jsonResponse(false, $e->getMessage());
}
?>
