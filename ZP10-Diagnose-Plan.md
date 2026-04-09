# ZP10 Diagnose-App — Projektplan

## Überblick

Eine umfassende Diagnose-Plattform zur ZP10-Vorbereitung (Gymnasium NRW), bestehend aus **Login-System**, **Schüler-Hub**, **8 Themen-Modulen**, einem **Prüfungssimulator** und einem **Lehrerbereich** mit Klassenverwaltung und Analyse.

**Backend:** Firebase (Authentication + Firestore + Hosting)

---

## Architektur

```
Firebase Backend
├── Authentication (E-Mail/Passwort + Google SSO)
├── Firestore Database
│   ├── users/{uid}           → Profil (Rolle: schüler/lehrer, Name, Klasse)
│   ├── classes/{classId}     → Klasse (Name, Lehrer-UID, Schüler-UIDs)
│   ├── results/{uid}/modules/{moduleId}  → Diagnoseergebnis pro Modul
│   ├── results/{uid}/exams/{examId}      → Prüfungssimulation-Ergebnis
│   └── custom_questions/{classId}/{moduleId}  → Lehrer-eigene Fragen
└── Hosting (Static Files)

Frontend (Single-Page-Apps)
├── Login / Registrierung
├── Schüler-Hub (Dashboard)
│   ├── 8 Themen-Module (je eine Diagnose-App)
│   │   ├── Modul 1: Terme & Gleichungen
│   │   ├── Modul 2: Lineare Funktionen
│   │   ├── Modul 3: Quadratische Funktionen
│   │   ├── Modul 4: Potenzen & Wurzeln
│   │   ├── Modul 5: Lineare Gleichungssysteme
│   │   ├── Modul 6: Geometrie (Körper, Pythagoras, Trigonometrie)
│   │   ├── Modul 7: Stochastik
│   │   └── Modul 8: Prozent- & Zinsrechnung / Wachstum
│   └── Prüfungssimulator
│       ├── Teil 1 – ohne Taschenrechner (30 Min)
│       └── Teil 2 – mit Taschenrechner (90 Min)
└── Lehrerbereich
    ├── Klassenübersicht & Verwaltung
    ├── Schüler-Einzelansicht
    ├── Klassenstatistiken & Heatmap
    ├── Fördergruppen-Vorschlag
    ├── Aufgaben-Editor (eigene Fragen)
    ├── Module freischalten/sperren
    └── Export (CSV / PDF)
```

---

## 1. Login & Rollensystem

### Login-Seite (`zp10-login.html`)
- E-Mail / Passwort Login
- Google-SSO (für Schulen mit Google Workspace)
- Registrierung mit Rollenauswahl: **Schüler** oder **Lehrer**
- Schüler: Bei Registrierung Klassen-Code eingeben (vom Lehrer generiert)
- Lehrer: Bei Registrierung Verifizierung (z.B. Schul-E-Mail-Domain)
- "Passwort vergessen"-Funktion via Firebase Auth

### Rollen
| Rolle | Zugriff |
|---|---|
| **Schüler** | Hub, Module, Prüfungssimulator, eigenes Profil |
| **Lehrer** | Alles oben + Lehrerbereich, Klassenverwaltung, Aufgaben-Editor |

### Firebase Security Rules
- Schüler können nur eigene Ergebnisse lesen/schreiben
- Lehrer können Ergebnisse aller Schüler ihrer Klassen lesen
- Nur Lehrer können Klassen erstellen und Module freischalten

---

## 2. Schüler-Hub / Dashboard

**Datei:** `zp10-hub.html`

### Features
- **Begrüßung** mit Schülername (aus Firebase-Profil)
- **Themen-Kacheln** mit Fortschrittsanzeige (Ampel: rot/gelb/grün je nach Diagnoseergebnis)
- **Gesamtfortschritt** über alle Module (Prozentbalken + XP-Gesamt)
- **Prüfungscountdown** bis zum ZP10-Termin (Mai 2026)
- **Lernpfad-Empfehlung:** Nach abgeschlossener Diagnose werden Module nach Dringlichkeit sortiert
- **Rang-Anzeige:** Aktueller Rang + Fortschritt zum nächsten
- **Letzte Aktivität:** Zeigt an, wann welches Modul zuletzt bearbeitet wurde
- **Gesperrte Module:** Vom Lehrer gesperrte Module werden ausgegraut mit Hinweis

### Datenfluss
- Ergebnisse werden in **Firestore** gespeichert (nicht nur localStorage)
- localStorage als Offline-Cache / Fallback
- Sync beim Laden: Firebase → localStorage

---

## 2. Themen-Module (8 Stück)

Jedes Modul basiert auf dem **erweiterten diagnose-template** und enthält:
- 10 Fehlvorstellungen (MV)
- 20–28 Fragen (MC, TF, Input)
- KLP-Kompetenzanbindung (K1–K6)
- Förder-Level mit 3 Aufgaben pro erkannter Fehlvorstellung
- Ergebnis-Export (PDF)

### Modul 1: Terme & Gleichungen
**Datei:** `zp10-terme-gleichungen.html`
| MV | Fehlvorstellung |
|---|---|
| M1 | Klammern falsch auflösen (Distributivgesetz) |
| M2 | Vorzeichen beim Ausmultiplizieren verloren |
| M3 | Äquivalenzumformung: auf beiden Seiten dasselbe tun |
| M4 | Division durch Variable ohne Fallunterscheidung (x≠0) |
| M5 | Binomische Formeln falsch angewendet ((a+b)² ≠ a²+b²) |
| M6 | Gleichung vs. Term verwechselt |
| M7 | Bruchgleichungen: Definitionsmenge vergessen |
| M8 | Faktorisieren / Ausklammern nicht erkannt |
| M9 | Quadratische Ergänzung fehlerhaft |
| M10 | p-q-Formel: Vorzeichen falsch eingesetzt |

### Modul 2: Lineare Funktionen
**Datei:** `zp10-lineare-funktionen.html`
| MV | Fehlvorstellung |
|---|---|
| M1 | Steigung m und y-Achsenabschnitt b verwechselt |
| M2 | Steigung als "Höhe" statt Δy/Δx verstanden |
| M3 | Negative Steigung nicht erkannt / falsch abgelesen |
| M4 | Steigungsdreieck falsch gezeichnet (Δx und Δy vertauscht) |
| M5 | Parallele Geraden: gleiche Steigung nicht erkannt |
| M6 | Schnittpunkt zweier Geraden falsch berechnet |
| M7 | Funktionsgleichung aus zwei Punkten: falscher Ansatz |
| M8 | Nullstelle mit y-Achsenabschnitt verwechselt |
| M9 | Proportionale vs. lineare Funktion verwechselt |
| M10 | Sachkontext: Variable x falsch zugeordnet |

### Modul 3: Quadratische Funktionen
**Datei:** `zp10-quadratische-funktionen.html`
| MV | Fehlvorstellung |
|---|---|
| M1 | Scheitelpunkt aus f(x)=a(x−d)²+e falsch abgelesen (Vorzeichen d) |
| M2 | Streckfaktor a: Einfluss auf Öffnung nicht verstanden |
| M3 | Normalform → Scheitelpunktform: quadratische Ergänzung fehlerhaft |
| M4 | Nullstellen: p-q-Formel Vorzeichen falsch |
| M5 | Diskriminante: keine Lösung bedeutet nicht "Fehler" |
| M6 | Symmetrieachse nicht als x = d erkannt |
| M7 | Verschiebung in x-Richtung: Vorzeichen-Irrtum (x−3 verschiebt nach rechts) |
| M8 | y-Achsenabschnitt: f(0) nicht berechnet |
| M9 | Parabel "schneidet" x-Achse vs. "berührt" (einfache/doppelte Nullstelle) |
| M10 | Sachaufgaben: Maximum/Minimum als Nullstelle gesucht |

### Modul 4: Potenzen & Wurzeln
**Datei:** `zp10-potenzen-wurzeln.html`
| MV | Fehlvorstellung |
|---|---|
| M1 | Potenzgesetze: aⁿ · aᵐ = aⁿ⁺ᵐ vs. aⁿ · bⁿ = (ab)ⁿ verwechselt |
| M2 | Negative Exponenten: a⁻ⁿ ≠ −aⁿ |
| M3 | Nullter Exponent: a⁰ = 1 nicht bekannt |
| M4 | Wurzel als halbe Potenz: √a = a^(1/2) nicht angewendet |
| M5 | Wurzelgesetze: √(a+b) ≠ √a + √b |
| M6 | Potenz einer Potenz: (aⁿ)ᵐ = aⁿ·ᵐ nicht a^(n+m) |
| M7 | Negativer Radikand bei geraden Wurzeln |
| M8 | Wissenschaftliche Schreibweise falsch umgerechnet |
| M9 | Bruch-Exponenten: a^(m/n) = ⁿ√(aᵐ) unbekannt |
| M10 | Potenzgesetze bei Division: aⁿ / aᵐ = aⁿ⁻ᵐ nicht angewendet |

### Modul 5: Lineare Gleichungssysteme
**Datei:** `zp10-lgs.html`
| MV | Fehlvorstellung |
|---|---|
| M1 | Einsetzungsverfahren: falsche Variable isoliert |
| M2 | Gleichsetzungsverfahren: verschiedene Variablen gleichgesetzt |
| M3 | Additionsverfahren: Gleichung nicht korrekt multipliziert |
| M4 | Keine Lösung vs. unendlich viele Lösungen nicht unterschieden |
| M5 | Probe nicht durchgeführt / nur in einer Gleichung geprüft |
| M6 | Rückeinsetzen vergessen (nur x, nicht y berechnet) |
| M7 | Sachaufgabe: Gleichungssystem falsch aufgestellt |
| M8 | Vorzeichenfehler beim Eliminieren |
| M9 | Parallele Geraden im LGS nicht als "keine Lösung" erkannt |
| M10 | Grafische Lösung: Schnittpunkt ungenau abgelesen |

### Modul 6: Geometrie
**Datei:** `zp10-geometrie.html`
| MV | Fehlvorstellung |
|---|---|
| M1 | Pythagoras: Hypotenuse nicht als längste Seite / gegenüber dem rechten Winkel erkannt |
| M2 | Körperformeln verwechselt (Kegel vs. Pyramide vs. Zylinder) |
| M3 | Oberflächeninhalt: Mantel + Grundfläche(n) vergessen |
| M4 | Trigonometrie: sin/cos/tan falsch zugeordnet (Gegenkathete/Ankathete) |
| M5 | Trigonometrie: Taschenrechner in Grad statt Bogenmaß (oder umgekehrt) |
| M6 | Volumen: Faktor 1/3 bei Spitzkörpern vergessen |
| M7 | Seitenflächenhöhe vs. Körperhöhe bei Pyramide/Kegel verwechselt |
| M8 | Zusammengesetzte Körper: Teilvolumina falsch kombiniert |
| M9 | Strahlensatz: bereits in separatem Modul, hier Anwendung in Sachkontexten |
| M10 | Maßeinheiten nicht korrekt umgerechnet (cm³ → dm³ → Liter) |

### Modul 7: Stochastik
**Datei:** `zp10-stochastik.html`
| MV | Fehlvorstellung |
|---|---|
| M1 | Baumdiagramm: Pfadregeln (Multiplikation vs. Addition) verwechselt |
| M2 | "Mindestens einmal" nicht als Gegenereignis erkannt |
| M3 | Mit/ohne Zurücklegen nicht unterschieden |
| M4 | Vierfeldertafel: relative vs. absolute Häufigkeiten verwechselt |
| M5 | Bedingte Wahrscheinlichkeit P(A|B) falsch berechnet |
| M6 | Unabhängigkeit falsch beurteilt |
| M7 | Erwartungswert: nur Summe statt gewichtetes Mittel |
| M8 | Laplace-Annahme fälschlicherweise auf nicht-faire Experimente angewendet |
| M9 | Mehrstufiges Experiment: Pfade nicht vollständig aufgelistet |
| M10 | Sachkontext: Wahrscheinlichkeit > 1 als Ergebnis nicht als Fehler erkannt |

### Modul 8: Prozent- & Zinsrechnung / Wachstum
**Datei:** `zp10-prozent-wachstum.html`
| MV | Fehlvorstellung |
|---|---|
| M1 | Prozentwert, Grundwert, Prozentsatz verwechselt |
| M2 | Prozentuale Zu-/Abnahme: auf falschen Grundwert bezogen |
| M3 | Zinseszins: Zins vom Zins nicht berücksichtigt |
| M4 | Wachstumsfaktor q vs. Wachstumsrate p verwechselt |
| M5 | Exponentielles vs. lineares Wachstum nicht unterschieden |
| M6 | Halbwertszeit / Verdopplungszeit falsch berechnet |
| M7 | Mehrwertsteuer: Brutto/Netto-Rechnung vertauscht |
| M8 | Rabatt auf bereits reduzierten Preis: doppelter Rabatt ≠ Summe |
| M9 | Negative Wachstumsrate (Zerfall) falsch als q = 1 + p statt q = 1 − p |
| M10 | Sachkontext: "um 20 % teurer" vs. "auf 120 %" nicht unterschieden |

---

## 3. Prüfungssimulator

**Datei:** `zp10-pruefung.html`

### Konzept
Simuliert eine realistische ZP10-Prüfung in zwei Teilen.

### Teil 1 — Ohne Taschenrechner (30 Minuten)
- 8–10 Basisaufgaben aus allen Modulen
- Countdown-Timer (30 Min)
- Aufgabentypen: MC, TF, Zahleneingabe
- Hilfsmittel-Hinweis: "Nur Geodreieck und Zirkel erlaubt"
- Themen-Mix: Kopfrechnen, einfache Gleichungen, Grundwissen Geometrie, Basisstochastik

### Teil 2 — Mit Taschenrechner (90 Minuten)
- 10–12 komplexere Aufgaben
- Countdown-Timer (90 Min)
- Hinweis "Taschenrechner + Formelsammlung erlaubt"
- Kontextaufgaben, mehrstufige Berechnungen, Textaufgaben

### Auswertung
- Gesamtpunktzahl + Note (nach offiziellem NRW-Notenschlüssel)
- Aufschlüsselung nach Themengebieten
- Vergleich mit Bestehensgrenze
- Empfehlung: welche Module wiederholt werden sollten

---

## 4. Neue Features (Template-Erweiterungen)

### 4.1 Zeitlimit pro Frage (optional)
- Konfigurierbar pro Modul (z.B. 90 Sek für MC, 180 Sek für Input)
- Visueller Countdown-Ring um die Fragekarte
- Bei Ablauf: Frage wird als falsch gewertet, aber Lösung angezeigt
- Im Prüfungssimulator: Gesamtzeit statt Einzelzeit

### 4.2 Prüfungsmodus
- Kein sofortiges Feedback (erst am Ende)
- Alle Fragen in Reihenfolge, kein Überspringen
- Zurück-Button optional
- Ergebnis erst nach Abgabe sichtbar

### 4.3 PDF-Export der Ergebnisse
- Button "Ergebnis als PDF speichern"
- Enthält: Schülername, Datum, Gesamtergebnis, Fehlvorstellungs-Profil, KLP-Kompetenzprofil, Empfehlungen
- Nutzt `html2canvas` + `jsPDF` (CDN)
- Druckfreundliches Layout

### 4.4 Lernpfad-Empfehlung
- Algorithmisch: Schwächste Fehlvorstellungen → zuerst fördern
- Auf Hub-Ebene: Module nach Dringlichkeit sortiert
- Auf Modul-Ebene: Förder-Level priorisiert die schwächsten MV

### 4.5 Fortschrittsspeicherung (localStorage)
- Jedes Modul speichert: Ergebnis, Datum, erkannte MV, XP
- Hub liest alle Module aus
- "Reset"-Button zum Zurücksetzen einzelner Module

### 4.6 Erweiterte Gamification
- **Gesamt-XP** über alle Module
- **Rangsystem:** Anfänger → Fortgeschritten → Experte → ZP10-Ready
- **Achievements** modul-übergreifend (z.B. "Alle Module geschafft", "3er-Streak in Stochastik")
- **Täglicher Streak** (optional)

---

## 5. Technische Umsetzung

### Dateien
| Datei | Beschreibung |
|---|---|
| `zp10-hub.html` | Dashboard / Launchpad |
| `zp10-terme-gleichungen.html` | Modul 1 |
| `zp10-lineare-funktionen.html` | Modul 2 |
| `zp10-quadratische-funktionen.html` | Modul 3 |
| `zp10-potenzen-wurzeln.html` | Modul 4 |
| `zp10-lgs.html` | Modul 5 |
| `zp10-geometrie.html` | Modul 6 |
| `zp10-stochastik.html` | Modul 7 |
| `zp10-prozent-wachstum.html` | Modul 8 |
| `zp10-pruefung.html` | Prüfungssimulator |

### Technologie
- Alles Single-File HTML (wie bestehende Diagnose-Apps)
- Kein Backend, kein Build-Step
- `localStorage` für Fortschritt
- CDN-Libraries nur für PDF-Export (`jsPDF`, `html2canvas`)
- SVGs für geometrische Darstellungen (inline)
- MathML oder Unicode für Formeln

### Gemeinsames Erweitertes Template
Neues `diagnose-template-v2.html` mit:
- Timer-System (Frage-Timer + Gesamt-Timer)
- Prüfungsmodus-Toggle
- PDF-Export-Funktion
- localStorage-Integration
- Hub-Kommunikation (Ergebnisse speichern)

---

## 6. Reihenfolge der Umsetzung

| Phase | Was | Priorität |
|---|---|---|
| **Phase 1** | Template v2 erstellen (Timer, PDF, localStorage, Prüfungsmodus) | Hoch |
| **Phase 2** | Hub/Dashboard bauen | Hoch |
| **Phase 3** | Module 1–3 (Terme, Lin. Fkt, Quad. Fkt) — Kernthemen der ZP10 | Hoch |
| **Phase 4** | Module 4–6 (Potenzen, LGS, Geometrie) | Mittel |
| **Phase 5** | Module 7–8 (Stochastik, Prozent/Wachstum) | Mittel |
| **Phase 6** | Prüfungssimulator | Mittel |
| **Phase 7** | Feinschliff: Achievements, Lernpfad-Algorithmus, Cross-Modul-XP | Niedrig |

---

## 7. Bestehende Module integrieren

Bereits vorhandene Diagnose-Apps können als Module eingebunden werden:
- `strahlensatz-diagnose.html` → Teil von Modul 6 (Geometrie) oder eigenständig verlinkt
- `terme-muster-diagnose.html` → Ergänzung zu Modul 1
- `terme-vereinfachen-diagnose.html` → Ergänzung zu Modul 1
- `expo-diagnose.html` → Ergänzung zu Modul 8 (Wachstum)
- `exponentialfunktionen.html` → Ergänzung zu Modul 8
