# Integration der Azure-Funktionen in bestehende ZP10-Module

**Anleitung, wie Sie ZP10Sync in Ihre vorhandenen Diagnose-Module integrieren.**

---

## Überblick

Alle ZP10-Module können die Azure-Synchronisierung mit nur 3 Zeilen Code nutzen:

```html
<!-- Am Ende von jedem Diagnose-Modul einfügen: -->

<!-- 1. Sync-Modul laden -->
<script src="../azure/zp10-azure-sync.js"></script>

<!-- 2. Nach dem Test speichern -->
<script>
  async function saveToAzure() {
    const result = {
      score: 75,
      maxScore: 100,
      answers: {...},
      misconceptions: ['MV001', 'MV002'],
      timeSpent: 1200 // Sekunden
    };

    await ZP10Sync.saveResult('terme-gleichungen', result);
  }
</script>
```

Das ist alles! Die Daten werden:
- ✅ Zuerst lokal gespeichert (localStorage)
- ✅ Dann zu Azure synchronisiert (falls online)
- ✅ Bei Fehler automatisch in eine Queue eingereiht
- ✅ Später automatisch nachgesendet (wenn online)

---

## Integration in bestehende Module

### Schritt 1: Sync-Skript laden

Am Anfang Ihres HTML-Moduls (im `<head>`), nach allen anderen Scripts:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  ...
  <!-- Ihre anderen Scripts -->
  <script src="..." ></script>

  <!-- Azure Sync - HIER EINFÜGEN -->
  <script src="../azure/zp10-azure-sync.js"></script>
</head>
<body>
  ...
</body>
</html>
```

**WICHTIG:** Der Pfad muss korrekt sein!
- Falls Ihr Modul ist: `terme-gleichungen.html`
- Dann der Pfad: `../azure/zp10-azure-sync.js`
- Falls im Subfolder: `../../azure/zp10-azure-sync.js`

### Schritt 2: Ergebnis speichern

In Ihrer Test-Abschluss-Funktion:

```javascript
// Beispiel aus einem bestehenden Modul
async function submitTest() {
  // Ihre bestehende Code: Berechnung von Punkten etc.
  const score = calculateScore();
  const maxScore = 100;

  // NEW: Mit Azure synchronisieren
  const result = {
    score: score,
    maxScore: maxScore,
    answers: userAnswers,
    misconceptions: detectedMisconceptions,
    timeSpent: Math.round(testDuration / 1000) // in Sekunden
  };

  // Modul-ID muss korrekt sein!
  const moduleId = 'terme-gleichungen'; // Anpassen!

  const syncResult = await ZP10Sync.saveResult(moduleId, result);

  // Optional: Feedback geben
  if (syncResult.synced) {
    console.log('✓ Ergebnis synchronisiert');
  } else if (syncResult.queued) {
    console.log('⏳ Ergebnis gespeichert, wird synchronisiert...');
  } else {
    console.log('❌ Fehler beim Speichern:', syncResult.error);
  }

  // Weiter zur Ergebnis-Anzeige...
  showResults(score, maxScore);
}
```

### Schritt 3: Sync-Status anzeigen (Optional)

Um einen Status-Indicator im Modul anzuzeigen:

```html
<!-- Im Modul HTML -->
<div id="syncIndicator" style="position: fixed; bottom: 20px; right: 20px;"></div>

<script>
  // Initialisierung
  document.addEventListener('DOMContentLoaded', () => {
    // Sync-Status anzeigen
    ZP10Sync.showSyncStatus('syncIndicator');

    // Auf Status-Änderungen hören
    window.addEventListener('zp10-sync-status', (e) => {
      const { event, data } = e.detail;
      if (event === 'sync-complete') {
        console.log(`${data.synced} Ergebnisse synchronisiert`);
      }
    });
  });
</script>
```

---

## Modul-ID-Liste

Verwenden Sie diese Werte in `saveResult(moduleId, ...)`:

```javascript
// 13 Module für ZP10 Mathe NRW

'terme-gleichungen'           // Terme & Gleichungen
'terme-muster'               // Muster & Strukturen
'terme-vereinfachen'         // Terme vereinfachen
'lineare-funktionen'         // Lineare Funktionen
'quadratische-funktionen'    // Quadratische Funktionen
'potenzen-wurzeln'          // Potenzen & Wurzeln
'lgs'                        // Lineare Gleichungssysteme
'geometrie'                  // Geometrie
'stochastik'                 // Stochastik/Wahrscheinlichkeit
'strahlensatz'               // Strahlensatz
'prozent-wachstum'           // Prozentrechnung & Wachstum
'expo-grundlagen'            // Exponentielles Wachstum Grundlagen
'exponentialfunktionen'      // Exponentialfunktionen
```

---

## Fehlvorstellungen (Misconceptions) erfassen

Falls Ihre Module Fehlvorstellungen erkennen, übergeben Sie diese:

```javascript
const misconceptions = [
  'MV001', // Schüler multipliziert Nenner statt gemeinsamen Nenner
  'MV002', // Schüler verwechselt Steigung mit y-Achsenabschnitt
];

const result = {
  score: 60,
  maxScore: 100,
  misconceptions: misconceptions,
  // ... weitere Felder
};

await ZP10Sync.saveResult('terme-gleichungen', result);
```

Falls keine Fehlvorstellungen erkannt wurden:
```javascript
const result = {
  score: 85,
  maxScore: 100,
  misconceptions: [],
  // ...
};
```

---

## Existierende Module anpassen

Hier sind die Dateien, die Sie wahrscheinlich haben:

```
Mathe-Diagnose/
├── terme-muster-diagnose.html
├── terme-vereinfachen-diagnose.html
├── strahlensatz-diagnose.html
├── expo-diagnose.html
├── exponentialfunktionen.html
└── ... [weitere Module]
```

### Beispiel: terme-muster-diagnose.html anpassen

Suchen Sie diese Stelle im Modul:

```javascript
// VORHER: Nur localStorage
function submitTest() {
  const score = calculateScore();
  // Lokal speichern
  localStorage.setItem('test_result', JSON.stringify({
    score: score,
    timestamp: new Date().toISOString()
  }));

  showResults(score);
}
```

Ändern Sie zu:

```javascript
// NACHHER: Mit Azure Sync
async function submitTest() {
  const score = calculateScore();

  // Mit Azure synchronisieren
  const result = {
    score: score,
    maxScore: 100,
    answers: userAnswers,
    misconceptions: [],
    timeSpent: Math.round((new Date() - testStartTime) / 1000)
  };

  const syncResult = await ZP10Sync.saveResult('terme-muster', result);

  // Optional: Status zeigen
  console.log('Gespeichert:', syncResult);

  showResults(score);
}
```

---

## Fehlerbehebung bei Integration

### Problem: "ZP10Sync is not defined"

**Ursache:** Skript wird nicht geladen

**Lösung:**
1. Überprüfen Sie den Pfad zu `zp10-azure-sync.js`
2. Überprüfen Sie, ob die Datei existiert
3. Öffnen Sie DevTools (F12) → Console
4. Schauen Sie nach Fehlermeldungen

```html
<!-- Debuggen: -->
<script src="../azure/zp10-azure-sync.js"></script>
<script>
  console.log('ZP10Sync', typeof ZP10Sync); // Sollte "object" sein
</script>
```

### Problem: Daten werden nicht synchronisiert

**Ursache:** Azure nicht konfiguriert, oder keine Internetverbindung

**Lösung:**
1. Überprüfen Sie die Konfiguration in der Login-Seite
2. Überprüfen Sie, ob Sie online sind
3. Öffnen Sie DevTools → Network
4. Sehen Sie sich die Request an

```javascript
// Debugging:
console.log('Offline?', !navigator.onLine);
console.log('Konfiguriert?', ZP10Sync.config);
console.log('Stats:', ZP10Sync.getStats());
```

### Problem: Module-ID ist falsch

**Symptom:** Daten werden gespeichert, aber erscheinen nicht im Lehrer-Dashboard

**Lösung:**
- Überprüfen Sie die Module-ID gegen die Liste oben
- Stelle sicher, dass sie exakt (Bindestriche!) ist
- Beispiel: `'quadratische-funktionen'` (nicht `'quadratische_funktionen'`)

---

## Lokaler Testmodus

Falls Sie noch keine Azure konfiguriert haben, funktioniert alles im reinen Offline-Modus:

```javascript
// Diese Code funktioniert IMMER - auch ohne Azure
await ZP10Sync.saveResult('terme-gleichungen', {
  score: 75,
  maxScore: 100
});

// Daten sind lokal in localStorage
const hubData = JSON.parse(localStorage.getItem('zp10_hub_data'));
console.log('Lokale Daten:', hubData);
```

Wenn Sie später Azure aktivieren:
1. Konfigurieren Sie auf der Login-Seite
2. Die lokalen Daten werden automatisch hochgeladen
3. Keine Neuarbeit nötig!

---

## Best Practices

### 1. Module-ID konsistent halten

```javascript
// FALSCH:
await ZP10Sync.saveResult('terme-gleichungen', ...);
await ZP10Sync.saveResult('Terme Gleichungen', ...);
await ZP10Sync.saveResult('terme_gleichungen', ...);

// RICHTIG:
const MODULE_ID = 'terme-gleichungen'; // Konstante
await ZP10Sync.saveResult(MODULE_ID, ...);
```

### 2. Fehlerbehebung einbauen

```javascript
async function submitTest() {
  try {
    const result = { score: 75, maxScore: 100 };
    const syncResult = await ZP10Sync.saveResult('terme-gleichungen', result);

    if (!syncResult.success) {
      console.warn('Warnung: Sync-Problem', syncResult.error);
      // Trotzdem weitermachen - Daten sind lokal gespeichert
    }
    showResults(75);
  } catch (error) {
    console.error('Unerwarteter Fehler:', error);
    showResults(75); // Fallback
  }
}
```

### 3. Debugging aktivieren

```javascript
// Am Anfang Ihres Moduls:
window.DEBUG_ZP10 = true;

// Dann überall in Ihrem Code:
if (window.DEBUG_ZP10) {
  console.log('Modul-ID:', 'terme-gleichungen');
  console.log('Ergebnis:', result);
  console.log('Sync-Status:', ZP10Sync.getStats());
}
```

### 4. Zeiterfassung

```javascript
// Am Anfang des Tests
const testStartTime = new Date();

// Am Ende:
const timeSpent = Math.round((new Date() - testStartTime) / 1000);
const result = {
  score: 75,
  maxScore: 100,
  timeSpent: timeSpent // in Sekunden
};

await ZP10Sync.saveResult('terme-gleichungen', result);
```

---

## API der ZP10Sync Funktion

Hier die wichtigsten Funktionen:

```javascript
// Initialisierung
ZP10Sync.init(config);

// Login/Authentifizierung
await ZP10Sync.login();
ZP10Sync.getUser();
await ZP10Sync.logout();

// Ergebnisse speichern
await ZP10Sync.saveResult(moduleId, data);

// Status
ZP10Sync.isOnline();
ZP10Sync.getStats();
ZP10Sync.showSyncStatus(containerId);

// Events
window.addEventListener('zp10-sync-status', (e) => {
  console.log(e.detail.event, e.detail.data);
});
```

---

## Checkliste für Integration

- [ ] `zp10-azure-sync.js` in HTML eingefügt
- [ ] Modul-ID eingespeichert und überprüft
- [ ] `saveResult()` nach Test-Abschluss aufgerufen
- [ ] Ergebnis-Datenstruktur korrekt (score, maxScore, etc.)
- [ ] Offline-Modus getestet (DevTools → Offline)
- [ ] Online-Synchronisierung getestet
- [ ] Im Lehrer-Dashboard Ergebnisse sichtbar
- [ ] Fehlerbehandlung eingebaut

---

## Support

**Fragen zur Integration?**

1. Überprüfen Sie die Errors in der Browser-Console (F12)
2. Lesen Sie die Debugging-Tipps oben
3. Schauen Sie in die Hauptdokumentation
4. Kontaktieren Sie den Support

**Beispiel-Code funktioniert nicht?**

Überprüfen Sie:
- Pfade zu Dateien korrekt?
- JavaScript-Syntax richtig?
- Browser-Kompatibilität (moderne Browser nötig)
- Keine Namespace-Konflikte mit anderen Libraries?

---

## Version

- **Erstellt:** März 2024
- **Für:** ZP10 Mathe-Diagnose v1.0+
- **Kompatibilität:** Alle Browser ab ES2020

---

**Happy integrating! 🚀**
