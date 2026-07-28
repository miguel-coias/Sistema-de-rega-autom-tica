<?php
// ======================================================
// Plant Monitor
// getHumidity.php
// Obter a humidade atual de uma planta
// ======================================================

require_once "config.php";

// ======================================================
// Verificar sessão
// ======================================================

checkLogin();

$userId = $_SESSION["user_id"];

// ======================================================
// Apenas aceita pedidos GET
// ======================================================

if($_SERVER["REQUEST_METHOD"] != "GET"){

    jsonResponse(false,"Método inválido.");

}

// ======================================================
// Receber ID da planta
// ======================================================

$plantId = intval($_GET["plant_id"] ?? 0);

if($plantId <= 0){

    jsonResponse(false,"ID da planta inválido.");

}

try{

    // ==================================================
    // Procurar planta
    // ==================================================

    $sql = "

        SELECT

            id,

            name,

            humidity,

            updated_at

        FROM plants

        WHERE id = :plant

        AND user_id = :user

        LIMIT 1

    ";

    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":plant",$plantId);

    $stmt->bindParam(":user",$userId);

    $stmt->execute();

    $plant = $stmt->fetch();

    if(!$plant){

        jsonResponse(false,"Planta não encontrada.");

    }

    // ==================================================
    // Definir estado da planta
    // ==================================================

    $status = "Ideal";

    if($plant["humidity"] < 40){

        $status = "Regar";

    }
    elseif($plant["humidity"] > 80){

        $status = "Demasiada Água";

    }

    // ==================================================
    // Resposta
    // ==================================================

    jsonResponse(

        true,

        "Humidade obtida com sucesso.",

        [

            "plant_id"=>$plant["id"],

            "name"=>$plant["name"],

            "humidity"=>$plant["humidity"],

            "status"=>$status,

            "updated_at"=>$plant["updated_at"]

        ]

    );

}
catch(PDOException $e){

    jsonResponse(

        false,

        $e->getMessage()

    );

}

?>