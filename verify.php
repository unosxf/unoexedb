<?php
header('Content-Type: text/plain');
include 'db_config.php';

$key = $_GET['key'] ?? '';
$hwid = $_GET['hwid'] ?? '';

if (empty($key) || empty($hwid)) { die("INVALID_REQUEST"); }

$sql = "SELECT * FROM licenses WHERE license_key = '$key'";
$res = $conn->query($sql);

if ($res->num_rows > 0) {
    $lic = $res->fetch_assoc();
    $lic_id = $lic['id'];
  
    if (strtotime($lic['expiry_date']) < time()) { die("EXPIRED"); }

    $check_hwid = $conn->query("SELECT * FROM registered_devices WHERE license_id = $lic_id AND hwid = '$hwid'");
    
    if ($check_hwid->num_rows > 0) {
        die("SUCCESS");
    } else {
        $count = $conn->query("SELECT id FROM registered_devices WHERE license_id = $lic_id")->num_rows;
        if ($count < $lic['device_limit']) {
            $conn->query("INSERT INTO registered_devices (license_id, hwid) VALUES ($lic_id, '$hwid')");
            die("SUCCESS");
        } else {
            die("DEVICE_LIMIT_REACHED");
        }
    }
} else {
    die("INVALID_KEY");
}
?>
