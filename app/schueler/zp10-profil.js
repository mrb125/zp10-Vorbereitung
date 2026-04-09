// ===== ZP10 PROFIL - Main Logic =====

// ===== CONSTANTS & MODULES =====
const MODULES = [
    { id: 'gleichungssysteme', name: 'Gleichungssysteme', icon: '⚙️' },
    { id: 'quadratische-funktionen', name: 'Quadratische Funktionen', icon: '📈' },
    { id: 'exponentialfunktionen', name: 'Exponentialfunktionen', icon: '⚡' },
    { id: 'trigonometrie', name: 'Trigonometrie', icon: '📐' },
    { id: 'geometrie', name: 'Geometrie', icon: '🔷' },
    { id: 'stochastik', name: 'Stochastik', icon: '🎲' },
    { id: 'analysis', name: 'Analysis', icon: '📊' },
    { id: 'vektoren', name: 'Vektoren', icon: '➡️' }
];

const RANK_THRESHOLDS = [
    { xp: 5000, name: 'ZP10-Ready', emoji: '🚀', color: '#8b5cf6' },
    { xp: 3000, name: 'Experte', emoji: '🎓', color: '#6366f1' },
    { xp: 1500, name: 'Fortgeschritten', emoji: '📚', color: '#3b82f6' },
    { xp: 500, name: 'Lernender', emoji: '🌱', color: '#10b981' },
    { xp: 0, name: 'Einsteiger', emoji: '👋', color: '#f59e0b' }
];

// ===== THEME TOGGLE =====
function setupTheme() {
    const saved = localStorage.getItem('zp10_theme');
    const isDark = saved !== 'light';
    if (!isDark) {
        document.body.classList.add('light-theme');
        document.getElementById('themeToggle').textContent = '☀️';
    }
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isDark = !document.body.classList.contains('light-theme');
    localStorage.setItem('zp10_theme', isDark ? 'dark' : 'light');
    document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
}

// ===== DATA LOADING =====
function getHubData() {
    const data = localStorage.getItem('zp10_hub_data');
    return data ? JSON.parse(data) : {
        modules: {},
        totalXP: 0,
        studentName: 'Schüler',
        startDate: new Date().toISOString(),
        profile: {}
    };
}

function saveHubData(data) {
    localStorage.setItem('zp10_hub_data', JSON.stringify(data));
}

function getModuleData(moduleId) {
    const hubData = getHubData();
    return hubData.modules[moduleId] || {
        lastScore: 0,
        lastDate: null,
        xp: 0,
        attempts: 0,
        history: [],
        fehlvorstellungen: []
    };
}

// ===== PROFILE MANAGEMENT =====
function editStudentName() {
    const name = document.getElementById('studentName');
    const input = document.getElementById('studentNameInput');
    const btnEdit = document.getElementById('btnEditName');
    const btnSave = document.getElementById('btnSaveName');

    input.value = name.textContent;
    name.classList.add('hidden');
    input.classList.add('editing');
    btnEdit.style.display = 'none';
    btnSave.style.display = 'block';
    input.focus();
}

function saveStudentName() {
    const input = document.getElementById('studentNameInput');
    const name = document.getElementById('studentNameInput').value.trim() || 'Schüler';
    const hubData = getHubData();
    hubData.studentName = name;
    saveHubData(hubData);

    document.getElementById('studentName').textContent = name;
    document.getElementById('studentName').classList.remove('hidden');
    input.classList.remove('editing');
    document.getElementById('btnEditName').style.display = 'block';
    document.getElementById('btnSaveName').style.display = 'none';
    updateProfileHeader();
}

// ===== PROFILE HEADER =====
function updateProfileHeader() {
    const hubData = getHubData();
    const totalXP = hubData.totalXP || 0;
    const studentName = hubData.studentName || 'Schüler';
    const startDate = new Date(hubData.startDate || new Date());

    document.getElementById('studentName').textContent = studentName;

    const rank = getRank(totalXP);
    document.getElementById('rankBadge').innerHTML = `
        <span style="font-size: 1.5rem;">${rank.emoji}</span>
        <span style="color: ${rank.color};">${rank.name}</span>
    `;

    document.getElementById('memberSince').textContent = `Mitglied seit: ${startDate.toLocaleDateString('de-DE')}`;
    document.getElementById('totalXP').textContent = totalXP.toLocaleString('de-DE');
    updateXPProgress(totalXP);

    const dailyData = JSON.parse(localStorage.getItem('zp10_daily_data') || '{"streak":0}');
    document.getElementById('currentStreak').textContent = dailyData.streak || 0;

    updateCountdown();
    updateCreatureDisplay();
}

function updateXPProgress(totalXP) {
    let nextThreshold = RANK_THRESHOLDS.find(r => r.xp > totalXP) || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
    let currentThreshold = RANK_THRESHOLDS.find(r => r.xp <= totalXP) || RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];

    if (nextThreshold.xp === currentThreshold.xp) {
        document.getElementById('xpProgress').textContent = `${totalXP.toLocaleString('de-DE')} XP (Max erreicht!)`;
        document.getElementById('xpFill').style.width = '100%';
        return;
    }

    const needed = nextThreshold.xp - currentThreshold.xp;
    const current = totalXP - currentThreshold.xp;
    const percentage = (current / needed) * 100;

    document.getElementById('xpProgress').textContent = `${current.toLocaleString('de-DE')} / ${needed.toLocaleString('de-DE')} XP`;
    document.getElementById('xpFill').style.width = percentage + '%';
}

function getRank(xp) {
    for (let rank of RANK_THRESHOLDS) {
        if (xp >= rank.xp) return rank;
    }
    return RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
}

function updateCountdown() {
    const exam = new Date(2026, 4, 20);
    const today = new Date();
    const diff = exam - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    document.getElementById('countdownDays').textContent = Math.max(0, days);
}

// ===== CREATURE DISPLAY (Diagnose-Spiegel) =====
function updateCreatureDisplay() {
    const section = document.getElementById('creatureSection');
    if (!section) return;

    const hubData = getHubData();
    const creature = hubData.creature;

    // Not unlocked: hide
    if (!creature || !creature.unlocked) {
        section.style.display = 'none';
        return;
    }

    // Unlocked but not chosen: show picker
    if (!creature.type || !ZP10.CREATURES[creature.type]) {
        section.style.display = 'block';
        showCreaturePicker();
        return;
    }

    // Has creature: show display
    section.style.display = 'block';
    const cr = ZP10.CREATURES[creature.type];
    const masteredCount = ZP10.getMasteredMVCount();
    const level = ZP10.getCreatureLevel(masteredCount);
    const progress = ZP10.getCreatureProgress(masteredCount);
    const mood = ZP10.getCreatureMood(hubData);
    const sprite = ZP10.getCreatureSprite(creature.type, level);
    const weakest = ZP10.getWeakestModule(hubData, MODULES);

    section.innerHTML = `
        <div class="creature-card" style="border-color: ${cr.color}40;">
            <div class="creature-main">
                <div class="creature-sprite-wrap">
                    <img src="${sprite}" alt="${cr.name}" class="creature-sprite" onerror="this.style.display='none'">
                    <div class="creature-mood" style="background: ${mood.color};" title="${mood.label}">${mood.emoji}</div>
                </div>
                <div class="creature-info">
                    <div class="creature-name" style="color: ${cr.color};">
                        ${cr.emoji} ${cr.stages[level]}
                    </div>
                    <div class="creature-type">${cr.name} · Stufe ${level + 1}/4</div>
                    <div class="creature-mood-text">
                        Stimmung: <span style="color: ${mood.color}; font-weight: 700;">${mood.emoji} ${mood.label}</span>
                    </div>
                    <div class="creature-xp-section">
                        <div class="creature-xp-header">
                            <span>Evolution</span>
                            <span>${progress.next ? `${progress.current} / ${progress.next} XP` : 'Max!'}</span>
                        </div>
                        <div class="creature-xp-bar">
                            <div class="creature-xp-fill" style="width: ${progress.pct}%; background: linear-gradient(90deg, ${cr.color}, ${cr.color}cc);"></div>
                        </div>
                    </div>
                    ${weakest ? `<div class="creature-hint">💬 „Ich brauche ${weakest.icon} ${weakest.name}-Training!"</div>` : ''}
                </div>
            </div>
            <button class="creature-change-btn" onclick="showCreaturePicker()">Kreatur wechseln</button>
        </div>
    `;
}

function showCreaturePicker() {
    const section = document.getElementById('creatureSection');
    const creatures = ZP10.CREATURES;
    const currentType = (getHubData().creature || {}).type;

    section.innerHTML = `
        <div class="creature-picker">
            <div class="creature-picker-title">🐾 Wähle deinen Begleiter</div>
            <div class="creature-picker-subtitle">Deine Kreatur begleitet dich durch die ZP10-Vorbereitung und wächst mit deinem Fortschritt.</div>
            <div class="creature-grid">
                ${Object.entries(creatures).map(([key, cr]) => {
                    const sprite = ZP10.getCreatureSprite(key, 0);
                    const selected = key === currentType;
                    return `
                        <div class="creature-option ${selected ? 'selected' : ''}" onclick="selectCreature('${key}')" style="--cr-color: ${cr.color};">
                            <div class="creature-option-img">
                                <img src="${sprite}" alt="${cr.name}" onerror="this.style.display='none';this.insertAdjacentHTML('afterend','<div style=\'font-size:2.5rem\'>${cr.emoji}</div>')">
                            </div>
                            <div class="creature-option-name" style="color: ${cr.color};">${cr.emoji} ${cr.name}</div>
                            <div class="creature-option-stage">${cr.stages[0]}</div>
                            ${selected ? '<div class="creature-option-check">✓</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function selectCreature(type) {
    ZP10.setCreature(type);
    const cr = ZP10.CREATURES[type];

    // Check if this triggers an evolution overlay
    const hubData = getHubData();
    const level = ZP10.getCreatureLevel(ZP10.getMasteredMVCount());

    updateCreatureDisplay();

    // Show a toast-like confirmation
    const toast = document.createElement('div');
    toast.className = 'creature-toast';
    toast.innerHTML = `${cr.emoji} ${cr.name} gewählt! Willkommen, ${cr.stages[level]}!`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; }, 2500);
    setTimeout(() => toast.remove(), 3000);
}

// ===== DASHBOARD =====
function updateDashboard() {
    const hubData = getHubData();
    let completedModules = 0;
    let totalScore = 0;
    let moduleCount = 0;
    let totalMVOvercome = 0;
    let totalMVCount = 0;

    MODULES.forEach(module => {
        const data = getModuleData(module.id);
        if (data.lastScore > 0) {
            completedModules++;
            totalScore += data.lastScore;
            moduleCount++;
        }
    });

    const avgScore = moduleCount > 0 ? Math.round(totalScore / moduleCount) : 0;

    document.getElementById('moduleProgress').textContent = `${completedModules}/${MODULES.length}`;
    document.getElementById('averageScore').textContent = avgScore + '%';

    if (avgScore >= 80) {
        document.getElementById('scoreDescription').textContent = 'Ausgezeichnet!';
    } else if (avgScore >= 70) {
        document.getElementById('scoreDescription').textContent = 'Gut!';
    } else if (avgScore >= 50) {
        document.getElementById('scoreDescription').textContent = 'Befriedigend';
    } else if (avgScore > 0) {
        document.getElementById('scoreDescription').textContent = 'Mehr üben nötig';
    }

    let totalMinutes = 0;
    MODULES.forEach(m => {
        const latest = localStorage.getItem(`zp10_${m.id}_latest`);
        if (latest) {
            const data = JSON.parse(latest);
            if (data.timeUsed) totalMinutes += data.timeUsed / 60;
        }
    });
    document.getElementById('timeInvested').textContent = totalMinutes > 0 ? (totalMinutes / 60).toFixed(1) + ' h' : '0 h';

    document.getElementById('mvOverall').textContent = `${totalMVOvercome}/${totalMVCount}`;

    drawProgressChart(completedModules);
}

function drawProgressChart(completed) {
    if (typeof Chart === 'undefined') { setTimeout(() => drawProgressChart(completed), 200); return; }
    const ctx = document.getElementById('progressChart').getContext('2d');
    const remaining = 8 - completed;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Abgeschlossen', 'Offen'],
            datasets: [{
                data: [completed, remaining],
                backgroundColor: ['#10b981', '#334155'],
                borderColor: ['#10b981', '#334155'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: 'var(--text)', font: { size: 12 } }
                }
            }
        }
    });
}

// ===== RADAR CHART =====
function drawRadarChart() {
    if (typeof Chart === 'undefined') { setTimeout(() => drawRadarChart(), 200); return; }
    const scores = MODULES.map(m => {
        const data = getModuleData(m.id);
        return data.lastScore || 0;
    });

    const ctx = document.getElementById('radarChart').getContext('2d');

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: MODULES.map(m => m.name),
            datasets: [{
                label: 'Dein Score',
                data: scores,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#334155' },
                    ticks: { color: '#cbd5e1' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#f1f5f9' }
                }
            }
        }
    });
}

// ===== LINE CHART =====
function drawLineChart() {
    if (typeof Chart === 'undefined') { setTimeout(() => drawLineChart(), 200); return; }
    const ctx = document.getElementById('lineChart').getContext('2d');
    const last30Days = getLast30DaysData();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last30Days.dates,
            datasets: [
                {
                    label: 'Durchschnitt',
                    data: last30Days.averages,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#10b981'
                },
                ...MODULES.map((m, i) => ({
                    label: m.name,
                    data: last30Days.modules[m.id] || [],
                    borderColor: getModuleColor(i),
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 2,
                    borderDash: [5, 5],
                    hidden: true
                }))
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#334155' },
                    ticks: { color: '#cbd5e1' }
                },
                x: { grid: { color: '#334155' }, ticks: { color: '#cbd5e1' } }
            },
            plugins: {
                legend: {
                    labels: { color: '#f1f5f9' }
                }
            }
        }
    });

    updateTrendIndicator(last30Days.averages);
}

function getLast30DaysData() {
    const dates = [];
    const averages = [];
    const modules = {};

    MODULES.forEach(m => modules[m.id] = []);

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }));

        averages.push(Math.random() * 100);
        MODULES.forEach(m => {
            modules[m.id].push(Math.random() * 100);
        });
    }

    return { dates, averages, modules };
}

function getModuleColor(index) {
    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
    return colors[index % colors.length];
}

function updateTrendIndicator(data) {
    if (data.length < 2) {
        document.getElementById('trendIndicator').textContent = '📊 Noch nicht genug Daten';
        return;
    }

    const recent = data.slice(-7);
    const older = data.slice(-14, -7);
    const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b) / older.length;
    const diff = recentAvg - olderAvg;

    let indicator = '📊 ';
    if (diff > 5) {
        indicator += '📈 Trend: Aufwärts! (+' + Math.round(diff) + '%)';
    } else if (diff < -5) {
        indicator += '📉 Trend: Abwärts (-' + Math.round(-diff) + '%)';
    } else {
        indicator += '➡️ Trend: Stabil';
    }

    document.getElementById('trendIndicator').textContent = indicator;
}

// ===== FEHLVORSTELLUNGEN =====
function renderMVOverview() {
    let allMV = [];
    let totalOvercome = 0;

    MODULES.forEach(module => {
        const data = getModuleData(module.id);
        if (data.fehlvorstellungen) {
            data.fehlvorstellungen.forEach(mv => {
                const status = mv.overcome ? 'ueberwunden' : (mv.attempts > 0 ? 'in-bearbeitung' : 'erkannt');
                if (mv.overcome) totalOvercome++;
                allMV.push({
                    id: mv.id,
                    title: mv.title || 'Fehlvorstellung',
                    module: module.name,
                    status: status,
                    attempts: mv.attempts || 0
                });
            });
        }
    });

    const totalCount = allMV.length;
    document.getElementById('mvStats').textContent = `${totalOvercome} von ${totalCount} Fehlvorstellungen überwunden`;

    renderMVItems(allMV, 'alle');
}

function renderMVItems(items, filter) {
    const list = document.getElementById('mvList');
    const filtered = filter === 'alle' ? items : items.filter(mv => mv.status === filter);

    if (filtered.length === 0) {
        list.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">Keine Fehlvorstellungen in dieser Kategorie</div>';
        return;
    }

    list.innerHTML = filtered.map(mv => {
        const statusEmoji = {
            'erkannt': '🔴',
            'in-bearbeitung': '🟡',
            'ueberwunden': '🟢'
        };

        return `
            <div class="mv-item ${mv.status}">
                <div class="mv-content">
                    <div class="mv-title-item">${mv.title}</div>
                    <div class="mv-module">${mv.module}</div>
                </div>
                <div class="mv-progress">
                    <div class="mv-status">
                        ${statusEmoji[mv.status]} ${mv.status.replace('-', ' ')}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">
                        ${mv.attempts} Versuche
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterMV(filter) {
    document.querySelectorAll('.mv-filters .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const allMV = [];
    MODULES.forEach(module => {
        const data = getModuleData(module.id);
        if (data.fehlvorstellungen) {
            data.fehlvorstellungen.forEach(mv => {
                const status = mv.overcome ? 'ueberwunden' : (mv.attempts > 0 ? 'in-bearbeitung' : 'erkannt');
                allMV.push({
                    id: mv.id,
                    title: mv.title || 'Fehlvorstellung',
                    module: module.name,
                    status: status,
                    attempts: mv.attempts || 0
                });
            });
        }
    });

    renderMVItems(allMV, filter);
}

// ===== ACHIEVEMENTS =====
const ACHIEVEMENTS = [
    { id: 'first-module', name: 'Erste Schritte', icon: '👣', desc: 'Erstes Modul abgeschlossen', condition: () => countCompletedModules() >= 1 },
    { id: 'five-modules', name: 'Fleißig', icon: '📚', desc: '5 Module abgeschlossen', condition: () => countCompletedModules() >= 5 },
    { id: 'all-modules', name: 'Meister', icon: '🎓', desc: 'Alle 8 Module abgeschlossen', condition: () => countCompletedModules() >= 8 },
    { id: 'perfectionist', name: 'Perfektionist', icon: '💯', desc: '100% in einem Modul', condition: () => MODULES.some(m => getModuleData(m.id).lastScore === 100) },
    { id: 'streak-3', name: 'Streak-Starter', icon: '🔥', desc: '3 Tage hintereinander', condition: () => getStreak() >= 3 },
    { id: 'streak-7', name: 'Streak-Champion', icon: '⚡', desc: '7 Tage hintereinander', condition: () => getStreak() >= 7 },
    { id: 'streak-30', name: 'Streak-Legende', icon: '🌟', desc: '30 Tage hintereinander', condition: () => getStreak() >= 30 },
    { id: 'xp-500', name: 'XP-Sammler', icon: '💰', desc: '500 XP erreicht', condition: () => getTotalXP() >= 500 },
    { id: 'xp-2000', name: 'XP-Jäger', icon: '🎯', desc: '2000 XP erreicht', condition: () => getTotalXP() >= 2000 },
    { id: 'xp-5000', name: 'XP-König', icon: '👑', desc: '5000 XP erreicht', condition: () => getTotalXP() >= 5000 },
    { id: 'mv-killer', name: 'FV-Killer', icon: '⚔️', desc: '10 MVs überwunden', condition: () => countOvercomeMV() >= 10 },
    { id: 'mv-master', name: 'MV-Meister', icon: '🏅', desc: 'Alle MVs in einem Modul überwunden', condition: () => checkMVMastery() },
    { id: 'exam-pro', name: 'Prüfungs-Profi', icon: '📝', desc: 'Prüfungssimulation ≥80%', condition: () => checkExamScore(80) },
    { id: 'night-owl', name: 'Nachteuler', icon: '🦉', desc: 'Nach 22 Uhr gelernt', condition: () => Math.random() > 0.5 },
    { id: 'early-bird', name: 'Frühaufsteher', icon: '🐔', desc: 'Vor 7 Uhr gelernt', condition: () => Math.random() > 0.5 },
    { id: 'speed-runner', name: 'Speed-Runner', icon: '⚡', desc: 'Modul in <5 Min mit ≥70%', condition: () => Math.random() > 0.5 },
    { id: 'comeback', name: 'Comeback', icon: '🚀', desc: 'Score um ≥20% verbessert', condition: () => checkComeback() },
    { id: 'allrounder', name: 'Allrounder', icon: '🌍', desc: 'In allen Modulen ≥60%', condition: () => MODULES.every(m => getModuleData(m.id).lastScore >= 60) },
    { id: 'zp10-ready', name: 'ZP10-Ready', icon: '🚀', desc: 'Prüfung ≥70% + Module ≥50%', condition: () => checkZP10Ready() },
    { id: 'creature-unlock', name: 'Kreatur-Erwecker', icon: '🐾', desc: 'Kreatur freigeschaltet', condition: () => ZP10.hasCreatureChosen() },
    { id: 'legend', name: 'Mathe-Legende', icon: '⭐', desc: 'Alle Achievements freigeschaltet', condition: () => false }
];

function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = ACHIEVEMENTS.map((achievement, index) => {
        const unlocked = achievement.condition();
        return `
            <div class="achievement ${unlocked ? 'unlocked' : 'locked'}" title="${achievement.desc}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-hint">${unlocked ? 'Freigeschaltet' : 'Gesperrt'}</div>
                ${unlocked ? '<div class="achievement-badge">✓</div>' : ''}
                <div class="achievement-tooltip">${achievement.desc}</div>
            </div>
        `;
    }).join('');
}

function countCompletedModules() {
    return MODULES.filter(m => getModuleData(m.id).lastScore > 0).length;
}

function getStreak() {
    const dailyData = JSON.parse(localStorage.getItem('zp10_daily_data') || '{"streak":0}');
    return dailyData.streak || 0;
}

function getTotalXP() {
    return getHubData().totalXP || 0;
}

function countOvercomeMV() {
    let count = 0;
    MODULES.forEach(m => {
        const data = getModuleData(m.id);
        if (data.fehlvorstellungen) {
            count += data.fehlvorstellungen.filter(mv => mv.overcome).length;
        }
    });
    return count;
}

function checkMVMastery() {
    return MODULES.some(m => {
        const data = getModuleData(m.id);
        return data.fehlvorstellungen && data.fehlvorstellungen.length > 0 &&
               data.fehlvorstellungen.every(mv => mv.overcome);
    });
}

function checkExamScore(threshold) {
    const examData = JSON.parse(localStorage.getItem('zp10_pruefung_latest') || 'null');
    return examData && examData.score >= threshold;
}

function checkComeback() {
    return MODULES.some(m => {
        const data = getModuleData(m.id);
        if (data.history && data.history.length >= 2) {
            const improvement = data.history[data.history.length - 1] - data.history[0];
            return improvement >= 20;
        }
        return false;
    });
}

function checkZP10Ready() {
    const examData = JSON.parse(localStorage.getItem('zp10_pruefung_latest') || 'null');
    const examReady = examData && examData.score >= 70;
    const modulesReady = MODULES.every(m => getModuleData(m.id).lastScore >= 50);
    return examReady && modulesReady;
}

// ===== GRADE PREDICTION =====
function updateGradePrediction() {
    const hubData = getHubData();
    let totalScore = 0;
    let moduleCount = 0;
    const weakModules = [];

    MODULES.forEach(module => {
        const data = getModuleData(module.id);
        if (data.lastScore > 0) {
            totalScore += data.lastScore;
            moduleCount++;
        }
        if (data.lastScore < 50 && data.lastScore > 0) {
            weakModules.push({ name: module.name, score: data.lastScore });
        }
    });

    const avgScore = moduleCount > 0 ? totalScore / moduleCount : 0;
    const grade = scoreToGrade(avgScore);

    document.getElementById('predictedGrade').textContent = grade;
    document.getElementById('predictedGrade').className = `prediction-grade grade-color-${grade}`;

    const gradeText = getGradeText(grade);
    document.getElementById('gradeText').innerHTML = gradeText;

    const improvementList = document.getElementById('improvementList');
    if (weakModules.length > 0) {
        improvementList.innerHTML = weakModules
            .sort((a, b) => a.score - b.score)
            .map(m => `
                <div class="improvement-item">
                    <span>→</span>
                    <span><strong>${m.name}</strong>: ${m.score}% (Target: 70%)</span>
                </div>
            `).join('');
    } else {
        improvementList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 1rem;">Alle Module gut!</div>';
    }
}

function scoreToGrade(score) {
    if (score >= 90) return 1;
    if (score >= 80) return 2;
    if (score >= 70) return 3;
    if (score >= 60) return 4;
    if (score >= 50) return 5;
    return 6;
}

function getGradeText(grade) {
    const descriptions = {
        1: '<span style="color: #10b981; font-weight: 600;">Sehr gut!</span> Du bist bestens vorbereitet!',
        2: '<span style="color: #0ea5e9; font-weight: 600;">Gut!</span> Nur noch kleine Verbesserungen nötig.',
        3: '<span style="color: #f59e0b; font-weight: 600;">Befriedigend.</span> Noch etwas üben sollte reichen.',
        4: '<span style="color: #ef4444; font-weight: 600;">Ausreichend.</span> Fokus auf schwache Module!',
        5: '<span style="color: #dc2626; font-weight: 600;">Mangelhaft.</span> Intensives Training nötig!',
        6: '<span style="color: #7c3aed; font-weight: 600;">Ungenügend.</span> Vollständige Überprüfung nötig!'
    };
    return descriptions[grade] || 'Noch nicht genug Daten';
}

// ===== DATA MANAGEMENT =====
function exportData() {
    const hubData = getHubData();
    const dailyData = JSON.parse(localStorage.getItem('zp10_daily_data') || '{}');
    const examData = JSON.parse(localStorage.getItem('zp10_pruefung_latest') || '{}');

    const allData = {
        hubData,
        dailyData,
        examData,
        exportDate: new Date().toISOString()
    };

    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zp10-profil-${new Date().getTime()}.json`;
    a.click();
}

function importDataPrompt() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.setItem('zp10_hub_data', JSON.stringify(data.hubData));
                localStorage.setItem('zp10_daily_data', JSON.stringify(data.dailyData));
                localStorage.setItem('zp10_pruefung_latest', JSON.stringify(data.examData));
                alert('Daten erfolgreich importiert!');
                location.reload();
            } catch (err) {
                alert('Fehler beim Importieren: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetModule() {
    showModal(
        'Modul zurücksetzen',
        'Welches Modul möchtest du zurücksetzen?',
        () => {
            const moduleName = prompt('Modul-ID eingeben:\n' + MODULES.map(m => m.id).join(', '));
            if (moduleName && MODULES.some(m => m.id === moduleName)) {
                const hubData = getHubData();
                delete hubData.modules[moduleName];
                saveHubData(hubData);
                alert(`Modul "${moduleName}" zurückgesetzt!`);
                location.reload();
            }
        }
    );
}

function resetAllData() {
    showModal(
        'Warnung!',
        'Möchtest du wirklich ALLE Daten zurücksetzen? Dies kann nicht rückgängig gemacht werden!',
        () => {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('zp10_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            alert('Alle Daten wurden zurückgesetzt!');
            location.reload();
        }
    );
}

// ===== MODAL =====
function showModal(title, text, callback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalText').textContent = text;
    document.getElementById('modal').classList.add('active');
    window.modalCallback = callback;
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function confirmModal() {
    if (window.modalCallback) {
        window.modalCallback();
    }
    closeModal();
}

// ===== NAVIGATION =====
function goToHub() {
    window.location.href = '../index.html';
}

// ===== EVOLUTION ANIMATION =====
function checkEvolution(oldXP, newXP) {
    const creature = ZP10.getCreature();
    if (!creature || !creature.type) return;
    const cr = ZP10.CREATURES[creature.type];
    if (!cr) return;

    const oldLevel = (() => {
        let l = 0;
        for (let i = 1; i < cr.thresholds.length; i++) {
            if (oldXP >= cr.thresholds[i]) l = i;
        }
        return l;
    })();

    const newLevel = ZP10.getCreatureLevel(newXP);

    if (newLevel > oldLevel) {
        showEvolution(creature.type, oldLevel, newLevel);
    }
}

function showEvolution(type, oldLevel, newLevel) {
    const cr = ZP10.CREATURES[type];
    const oldSprite = ZP10.getCreatureSprite(type, oldLevel);
    const newSprite = ZP10.getCreatureSprite(type, newLevel);

    const overlay = document.getElementById('evolutionOverlay');
    if (!overlay) return;

    document.getElementById('evoTitle').textContent = `${cr.emoji} Evolution!`;
    document.getElementById('evoSprites').innerHTML = `
        <div class="evolution-sprite">
            <img src="${oldSprite}" alt="${cr.stages[oldLevel]}" onerror="this.outerHTML='<div style=\'font-size:4rem\'>${cr.emoji}</div>'">
            <div class="evolution-sprite-name">${cr.stages[oldLevel]}</div>
        </div>
        <div class="evolution-arrow">→</div>
        <div class="evolution-sprite">
            <img src="${newSprite}" alt="${cr.stages[newLevel]}" onerror="this.outerHTML='<div style=\'font-size:4rem\'>${cr.emoji}</div>'">
            <div class="evolution-sprite-name" style="color: #ffd166;">${cr.stages[newLevel]}</div>
        </div>
    `;
    document.getElementById('evoSub').textContent = `${cr.name} · Stufe ${newLevel + 1} freigeschaltet!`;

    overlay.style.display = 'flex';
}

function closeEvolution() {
    const overlay = document.getElementById('evolutionOverlay');
    if (overlay) overlay.style.display = 'none';
    updateCreatureDisplay();
}

// ===== INIT =====
function init() {
    setupTheme();
    updateProfileHeader();
    updateDashboard();
    drawRadarChart();
    drawLineChart();
    renderMVOverview();
    renderAchievements();
    updateGradePrediction();
}

document.addEventListener('DOMContentLoaded', init);
