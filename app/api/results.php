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
    if ($code && isset($hubs[$code]['fehlvorstellungen'])) {
        // Hub-MVs zusammenführen (Duplikate per code+moduleId vermeiden)
        $existing = array_column($st['fehlvorstellungen'] ?? [], null, 'code');
        foreach ($hubs[$code]['fehlvorstellungen'] as $mv) {
            if (!isset($existing[$mv['code'] ?? ''])) {
                $st['fehlvorstellungen'][] = $mv;
            }
        }
    }
}
unset($st);

echo json_encode(array_values($students));
