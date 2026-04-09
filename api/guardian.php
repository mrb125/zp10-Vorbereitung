<?php
/**
 * ZP10 — Klassen-Guardian XP (Nebelwolf)
 * GET /api/guardian.php?key=<key>
 *
 * Summiert den neuesten XP-Wert je (Schüler × Modul) über alle Schüler.
 * Guardian-XP = Summe × 0.2  (Escape Room & alle Module zählen mit).
 */
require_once __DIR__ . '/db.php';
setCORSHeaders();
checkAPIKey();

$db = getDB();

// Neuester XP-Wert je (student_code, module_id) — Login-Einträge ausschließen
$rows = $db->query("
    SELECT r.student_code, r.module_id, r.xp
    FROM results r
    INNER JOIN (
        SELECT student_code, module_id, MAX(created_at) AS latest
        FROM results
        WHERE mode != 'login'
        GROUP BY student_code, module_id
    ) latest ON r.student_code = latest.student_code
           AND r.module_id    = latest.module_id
           AND r.created_at   = latest.latest
    WHERE r.mode != 'login'
")->fetchAll();

// Summieren: max XP je Schüler×Modul-Kombination
$seen       = [];
$totalXP    = 0;
$students   = [];

foreach ($rows as $row) {
    $key = $row['student_code'] . '|' . $row['module_id'];
    if (!isset($seen[$key])) {
        $seen[$key] = true;
        $xp = (int)$row['xp'];
        $totalXP += $xp;
        $students[$row['student_code']] = true;
    }
}

$guardianXP   = (int)round($totalXP * 0.2);
$studentCount = count($students);

jsonOut([
    'xp'           => $guardianXP,
    'totalClassXP' => $totalXP,
    'students'      => $studentCount,
]);
