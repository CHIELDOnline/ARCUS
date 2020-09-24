<?php

$key = "%".$_POST['key']."%";

include_once('setDBLocation.php');
$pdo = new PDO('sqlite:'.$dblocation);

$sql= <<<EOT
SELECT name, pk, COUNT(name) FROM (
SELECT s.[name],s.[pk]
  FROM causal_links l 
  LEFT JOIN variables s ON l.Var1 = s.pk 
  WHERE l.[subject] LIKE :key1
UNION ALL
SELECT s.[name],s.[pk]
  FROM causal_links l 
  LEFT JOIN variables s ON l.Var2 = s.pk 
  WHERE l.[subject] LIKE :key2
  )
  GROUP BY name ORDER BY COUNT(name) DESC
EOT;

$statement=$pdo->prepare($sql);
$statement->bindParam(':key1', $key, PDO::PARAM_STR);
$statement->bindParam(':key2', $key, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;


?> 