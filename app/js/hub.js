// ===== THEME MANAGEMENT =====
function initTheme() {
    const savedTheme = localStorage.getItem('zp10_theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark');
        localStorage.setItem('zp10_theme', 'dark');
        updateThemeIcon('dark');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('zp10_theme', 'light');
        updateThemeIcon('light');
    }
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    } else {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    }
}

document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = localStorage.getItem('zp10_theme') || 'light';
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// ===== DATA MANAGEMENT =====
function loadHubData() {
    const hubData = localStorage.getItem('zp10_hub_data');
    return hubData ? JSON.parse(hubData) : {
        studentName: 'Schüler',
        totalXP: 0,
        rank: 'Einsteiger',
        achievements: [],
        examResults: null
    };
}

function saveHubData(data) {
    localStorage.setItem('zp10_hub_data', JSON.stringify(data));
}

// ===== MODULE DATA =====
const modulesMetadata = [
    {
        id: 'zp10-terme-gleichungen',
        name: 'Terme & Gleichungen',
        file: 'module/zp10-terme-gleichungen.html',
        icon: 'calculator',
        description: 'Binomische Formeln, p-q-Formel, Äquivalenzumformungen'
    },
    {
        id: 'zp10-terme-muster',
        name: 'Terme & Muster',
        file: 'module/zp10-terme-muster.html',
        icon: 'grid',
        description: 'Zahlenfolgen, Bildmuster, Terme aufstellen'
    },
    {
        id: 'zp10-terme-vereinfachen',
        name: 'Terme vereinfachen',
        file: 'module/zp10-terme-vereinfachen.html',
        icon: 'calculator',
        description: 'Zusammenfassen, Ausmultiplizieren, Ausklammern'
    },
    {
        id: 'zp10-lineare-funktionen',
        name: 'Lineare Funktionen',
        file: 'module/zp10-lineare-funktionen.html',
        icon: 'function',
        description: 'Steigung, y-Achsenabschnitt, Geradengleichungen'
    },
    {
        id: 'zp10-quadratische-funktionen',
        name: 'Quadratische Funktionen',
        file: 'module/zp10-quadratische-funktionen.html',
        icon: 'function',
        description: 'Parabeln, Scheitelpunkt, Nullstellen'
    },
    {
        id: 'zp10-potenzen-wurzeln',
        name: 'Potenzen & Wurzeln',
        file: 'module/zp10-potenzen-wurzeln.html',
        icon: 'percent',
        description: 'Potenzgesetze, Wurzelrechnung, Exponenten'
    },
    {
        id: 'zp10-lgs',
        name: 'Lineare Gleichungssysteme',
        file: 'module/zp10-lgs.html',
        icon: 'grid',
        description: 'Einsetzungs-, Gleichsetzungs-, Additionsverfahren'
    },
    {
        id: 'zp10-geometrie',
        name: 'Geometrie',
        file: 'module/zp10-geometrie.html',
        icon: 'triangle',
        description: 'Pythagoras, Trigonometrie, Körperberechnungen'
    },
    {
        id: 'zp10-strahlensatz',
        name: 'Strahlensatz',
        file: 'module/zp10-strahlensatz.html',
        icon: 'triangle',
        description: 'Streckenverhältnisse, zentrische Streckung'
    },
    {
        id: 'zp10-stochastik',
        name: 'Stochastik',
        file: 'module/zp10-stochastik.html',
        icon: 'dice',
        description: 'Wahrscheinlichkeiten, Baumdiagramme, Vierfeldertafel'
    },
    {
        id: 'zp10-prozent-wachstum',
        name: 'Prozent & Wachstum',
        file: 'module/zp10-prozent-wachstum.html',
        icon: 'percent',
        description: 'Prozentrechnung, Zinseszins, Wachstumsfaktor'
    },
    {
        id: 'zp10-expo-grundlagen',
        name: 'Exponentielles Wachstum',
        file: 'module/zp10-expo-grundlagen.html',
        icon: 'function',
        description: 'Wachstumsfaktor, Verdopplung, Halbwertszeit'
    },
    {
        id: 'zp10-exponentialfunktionen',
        name: 'Exponentialfunktionen',
        file: 'module/zp10-exponentialfunktionen.html',
        icon: 'function',
        description: 'f(x)=a·bˣ, Asymptoten, Logarithmus'
    }
];

const extraModules = [];

// ===== MODULE CARD RENDERING =====
function renderModules() {
    const container = document.getElementById('modulesContainer');
    const hubData = loadHubData();
    const moduleProgress = {};

    // Load escape room recommendations
    const escapeRaw = localStorage.getItem('zp10_escape_results');
    const escapeData = escapeRaw ? JSON.parse(escapeRaw) : null;
    const recommended = escapeData && escapeData.recommendedModules ? new Set(escapeData.recommendedModules) : new Set();

    // Collect all module progress data
    modulesMetadata.forEach(module => {
        const latest = localStorage.getItem(`zp10_${module.id}_latest`);
        const data = latest ? JSON.parse(latest) : null;
        moduleProgress[module.id] = data;
    });

    // Sort: recommended modules first
    const sorted = [...modulesMetadata].sort((a, b) => {
        const aRec = recommended.has(a.id) ? 0 : 1;
        const bRec = recommended.has(b.id) ? 0 : 1;
        return aRec - bRec;
    });

    container.innerHTML = sorted.map(module => {
        const data = moduleProgress[module.id];
        const score = data ? data.score || 0 : 0;
        const maxScore = data ? data.maxScore || 100 : 100;
        const percent = Math.round((score / maxScore) * 100);
        const lastActivity = data ? new Date(data.lastDate).toLocaleDateString('de-DE') : 'Nie';
        const isRecommended = recommended.has(module.id);

        // Status indicator
        let status = 'gray';
        if (percent >= 70) status = 'green';
        else if (percent >= 40) status = 'amber';
        else if (percent > 0) status = 'red';

        const recBadge = isRecommended ? `<div style="position:absolute;top:-8px;right:-8px;background:var(--danger);color:white;font-size:0.7rem;font-weight:700;padding:3px 8px;border-radius:10px;z-index:2;box-shadow:0 2px 6px rgba(239,68,68,0.4);">Empfohlen!</div>` : '';
        const recBorder = isRecommended ? 'border:2px solid var(--danger);box-shadow:0 0 12px rgba(239,68,68,0.15);' : '';

        return `
            <div class="module-card" style="position:relative;${recBorder}">
                ${recBadge}
                <div class="module-header">
                    <div class="module-icon-wrapper">
                        ${getModuleIcon(module.icon)}
                    </div>
                    <div class="module-status-indicator status-${status}"></div>
                </div>
                <h3 class="module-title">${module.name}</h3>
                <div class="module-progress">
                    <div class="module-progress-label">
                        <span>Fortschritt</span>
                        <span>${percent}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
                <div class="module-stats">
                    <div class="module-stat-row">
                        <span class="module-stat-label">Punkte</span>
                        <span class="module-score">${score}<span class="module-score-unit">/${maxScore}</span></span>
                    </div>
                    <div class="module-stat-row">
                        <span class="module-stat-label">Zuletzt</span>
                        <span class="module-stat-value">${lastActivity}</span>
                    </div>
                </div>
                <a href="${module.file}" class="module-cta"${isRecommended ? ' style="background:var(--danger);color:white;"' : ''}>
                    ${isRecommended ? 'Jetzt üben!' : 'Üben'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </a>
            </div>
        `;
    }).join('');

    // Show recommendation banner if escape room completed
    if (recommended.size > 0) {
        const banner = document.createElement('div');
        banner.style.cssText = 'background:linear-gradient(135deg, var(--danger-light), var(--warning-light));border:1px solid var(--danger);border-radius:16px;padding:20px;margin-bottom:24px;';
        banner.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                <span style="font-size:1.5rem;">🎯</span>
                <div style="flex:1;min-width:200px;">
                    <div style="font-weight:700;margin-bottom:4px;color:var(--text);">Escape-Room Auswertung</div>
                    <div style="font-size:0.9rem;color:var(--text-secondary);">
                        Basierend auf deinen Ergebnissen empfehlen wir dir <strong>${recommended.size} Module</strong> zum gezielten Üben.
                        Die empfohlenen Module sind rot markiert und oben einsortiert.
                    </div>
                </div>
            </div>
        `;
        container.parentElement.insertBefore(banner, container);
    }

    updateProgress();
}

// ===== EXTRA MODULES RENDERING =====
function renderExtraModules() {
    const container = document.getElementById('extraModulesContainer');
    container.innerHTML = extraModules.map(module => {
        return `
            <a href="${module.file}" class="module-card">
                <h3 class="module-title">${module.name}</h3>
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: auto;">${module.description}</p>
                <button class="module-cta" style="margin-top: 1rem;">
                    Starten
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </a>
        `;
    }).join('');
}

// ===== ICON HELPER =====
function getModuleIcon(iconType) {
    const icons = {
        calculator: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><rect x="8" y="6" width="2" height="2"></rect><rect x="14" y="6" width="2" height="2"></rect><rect x="8" y="11" width="2" height="2"></rect><rect x="14" y="11" width="2" height="2"></rect><line x1="8" y1="16" x2="14" y2="16"></line></svg>`,
        function: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 21 7 3"></polyline><polyline points="21 3 12 15 3 6"></polyline></svg>`,
        triangle: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 20 2 20"></polygon></svg>`,
        dice: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8" cy="8" r="1"></circle><circle cx="16" cy="16" r="1"></circle><circle cx="16" cy="8" r="1"></circle><circle cx="8" cy="16" r="1"></circle></svg>`,
        percent: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>`,
        grid: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
    };
    return icons[iconType] || icons.calculator;
}

// ===== UPDATE PROGRESS =====
function updateProgress() {
    const hubData = loadHubData();
    let totalPercent = 0;
    let completedModules = 0;
    let totalModules = modulesMetadata.length;

    modulesMetadata.forEach(module => {
        const latest = localStorage.getItem(`zp10_${module.id}_latest`);
        const data = latest ? JSON.parse(latest) : null;
        if (data && data.score && data.maxScore) {
            const percent = (data.score / data.maxScore) * 100;
            totalPercent += percent;
            if (percent >= 70) completedModules++;
        }
    });

    const overallPercent = Math.round(totalPercent / totalModules);
    document.getElementById('progressPercent').textContent = overallPercent + '%';
    document.getElementById('modulesCompleted').textContent = completedModules;
    const totalEl = document.getElementById('modulesTotal');
    if (totalEl) totalEl.textContent = totalModules;

    // Update progress ring
    const circumference = 440;
    const offset = circumference - (overallPercent / 100) * circumference;
    document.getElementById('progressRing').style.strokeDashoffset = offset;

    // Update achievement count
    const achievements = hubData.achievements || [];
    document.getElementById('achievementCount').textContent = achievements.length;
}

// ===== COUNTDOWN =====
function updateCountdown() {
    const exam = new Date(2026, 4, 22); // May 22, 2026
    const today = new Date();
    const diff = exam - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    document.getElementById('countdownDays').textContent = Math.max(0, days);
}

// ===== DAILY CHALLENGE =====
function updateDailyChallenge() {
    const dailyData = localStorage.getItem('zp10_daily_data');
    let data = dailyData ? JSON.parse(dailyData) : { streak: 0, lastDate: null };

    const today = new Date().toDateString();
    const isCompletedToday = data.lastDate === today;

    const card = document.getElementById('dailyChallengeCard');
    const streakDisplay = document.getElementById('streakDisplay');
    const statusDisplay = document.getElementById('todayStatus');
    const titleEl = document.getElementById('dailyChallengeTitle');
    const descEl = document.getElementById('dailyChallengeDescription');
    const btnEl = document.getElementById('dailyChallengeBtn');

    streakDisplay.textContent = data.streak || 0;

    if (isCompletedToday) {
        card.classList.add('completed');
        statusDisplay.innerHTML = '✓ Erledigt';
        titleEl.textContent = 'Challenge erledigt!';
        descEl.textContent = 'Gute Arbeit! Komm morgen wieder.';
        btnEl.textContent = 'Ergebnisse →';
    } else {
        card.classList.remove('completed');
        statusDisplay.textContent = 'Offen';
        titleEl.textContent = '5-Minuten-Challenge';
        descEl.textContent = '5 Aufgaben aus allen Themen';
        btnEl.textContent = 'Starten →';
    }
}

// ===== HEADER DATA =====
function updateHeader() {
    const hubData = loadHubData();
    const code = getStudentCode();
    const displayName = code && code !== 'GAST' ? `${hubData.studentName || 'Schüler'} (${code})` : hubData.studentName || 'Schüler';
    const nameEl = document.getElementById('studentName');
    nameEl.textContent = displayName;
    nameEl.style.cursor = 'pointer';
    nameEl.title = 'Klicken um Code zu ändern';
    nameEl.onclick = () => {
        const newCode = prompt('Neuen Code eingeben (oder leer lassen zum Behalten):', code || '');
        if (newCode !== null && newCode.trim() !== '') {
            localStorage.setItem('zp10_student_code', newCode.trim().toUpperCase());
            const hd = loadHubData();
            hd.studentCode = newCode.trim().toUpperCase();
            saveHubData(hd);
            location.reload();
        }
    };
    document.getElementById('totalXP').textContent = hubData.totalXP || 0;

    const ranks = [
        { min: 0, name: 'Einsteiger' },
        { min: 500, name: 'Schüler' },
        { min: 1500, name: 'Meister' },
        { min: 3000, name: 'Champion' }
    ];

    let rank = ranks[0].name;
    for (let r of ranks) {
        if ((hubData.totalXP || 0) >= r.min) rank = r.name;
    }

    document.getElementById('rankBadge').textContent = '🚀 ' + rank;
}

// ===== LEHRER ACCESS =====
function setupLehrerAccess() {
    const params = new URLSearchParams(window.location.search);
    const card = document.getElementById('lehrerActionCard');
    const link = card.parentElement.querySelector('a[href="lehrer/zp10-lehrer-lokal.html"]');

    if (params.has('lehrer') && params.get('lehrer') === '1') {
        localStorage.setItem('zp10_is_lehrer', 'true');
    }

    if (localStorage.getItem('zp10_is_lehrer') === 'true') {
        card.style.display = 'flex';
        if (link) link.href = 'lehrer/zp10-lehrer-lokal.html';
    }
}

// ===== RESET FUNCTIONALITY =====
function setupResetButton() {
    const resetBtn = document.getElementById('resetBtn');
    const modal = document.getElementById('resetModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');

    resetBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    confirmBtn.addEventListener('click', () => {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('zp10_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        modal.classList.remove('active');
        location.reload();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ===== EXPORT FUNCTIONALITY =====
function setupExportButton() {
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', () => {
        const hubData = loadHubData();
        const studentName = hubData.studentName || 'Schüler';
        const modules = {};

        const moduleIds = modulesMetadata.map(m => m.id).concat(extraModules.map(m => m.id));
        moduleIds.forEach(id => {
            const latest = localStorage.getItem(`zp10_${id}_latest`);
            const history = localStorage.getItem(`zp10_${id}_history`);
            if (latest || history) {
                modules[id] = {
                    latest: latest ? JSON.parse(latest) : null,
                    history: history ? JSON.parse(history) : []
                };
            }
        });

        const studentCode = getStudentCode() || 'NONE';
        const exportData = {
            exportVersion: '1.1',
            exportDate: new Date().toISOString(),
            studentCode: studentCode,
            studentName: studentName,
            hubData: hubData,
            modules: modules
        };

        const codePrefix = studentCode !== 'NONE' && studentCode !== 'GAST' ? studentCode + '-' : '';
        const fileName = `zp10-export-${codePrefix}${studentName.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.json`;
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}

// ===== COLLAPSIBLE SECTION =====
function setupCollapsible() {
    const toggle = document.getElementById('extraModulesToggle');
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', toggle.classList.contains('active'));
    });
}

// ===== SCHÜLER-CODE SYSTEM =====
function getStudentCode() {
    return localStorage.getItem('zp10_student_code') || null;
}

function showCodeGate() {
    initTheme();
    document.body.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 2rem;">
            <div style="max-width: 440px; width: 100%; text-align: center; background: var(--surface); border-radius: 20px; padding: 2.5rem; box-shadow: 0 8px 32px rgba(0,0,0,0.15); border: 2px solid var(--primary);">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔑</div>
                <h1 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.5rem; font-family: 'Nunito Sans', sans-serif;">ZP10 Mathe-Diagnose</h1>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5; font-size: 0.95rem;">
                    Gib deinen persönlichen Code ein, den du von deiner Lehrkraft erhalten hast.
                </p>
                <form id="codeForm" style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="position: relative;">
                        <input type="text" id="codeInput" placeholder="z.B. A3X7K2"
                            maxlength="8" autocomplete="off" spellcheck="false"
                            style="width: 100%; padding: 16px; font-size: 1.5rem; font-weight: 700; text-align: center;
                            letter-spacing: 0.3em; text-transform: uppercase; border: 2px solid var(--border);
                            border-radius: 12px; background: var(--bg); color: var(--text);
                            font-family: 'Inter', monospace; outline: none; transition: border-color 0.3s;">
                    </div>
                    <div id="codeError" style="color: var(--danger, #EF4444); font-size: 0.85rem; display: none;"></div>
                    <button type="submit" style="padding: 14px 24px; background: var(--primary); color: white;
                        border: none; border-radius: 12px; font-size: 1.05rem; font-weight: 700;
                        cursor: pointer; transition: transform 0.2s, background 0.3s;
                        font-family: 'Nunito Sans', sans-serif;">
                        Weiter
                    </button>
                </form>
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);">
                    <button onclick="skipCode()" style="background: none; border: none; color: var(--text-tertiary, #94A3B8);
                        font-size: 0.85rem; cursor: pointer; text-decoration: underline;">
                        Ohne Code fortfahren (nur zum Testen)
                    </button>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('codeForm');
    const input = document.getElementById('codeInput');
    input.focus();

    input.addEventListener('focus', () => { input.style.borderColor = 'var(--primary)'; });
    input.addEventListener('blur', () => { input.style.borderColor = 'var(--border)'; });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = input.value.trim().toUpperCase();
        if (code.length < 3) {
            const err = document.getElementById('codeError');
            err.textContent = 'Bitte gib einen gültigen Code ein (mind. 3 Zeichen).';
            err.style.display = 'block';
            input.style.borderColor = 'var(--danger, #EF4444)';
            return;
        }
        activateCode(code);
    });
}

function skipCode() {
    localStorage.setItem('zp10_student_code', 'GAST');
    const hubData = loadHubData();
    hubData.studentCode = 'GAST';
    saveHubData(hubData);
    location.reload();
}

function activateCode(code) {
    localStorage.setItem('zp10_student_code', code);
    const hubData = loadHubData();
    hubData.studentCode = code;
    if (hubData.studentName === 'Schüler') {
        hubData.studentName = code;
    }
    saveHubData(hubData);
    location.reload();
}

// ===== PASSWORT-SETUP (einmalig nach erstem Code) =====
function showProfilSetup() {
    initTheme();
    document.body.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:2rem;">
            <div style="max-width:400px;width:100%;text-align:center;background:var(--surface);border-radius:20px;padding:2.5rem;box-shadow:0 8px 32px rgba(0,0,0,0.15);border:2px solid var(--primary);">
                <div style="font-size:3rem;margin-bottom:0.5rem;">🔐</div>
                <h1 style="color:var(--primary);margin-bottom:0.5rem;font-size:1.5rem;font-family:'Nunito Sans',sans-serif;">Passwort vergeben</h1>
                <p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.5;font-size:0.9rem;">
                    Schütze deine Daten mit einem persönlichen Passwort.
                </p>
                <div style="display:flex;flex-direction:column;gap:14px;text-align:left;">
                    <div>
                        <label style="font-size:0.85rem;font-weight:700;color:var(--text-secondary);display:block;margin-bottom:6px;">Passwort (optional)</label>
                        <input id="setupPw" type="password" placeholder="Mind. 4 Zeichen"
                            style="width:100%;padding:12px;border:2px solid var(--border);border-radius:10px;background:var(--bg);color:var(--text);font-size:1rem;outline:none;box-sizing:border-box;">
                        <div style="font-size:0.78rem;color:var(--text-tertiary,#94a3b8);margin-top:4px;">Leer lassen = kein Passwort</div>
                    </div>
                    <div id="setupError" style="color:var(--danger,#EF4444);font-size:0.85rem;display:none;"></div>
                    <button id="setupBtn" style="padding:14px;background:var(--primary);color:white;border:none;border-radius:12px;font-size:1.05rem;font-weight:700;cursor:pointer;font-family:'Nunito Sans',sans-serif;margin-top:4px;">
                        Weiter ➜
                    </button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('setupPw').focus();
    document.getElementById('setupBtn').addEventListener('click', () => {
        const pw  = document.getElementById('setupPw').value;
        const err = document.getElementById('setupError');
        if (pw && pw.length < 4) { err.textContent = 'Passwort muss mind. 4 Zeichen haben.'; err.style.display = 'block'; return; }
        localStorage.setItem('zp10_password', pw || 'NONE');
        sessionStorage.setItem('zp10_authenticated', '1');
        location.reload();
    });
}

// ===== PASSWORT-GATE (bei Rückkehr) =====
function showPasswordGate() {
    initTheme();
    const hubData = loadHubData();
    const name = hubData.studentName || 'Schüler';
    document.body.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:2rem;">
            <div style="max-width:400px;width:100%;text-align:center;background:var(--surface);border-radius:20px;padding:2.5rem;box-shadow:0 8px 32px rgba(0,0,0,0.15);border:2px solid var(--primary);">
                <div style="font-size:3rem;margin-bottom:0.5rem;">🔒</div>
                <h1 style="color:var(--primary);margin-bottom:0.25rem;font-size:1.4rem;font-family:'Nunito Sans',sans-serif;">Hallo, ${name}!</h1>
                <p style="color:var(--text-secondary);margin-bottom:1.5rem;font-size:0.9rem;">Bitte gib dein Passwort ein.</p>
                <input id="pwInput" type="password" placeholder="Passwort"
                    style="width:100%;padding:14px;font-size:1.1rem;text-align:center;border:2px solid var(--border);border-radius:12px;background:var(--bg);color:var(--text);outline:none;box-sizing:border-box;margin-bottom:12px;">
                <div id="pwError" style="color:var(--danger,#EF4444);font-size:0.85rem;display:none;margin-bottom:12px;"></div>
                <button id="pwBtn" style="width:100%;padding:14px;background:var(--primary);color:white;border:none;border-radius:12px;font-size:1.05rem;font-weight:700;cursor:pointer;font-family:'Nunito Sans',sans-serif;">
                    Anmelden
                </button>
                <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);">
                    <p style="font-size:0.8rem;color:var(--text-tertiary,#94a3b8);margin:0;">
                        Passwort vergessen? Bitte deine Lehrkraft, es zurückzusetzen.
                    </p>
                </div>
            </div>
        </div>
    `;
    const input = document.getElementById('pwInput');
    input.focus();
    const check = () => {
        const stored = localStorage.getItem('zp10_password');
        if (input.value === stored) {
            sessionStorage.setItem('zp10_authenticated', '1');
            location.reload();
        } else {
            const err = document.getElementById('pwError');
            err.textContent = 'Falsches Passwort. Versuche es nochmal.';
            err.style.display = 'block';
            input.value = '';
            input.focus();
        }
    };
    document.getElementById('pwBtn').addEventListener('click', check);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
}

// ===== TIER-WAHL ONBOARDING =====
function showCreatureOnboarding() {
    initTheme();
    const creatures = ZP10.CREATURES;
    const cards = Object.entries(creatures).map(([key, cr]) => `
        <div onclick="chooseCreatureOnboarding('${key}')"
            style="background:var(--surface);border:2px solid ${cr.color}40;border-radius:16px;padding:1rem;cursor:pointer;
            transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;"
            onmouseover="this.style.borderColor='${cr.color}';this.style.transform='translateY(-4px)'"
            onmouseout="this.style.borderColor='${cr.color}40';this.style.transform='none'">
            <img src="companion-img/${key}-0.png" alt="${cr.name}"
                style="width:90px;height:90px;object-fit:contain;"
                onerror="this.outerHTML='<div style=\'font-size:3.5rem\'>${cr.emoji}</div>'">
            <div style="font-weight:800;color:${cr.color};font-size:0.95rem;">${cr.emoji} ${cr.name}</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);">${cr.stages[0]}</div>
        </div>
    `).join('');

    document.body.innerHTML = `
        <div style="min-height:100vh;background:var(--bg);padding:2rem;display:flex;align-items:center;justify-content:center;">
            <div style="max-width:560px;width:100%;text-align:center;">
                <div style="font-size:3rem;margin-bottom:0.5rem;">🐾</div>
                <h1 style="color:var(--primary);margin-bottom:0.5rem;font-size:1.6rem;font-family:'Nunito Sans',sans-serif;">Wähle deinen Begleiter!</h1>
                <p style="color:var(--text-secondary);margin-bottom:1.5rem;font-size:0.9rem;line-height:1.6;">
                    Dein Begleiter wächst mit dir — je mehr Fehlvorstellungen du meisterst, desto stärker wird er.
                </p>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:1.5rem;">
                    ${cards}
                </div>
                <button onclick="skipCreatureOnboarding()"
                    style="background:none;border:none;color:var(--text-tertiary,#94a3b8);font-size:0.85rem;cursor:pointer;text-decoration:underline;">
                    Ohne Begleiter spielen
                </button>
            </div>
        </div>
    `;
}

function chooseCreatureOnboarding(type) {
    ZP10.setCreature(type);
    location.reload();
}

function skipCreatureOnboarding() {
    const hubData = loadHubData();
    if (!hubData.creature) hubData.creature = {};
    hubData.creature.skipped = true;
    hubData.creature.unlocked = false;
    saveHubData(hubData);
    location.reload();
}

// ===== INITIALIZATION =====
function init() {
    const params = new URLSearchParams(window.location.search);
    const skipCodeGate = params.has('lehrer');
    const skipGate     = params.has('hub');

    // ===== CODE GATE =====
    const studentCode = getStudentCode();
    if (!studentCode && !skipCodeGate) {
        showCodeGate();
        return;
    }

    // ===== PROFIL-SETUP (einmalig nach erstem Login) =====
    const storedPw = localStorage.getItem('zp10_password');
    if (!storedPw && !skipCodeGate) {
        showProfilSetup();
        return;
    }

    // ===== PASSWORT-GATE (bei Rückkehr) =====
    const authenticated = sessionStorage.getItem('zp10_authenticated');
    if (storedPw && storedPw !== 'NONE' && !authenticated && !skipCodeGate) {
        showPasswordGate();
        return;
    }

    // ===== TIER-WAHL ONBOARDING (einmalig) =====
    const hubData = loadHubData();
    const creatureData = hubData.creature;
    const creatureChosen = creatureData && (creatureData.type || creatureData.skipped);
    if (!creatureChosen && !skipCodeGate) {
        showCreatureOnboarding();
        return;
    }

    // ===== ESCAPE ROOM GATE (flexibel) =====
    const escapeResults = localStorage.getItem('zp10_escape_results');
    const escapeState = localStorage.getItem('zp10_escape_state');

    if (!escapeResults && !skipGate) {
        showEscapeGate(escapeState);
        return;
    }

    initTheme();
    setupLehrerAccess();
    updateCountdown();
    updateHeader();
    updateCreatureMini();
    updateDailyChallenge();
    renderModules();
    renderExtraModules();
    setupResetButton();
    setupExportButton();
    setupCollapsible();
    renderCreatureHubWidget();
    renderGuardianWidget();

    // Escape Room-Banner anzeigen, wenn noch nicht abgeschlossen
    if (!escapeResults && escapeState) {
        showEscapeReminder();
    }

    // Update every minute
    setInterval(updateCountdown, 60000);
}

function showEscapeGate(escapeState) {
    const hasProgress = !!escapeState;
    let progressInfo = '';
    if (hasProgress) {
        try {
            const state = JSON.parse(escapeState);
            const completed = Object.keys(state.completedRooms || {}).length;
            progressInfo = `<p style="color: var(--text-secondary); margin-bottom: 1rem;">Du hast bereits ${completed}/10 Räume abgeschlossen.</p>`;
        } catch(e) {}
    }

    document.body.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 2rem;">
            <div style="max-width: 500px; text-align: center; background: var(--surface); border-radius: 16px; padding: 2.5rem; box-shadow: 0 8px 32px rgba(0,0,0,0.2); border: 2px solid var(--primary);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
                <h1 style="color: var(--primary); margin-bottom: 0.5rem; font-size: 1.5rem;">ZP10 Mathe-Diagnose</h1>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5;">
                    Starte mit dem <strong>Escape Room</strong>, um deine Stärken und Schwächen zu erkennen.
                    Danach werden alle Übungsmodule freigeschaltet.
                </p>
                ${progressInfo}
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <a href="escape-room.html" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 24px; background: var(--primary); color: white; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 1.05rem; transition: transform 0.2s;">
                        🔐 ${hasProgress ? 'Escape Room fortsetzen' : 'Escape Room starten'}
                    </a>
                    <a href="?hub" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 24px; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); border-radius: 10px; text-decoration: none; font-size: 0.9rem; transition: opacity 0.2s;">
                        Direkt zu den Übungsmodulen →
                    </a>
                </div>
            </div>
        </div>
    `;
}

function showEscapeReminder() {
    const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body.firstElementChild;
    if (!mainContent) return;

    const banner = document.createElement('div');
    banner.style.cssText = 'background: linear-gradient(135deg, var(--primary), var(--primary-dark, #1a3f28)); color: white; padding: 16px 20px; border-radius: 12px; margin: 0 1rem 1.5rem; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;';
    banner.innerHTML = `
        <span style="font-size: 1.5rem;">🔐</span>
        <div style="flex: 1; min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 2px;">Escape Room noch nicht abgeschlossen</div>
            <div style="font-size: 0.85rem; opacity: 0.85;">Schließe alle 10 Räume ab, um dein vollständiges Diagnose-Ergebnis zu erhalten.</div>
        </div>
        <a href="escape-room.html" style="padding: 8px 18px; background: white; color: var(--primary); border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.9rem; white-space: nowrap;">Fortsetzen →</a>
    `;

    const firstSection = mainContent.querySelector('section') || mainContent.firstElementChild;
    if (firstSection) {
        mainContent.insertBefore(banner, firstSection);
    } else {
        mainContent.prepend(banner);
    }
}

// ===== KREATUR HUB WIDGET =====
function renderCreatureHubWidget() {
    const widget = document.getElementById('creatureHubWidget');
    if (!widget) return;

    try {
        const hubData = loadHubData();
        const creature = hubData.creature;

        if (!creature || !creature.unlocked || !creature.type) {
            widget.style.display = 'none';
            return;
        }

        const CREATURES = ZP10.CREATURES;
        const cr = CREATURES[creature.type];
        if (!cr) { widget.style.display = 'none'; return; }

        // G1: Use mastered MV count for creature evolution (not XP)
        const masteredCount = ZP10.getMasteredMVCount();
        const level = ZP10.getCreatureLevel(masteredCount);
        const progress = ZP10.getCreatureProgress(masteredCount);
        const mood = ZP10.getCreatureMood(hubData);
        const weakest = ZP10.getWeakestModule(hubData, modulesMetadata);

        // Sprite + Glow-Farbe
        const spritePath = ZP10.getCreatureSprite(creature.type, level);
        const hubImg = document.getElementById('creatureHubImg');
        hubImg.style.display = '';
        hubImg.src = spritePath;
        widget.style.setProperty('--creature-color', cr.color + '33');

        // Mood-Badge
        const moodBadge = document.getElementById('creatureHubMoodBadge');
        if (moodBadge) moodBadge.textContent = mood.emoji;

        // Sprech-Blase bei Klick auf Sprite
        const spriteImg = document.getElementById('creatureHubImg');
        if (spriteImg && !spriteImg._speechBound) {
            spriteImg._speechBound = true;
            spriteImg.style.cursor = 'pointer';
            spriteImg.addEventListener('click', (e) => {
                e.stopPropagation();
                const msgs = [
                    'Du schaffst das! 💪',
                    progress.next ? 'Noch ' + (progress.next - progress.current) + ' MVs bis zur Entwicklung!' : 'Du bist auf Maximum! 🏆',
                    'Jeder Fehler bringt dich weiter! ✨',
                    'Heute trainiert, morgen gemeistert! 🌟',
                    'Ich glaube an dich! 🐾',
                ];
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                let bubble = document.getElementById('creatureSpeechBubble');
                if (!bubble) {
                    bubble = document.createElement('div');
                    bubble.id = 'creatureSpeechBubble';
                    bubble.className = 'creature-speech-bubble';
                    const wrap = document.querySelector('.creature-hub-sprite-wrap');
                    if (wrap) wrap.appendChild(bubble);
                }
                bubble.textContent = msg;
                bubble.classList.add('visible');
                clearTimeout(bubble._timer);
                bubble._timer = setTimeout(() => bubble.classList.remove('visible'), 3000);
            });
        }

        document.getElementById('creatureHubName').textContent = cr.emoji + ' ' + cr.stages[level];
        document.getElementById('creatureHubName').style.color = cr.color;
        const nextNeeded = progress.next !== null ? (progress.next - progress.current + ' MV bis ' + cr.stages[Math.min(level+1, cr.stages.length-1)]) : 'Vollständig gemeistert!';
        document.getElementById('creatureHubStage').textContent = cr.name + ' · ' + masteredCount + ' Fehlvorstellungen gemeistert · ' + nextNeeded;
        document.getElementById('creatureHubMood').innerHTML = 'Stimmung: <span style="color:' + mood.color + ';font-weight:700;">' + mood.emoji + ' ' + mood.label + '</span>';
        document.getElementById('creatureHubXpFill').style.width = progress.pct + '%';
        document.getElementById('creatureHubXpFill').style.background = 'linear-gradient(90deg,' + cr.color + ',' + cr.color + 'cc)';

        const hint = document.getElementById('creatureHubHint');
        if (weakest) {
            hint.textContent = '\u{1F4AC} \u201EIch brauche ' + weakest.name + '-Training!\u201C';
            hint.style.display = 'block';
        } else {
            hint.style.display = 'none';
        }

        widget.style.display = 'flex';
        widget.style.borderColor = cr.color + '40';
    } catch(e) {
        console.warn('Creature hub widget error:', e);
        widget.style.display = 'none';
    }
}

// ===== GUARDIAN (Klassen-Nebelwolf) =====
function renderGuardianWidget() {
    const widget = document.getElementById('guardianWidget');
    if (!widget) return;

    // Cached local data shown immediately while server loads
    const cached = _guardianLocalFallback();
    renderGuardianWidgetWithData(cached, widget);

    // Try server fetch for real class-aggregated XP
    const serverUrl = localStorage.getItem('zp10_server_url') || window.ZP10_SERVER_URL;
    const apiKey    = localStorage.getItem('zp10_server_key') || window.ZP10_API_KEY;
    if (serverUrl && apiKey) {
        fetch(serverUrl + '/guardian.php', { headers: { 'X-API-Key': apiKey } })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && typeof data.xp === 'number') {
                    // Merge: keep local name, use server XP
                    const gd = { ..._guardianLocalFallback(), xp: data.xp, students: data.students };
                    localStorage.setItem('zp10_guardian_data', JSON.stringify(gd));
                    renderGuardianWidgetWithData(gd, widget);
                }
            })
            .catch(() => {}); // silently fall back to cached data
    }
}

function _guardianLocalFallback() {
    try {
        const stored = JSON.parse(localStorage.getItem('zp10_guardian_data') || 'null');
        if (stored) return stored;
    } catch(e) {}
    // Auto-create from local XP as first estimate
    const hubData  = loadHubData();
    const totalXP  = hubData.totalXP || 0;
    const gd = { xp: Math.round(totalXP * 0.2), name: 'Nebula', createdAt: new Date().toISOString() };
    localStorage.setItem('zp10_guardian_data', JSON.stringify(gd));
    return gd;
}

function renderGuardianWidgetWithData(gd, widget) {
    const G = ZP10.GUARDIAN;
    if (!G) { widget.style.display = 'none'; return; }

    const xp = gd.xp || 0;
    let level = 0;
    for (let i = 1; i < G.thresholds.length; i++) {
        if (xp >= G.thresholds[i]) level = i;
    }

    const nextThr = level < G.thresholds.length - 1 ? G.thresholds[level + 1] : null;
    const currentThr = G.thresholds[level];
    const pct = nextThr ? Math.round((xp - currentThr) / (nextThr - currentThr) * 100) : 100;

    // Wolf sprite
    document.getElementById('guardianImg').src = ZP10.getGuardianSprite(level);
    document.getElementById('guardianName').textContent = G.emoji + ' ' + (gd.name || 'Nebelwolf');
    document.getElementById('guardianStage').textContent = G.stages[level] + ' · Stufe ' + (level + 1) + '/' + G.stages.length;
    document.getElementById('guardianXpFill').style.width = Math.min(100, pct) + '%';
    const studentsText = gd.students ? ' · ' + gd.students + ' Schüler' : '';
    document.getElementById('guardianXpText').textContent = nextThr
        ? xp + ' / ' + nextThr + ' XP' + studentsText
        : xp + ' XP · Max!' + studentsText;

    widget.style.display = 'flex';
}

// ===== OLD COMPANION REMOVED =====
// ===== CREATURE MINI (Hub Header) =====
function updateCreatureMini() {
    const miniEl = document.getElementById('creatureMini');
    if (!miniEl) return;

    try {
        const hubData = loadHubData();
        const creature = hubData.creature;

        if (!creature || !creature.unlocked || !creature.type) {
            miniEl.style.display = 'none';
            return;
        }

        const cr = ZP10.CREATURES[creature.type];
        if (!cr) { miniEl.style.display = 'none'; return; }

        // G1: Use mastered MV count for mini creature level
        const masteredCount = ZP10.getMasteredMVCount();
        const level = ZP10.getCreatureLevel(masteredCount);

        // Mood calculation (simplified)
        const daily = JSON.parse(localStorage.getItem('zp10_daily_data') || '{"streak":0}');
        const streak = daily.streak || 0;
        let moodEmoji = '😐';
        if (streak >= 3) moodEmoji = '😊';

        // Sprite laden
        document.getElementById('creatureMiniImg').src = ZP10.getCreatureSprite(creature.type, level);

        document.getElementById('creatureMiniName').textContent = cr.emoji + ' ' + cr.stages[level];
        document.getElementById('creatureMiniName').style.color = cr.color;
        document.getElementById('creatureMiniMood').textContent = moodEmoji + ' ' + masteredCount + ' MV';

        miniEl.style.display = 'flex';
    } catch(e) {
        console.warn('Creature mini error:', e);
        miniEl.style.display = 'none';
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);