<?php
$servername = "creaturedb.cgyax6thjqsq.us-east-1.rds.amazonaws.com";
$username = "admin";
$password = "databasesystems4710";

  $conn = new PDO("mysql:host=$servername;dbname=myDB", $username, $password);
// set the PDO error mode to exception
try {
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  echo "Connected successfully";
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}
?>