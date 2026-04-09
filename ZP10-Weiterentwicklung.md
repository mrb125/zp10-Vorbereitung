# ZP10-Diagnose-App: Weiterentwicklungsplan

*Stand: 27. März 2026 | Simon Blankenagel | Gymnasium NRW*

---

## Status Quo

Die Plattform umfasst aktuell **14 Dateien (~15.000 Zeilen Code)**: Hub-Dashboard, 8 Themenmodule, Prüfungssimulation und Firebase-Backend. Grundarchitektur (Single-File HTML, localStorage-first, Template-basiert) ist solide. Alle Module funktionieren offline im Browser.

**Was gut funktioniert:** Hub mit Ampelsystem, Gamification (XP/Ränge/Achievements), 265+ Fragen mit Fehlvorstellungs-Diagnose, KLP-Tagging, Förderaufgaben, PDF-Export.

**Was fehlt oder schwach ist:** Firebase nur Platzhalter, Prüfungssimulator zu einfach, keine SVG-Diagramme in Geometrie/Stochastik, keine Tests, kein Service Worker, keine Dokumentation.

---

## Phase 1: Qualitätssicherung & Bugfixing (Priorität: HOCH)

### 1.1 Browser-Testing aller Module
- Jedes Modul im Chrome/Firefox/Safari öffnen und durchspielen
- Diagnose-Modus: Alle Fragetypen (MC, TF, Input) testen
- Prüfungsmodus: Timer, Navigation, Flagging testen
- PDF-Export: Funktioniert jsPDF korrekt?
- Hub: Werden Ergebnisse aller Module korrekt angezeigt?
- Mobile: Responsive auf Tablet (iPad) und Smartphone testen

### 1.2 Inhaltliche Review der Fragen
- Sind alle 265+ Fragen fachlich korrekt?
- Entspricht das Niveau der GYM-Differenzierung (nicht MSA)?
- Sind Distractoren bei MC-Fragen sinnvoll und decken echte Fehlvorstellungen ab?
- Förderaufgaben: Steigt die Schwierigkeit (leicht → mittel → schwer)?
- Feedback-Texte: Verständlich und lernförderlich?

### 1.3 Prüfungssimulator aufwerten
- Aktuell nur 22 Fragen (zu wenig, zu einfach)
- **Ziel:** 30+ Fragen auf echtem ZP10-Niveau
- Teil 1 (ohne Taschenrechner): Binomische Formeln, Kopfrechnen mit Brüchen, Termvereinfachung, Grundwissen Geometrie
- Teil 2 (mit Taschenrechner): Komplexe Modellierungsaufgaben, mehrstufige Probleme, Funktionsanalyse, Sachkontexte
- Bewertungsschlüssel gegen offiziellen NRW-Maßstab prüfen

---

## Phase 2: UX & Gamification verbessern

### 2.1 Visuelle Aufwertung
- **SVG-Diagramme** für Geometrie (Pythagoras, Trigonometrie, Körper)
- **Funktionsgraphen** als SVG für lineare/quadratische Funktionen
- **Baumdiagramme** für Stochastik
- **Animierte Übergänge** zwischen Fragen (smoother UX)
- Dark/Light-Theme Toggle (nicht alle SuS mögen Dark Mode)

### 2.2 Gamification 2.0
- **Skill-Trees:** Visuelle Kompetenz-Bäume statt linearer Fortschritt
- **Daily Challenges:** Tägliche 5-Minuten-Aufgabe für Streak-Motivation
- **Fehlvorstellungs-Duelle:** "Boss-Fights" gegen hartnäckige Misconceptions
- **Klassenrangliste** (optional, nur mit Firebase)
- **Badges mit Substanz:** Nicht nur "10 Fragen beantwortet" sondern "Alle Fehlvorstellungen in Terme überwunden"

### 2.3 Adaptivität
- **Spaced Repetition:** Fragen, die falsch beantwortet wurden, nach Intervallen wiederholen
- **Schwierigkeitsanpassung:** Nach 3x richtig → schwerere Variante; nach 3x falsch → leichtere + Förderaufgabe
- **Lernpfad-Algorithmus:** Hub empfiehlt nächstes Modul basierend auf Schwächen, nicht nur Reihenfolge

---

## Phase 3: Firebase-Backend aktivieren

### 3.1 Firebase-Projekt einrichten
- Firebase-Projekt in Google Cloud Console erstellen
- Credentials in `firebase-config.js` eintragen
- Authentication aktivieren (Email/Password + Google SSO)
- Firestore-Datenbank mit Security Rules deployen
- Hosting über Firebase Hosting (kostenlos, HTTPS, schnell)

### 3.2 Offline-Sync implementieren
- **Service Worker:** App funktioniert komplett offline, synct bei Reconnect
- localStorage ↔ Firestore bidirektionale Synchronisation
- Konflikterkennung: Was passiert bei gleichzeitiger Nutzung auf zwei Geräten?

### 3.3 Lehrer-Dashboard aktivieren
- Klassen-Management (Einladungscodes)
- **Kompetenz-Heatmap:** Welche Fehlvorstellungen hat die ganze Klasse?
- **Einzelschüler-Profile:** Detailansicht mit Lernverlauf
- **Interventionsempfehlungen:** "8 SuS haben MV3 (Äquivalenzumformung) → Wiederholung empfohlen"
- CSV-Export der Ergebnisse für Zeugniskonferenzen
- Module sperren/freigeben pro Klasse

---

## Phase 4: Zusätzliche Features

### 4.1 Aufgaben-Editor für Lehrkräfte
- Web-UI zum Erstellen eigener Fragen (ohne Code)
- Fehlvorstellungen zuordnen, KLP-Kompetenz taggen
- Fragen-Pool teilen mit Fachschaft
- Import/Export als JSON

### 4.2 Erweiterter Prüfungsmodus
- **Probeklausuren generieren:** Zufällige Zusammenstellung aus allen Modulen
- **Zeitdruck-Training:** Aufgaben unter Zeitlimit üben
- **Teil 1 / Teil 2 getrennt übbar**
- **Notenprognose:** "Bei diesem Leistungsstand wäre deine ZP10-Note voraussichtlich..."

### 4.3 Integration bestehender Diagnose-Apps
- `strahlensatz-diagnose.html`, `terme-muster-diagnose.html` etc. in Hub einbinden
- Einheitliches Design anpassen
- Ergebnisse in Hub-Tracking integrieren

### 4.4 Barrierefreiheit
- Screenreader-Kompatibilität (ARIA)
- Tastaturnavigation
- Schriftgrößen-Anpassung
- Nachteilsausgleich-Modus (mehr Zeit, größere Schrift)

---

## Phase 5: Deployment & Skalierung

### 5.1 Deployment
- **Option A:** Firebase Hosting (einfach, kostenlos bis 10 GB/Monat)
- **Option B:** GitHub Pages (statisch, kein Backend)
- **Option C:** Schulserver (volle Kontrolle, DSGVO-konform)
- Custom Domain: `zp10-diagnose.de` oder Subdomain der Schule

### 5.2 DSGVO-Compliance
- Datenschutzerklärung erstellen
- Einwilligungserklärung für SuS unter 16 (Eltern)
- Datenminimierung: Nur speichern, was für Diagnose nötig ist
- Löschkonzept: Daten nach Schuljahresende automatisch löschen
- Auftragsverarbeitungsvertrag mit Google/Firebase

### 5.3 Dokumentation
- **Schüler-Guide:** "So nutzt du die App" (kurz, mit Screenshots)
- **Lehrer-Handbuch:** Klassen einrichten, Ergebnisse interpretieren, Fördermaßnahmen ableiten
- **Technische Doku:** Für Wartung und Weiterentwicklung

### 5.4 Feedback-Schleife
- In-App Feedback-Button ("War diese Frage verständlich?")
- Analytics: Welche Fragen werden oft falsch beantwortet? (→ Frage schlecht oder echte Lücke?)
- Quartalsweise Review der Fragen-Qualität

---

## Phase 6: Langfristige Vision

### 6.1 Weitere Fächer
- Physik ZP10 (gleiche Architektur, andere Inhalte)
- Informatik-Diagnose (Algorithmen, Datenstrukturen)
- Englisch ZP10 (Leseverstehen, Grammatik)

### 6.2 KI-Integration
- **Automatische Aufgabengenerierung** aus KLP-Kompetenzen
- **Individueller Lernplan** basierend auf Diagnoseergebnissen
- **Chatbot-Tutor:** SuS können Fragen zum Stoff stellen
- **Frei formulierte Antworten** mit KI-Bewertung (statt nur MC/Input)

### 6.3 Community
- Fachschaft-Netzwerk: Lehrkräfte teilen Aufgabenpools
- Open Source auf GitHub: Andere Schulen nutzen/erweitern die App
- Fortbildungs-Workshop: "Diagnostik digital" für Kolleg:innen

---

## Priorisierte Roadmap

| Priorität | Phase | Aufwand | Impact |
|-----------|-------|---------|--------|
| SOFORT | 1.1 Browser-Testing | 2-3h | Bugs finden |
| SOFORT | 1.2 Fragen-Review | 4-6h | Qualität sichern |
| SOFORT | 1.3 Prüfungssimulator | 3-4h | Kernfeature |
| HOCH | 2.1 SVG-Diagramme | 4-6h | Verständlichkeit |
| HOCH | 3.1 Firebase einrichten | 2-3h | Backend aktivieren |
| MITTEL | 2.2 Gamification 2.0 | 6-8h | Motivation |
| MITTEL | 2.3 Adaptivität | 8-10h | Lerneffekt |
| MITTEL | 3.3 Lehrer-Dashboard | 4-6h | Unterrichtsnutzen |
| NIEDRIG | 4.1 Aufgaben-Editor | 10-15h | Nachhaltigkeit |
| NIEDRIG | 5.2 DSGVO | 4-6h | Rechtssicherheit |
| LANGFRISTIG | 6.x Vision | fortlaufend | Skalierung |

---

## Nächster Schritt

**Empfehlung:** Mit Phase 1 starten. Öffne den Hub und jedes Modul im Browser, spiele sie durch, und notiere alle Bugs und inhaltlichen Fehler. Dann können wir gezielt fixen und gleichzeitig den Prüfungssimulator auf ZP10-Niveau bringen.

Sag einfach, welche Phase du als erstes angehen willst!
