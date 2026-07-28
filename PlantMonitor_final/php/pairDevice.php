<?php
// ======================================================
// Plant Monitor
// pairDevice.php
// Emparelhar um dispositivo Bluetooth
// ======================================================

require_once "config.php";

// ======================================================
// Verificar sessão
// ======================================================

checkLogin();

$userId = $_SESSION["user_id"];

// ======================================================
// Apenas aceita pedidos POST
// ======================================================

if($_SERVER["REQUEST_METHOD"] != "POST"){

    jsonResponse(false,"Método inválido.");

}

// ======================================================
// Receber dados
// ======================================================

$deviceName = cleanInput($_POST["device_name"] ?? "");

$bluetoothId = cleanInput($_POST["bluetooth_id"] ?? "");

// ======================================================
// Validar dados
// ======================================================

if(empty($deviceName) || empty($bluetoothId)){

    jsonResponse(false,"Dados do dispositivo inválidos.");

}

try{

    // ==================================================
    // Verificar se o dispositivo já existe
    // ==================================================

    $sql = "

        SELECT id

        FROM devices

        WHERE bluetooth_id = :bluetooth

        LIMIT 1

    ";

    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":bluetooth",$bluetoothId);

    $stmt->execute();

    $device = $stmt->fetch();

    if($device){

        // Atualizar proprietário

        $sql = "

            UPDATE devices

            SET

                user_id = :user,

                device_name = :name,

                paired_at = NOW()

            WHERE

                bluetooth_id = :bluetooth

        ";

        $stmt = $pdo->prepare($sql);

        $stmt->bindParam(":user",$userId);

        $stmt->bindParam(":name",$deviceName);

        $stmt->bindParam(":bluetooth",$bluetoothId);

        $stmt->execute();

        jsonResponse(

            true,

            "Dispositivo emparelhado com sucesso."

        );

    }

    // ==================================================
    // Inserir novo dispositivo
    // ==================================================

    $sql = "

        INSERT INTO devices(

            user_id,

            device_name,

            bluetooth_id,

            paired_at

        )

        VALUES(

            :user,

            :name,

            :bluetooth,

            NOW()

        )

    ";

    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":user",$userId);

    $stmt->bindParam(":name",$deviceName);

    $stmt->bindParam(":bluetooth",$bluetoothId);

    $stmt->execute();

    jsonResponse(

        true,

        "Dispositivo registado com sucesso."

    );

}
catch(PDOException $e){

    jsonResponse(

        false,

        $e->getMessage()

    );

}

?>