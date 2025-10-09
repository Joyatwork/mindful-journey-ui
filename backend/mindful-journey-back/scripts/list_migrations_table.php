<?php
$pdo = new PDO('mysql:host=joy-at-work-db1-joy-at-work-db1.k.aivencloud.com;port=18136;dbname=mindful_journey;charset=utf8mb4','Ali_CAMARA','AVNS_TaUyL9dsB37NJOKRllf',[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
$rows = $pdo->query('SELECT id, migration, batch FROM migrations ORDER BY id')->fetchAll();
foreach ($rows as $r) echo $r['id']."\t".$r['migration']."\tbatch=".$r['batch']."\n";
