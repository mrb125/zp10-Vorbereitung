<?php
/**
 * ZP10 API - Konfiguration & Hilfsfunktionen
 * Server: mrbl.4lima.de/app/api/
 */

define('API_KEY',      'ZP10-API-2026-mrbl');
define('DATA_DIR',     __DIR__ . '/data');
define('STUDENTS_FILE', DATA_DIR . '/students.json');
define('HUB_FILE',      DATA_DIR . '/hub.json');

// CORS (gleiche Domain, aber für Sicherheit explizit)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (str_contains($origin, 'mrbl.4lima.de') || str_contains($origin, 'localhost')) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

function checkApiKey(): void {
    $key = $_SERVER['HTTP_X_API_KEY'] ?? $_GET['key'] ?? '';
    if ($key !== API_KEY) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

function loadJson(string $file): array {
    if (!file_exists($file)) return [];
    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : [];
}

function saveJson(string $file, array $data): void {
    if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0755, true);
    $fp = fopen($file, 'c');
    if (!$fp) return;
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

function now(): string {
    return date('Y-m-d H:i:s');
}
