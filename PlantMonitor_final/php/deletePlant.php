<?php
// ======================================================
// Plant Monitor
// deletePlant.php
// Eliminar uma planta
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
// Receber ID da planta
// ======================================================

$id = intval($_POST["id"] ?? 0);

if($id <= 0){

    jsonResponse(false,"ID da planta inválido.");

}

try{

    // ==================================================
    // Verificar se a planta pertence ao utilizador
    // ==================================================

    $sql = "

        SELECT id

        FROM plants

        WHERE id = :id

        AND user_id = :user

        LIMIT 1

    ";

    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":id",$id);

    $stmt->bindParam(":user",$userId);

    $stmt->execute();

    if(!$stmt->fetch()){

        jsonResponse(false,"Planta não encontrada.");

    }

    // ==================================================
    // Eliminar a planta
    // ==================================================

    $sql = "

        DELETE FROM plants

        WHERE id = :id

        AND user_id = :user

    ";

    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":id",$id);

    $stmt->bindParam(":user",$userId);

    $stmt->execute();

    // ==================================================
    // Resposta
    // ==================================================

    jsonResponse(

        true,

        "Planta eliminada com sucesso."

    );

}
catch(PDOException $e){

    jsonResponse(

        false,

        $e->getMessage()

    );

}

?>