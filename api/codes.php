<?php
/**
 * ZP10 — Schüler-Codes verwalten
 *
 * PUBLIC  GET  ?validate=CODE          → {valid, name}  (kein API-Key nötig)
 * AUTH    GET  (kein validate)         → alle Codes liste
 * AUTH    POST {action:"add",code,name}
 * AUTH    POST {action:"delete",code}
 * AUTH    POST {action:"bulk",codes:[{code,name},...]}
 */
require_once __DIR__ . '/db.php';
setCORSHeaders();

$db = getDB();
$db->exec("CREATE TABLE IF NOT EXISTS student_codes (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    code         VARCHAR(50)  NOT NULL UNIQUE,
    student_name VARCHAR(100) NOT NULL DEFAULT '',
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$method = $_SERVER['REQUEST_METHOD'];

// ── öffentlich: Code validieren (Schüler-App) ──────────────────────────────
if ($method === 'GET' && isset($_GET['validate'])) {
    $code = mb_strtoupper(trim($_GET['validate']));
    $stmt = $db->prepare("SELECT code, student_name FROM student_codes WHERE code = ?");
    $stmt->execute([$code]);
    $row = $stmt->fetch();
    jsonOut($row
        ? ['valid' => true,  'name' => $row['student_name'] ?: $row['code']]
        : ['valid' => false, 'name' => '']);
}

// ── ab hier API-Key erforderlich ───────────────────────────────────────────
checkAPIKey();

if ($method === 'GET') {
    $rows = $db->query(
        "SELECT code, student_name, DATE_FORMAT(created_at,'%d.%m.%Y') AS added
         FROM student_codes ORDER BY student_name, code"
    )->fetchAll();
    jsonOut($rows);
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $action = $body['action'] ?? '';

    if ($action === 'add') {
        $code = mb_strtoupper(preg_replace('/[^A-Za-z0-9_\-]/', '', trim($body['code'] ?? '')));
        $name = mb_substr(trim($body['name'] ?? ''), 0, 100);
        if (!$code) jsonOut(['error' => 'Code fehlt'], 400);
        $db->prepare(
            "INSERT INTO student_codes (code, student_name) VALUES (?,?)
             ON DUPLICATE KEY UPDATE student_name = VALUES(student_name)"
        )->execute([$code, $name]);
        jsonOut(['ok' => true, 'code' => $code]);
    }

    if ($action === 'delete') {
        $code = trim($body['code'] ?? '');
        if (!$code) jsonOut(['error' => 'Code fehlt'], 400);
        $db->prepare("DELETE FROM student_codes WHERE code = ?")->execute([$code]);
        jsonOut(['ok' => true]);
    }

    if ($action === 'bulk') {
        $codes = $body['codes'] ?? [];
        $stmt = $db->prepare(
            "INSERT INTO student_codes (code, student_name) VALUES (?,?)
             ON DUPLICATE KEY UPDATE student_name = VALUES(student_name)"
        );
        $added = 0;
        foreach ($codes as $item) {
            $code = mb_strtoupper(preg_replace('/[^A-Za-z0-9_\-]/', '', trim($item['code'] ?? '')));
            $name = mb_substr(trim($item['name'] ?? ''), 0, 100);
            if ($code) { $stmt->execute([$code, $name]); $added++; }
        }
        jsonOut(['ok' => true, 'added' => $added]);
    }

    jsonOut(['error' => 'Unbekannte Aktion'], 400);
}

jsonOut(['error' => 'Methode nicht erlaubt'], 405);
