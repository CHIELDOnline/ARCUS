<?php

include_once('setDBLocation.php');
$pdo = new PDO('sqlite:'.$dblocation);

$sql= <<<EOT
SELECT DISTINCT d.citation, d.title, d.pk, 
	l.SampleN,l.SampleLocation,l.SampleDemographic
	FROM causal_links l
	LEFT JOIN contributors c ON l.bibref = c.bibref
	LEFT JOIN documents d ON l.bibref = d.pk
ORDER BY l.SampleN DESC
EOT;


$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 