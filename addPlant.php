<?php
// ======================================================
// Plant Monitor - addPlant.php
// Adicionar uma nova planta
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

$name = cleanInput($data["name"] ?? "");
$typeName = cleanInput($data["type_name"] ?? "");
$typeId = intval($data["type_id"] ?? 0);
$deviceId = intval($data["device_id"] ?? 0);

if (empty($name) || (empty($typeName) && $typeId <= 0)) {
    jsonResponse(false, "Preencha o nome e o tipo da planta.");
}

try {
    // Resolver o tipo de planta pelo nome. Isto evita erros se os IDs mudarem na base de dados.
    if (!empty($typeName)) {
        $stmt = $pdo->prepare("SELECT id FROM plant_types WHERE LOWER(name) = LOWER(:name) LIMIT 1");
        $stmt->bindParam(":name", $typeName);
        $stmt->execute();
        $type = $stmt->fetch();

        if ($type) {
            $typeId = intval($type["id"]);
        } else {
            // Se o tipo não existir, usa 'Outra'.
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

    // Se não foi escolhido nenhum dispositivo, a planta fica sem sensor
    // associado (device_id = NULL) — não faz sentido inventar um
    // dispositivo partilhado, já que agora cada dispositivo só pode
    // estar associado a uma planta de cada vez.
    if ($deviceId > 0) {

        // Confirmar que o dispositivo pertence ao utilizador
        $stmt = $pdo->prepare("SELECT id FROM devices WHERE id = :id AND user_id = :user LIMIT 1");
        $stmt->bindParam(":id", $deviceId);
        $stmt->bindParam(":user", $userId);
        $stmt->execute();

        if (!$stmt->fetch()) {
            jsonResponse(false, "Dispositivo não encontrado.");
        }

        // Impedir que o mesmo dispositivo seja associado a mais do que uma planta
        $stmt = $pdo->prepare("SELECT id FROM plants WHERE device_id = :device LIMIT 1");
        $stmt->bindParam(":device", $deviceId);
        $stmt->execute();

        if ($stmt->fetch()) {
            jsonResponse(false, "Este dispositivo já está associado a outra planta.");
        }
    } else {
        $deviceId = null;
    }

    $sql = "
        INSERT INTO plants (user_id, device_id, type_id, name, humidity, created_at, updated_at)
        VALUES (:user, :device, :type, :name, 0, NOW(), NOW())
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":user", $userId);
    $stmt->bindParam(":device", $deviceId, $deviceId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
    $stmt->bindParam(":type", $typeId);
    $stmt->bindParam(":name", $name);
    $stmt->execute();

    jsonResponse(true, "Planta adicionada com sucesso.", ["id" => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    jsonResponse(false, $e->getMessage());
}
?>
