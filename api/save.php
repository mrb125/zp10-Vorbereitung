<?php
/**
 * ZP10 — Ergebnis speichern
 * POST /api/save.php
 * Header: X-API-Key: <dein key>
 * Body (JSON): { studentCode, moduleId, score, maxScore, percentage, xp, mode, confidence, srData }
 */
require_once __DIR__ . '/db.php';
setCORSHeaders();
checkAPIKey();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonOut(['error' => 'POST required'], 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) jsonOut(['error' => 'Invalid JSON'], 400);

$studentCode = trim($body['studentCode'] ?? 'GAST');
$moduleId    = trim($body['moduleId']    ?? '');
if (!$moduleId) jsonOut(['error' => 'moduleId missing'], 400);

// Maximal 50 Zeichen je Feld
$studentCode = mb_substr($studentCode, 0, 50);
$moduleId    = mb_substr($moduleId, 0, 100);

$db = getDB();
$db->prepare("
    INSERT INTO results
        (student_code, module_id, score, max_score, percentage, xp, mode, confidence, created_at)
    VALUES
        (:student_code, :module_id, :score, :max_score, :percentage, :xp, :mode, :confidence, NOW())
")->execute([
    ':student_code' => $studentCode,
    ':module_id'    => $moduleId,
    ':score'        => (int)($body['score']      ?? 0),
    ':max_score'    => (int)($body['maxScore']    ?? 0),
    ':percentage'   => (int)($body['percentage']  ?? 0),
    ':xp'           => (int)($body['xp']          ?? 0),
    ':mode'         => in_array($body['mode'] ?? '', ['diagnose','exam']) ? $body['mode'] : 'diagnose',
    ':confidence'   => json_encode($body['confidence'] ?? null),
]);

jsonOut(['ok' => true, 'id' => (int)$db->lastInsertId()]);
