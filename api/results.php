<?php
/**
 * ZP10 — Ergebnisse abrufen (für Lehrer-Dashboard)
 * GET /api/results.php?key=<dein key>
 * Optional: ?student=SCHÜLERCODE  oder  ?module=MODULE_ID
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

// Gruppiert nach Schüler
$students = [];
foreach ($rows as $row) {
    $code = $row['student_code'];
    if (!isset($students[$code])) {
        $students[$code] = [
            'name'              => $code,
            'code'              => $code,
            'modules'           => [],
            'fehlvorstellungen' => [],
            'totalXP'           => 0,
            'lastActivity'      => $row['created_at'],
            'lastLogin'         => null,
            'status'            => 'never_logged_in',
        ];
    }
    $st = &$students[$code];
    $mid  = $row['module_id'];
    $mode = $row['mode'];

    // Login-Einträge separat tracken, nicht als Modul zählen
    if ($mode === 'login' || $mid === 'LOGIN') {
        if (!$st['lastLogin'] || $row['created_at'] > $st['lastLogin']) {
            $st['lastLogin'] = $row['created_at'];
        }
        if ($st['status'] === 'never_logged_in') {
            $st['status'] = 'logged_in';
        }
        continue; // nicht in modules aufnehmen
    }

    $st['status'] = 'active';

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
}

// Schüler aus student_codes einbeziehen die noch nie eingeloggt waren
try {
    $codeRows = $db->query("SELECT code, student_name, created_at FROM student_codes")->fetchAll();
    foreach ($codeRows as $cr) {
        $code = $cr['code'];
        if (!isset($students[$code])) {
            $students[$code] = [
                'name'              => $cr['student_name'] ?: $code,
                'code'              => $code,
                'modules'           => [],
                'fehlvorstellungen' => [],
                'totalXP'           => 0,
                'lastActivity'      => null,
                'lastLogin'         => null,
                'status'            => 'never_logged_in',
                'codeCreatedAt'     => $cr['created_at'],
            ];
        }
    }
} catch (Exception $e) {
    // student_codes Tabelle existiert noch nicht — kein Problem
}

jsonOut(array_values($students));
