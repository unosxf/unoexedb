<?php
// db_config.php - The Pro Railway Version

// We use getenv() to grab the "Label" from the Railway Variables tab
$host = getenv('MYSQLHOST');
$user = getenv('MYSQLUSER');
$pass = getenv('MYSQLPASSWORD');
$db   = getenv('MYSQLDATABASE');
$port = getenv('MYSQLPORT');

// Connect using those labels
$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
// If it works, it will just be a blank page (which is good!)
?>
