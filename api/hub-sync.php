<?php
/**
 * ZP10 — Hub-Daten synchronisieren (geräteübergreifend)
 *
 * GET  /api/hub-sync.php?code=10A-01
 *      → gibt gespeicherte hub_data zurück (kein API-Key nötig)
 *
 * POST /api/hub-sync.php  X-API-Key: <key>
 *      Body: { code, hub_data }
 *      → merged additive (nie downgrade) und speichert
 *      → gibt merged hub_data zurück
 *
 * Merge-Strategie: server-Werte werden NIE überschrieben mit niedrigeren Werten.
 * totalXP, Scores → immer Maximum. completedModules → Union. creature → server-first.
 */
require_once __DIR__ . '/db.php';
setCORSHeaders();

// Tabelle anlegen falls nicht vorhanden
getDB()->exec("
    CREATE TABLE IF NOT EXISTS student_hub (
        code       VARCHAR(50) NOT NULL PRIMARY KEY,
        hub_data   MEDIUMTEXT  NOT NULL,
        updated_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Daten laden (kein API-Key nötig) ─────────────────────────────────
if ($method === 'GET') {
    $code = mb_strtoupper(trim($_GET['code'] ?? ''));
    if (!$code) jsonOut(['error' => 'code fehlt'], 400);

    $stmt = getDB()->prepare("SELECT hub_data FROM student_hub WHERE code = ?");
    $stmt->execute([$code]);
    $row = $stmt->fetch();

    if (!$row) jsonOut(['found' => false, 'hub_data' => null]);

    $data = json_decode($row['hub_data'], true);
    jsonOut(['found' => true, 'hub_data' => $data]);
}

// ── POST: Daten mergen & speichern ────────────────────────────────────────
if ($method === 'POST') {
    checkAPIKey();

    $body = json_decode(file_get_contents('php://input'), true);
    if (!$body) jsonOut(['error' => 'Invalid JSON'], 400);

    $code    = mb_strtoupper(mb_substr(trim($body['code'] ?? ''), 0, 50));
    $client  = $body['hub_data'] ?? null;
    if (!$code || !$client) jsonOut(['error' => 'code oder hub_data fehlt'], 400);

    // Bestehende Server-Daten laden
    $stmt = getDB()->prepare("SELECT hub_data FROM student_hub WHERE code = ?");
    $stmt->execute([$code]);
    $row    = $stmt->fetch();
    $server = $row ? (json_decode($row['hub_data'], true) ?? []) : [];

    // Merge: server + client → immer additiv, nie downgrade
    $merged = mergeHubData($server, $client);

    // Speichern (INSERT oder UPDATE)
    getDB()->prepare("
        INSERT INTO student_hub (code, hub_data)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE hub_data = VALUES(hub_data), updated_at = NOW()
    ")->execute([$code, json_encode($merged, JSON_UNESCAPED_UNICODE)]);

    jsonOut(['ok' => true, 'hub_data' => $merged]);
}

jsonOut(['error' => 'Methode nicht erlaubt'], 405);

// ── Merge-Funktion ────────────────────────────────────────────────────────
function mergeHubData(array $server, array $client): array {
    $m = $server; // server ist Basis

    // XP: immer Maximum
    $m['totalXP'] = max((int)($server['totalXP'] ?? 0), (int)($client['totalXP'] ?? 0));

    // mvScores: pro Modul höchsten lastScore nehmen
    $ss = $server['mvScores'] ?? [];
    $cs = $client['mvScores'] ?? [];
    $allMods = array_unique(array_merge(array_keys($ss), array_keys($cs)));
    $m['mvScores'] = [];
    foreach ($allMods as $mod) {
        $sv = $ss[$mod] ?? null;
        $cv = $cs[$mod] ?? null;
        if (!$sv)                                                 $m['mvScores'][$mod] = $cv;
        elseif (!$cv)                                             $m['mvScores'][$mod] = $sv;
        elseif ((float)($cv['lastScore'] ?? 0) > (float)($sv['lastScore'] ?? 0))
                                                                  $m['mvScores'][$mod] = $cv;
        else                                                      $m['mvScores'][$mod] = $sv;
    }

    // completedModules: Union (keine Duplikate)
    $combined = array_merge(
        array_values($server['completedModules'] ?? []),
        array_values($client['completedModules'] ?? [])
    );
    $m['completedModules'] = array_values(array_unique($combined));

    // creature: server-first; customName aus client übernehmen falls server keinen hat
    if (!empty($client['creature'])) {
        if (empty($server['creature']['type'])) {
            $m['creature'] = $client['creature'];
        } else {
            // Server hat Tier → behalten; aber customName ergänzen falls fehlend
            if (empty($m['creature']['customName']) && !empty($client['creature']['customName'])) {
                $m['creature']['customName'] = $client['creature']['customName'];
            }
        }
    }

    // studentName: server-Wert behalten; client-Wert nur wenn server noch 'Schüler' ist
    $sName = $server['studentName'] ?? '';
    $cName = $client['studentName'] ?? '';
    if ((!$sName || $sName === 'Schüler') && $cName && $cName !== 'Schüler') {
        $m['studentName'] = $cName;
    } elseif ($sName) {
        $m['studentName'] = $sName;
    }

    return $m;
}
