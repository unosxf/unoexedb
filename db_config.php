<?php
// db_config.php 
$host = getenv('mysql.railway.internal');
$user = getenv('root');
$pass = getenv('jwSZcQlwTxSOiPhCWedsiqwXheknWXXe');
$db   = getenv('railway');
$port = getenv('3306');

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
