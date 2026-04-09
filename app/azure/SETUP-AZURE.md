# Azure-Integration für ZP10 Mathe-Diagnose

**Vollständige Anleitung für Schulen mit Microsoft 365 Education**

Dieses Dokument führt Sie Schritt für Schritt durch die Einrichtung der Azure-Backend für die ZP10 Mathe-Diagnose-Plattform.

## Überblick

Die Azure-Integration ermöglicht:
- ✅ Anmeldung mit Schulkonto (Microsoft 365)
- ✅ Automatische Klassenverwaltung aus Azure AD
- ✅ Sichere Datenspeicherung in der EU (Frankfurt)
- ✅ DSGVO-konforme Datenverarbeitung
- ✅ Automatische Synchronisierung
- ✅ Lehrer-Dashboard mit Analytics

**Kosten:** 0€ (mit kostenlosen Azure-Kontingenten)

---

## Schritt 1: Azure-Konto erstellen

### 1.1 Für Schulen mit Microsoft 365 Education

Wenn Ihre Schule bereits Microsoft 365 Education hat:

1. Gehen Sie zu https://portal.azure.com
2. Melden Sie sich mit Ihrem Schulkonto an
3. Azure sollte automatisch verfügbar sein
4. Falls nicht: Kontaktieren Sie Ihren IT-Administrator für Zugriff

### 1.2 Für Schulen ohne Microsoft 365

1. Gehen Sie zu https://azure.microsoft.com/de-de/free/students/
2. Melden Sie sich mit Ihrer Schul-E-Mail an
3. Wählen Sie "Für Studierende" (auch für Lehrkräfte möglich)
4. Sie erhalten 200€ Guthaben für 12 Monate (kostenlos)

### 1.3 Was Sie notieren müssen:

Speichern Sie folgende Informationen:

```
Schule: ___________________
Azure Tenant ID: ___________________
Schulkonto: ___________________@school.de
Subscription ID: ___________________
```

Sie finden diese unter:
- **Tenant ID**: Azure Portal → Azure Active Directory → Properties → Tenant ID
- **Subscription ID**: Azure Portal → Subscriptions

---

## Schritt 2: App-Registrierung in Entra ID

Entra ID (ehemals Azure AD) muss die ZP10-App kennen.

### 2.1 Neue App registrieren

1. Öffnen Sie Azure Portal: https://portal.azure.com
2. Suchen Sie nach "App Registrierungen" (App registrations)
3. Klicken Sie auf "+ Neue Registrierung"
4. Geben Sie folgende Werte ein:

```
Name: "Mathe-Check ZP10"
Unterstützte Kontotypen: Nur Konten in diesem Organisationsverzeichnis
Umleitungs-URI:
  - Web: https://yourschool.de/zp10/azure/zp10-login-azure.html
  - Single Page App (SPA): https://yourschool.de/zp10/azure/
```

Ersetzen Sie `yourschool.de` mit Ihrer Schul-Domain!

### 2.2 Client ID kopieren

1. Nach der Registrierung: Übersicht anschauen
2. Kopieren Sie: **Application (client) ID**
3. Notieren Sie:

```
Client ID: ___________________
Tenant ID: ___________________ (aus Übersicht)
```

### 2.3 App-Berechtigungen konfigurieren

1. Gehen Sie zu: App-Registrierung → API-Berechtigungen
2. Klicken Sie "+ Berechtigung hinzufügen"
3. Wählen Sie "Microsoft Graph"
4. Wählen Sie "Delegierte Berechtigungen"
5. Suchen Sie und aktivieren Sie:

```
✓ User.Read
✓ Directory.Read.All  (für Klassenabfrage)
✓ email
✓ profile
```

6. Klicken Sie "Berechtigungen hinzufügen"
7. Klicken Sie als Admin: "Administratorzustimmung für [Schule] erteilen"

### 2.4 Client Secret erstellen (für Backend)

1. Gehen Sie zu: App-Registrierung → Zertifikate & Geheimnisse
2. Klicken Sie "+ Neuen Clientgeheimnis"
3. Geben Sie ein:
   - Beschreibung: "ZP10 Backend"
   - Ablauf: "12 Monate"
4. Klicken Sie "Hinzufügen"
5. **Sofort kopieren** und speichern:

```
Client Secret: ___________________
(Das können Sie später nicht mehr sehen!)
```

---

## Schritt 3: Cosmos DB einrichten

Cosmos DB speichert alle Testergebnisse sicher in der EU.

### 3.1 Cosmos DB Account erstellen

1. Azure Portal → "Cosmos DB" suchen
2. Klicken Sie "+ Erstellen"
3. Wählen Sie:

```
Abonnement: [Ihre Subscription]
Ressourcengruppe: zp10-resources
Account-Name: zp10-[schulkürzel] (z.B. zp10-gym-bonn)
API: Core (SQL)
Notebooks: Aus
Standort: North Europe (Frankfurt) ⭐ WICHTIG FÜR DSGVO!
Kapazitätsmodus: Serverless ⭐ (kostenlos!)
```

4. Klicken Sie "Überprüfen + Erstellen"
5. Warten Sie, bis der Account erstellt ist (ca. 2-3 Minuten)

### 3.2 Datenbank und Container erstellen

1. Öffnen Sie den neu erstellten Cosmos DB Account
2. Gehen Sie zu: Daten-Explorer
3. Klicken Sie "+ Neue Datenbank"

```
Datenbank-ID: zp10
Durchsatz: [Freigegebenen Durchsatz bereitstellen - deaktivieren]
```

4. Klicken Sie "+ Neuer Container"

```
Datenbank-ID: zp10
Container-ID: results
Partitionsschlüssel: /studentId
```

5. Wiederholen Sie für zweiten Container:

```
Container-ID: students
Partitionsschlüssel: /classId
```

### 3.3 Connection String kopieren

1. Gehen Sie zu: Cosmos DB Account → Schlüssel
2. Kopieren Sie: "Primäre Verbindungszeichenfolge"

```
COSMOS_CONNECTION_STRING: ___________________
```

---

## Schritt 4: Azure Static Web Apps deployen (Optional)

Static Web Apps hostet Ihre Frontend-Dateien kostenlos.

### 4.1 GitHub Repository vorbereiten

Sie benötigen die ZP10-Dateien in einem privaten GitHub-Repository:

```
zp10-mathe-diagnose/
├── azure/
│   ├── zp10-azure-sync.js
│   ├── zp10-login-azure.html
│   ├── zp10-lehrer-azure.html
│   └── api/
└── [weitere Module]
```

### 4.2 Static Web App erstellen

1. Azure Portal → "Static Web Apps" suchen
2. Klicken Sie "+ Erstellen"
3. Geben Sie ein:

```
Ressourcengruppe: zp10-resources
Name: zp10-[schulkürzel]
Hosting-Plan: Kostenlos
Azure Functions und Staging-Details: Überspringen
```

4. Wählen Sie Ihr GitHub-Repository
5. Build-Details:

```
Org: [Ihr GitHub-Account]
Repository: zp10-mathe-diagnose
Branch: main
Build-Presets: Custom
App location: ./
API location: ./api
Output location: ./
```

6. Klicken Sie "Überprüfen + Erstellen"

### 4.3 Nach Deployment

1. Gehen Sie zu: Static Web App → Übersicht
2. Kopieren Sie: "Standard-Domain"

```
API Base URL: https://[generierte-domain].azurestaticapps.net
```

---

## Schritt 5: Konfiguration eintragen

Jetzt tragen Sie alle Informationen in die Dateien ein.

### 5.1 zp10-azure-sync.js

Öffnen Sie `azure/zp10-azure-sync.js` und tragen Sie ein (etwa Zeile 10-15):

```javascript
config: {
  clientId: 'IHRE_CLIENT_ID',
  tenantId: 'IHRE_TENANT_ID',
  apiBase: 'https://[domain].azurestaticapps.net',
  authority: 'https://login.microsoftonline.com/IHRE_TENANT_ID'
}
```

### 5.2 zp10-login-azure.html

Öffnen Sie `azure/zp10-login-azure.html` - dort können Lehrer die Konfiguration eingeben:

1. Klicken Sie "⚙️ Azure konfigurieren"
2. Geben Sie ein:
   - Client ID
   - Tenant ID
   - API Base URL
3. Klicken Sie "Speichern"

Die Konfiguration wird im Browser gespeichert.

### 5.3 Azure Function App konfigurieren

Falls Sie die API deployen:

1. Azure Portal → Function App
2. Gehen Sie zu: Configuration → Application settings
3. Klicken Sie "+ New application setting"
4. Fügen Sie ein:

```
Name: COSMOS_CONNECTION_STRING
Value: [Ihre Verbindungszeichenfolge]

Name: AZURE_TENANT_ID
Value: [Ihre Tenant ID]

Name: AZURE_CLIENT_ID
Value: [Ihre Client ID]

Name: AZURE_CLIENT_SECRET
Value: [Ihr Client Secret]
```

5. Klicken Sie "OK" und dann "Speichern"

---

## Schritt 6: Testen

### 6.1 Login-Seite testen

1. Öffnen Sie: https://yourschool.de/zp10/azure/zp10-login-azure.html
2. Klicken Sie "Mit Schulkonto anmelden"
3. Melden Sie sich mit Ihrem Schulkonto an
4. Sie sollten Ihren Namen und E-Mail-Adresse sehen

### 6.2 Lehrer-Dashboard testen

1. Falls Sie als Lehrer in Azure AD eingespeichert sind:
   - Das Dashboard sollte automatisch öffnen
   - Sie sollten Sample-Daten sehen

2. Falls Sie als Schüler erkannt werden:
   - Sie werden zum Schüler-Hub weitergeleitet
   - Das ist das erwartete Verhalten

### 6.3 Offline-Modus testen

1. Öffnen Sie DevTools (F12)
2. Gehen Sie zu Network
3. Aktivieren Sie "Offline"
4. Laden Sie die Seite neu
5. Sie sollten einen "Offline weiterarbeiten" Button sehen

### 6.4 Synchronisierung testen

1. Öffnen Sie Browser DevTools
2. Öffnen Sie die Console
3. Geben Sie ein:

```javascript
ZP10Sync.getStats()
```

Sie sollten sehen:
```
{
  synced: 0,
  pending: 0,
  failed: 0,
  lastSync: null
}
```

---

## Schritt 7: Azure AD Gruppen einrichten

So werden Lehrer automatisch erkannt:

### 7.1 "Lehrer" Gruppe erstellen

1. Azure Portal → Azure Active Directory → Gruppen
2. Klicken Sie "+ Neue Gruppe"
3. Geben Sie ein:

```
Gruppentyp: Sicherheit
Gruppennamen: Lehrer
Gruppenbeschreibung: Mathematik-Lehrkräfte
Mitgliedschaftstyp: Zugewiesen
```

4. Klicken Sie "Erstellen"

### 7.2 Lehrkräfte zur Gruppe hinzufügen

1. Öffnen Sie die neue Gruppe "Lehrer"
2. Gehen Sie zu: Mitglieder
3. Klicken Sie "+ Mitglieder hinzufügen"
4. Wählen Sie alle Mathematik-Lehrkräfte
5. Klicken Sie "Auswählen"

### 7.3 Zuweisung mit App

1. Gehen Sie zu: Enterprise-Apps
2. Suchen Sie "Mathe-Check ZP10"
3. Gehen Sie zu: Benutzer und Gruppen
4. Klicken Sie "+ Benutzer/Gruppe hinzufügen"
5. Wählen Sie die "Lehrer"-Gruppe

---

## Was Sie Ihrem IT-Administrator erklären müssen

Falls Ihre IT-Abteilung Fragen hat:

**"Wir möchten die ZP10 Mathe-Diagnose-App mit Azure AD integrieren. Das erfordert:"**

1. **Entra ID App-Registrierung**
   - Name: Mathe-Check ZP10
   - Berechtigungen: User.Read, Directory.Read.All
   - Nur für Ihre Schulorganisation
   - Delegierte Berechtigungen (kein App-only)

2. **Cosmos DB (Datenspeicherung)**
   - Standort: North Europe (Frankfurt) - EU DSGVO-konform
   - Serverless-Kapazität (automatische Skalierung)
   - Kostenlos im kostenlosen Kontingent

3. **DSGVO & Compliance**
   - Daten bleiben in Frankfurt (EU)
   - TLS-Verschlüsselung in Transit
   - 90-Tage Aufbewahrung (TTL)
   - Vollständige Audit-Logs in Application Insights
   - Keine Daten an Dritte (Microsoft behält nur Infrastruktur)

4. **Sicherheit**
   - OAuth 2.0 / OpenID Connect Standard
   - Sichere Token-Handhabung
   - Kein Speichern von Passwörtern
   - Automatische Session-Verwaltung

---

## DSGVO und Datenschutz

### Datenverarbeitung:
- **Was:** Testergebnisse, Schülernamen, E-Mails
- **Wo:** Azure Cosmos DB, Rechenzentrum Frankfurt
- **Wie lange:** 90 Tage (automatisch gelöscht)
- **Wer hat Zugriff:** Nur Ihre Schulorganisation

### Datenschutzerklärung:

Fügen Sie zu Ihrer Schulwebseite hinzu:

> "ZP10 Mathe-Diagnose nutzt Microsoft Azure zur Datenspeicherung. Alle Daten werden verschlüsselt und in Frankfurt (EU) gespeichert. Weitere Informationen siehe [Link zur Datenschutzerklärung]. Die Verarbeitung erfolgt nach DSGVO."

### Schulvereinbarung (AVV):

Microsoft und Ihre Schule müssen eine "Auftragsverarbeitungsvereinbarung" (AVV) haben. Diese sollte Ihrem IT-Administrator bekannt sein:

- **Für Microsoft 365**: Existiert bereits
- **Für Azure**: Ist automatisch enthalten

Fragen Sie Ihren IT-Administrator, falls die AVV fehlt.

---

## Häufig gestellte Fragen

### F: Kostet das etwas?
A: Nein! Das kostenlose Azure-Kontingent deckt typische Schulen ab:
- Cosmos DB: 400 RU/s kostenlos
- Static Web Apps: kostenlos
- Azure Functions: 1 Mio. Anfragen kostenlos

**Geschätzter Verbrauch für 5 Schulen à 100 Schüler:**
- ~1.000.000 Anfragen/Monat
- ~50 GB Speicher
- **Kosten: 0€** ✅

### F: Was passiert, wenn die Schule Microsoft 365 kündigt?
A:
- Die Azure AD bleibt bestehen (unabhängig)
- Sie müssen ein separates Azure-Konto erstellen
- Oder: Migrieren Sie zu einem anderen IdP

### F: Können Schüler zu Hause arbeiten?
A: Ja!
- Mit Schulkonto: Automatische SSO
- Ohne Schulkonto: Offline-Modus mit lokalem Speicher
- Wenn online: Automatische Synchronisierung

### F: Wie sicher sind die Daten?
A:
- TLS 1.2+ Verschlüsselung
- Azure Cosmos DB hat 99,999% Verfügbarkeit
- Automatische Backups
- DSGVO-konform (Frankfurt)
- Keine Weitergabe an Dritte

### F: Was wenn ein Schüler seine Daten löschen möchte?
A: Sie können das DELETE-Endpoint aufrufen:
```
DELETE /api/student/{studentId}
```
Alle Daten werden sofort gelöscht.

### F: Kann ich die App auch lokal (ohne Azure) nutzen?
A: Ja!
- Die App funktioniert auch mit nur localStorage
- Ohne Azure-Konfiguration: Nur lokaler Modus
- Limit: Nur auf einem Gerät nutzbar

---

## Troubleshooting

### Login funktioniert nicht

**Symptom:** "Fehler beim Anmelden"

**Lösung:**
1. Überprüfen Sie, ob Client ID richtig eingegeben ist
2. Überprüfen Sie, ob Tenant ID richtig eingegeben ist
3. Überprüfen Sie die Redirect-URI in Azure Portal (muss exakt passen)
4. Browser-Cache leeren (Strg+Shift+Del)
5. Andere Browser testen (Chrome, Firefox)

### Daten werden nicht synchronisiert

**Symptom:** Gelbe Sync-Anzeige, "ausstehend"

**Lösung:**
1. Überprüfen Sie Internetverbindung
2. Überprüfen Sie Browser-Konsole (F12 → Console)
3. Überprüfen Sie, ob API URL korrekt ist
4. Überprüfen Sie Azure Function Logs

### Klassenabfrage funktioniert nicht

**Symptom:** "Klassen konnten nicht abgerufen werden"

**Lösung:**
1. Überprüfen Sie, ob "Directory.Read.All" Berechtigung erteilt ist
2. Überprüfen Sie, ob der Benutzer eine Lehrkraft ist
3. Überprüfen Sie, ob Gruppen in Azure AD erstellt sind

### Cosmic DB gibt Fehler

**Symptom:** "Datenbankfehler 400/401"

**Lösung:**
1. Überprüfen Sie Connection String (keine Leerzeichen!)
2. Überprüfen Sie, ob Cosmos DB Account aktiv ist
3. Überprüfen Sie, ob Datenbank und Container existieren
4. Überprüfen Sie Application Insights Logs

---

## Performance & Limits

Typische Belastungen:

```
Szenarien:           Kosten/Monat:
1 Schule (100 Schüler)     0€
5 Schulen (500 Schüler)    0€
10 Schulen (1000 Schüler)  0€
50 Schulen (5000 Schüler)  ~15€
```

Wenn Sie über das kostenlose Kontingent hinausgehen:
1. Sie werden benachrichtigt
2. Sie können Durchsatz reduzieren
3. Oder: Upgrade zu zahlendem Plan

---

## Nächste Schritte

Nach erfolgreichem Aufbau:

1. **Schülerdaten importieren**
   - Lehrer-Dashboard → Export → JSON importieren
   - Oder: Automatisch aus Azure AD auslesen

2. **Auf allen Schüler-PCs verteilen**
   - QR-Code zu zp10-hub.html
   - Shortcut auf Desktop

3. **Lehrkräfte schulen**
   - Demo im Lehrer-Dashboard
   - Wie man Ergebnisse anschaut
   - Wie man Förderempfehlungen nutzt

4. **Regelmäßige Backups**
   - Lehrer-Dashboard → CSV exportieren
   - Monatlich speichern

5. **Monitoring**
   - Azure Portal → Application Insights
   - Fehlerrate überwachen
   - Performance-Metriken checken

---

## Support & Kontakt

**Dokumentation:** [Link zur Dokumentation]

**GitHub Issues:** [Link zum Projekt]

**Azure Support:** https://portal.azure.com → Hilfe + Support

**Microsoft Support:** https://support.microsoft.com/de-de/

---

## Version

- **Version:** 1.0
- **Datum:** März 2024
- **Status:** ✅ Produktiv
- **Zuletzt aktualisiert:** 28.03.2024

---

**Viel Erfolg mit ZP10! 📊📚**

Bei Fragen: Schauen Sie in die Troubleshooting-Sektion oder kontaktieren Sie Ihren IT-Administrator.
