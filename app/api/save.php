<?php
/**
 * ZP10 API - Schüler-Ergebnis speichern
 * POST: {studentCode, moduleId, percentage, xp, mode, ...}
 * Kein API-Key nötig (Schüler haben keinen Schlüssel)
 */
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['studentCode']) || empty($input['moduleId'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad Request']);
    exit;
}

$code     = trim($input['studentCode']);
$moduleId = trim($input['moduleId']);

if (!$code || $code === 'GAST' || $code === 'NONE') {
    echo json_encode(['ok' => false, 'reason' => 'no code']);
    exit;
}

$pct = (int)($input['percentage'] ?? $input['score'] ?? 0);
$xp  = (int)($input['xp'] ?? 0);

// Client-Zeitstempel bevorzugen (korrekt bei Offline-Sync aus Queue)
// Nur akzeptieren wenn valide ISO-8601 und nicht in der Zukunft
$clientTs = $input['lastActivity'] ?? null;
$ts = now();
if ($clientTs && preg_match('/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/', $clientTs)) {
    $clientTime = strtotime($clientTs);
    if ($clientTime && $clientTime <= time() + 60) { // max 60s Toleranz
        $ts = date('Y-m-d H:i:s', $clientTime);
    }
}

$students = loadJson(STUDENTS_FILE);

$found = false;
foreach ($students as &$st) {
    if (($st['code'] ?? '') === $code || ($st['name'] ?? '') === $code) {
        $found = true;
        if (!isset($st['modules']) || !is_array($st['modules'])) $st['modules'] = [];
        $prev = $st['modules'][$moduleId] ?? [];
        $st['modules'][$moduleId] = [
            'score'        => $pct,
            'xp'           => $xp,
            'lastAttempt'  => $ts,
            'attemptCount' => ($prev['attemptCount'] ?? 0) + 1,
        ];
        // XP is cumulative from client — take the maximum
        $st['totalXP']      = max((int)($st['totalXP'] ?? 0), $xp);
        $st['lastActivity'] = $ts;
        $st['status']       = 'active';
        break;
    }
}
unset($st);

if (!$found) {
    $students[] = [
        'name'            => $code,
        'code'            => $code,
        'modules'         => [
            $moduleId => [
                'score'        => $pct,
                'xp'           => $xp,
                'lastAttempt'  => $ts,
                'attemptCount' => 1,
            ],
        ],
        'fehlvorstellungen' => [],
        'totalXP'           => $xp,
        'lastActivity'      => $ts,
        'status'            => 'active',
    ];
}

saveJson(STUDENTS_FILE, $students);
echo json_encode(['ok' => true]);
