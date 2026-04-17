<?php
/**
 * ZP10 API - Bulk-Import lokaler Lehrerdaten
 * POST X-API-Key  {students: [{code, name, modules, totalXP, ...}]}
 * Mergt alle übermittelten Schüler in students.json (höchster Score gewinnt)
 */
require_once 'config.php';
checkApiKey();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

$input    = json_decode(file_get_contents('php://input'), true);
$incoming = $input['students'] ?? [];

if (!is_array($incoming) || empty($incoming)) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad Request: students array required']);
    exit;
}

$students = loadJson(STUDENTS_FILE);
$indexed  = [];
foreach ($students as $i => $st) {
    $indexed[$st['code'] ?? $st['name'] ?? ''] = $i;
}

$added   = 0;
$updated = 0;

foreach ($incoming as $inc) {
    $code = trim($inc['code'] ?? $inc['name'] ?? '');
    if (!$code || $code === 'GAST' || $code === 'NONE') continue;

    $incModules = $inc['modules'] ?? [];
    // Normalize: modules may arrive as array [] from old format
    if (!is_array($incModules) || array_keys($incModules) === range(0, count($incModules) - 1)) {
        $incModules = [];
    }

    if (isset($indexed[$code])) {
        // Merge into existing
        $idx = $indexed[$code];
        $ex  = &$students[$idx];

        if (!isset($ex['modules']) || !is_array($ex['modules'])) $ex['modules'] = [];

        foreach ($incModules as $mid => $mod) {
            $prev = $ex['modules'][$mid] ?? null;
            if (!$prev || ($mod['score'] ?? 0) >= ($prev['score'] ?? 0)) {
                $ex['modules'][$mid] = [
                    'score'        => (int)($mod['score'] ?? 0),
                    'xp'           => (int)($mod['xp'] ?? 0),
                    'lastAttempt'  => $mod['lastAttempt'] ?? now(),
                    'attemptCount' => (int)($mod['attemptCount'] ?? 1),
                ];
            }
        }
        $ex['totalXP']      = max((int)($ex['totalXP'] ?? 0), (int)($inc['totalXP'] ?? 0));
        $ex['lastActivity'] = $inc['lastActivity'] ?? $ex['lastActivity'] ?? now();
        if (!empty($inc['name'])) $ex['name'] = $inc['name'];
        $updated++;
        unset($ex);
    } else {
        // New student
        $modules = [];
        foreach ($incModules as $mid => $mod) {
            $modules[$mid] = [
                'score'        => (int)($mod['score'] ?? 0),
                'xp'           => (int)($mod['xp'] ?? 0),
                'lastAttempt'  => $mod['lastAttempt'] ?? now(),
                'attemptCount' => (int)($mod['attemptCount'] ?? 1),
            ];
        }
        $students[] = [
            'name'              => $inc['name'] ?? $code,
            'code'              => $code,
            'modules'           => $modules,
            'fehlvorstellungen' => $inc['fehlvorstellungen'] ?? [],
            'totalXP'           => (int)($inc['totalXP'] ?? 0),
            'lastActivity'      => $inc['lastActivity'] ?? now(),
            'status'            => $inc['status'] ?? 'active',
        ];
        $indexed[$code] = count($students) - 1;
        $added++;
    }
}

saveJson(STUDENTS_FILE, $students);
echo json_encode(['ok' => true, 'added' => $added, 'updated' => $updated, 'total' => count($students)]);
