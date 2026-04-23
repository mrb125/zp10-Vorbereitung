<?php
/**
 * ZP10 API - Alle Schülerdaten laden (Lehrer)
 * GET ?key=API_KEY  oder  Header X-API-Key
 * Gibt Array im lehrer_data-Format zurück
 */
require_once 'config.php';
checkApiKey();

$students = loadJson(STUDENTS_FILE);

// Fehlvorstellungen aus Hub-Daten ergänzen (falls vorhanden)
$hubs = loadJson(HUB_FILE);
foreach ($students as &$st) {
    $code = $st['code'] ?? $st['name'] ?? '';
    if ($code && isset($hubs[$code])) {
        $hub = $hubs[$code];
        // Hub-MVs zusammenführen (Duplikate per code+moduleId vermeiden)
        if (!empty($hub['fehlvorstellungen'])) {
            $existing = array_column($st['fehlvorstellungen'] ?? [], null, 'code');
            foreach ($hub['fehlvorstellungen'] as $mv) {
                if (!isset($existing[$mv['code'] ?? ''])) {
                    $st['fehlvorstellungen'][] = $mv;
                }
            }
        }
        // lastSync für Live-Heartbeat
        if (!empty($hub['lastSync'])) {
            $st['lastSync'] = $hub['lastSync'];
        }
    }
}
unset($st);

echo json_encode(array_values($students));
