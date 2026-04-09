<?php
/**
 * ZP10 — Ergebnisse abrufen (für Lehrer-Dashboard)
 * GET /api/results.php?key=<dein key>
 * Optional: ?student=SCHÜLERCODE  oder  ?module=MODULE_ID
 *
 * Gibt alle Ergebnisse als JSON zurück, im Format das
 * zp10-lehrer-lokal.html erwartet.
 */
require_once __DIR__ . '/db.php';
setCORSHeaders();
checkAPIKey();

$db = getDB();

$where  = [];
$params = [];

if (!empty($_GET['student'])) {
    $where[]  = 'student_code = :student';
    $params[':student'] = mb_substr($_GET['student'], 0, 50);
}
if (!empty($_GET['module'])) {
    $where[]  = 'module_id = :module';
    $params[':module'] = mb_substr($_GET['module'], 0, 100);
}

$sql = 'SELECT * FROM results';
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= ' ORDER BY created_at DESC LIMIT 2000';

$stmt = $db->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Gruppiert nach Schüler — passt direkt ins Lehrer-Dashboard
$students = [];
foreach ($rows as $row) {
    $code = $row['student_code'];
    if (!isset($students[$code])) {
        $students[$code] = [
            'name'           => $code,
            'code'           => $code,
            'modules'        => [],
            'fehlvorstellungen' => [],
            'totalXP'        => 0,
            'lastActivity'   => $row['created_at'],
        ];
    }
    $st = &$students[$code];
    $mid = $row['module_id'];

    // Neuestes Ergebnis je Modul behalten
    if (!isset($st['modules'][$mid]) || $row['created_at'] > $st['modules'][$mid]['lastAttempt']) {
        $st['modules'][$mid] = [
            'score'        => (int)$row['percentage'],
            'xp'           => (int)$row['xp'],
            'lastAttempt'  => $row['created_at'],
            'attemptCount' => ($st['modules'][$mid]['attemptCount'] ?? 0) + 1,
        ];
    }

    $st['totalXP']      = max($st['totalXP'], array_sum(array_column($st['modules'], 'xp')));
    $st['lastActivity'] = max($st['lastActivity'], $row['created_at']);

    // Konfidenz-Daten für Deep-MV-Erkennung auswerten
    $conf = json_decode($row['confidence'] ?? 'null', true);
    // (Erweiterungspunkt: confidence-Daten könnten hier zu fehlvorstellungen gemappt werden)
}

jsonOut(array_values($students));
