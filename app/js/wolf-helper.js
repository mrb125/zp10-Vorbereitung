// wolf-helper.js — Nebelwolf Tipp-Geber für Modul-Seiten
// Wird am Ende jeder Modul-HTML-Seite eingebunden.
(function () {
    // ── Generische Mathe-Tipps ──────────────────────────────────
    const GENERIC = [
        '💡 Schreib jeden Rechenschritt auf — das vermeidet Flüchtigkeitsfehler!',
        '📐 Zeichne eine Skizze, bevor du rechnest.',
        '🔁 Überprüfe dein Ergebnis durch Einsetzen.',
        '🧮 Einheiten mitschreiben verhindert viele Fehler.',
        '⏱️ In der Prüfung: schwere Aufgaben überspringen und später lösen.',
        '📝 Formeln auswendig kennen spart wertvolle Prüfungszeit.',
        '🎯 Lies die Aufgabe zweimal: einmal zum Verstehen, einmal zum Lösen.',
        '✏️ Zwischenergebnisse hinschreiben — Teilpunkte zählen in der ZP10!',
        '🤓 Wenn du feststeckst: Schreib auf, was du weißt — oft kommt dann die Idee.',
    ];

    // ── Modul-spezifische Tipps (Schlüssel = Dateiname-Segment) ─
    const MODULE_TIPS = {
        'escape-room': [
            '🗝️ Lies die Aufgabe zweimal — oft steckt der Hinweis im Aufgabentext selbst!',
            '🧩 Keine Angst vor offenen Fragen: Schreib, was du weißt — das zählt!',
            '⏱️ Zeit läuft? Überspringe und komm später zurück.',
            '🔢 Schreib alle Zwischenschritte auf — auch falsche Wege zeigen Können.',
            '📐 Skizze hilft: Zeichne das Problem auf, bevor du rechnest.',
            '✅ Vor dem Speichern: kurz prüfen ob die Antwort Sinn ergibt.',
        ],
        'lineare-funktionen': [
            'f(x) = mx + b: m ist die Steigung, b der y-Achsenabschnitt.',
            'Steigung m = (y₂ − y₁) / (x₂ − x₁) — immer Δy geteilt durch Δx!',
            'Zwei Punkte reichen, um eine lineare Funktion eindeutig zu bestimmen.',
            'Parallele Geraden haben die gleiche Steigung m.',
        ],
        'quadratische-funktionen': [
            'Scheitelpunkt: xₛ = −b / (2a), dann yₛ durch Einsetzen.',
            'Diskriminante D = b² − 4ac: D > 0 → 2 Nullstellen, D = 0 → 1, D < 0 → keine.',
            'Aus der Normalform durch quadratische Ergänzung zur Scheitelpunktform.',
            'In der Scheitelpunktform f(x) = a(x − xₛ)² + yₛ liest man den Scheitelpunkt direkt ab.',
        ],
        'exponentialfunktionen': [
            'Basis b > 1: Wachstum. Basis 0 < b < 1: Zerfall.',
            'Die x-Achse ist immer Asymptote (y → 0, aber niemals y = 0).',
            'Halbwertszeit / Verdopplungszeit: bᵗ = 0,5 bzw. bᵗ = 2 — logarithmieren!',
            'log und exp sind Umkehrfunktionen: log_b(bˣ) = x.',
        ],
        'expo-grundlagen': [
            'aⁿ · aᵐ = aⁿ⁺ᵐ — gleiche Basis, Exponenten addieren.',
            'aⁿ / aᵐ = aⁿ⁻ᵐ — gleiche Basis, Exponenten subtrahieren.',
            '(aⁿ)ᵐ = aⁿ·ᵐ — Exponent mal Exponent.',
            'a⁰ = 1 (für a ≠ 0) und a⁻ⁿ = 1 / aⁿ.',
        ],
        'potenzen-wurzeln': [
            '√a = a^(1/2), ³√a = a^(1/3) — Wurzeln als gebrochene Exponenten.',
            '√(a · b) = √a · √b, aber √(a + b) ≠ √a + √b!',
            'Beim Gleichungslösen: beide Seiten quadrieren → Probe nicht vergessen!',
        ],
        'terme-gleichungen': [
            'Beim Auflösen: dieselbe Operation auf beiden Seiten.',
            'Klammern zuerst auflösen (distributiv: a(b+c) = ab + ac).',
            'Probe: berechnetes Ergebnis einsetzen und beide Seiten vergleichen.',
        ],
        'terme-vereinfachen': [
            'Nur gleichartige Terme (gleiche Variable, gleicher Exponent) zusammenfassen.',
            'Vorzeichen beachten: −(a − b) = −a + b.',
            'Erst multiplizieren/dividieren, dann addieren/subtrahieren.',
        ],
        'terme-muster': [
            '(a + b)² = a² + 2ab + b² — Erste binomische Formel.',
            '(a − b)² = a² − 2ab + b² — Zweite binomische Formel.',
            '(a + b)(a − b) = a² − b² — Dritte binomische Formel.',
        ],
        'lgs': [
            'Additionsverfahren: Gleichungen so multiplizieren, dass sich eine Variable weghebt.',
            'Einsetzungsverfahren: eine Variable ausdrücken, in andere Gleichung einsetzen.',
            'Probe: berechnetes (x, y) in BEIDE Originalgleichungen einsetzen.',
        ],
        'geometrie': [
            'Pythagoras: a² + b² = c² (c = Hypotenuse, dem rechten Winkel gegenüber).',
            'sin = Gegenkathete / Hypotenuse, cos = Ankathete / Hypotenuse.',
            'Flächenformel Dreieck: A = (Grundseite × Höhe) / 2.',
            'Kreisfläche: A = π · r², Kreisumfang: U = 2π · r.',
        ],
        'strahlensatz': [
            'Strahlensatz: Teilstrecken eines Strahls sind proportional.',
            'ZA / ZA\' = ZB / ZB\' = AB / A\'B\' — alle drei Quotienten sind gleich.',
            'Erst prüfen: Liegen die Punkte auf den gleichen Geraden vom Zentrum aus?',
        ],
        'stochastik': [
            'P(A) + P(nicht A) = 1 — Gegenwahrscheinlichkeit.',
            'Baumdiagramm: Wahrscheinlichkeiten auf einem Pfad multiplizieren.',
            'Mehrstufig: Pfadregeln — Pfad: mal, Ergebnis: plus.',
            'Relative Häufigkeit ≠ Wahrscheinlichkeit, aber nähert sich an.',
        ],
        'prozent-wachstum': [
            'Grundwert G, Prozentwert W, Prozentsatz p: W = G · p / 100.',
            'Wachstumsfaktor b = 1 + p/100. Zinseszins: K_n = K_0 · bⁿ.',
            'Rückwärts rechnen: G = W / (p/100) — nicht einfach abziehen!',
        ],
    };

    function getModuleKey() {
        const path = window.location.pathname;
        if (path.includes('escape-room')) return 'escape-room';
        const match = path.match(/zp10-(.+?)\.html/);
        return match ? match[1] : null;
    }

    // Bildpfad: überschreibbar via window.WOLF_IMG_BASE (z.B. 'companion-img' für root-Seiten)
    const IMG_BASE = (typeof window.WOLF_IMG_BASE !== 'undefined') ? window.WOLF_IMG_BASE : '../companion-img';

    function getWolfLevel() {
        try {
            const gd = JSON.parse(localStorage.getItem('zp10_guardian_data') || 'null');
            if (!gd) return 0;
            const thr = [0, 1000, 4000, 12000, 28000];
            let lvl = 0;
            for (let i = 1; i < thr.length; i++) if ((gd.xp || 0) >= thr[i]) lvl = i;
            return lvl;
        } catch (e) { return 0; }
    }

    function getRandomTip() {
        const key = getModuleKey();
        const specific = key && MODULE_TIPS[key];
        const pool = specific ? [...specific, ...GENERIC] : GENERIC;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function create() {
        const level = getWolfLevel();
        const imgSrc = `${IMG_BASE}/wolf-${level}.png`;

        // ── Floating Button ────────────────────────────────────
        const btn = document.createElement('button');
        btn.id = 'wolfHelperBtn';
        btn.className = 'wolf-helper-btn';
        btn.title = 'Nebelwolf-Tipp';
        btn.setAttribute('aria-label', 'Nebelwolf Tipp anzeigen');
        btn.innerHTML = `<img src="${imgSrc}" alt="Nebelwolf" onerror="this.outerHTML='<span style=\'font-size:28px\'>🐺</span>'">`;

        // ── Tipp-Panel ─────────────────────────────────────────
        const panel = document.createElement('div');
        panel.id = 'wolfHelperPanel';
        panel.className = 'wolf-helper-panel wolf-hidden';
        panel.innerHTML = `
            <div class="wolf-panel-header">
                <img class="wolf-panel-img" src="${imgSrc}" alt=""
                    onerror="this.outerHTML='<span style=\'font-size:2rem\'>🐺</span>'">
                <div class="wolf-panel-title">
                    <div class="wolf-panel-name">🐺 Nebelwolf</div>
                    <div class="wolf-panel-sub">Dein Klassen-Begleiter</div>
                </div>
                <button class="wolf-panel-close" id="wolfPanelClose" aria-label="Schließen">✕</button>
            </div>
            <div class="wolf-panel-tip" id="wolfPanelTip"></div>
            <button class="wolf-panel-refresh" id="wolfTipRefresh">🎲 Neuer Tipp</button>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(panel);

        function showTip() {
            document.getElementById('wolfPanelTip').textContent = getRandomTip();
        }

        btn.addEventListener('click', () => {
            const hidden = panel.classList.contains('wolf-hidden');
            if (hidden) {
                showTip();
                panel.classList.remove('wolf-hidden');
            } else {
                panel.classList.add('wolf-hidden');
            }
        });
        document.getElementById('wolfPanelClose').addEventListener('click', () => {
            panel.classList.add('wolf-hidden');
        });
        document.getElementById('wolfTipRefresh').addEventListener('click', showTip);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', create);
    } else {
        create();
    }
})();
