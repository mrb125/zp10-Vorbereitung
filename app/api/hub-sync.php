<?php
/**
 * ZP10 API - Hub-Daten synchronisieren
 * GET  ?code=CODE           → {found, hub_data}
 * POST {code, hub_data}     → speichert/merged Hub-Daten (X-API-Key optional)
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Hub-Daten für einen Schüler abrufen ─────────────────────────────────
if ($method === 'GET') {
    $code = trim($_GET['code'] ?? '');
    if (!$code) { echo json_encode(['found' => false]); exit; }

    $hubs = loadJson(HUB_FILE);
    if (isset($hubs[$code])) {
        echo json_encode(['found' => true, 'hub_data' => $hubs[$code]]);
    } else {
        echo json_encode(['found' => false]);
    }
    exit;
}

// ── POST: Hub-Daten vom Schüler pushen ───────────────────────────────────────
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $code  = trim($input['code'] ?? '');
    $hubData = $input['hub_data'] ?? null;

    if (!$code || !$hubData) {
        http_response_code(400);
        echo json_encode(['error' => 'Bad Request']);
        exit;
    }

    $hubs = loadJson(HUB_FILE);

    // Merge: XP additiv, mvScores höchster Wert, Rest überschreiben
    $existing = $hubs[$code] ?? [];
    $merged   = array_merge($existing, $hubData);
    $merged['totalXP'] = max(
        (int)($existing['totalXP'] ?? 0),
        (int)($hubData['totalXP'] ?? 0)
    );
    // mvScores: pro Modul den höheren lastScore behalten
    $lmv = $existing['mvScores'] ?? [];
    $smv = $hubData['mvScores']  ?? [];
    $allMods = array_unique(array_merge(array_keys($lmv), array_keys($smv)));
    $merged['mvScores'] = [];
    foreach ($allMods as $mod) {
        $ls = $lmv[$mod] ?? null;
        $ss = $smv[$mod] ?? null;
        if (!$ls)      $merged['mvScores'][$mod] = $ss;
        elseif (!$ss)  $merged['mvScores'][$mod] = $ls;
        else $merged['mvScores'][$mod] = (($ss['lastScore'] ?? 0) >= ($ls['lastScore'] ?? 0)) ? $ss : $ls;
    }
    $merged['lastSync'] = now();
    $hubs[$code] = $merged;

    saveJson(HUB_FILE, $hubs);

    // Auch in students.json registrieren (Schüler anlegen falls neu)
    $students = loadJson(STUDENTS_FILE);
    $found = false;
    foreach ($students as &$st) {
        if (($st['code'] ?? '') === $code || ($st['name'] ?? '') === $code) {
            $found = true;
            $st['totalXP']  = max((int)($st['totalXP'] ?? 0), (int)($merged['totalXP'] ?? 0));
            $st['status']   = 'active';
            break;
        }
    }
    unset($st);
    if (!$found) {
        $students[] = [
            'name'            => $code,
            'code'            => $code,
            'modules'         => [],
            'fehlvorstellungen' => [],
            'totalXP'         => (int)($merged['totalXP'] ?? 0),
            'lastActivity'    => now(),
            'status'          => 'active',
        ];
    }
    saveJson(STUDENTS_FILE, $students);

    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
