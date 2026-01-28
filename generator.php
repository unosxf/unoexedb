<?php
include 'db_config.php';

if (isset($_POST['generate'])) {
    $key = "PHNTM-" . strtoupper(bin2hex(random_bytes(4))) . "-" . strtoupper(bin2hex(random_bytes(4)));
    $limit = 1; // Device limit
    $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $sql = "INSERT INTO licenses (license_key, device_limit, expiry_date) VALUES ('$key', $limit, '$expiry')";
    
    if ($conn->query($sql) === TRUE) {
        $msg = "<div style='color:lime'>Generated: <b>$key</b><br>Expires: $expiry</div>";
    } else {
        $msg = "<div style='color:red'>Error: " . $conn->error . "</div>";
    }
}
?>
<!DOCTYPE html>
<html>
<body style="background:#111; color:white; font-family:sans-serif; text-align:center; padding-top:50px;">
    <h2>License Generator</h2>
    <form method="POST">
        <button type="submit" name="generate" style="padding:15px 30px; cursor:pointer;">GENERATE 24H KEY</button>
    </form>
    <br><?php echo $msg ?? ''; ?>
</body>
</html>
