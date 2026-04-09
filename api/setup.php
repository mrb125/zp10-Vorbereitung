<?php
/**
 * ZP10 — Einmalige Einrichtung
 *
 * EINMALIG im Browser aufrufen:  https://deine-domain.de/api/setup.php?key=DEIN_KEY
 * Danach diese Datei sofort vom Server löschen!
 */
require_once __DIR__ . '/db.php';
checkAPIKey();
header('Content-Type: text/plain; charset=utf-8');

$db = getDB();
$db->exec("
    CREATE TABLE IF NOT EXISTS results (
        id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        student_code VARCHAR(50)  NOT NULL,
        module_id    VARCHAR(100) NOT NULL,
        score        SMALLINT     NOT NULL DEFAULT 0,
        max_score    SMALLINT     NOT NULL DEFAULT 0,
        percentage   TINYINT      NOT NULL DEFAULT 0,
        xp           SMALLINT     NOT NULL DEFAULT 0,
        mode         VARCHAR(10)  NOT NULL DEFAULT 'diagnose',
        confidence   JSON,
        created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student (student_code),
        INDEX idx_module  (module_id),
        INDEX idx_date    (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

echo "✅ Tabelle 'results' erfolgreich erstellt.\n";
echo "⚠️  Bitte diese Datei (setup.php) jetzt vom Server löschen!\n";
