<?php

include_once('setDBLocation.php');
$pdo = new PDO('sqlite:'.$dblocation);

$sql= "SELECT title, pk	FROM documents d";


$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 