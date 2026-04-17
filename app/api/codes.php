<?php
/**
 * ZP10 API - Schüler-Codes verwalten (Lehrer)
 * GET  X-API-Key  → [{code, student_name}]
 * POST X-API-Key  {codes: [{code, student_name}]}  → Codes anlegen/ergänzen
 */
require_once 'config.php';
checkApiKey();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $students = loadJson(STUDENTS_FILE);
    $result = array_map(fn($st) => [
        'code'         => $st['code'] ?? $st['name'] ?? '',
        'student_name' => $st['name'] ?? $st['code'] ?? '',
    ], $students);
    echo json_encode(array_values($result));
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $newCodes = $input['codes'] ?? [];
    if (!is_array($newCodes)) { http_response_code(400); echo json_encode(['error' => 'Bad Request']); exit; }

    $students = loadJson(STUDENTS_FILE);
    $existing = array_column($students, null, 'code');

    foreach ($newCodes as $entry) {
        $code = trim($entry['code'] ?? '');
        if (!$code || isset($existing[$code])) continue;
        $students[] = [
            'name'            => $entry['student_name'] ?? $code,
            'code'            => $code,
            'modules'         => [],
            'fehlvorstellungen' => [],
            'totalXP'         => 0,
            'lastActivity'    => null,
            'status'          => 'pending',
            'codeCreatedAt'   => now(),
        ];
    }
    saveJson(STUDENTS_FILE, $students);
    echo json_encode(['ok' => true, 'total' => count($students)]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
