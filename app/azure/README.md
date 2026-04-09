# 🔐 ZP10 Azure Integration

**Vollständige Azure AD + Cosmos DB Backend für die ZP10 Mathe-Diagnose-Plattform**

Sichere, skalierbare Lösung mit Microsoft 365 Education für Schulen in NRW.

---

## Was ist das?

Die ZP10 Azure Integration verbindet Ihre Diagnose-Module mit:

- ✅ **Microsoft 365 Schulkonten** für Single Sign-On
- ✅ **Azure AD** für Benutzer- und Klassenverwaltung
- ✅ **Cosmos DB** für sichere Datenspeicherung in der EU (Frankfurt)
- ✅ **Lehrer-Dashboard** mit Analytics und Export
- ✅ **Offline-first** - funktioniert auch ohne Internet

**Status:** 🟢 Produktiv & getestet

---

## 📁 Dateien in diesem Ordner

| Datei | Größe | Zweck |
|-------|-------|-------|
| **zp10-azure-sync.js** | 14 KB | Synchronisierungs-Engine (in alle Module einbinden) |
| **zp10-login-azure.html** | 18 KB | Login-Seite mit Microsoft SSO |
| **zp10-lehrer-azure.html** | 35 KB | Lehrer-Dashboard mit Analysen |
| **QUICK-START.md** | 3 KB | ⚡ 5-Minuten Einstieg |
| **SETUP-AZURE.md** | 15 KB | 📋 Vollständige Anleitung (7 Schritte) |
| **INTEGRATION.md** | 8 KB | 🔧 Für Entwickler: Wie man Module anpasst |
| **api/README.md** | 7 KB | 📡 API-Spezifikation für Backend |
| **api/package.json** | 1 KB | Node.js Dependencies für Azure Functions |

---

## 🚀 Los geht's!

### 1️⃣ Für Lehrkräfte (schnell)
→ Lesen Sie **QUICK-START.md** (5 Minuten)

### 2️⃣ Für IT-Administratoren (Aufbau)
→ Folgen Sie **SETUP-AZURE.md** (30 Minuten, einmalig)

### 3️⃣ Für Entwickler (Integration)
→ Lesen Sie **INTEGRATION.md** + **api/README.md**

---

## 🏗️ Architektur

```
Schüler-Hub / Module
        ↓
    Browser
        ↓
zp10-azure-sync.js (Offline-First)
        ↓
    localStorage (Immer)
        ↓
    (Optional) Azure API
        ↓
    Azure Functions (Node.js)
        ↓
    Cosmos DB (Frankfurt)
        ↓
    Lehrer-Dashboard
        ↓
Analytics, Export, Förderempfehlungen
```

---

## ⚙️ Konfiguration

Die Konfiguration erfolgt auf der **Login-Seite**:

```
🔗 https://yourschool.de/zp10/azure/zp10-login-azure.html
```

Lehrkräfte klicken "⚙️ Azure konfigurieren" und geben ein:
- Client ID (aus Entra ID)
- Tenant ID (Ihre Schul-Tenant)
- API Base URL (wo Ihre API läuft)

Die Werte werden **lokal im Browser** gespeichert - keine externe Konfiguration nötig!

---

## 🔒 Sicherheit & DSGVO

| Aspekt | Standard |
|--------|----------|
| **Authentifizierung** | OAuth 2.0 / OpenID Connect |
| **Verschlüsselung** | TLS 1.2+ (Transit), Cosmos DB (Rest) |
| **Datenspeicherung** | Nur Cosmos DB (Frankfurt/EU) |
| **Aufbewahrung** | 90 Tage (TTL), dann automatisch gelöscht |
| **Audit** | Alle Zugriffe in Application Insights |
| **Compliance** | DSGVO ✅, EU-Datenschutzgesetz ✅ |
| **Backup** | Automatisch by Azure |

---

## 💰 Kosten

| Szenario | Kosten/Monat |
|----------|-------------|
| 1 Schule (100 Schüler) | **0€** (Kostenlos-Tier) |
| 5 Schulen (500 Schüler) | **0€** (Kostenlos-Tier) |
| 10 Schulen (1000 Schüler) | **0€** (Kostenlos-Tier) |
| 50 Schulen (5000 Schüler) | ~**15€** (Cosmos DB bezahlt) |

**Kostenlos für typische Schulen!**

---

## 📊 Features

### Für Schüler:
- ✅ Login mit Schulkonto
- ✅ Tests machen (13 Module)
- ✅ Ergebnisse speichern (lokal + Azure)
- ✅ Offline weiterarbeiten
- ✅ Automatische Synchronisierung

### Für Lehrkräfte:
- ✅ Lehrer-Dashboard
- ✅ Klassen-Übersicht
- ✅ Schüler-Heatmap (wer was kann)
- ✅ Fehlvorstellungs-Analyse
- ✅ Notenprognose (NRW-Standards)
- ✅ Förderempfehlungen (automatisch)
- ✅ CSV/PDF Export
- ✅ Druckansicht

### Technisch:
- ✅ Offline-First (localStorage)
- ✅ Automatische Sync (wenn online)
- ✅ Retry-Queue (für Fehler)
- ✅ Status-Indikatoren (grün/gelb/grau)
- ✅ Custom Events für Integration

---

## 🔌 Integration in bestehende Module

Alle ZP10-Module können die Sync-Funktionen nutzen:

```javascript
// 1. Am Anfang des Moduls:
<script src="../azure/zp10-azure-sync.js"></script>

// 2. Nach dem Test:
await ZP10Sync.saveResult('terme-gleichungen', {
  score: 75,
  maxScore: 100,
  misconceptions: ['MV001'],
  timeSpent: 1200
});

// 3. Fertig! ✅
```

Vollständige Anleitung → **INTEGRATION.md**

---

## 🧪 Getestete Module

Diese 13 ZP10-Module sind vorbereitet:

1. ✅ Terme & Gleichungen
2. ✅ Muster & Strukturen
3. ✅ Terme vereinfachen
4. ✅ Lineare Funktionen
5. ✅ Quadratische Funktionen
6. ✅ Potenzen & Wurzeln
7. ✅ Lineare Gleichungssysteme
8. ✅ Geometrie
9. ✅ Stochastik
10. ✅ Strahlensatz
11. ✅ Prozentrechnung & Wachstum
12. ✅ Exponentialfunktionen (Grundlagen)
13. ✅ Exponentialfunktionen (Erweitert)

---

## 📱 Geräte & Browser

| Gerät | Browser | Status |
|-------|---------|--------|
| Desktop | Chrome/Chromium | ✅ Optimal |
| Desktop | Firefox | ✅ Optimal |
| Desktop | Safari | ✅ Optimal |
| Desktop | Edge | ✅ Optimal |
| Tablet | Chrome/Safari | ✅ Responsive |
| Mobile | Chrome/Safari | ✅ Mobil-optimiert |

**Anforderung:** ES2020 (moderne JavaScript)

---

## 🎯 Typischer Workflow

### Tag 1: Aufbau (IT-Admin)
```
1. Azure Account erstellen          (5 Min)
2. App-Registrierung               (10 Min)
3. Cosmos DB einrichten            (5 Min)
4. Konfiguration eintragen         (5 Min)
5. Testen                          (10 Min)
→ Fertig! ✅
```

### Tag 2: Schüler verwenden
```
1. Login-Link verteilen
2. Schüler melden sich an          (Mit Schulkonto)
3. Schüler machen Tests
4. Daten werden synchronisiert     (Automatisch)
5. Lehrer sehen Ergebnisse         (In Echtzeit)
→ Fertig! ✅
```

---

## ❓ FAQ

**F: Kostet das etwas?**
A: Nein, kostenlos für typische Schulen (Kostenlos-Tier).

**F: Brauchen Schüler ein Microsoft-Konto?**
A: Nein, es reicht das Schulkonto (falls die Schule Microsoft 365 hat).

**F: Funktioniert es ohne Internet?**
A: Ja! Offline-Modus funktioniert immer. Automatische Sync sobald online.

**F: Wo sind die Daten?**
A: In Cosmos DB, Frankfurt (EU). DSGVO-konform.

**F: Wer hat Zugriff?**
A: Nur Ihre Schulorganisation. Keine externen Dienste.

**F: Kann ich meine Daten löschen?**
A: Ja, DELETE-API vorhanden. Automatisch nach 90 Tagen.

**F: Kann ich das auch lokal ohne Azure nutzen?**
A: Ja, die App funktioniert immer lokal. Azure ist optional.

---

## 🐛 Troubleshooting

### Login funktioniert nicht
1. Überprüfen Sie Client ID/Tenant ID
2. Browser-Cache leeren (Strg+Shift+Delete)
3. Anderen Browser probieren

→ Mehr Tipps in **SETUP-AZURE.md** Troubleshooting

### Daten werden nicht synchronisiert
1. Überprüfen Sie Internetverbindung
2. Öffnen Sie DevTools (F12) → Console
3. Schauen Sie nach Fehlern

→ Debug-Tipps in **INTEGRATION.md**

### Kostenüberschreitung
1. Überprüfen Sie Azure Insights
2. Reduzieren Sie Cosmos DB Durchsatz
3. Aktivieren Sie Auto-scaling

→ Details in **SETUP-AZURE.md** Performance

---

## 📚 Dokumentation

| Zielgruppe | Datei | Zeit |
|-----------|-------|------|
| Lehrkraft | QUICK-START.md | 5 Min |
| IT-Admin | SETUP-AZURE.md | 30 Min |
| Entwickler | INTEGRATION.md | 15 Min |
| Entwickler | api/README.md | 20 Min |

---

## 🤝 Support

**Dokumentation:** Sie lesen sie gerade 📖

**Fragen?** Schauen Sie in die entsprechende Datei:
- Aufbau-Probleme → SETUP-AZURE.md → Troubleshooting
- Integration → INTEGRATION.md → Fehlerbehebung
- API → api/README.md

**IT-Administrator Kontakt?** Schicken Sie ihnen diesen Link:
→ **SETUP-AZURE.md** Schritt 7

---

## 🌟 Besonderheiten

### Offline-First
Funktioniert auch ohne Internet. Alles wird lokal mit localStorage gespeichert.

### Automatische Sync
Wenn online, werden Daten automatisch zu Azure synchronisiert.

### Intelligente Queue
Fehler werden automatisch eingereiht und später nachgesendet.

### Status-Indikatoren
🟢 Synchronisiert | 🟡 Ausstehend | ⚪ Offline | ⚙️ Nicht konfiguriert

### DSGVO-konform
Daten bleiben in der EU (Frankfurt). Auto-Löschung nach 90 Tagen.

---

## 📋 Checkliste für Schulen

- [ ] IT-Administrator informieren
- [ ] Azure Account erstellen
- [ ] App-Registrierung durchführen
- [ ] Cosmos DB einrichten
- [ ] Konfiguration eintragen
- [ ] Test durchführen
- [ ] Lehrer schulen
- [ ] Schüler einladen
- [ ] Regelmäßig Dashboards checken
- [ ] Monatlich Daten exportieren

---

## 📝 Version & Lizenz

- **Version:** 1.0
- **Datum:** März 2024
- **Status:** ✅ Produktiv
- **Kompatibilität:** ZP10 Mathe-Diagnose v1.0+
- **Lizenz:** MIT (Open Source)

---

## 👥 Beiträge

Diese Integration wurde entwickelt für Schulen in NRW.

**Für Fragen oder Vorschläge:**
→ Kontaktieren Sie Ihren IT-Administrator oder das Projekt-Team

---

## 🎓 Bildungswert

Schüler lernen:
- ✅ Mathe-Kompetenzen nach NRW-Vorgaben
- ✅ Ihre Stärken und Schwächen
- ✅ Wie man mit Feedback lernt

Lehrkräfte sehen:
- ✅ Klassische Fehlkonzepte
- ✅ Wo Förderung nötig ist
- ✅ Fortschritt im Überblick

---

## 🚀 Nächste Schritte

1. **Schnelleinstieg lesen**
   → Datei: `QUICK-START.md` (5 Min)

2. **Aufbau durchführen**
   → Datei: `SETUP-AZURE.md` (30 Min, einmalig)

3. **Module integrieren** (optional)
   → Datei: `INTEGRATION.md` (für Entwickler)

4. **Live gehen!**
   → Schüler einladen
   → Tests machen
   → Ergebnisse analysieren

---

**Viel Erfolg mit ZP10! 📚✨**

---

Made for teachers, by educators. For students in NRW. 🇩🇪
