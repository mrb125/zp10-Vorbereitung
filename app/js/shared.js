/* ===== ZP10 SHARED UTILITIES ===== */

// ===== LOCAL STORAGE HELPERS =====
const ZP10 = {
    // Hub Data
    getHubData() {
        try { return JSON.parse(localStorage.getItem('zp10_hub_data') || '{}'); }
        catch(e) { return {}; }
    },
    saveHubData(data) {
        localStorage.setItem('zp10_hub_data', JSON.stringify(data));
    },
    addXP(amount) {
        const d = this.getHubData();
        d.totalXP = (d.totalXP || 0) + amount;
        this.saveHubData(d);
        return d.totalXP;
    },

    // Theme
    getTheme() {
        return localStorage.getItem('zp10_theme') || 'auto';
    },
    setTheme(theme) {
        localStorage.setItem('zp10_theme', theme);
        this.applyTheme(theme);
    },
    applyTheme(theme) {
        if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        else if (theme === 'light') document.documentElement.removeAttribute('data-theme');
        // 'auto' uses CSS prefers-color-scheme
    },

    // NRW Grading
    grade(pct) {
        if (pct >= 87) return { note: '1', label: 'sehr gut', color: 'var(--grade-1)' };
        if (pct >= 73) return { note: '2', label: 'gut', color: 'var(--grade-2)' };
        if (pct >= 59) return { note: '3', label: 'befriedigend', color: 'var(--grade-3)' };
        if (pct >= 45) return { note: '4', label: 'ausreichend', color: 'var(--grade-4)' };
        if (pct >= 18) return { note: '5', label: 'mangelhaft', color: 'var(--grade-5)' };
        return { note: '6', label: 'ungenügend', color: 'var(--grade-6)' };
    },

    // Shuffle array (Fisher-Yates)
    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },

    // Confetti animation
    confetti(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * 4 + 3,
                color: ['#5B6CF0', '#FF6B8A', '#10B981', '#F59E0B'][Math.floor(Math.random() * 4)],
                size: Math.random() * 4 + 3
            });
        }
        let frame = 0;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = 0;
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1;
                if (p.y < canvas.height) {
                    alive++;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                }
            });
            frame++;
            if (alive > 0 && frame < 200) requestAnimationFrame(animate);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        animate();
    },

    // Format time
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    },

    // Student name
    getStudentName() {
        const d = this.getHubData();
        return d.studentName || localStorage.getItem('zp10_student_name') || '';
    },

    // ===== CREATURE SYSTEM =====
    // G1: Thresholds are now mastered misconception counts (not XP)
    // 0→5→20→50 mastered MVs across Leitner boxes 4+
    CREATURES: {
        fox:     { name:'Blitzfuchs',    emoji:'⚡', color:'#f4a61a', stages:['Voltino','Sparkling','Fulminox','Thunderex'], thresholds:[0,5,20,50] },
        water:   { name:'Wasserdrache',  emoji:'🌊', color:'#4fc3f7', stages:['Bubblin','Wavekin','Tidalon','Abysshar'],   thresholds:[0,5,20,50] },
        forest:  { name:'Waldgeist',     emoji:'🌿', color:'#66bb6a', stages:['Sprouta','Leafling','Arboros','Ancienta'],   thresholds:[0,5,20,50] },
        phoenix: { name:'Phönix',        emoji:'🔥', color:'#ff7043', stages:['Emberkin','Cindross','Flamara','Phoenara'],  thresholds:[0,5,20,50] },
        gecko:   { name:'Kaktusgecko',   emoji:'🌵', color:'#8bc34a', stages:['Pricklet','Spikeliz','Cactudon','Thornlord'], thresholds:[0,5,20,50] },
    },

    getCreature() {
        const d = this.getHubData();
        return d.creature || null;
    },

    setCreature(type) {
        const d = this.getHubData();
        if (!d.creature) d.creature = {};
        d.creature.type = type;
        d.creature.unlocked = true;
        if (!d.creature.unlockedAt) d.creature.unlockedAt = new Date().toISOString();
        this.saveHubData(d);
    },

    unlockCreature() {
        const d = this.getHubData();
        if (!d.creature) d.creature = {};
        d.creature.unlocked = true;
        d.creature.unlockedAt = new Date().toISOString();
        this.saveHubData(d);
    },

    isCreatureUnlocked() {
        const c = this.getCreature();
        return c && c.unlocked === true;
    },

    hasCreatureChosen() {
        const c = this.getCreature();
        return c && c.type && this.CREATURES[c.type];
    },

    // G1: Get mastered MV count from Leitner engine or fallback to srData quality
    getMasteredMVCount() {
        if (typeof SpacedRepetition !== 'undefined') {
            return SpacedRepetition.getMasteredCount();
        }
        try {
            const sr = JSON.parse(localStorage.getItem('zp10_sr_mvs') || '{}');
            return Object.values(sr).filter(mv => (mv.quality || 0) >= 4).length;
        } catch(e) { return 0; }
    },

    // G1: Level now based on mastered MV count, not XP
    getCreatureLevel(masteredCount) {
        const c = this.getCreature();
        if (!c || !c.type || !this.CREATURES[c.type]) return 0;
        const thr = this.CREATURES[c.type].thresholds;
        let level = 0;
        for (let i = 1; i < thr.length; i++) {
            if (masteredCount >= thr[i]) level = i;
        }
        return level;
    },

    getCreatureProgress(masteredCount) {
        const c = this.getCreature();
        if (!c || !c.type || !this.CREATURES[c.type]) return { pct: 0, current: 0, next: null };
        const thr = this.CREATURES[c.type].thresholds;
        const level = this.getCreatureLevel(masteredCount);
        if (level >= thr.length - 1) return { pct: 100, current: masteredCount, next: null };
        const nextThr = thr[level + 1];
        const currentThr = thr[level];
        const pct = Math.round((masteredCount - currentThr) / (nextThr - currentThr) * 100);
        return { pct: Math.min(100, pct), current: masteredCount - currentThr, next: nextThr - currentThr, nextTotal: nextThr };
    },

    getCreatureSprite(type, level) {
        if (typeof CREATURE_SPRITES !== 'undefined' && CREATURE_SPRITES[type]) {
            return CREATURE_SPRITES[type][level] || CREATURE_SPRITES[type][0];
        }
        return null;
    },

    getCreatureMood(hubData) {
        if (!hubData) hubData = this.getHubData();
        const c = hubData.creature;
        if (!c || !c.type) return { mood: 'neutral', emoji: '😐', label: 'Neutral', color: '#94a3b8' };

        // Check for recently overcome misconception (strahlend)
        const modules = hubData.modules || {};
        let recentOvercome = false;
        let unsolvedMV = 0;
        Object.values(modules).forEach(m => {
            if (m.fehlvorstellungen) {
                m.fehlvorstellungen.forEach(mv => {
                    if (mv.overcome) {
                        if (mv.overcomeDate) {
                            const d = new Date(mv.overcomeDate);
                            const now = new Date();
                            if ((now - d) < 24 * 60 * 60 * 1000) recentOvercome = true;
                        }
                    } else {
                        unsolvedMV++;
                    }
                });
            }
        });

        if (recentOvercome) return { mood: 'shining', emoji: '✨', label: 'Strahlend', color: '#fbbf24' };

        // Check for unresolved misconceptions (verletzt)
        if (unsolvedMV >= 3) return { mood: 'hurt', emoji: '🤕', label: 'Verletzt', color: '#ef4444' };

        // Check streak and last session
        const daily = JSON.parse(localStorage.getItem('zp10_daily_data') || '{"streak":0}');
        const streak = daily.streak || 0;

        // Check last activity date
        let lastActivity = null;
        Object.values(modules).forEach(m => {
            if (m.lastDate) {
                const d = new Date(m.lastDate);
                if (!lastActivity || d > lastActivity) lastActivity = d;
            }
        });

        const daysSinceActivity = lastActivity ? Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24)) : 999;

        if (daysSinceActivity > 5) return { mood: 'tired', emoji: '😴', label: 'Müde', color: '#64748b' };

        // Check last score
        let lastScore = 0;
        Object.values(modules).forEach(m => {
            if (m.lastScore) lastScore = Math.max(lastScore, m.lastScore);
        });

        if (streak >= 3 && lastScore >= 70) return { mood: 'happy', emoji: '😊', label: 'Fröhlich', color: '#10b981' };

        return { mood: 'neutral', emoji: '😐', label: 'Neutral', color: '#94a3b8' };
    },

    // ===== GUARDIAN (Klassen-Nebelwolf) =====
    // Schwellen für ~28 Schüler (Guardian-XP = Klassen-Gesamt-XP × 0.2):
    //   Stufe 2 (~1000): wenige Schüler, 1-2 Module       → 28 × 1 Modul × 180 XP × 0.2 ≈ 1008
    //   Stufe 3 (~4000): halbe Klasse, 3-4 Module         → 28 × 0.5 × 3 × 480 × 0.2 ≈ 4032
    //   Stufe 4 (~12000): meiste Schüler, ~6 Module        → 28 × 0.8 × 6 × 450 × 0.2 ≈ 12096
    //   Stufe 5 (~28000): alle Schüler, alle 13 Module     → 28 × 13 × 385 × 0.2 ≈ 28028
    GUARDIAN: {
        name: 'Nebelwolf', emoji: '🐺', color: '#9C7DFC',
        stages: ['Mistpup','Mistfang','Mistprowler','Mistguardian','Aetheris'],
        thresholds: [0, 1000, 4000, 12000, 28000]
    },

    getGuardian() {
        try { return JSON.parse(localStorage.getItem('zp10_guardian_data') || 'null'); }
        catch(e) { return null; }
    },

    saveGuardian(data) {
        localStorage.setItem('zp10_guardian_data', JSON.stringify(data));
    },

    addGuardianXP(amount) {
        const gd = this.getGuardian() || { xp: 0, name: 'Nebula', createdAt: new Date().toISOString() };
        gd.xp = (gd.xp || 0) + Math.round(amount * 0.2);
        this.saveGuardian(gd);
        return gd.xp;
    },

    getGuardianLevel(xp) {
        const thr = this.GUARDIAN.thresholds;
        let level = 0;
        for (let i = 1; i < thr.length; i++) {
            if (xp >= thr[i]) level = i;
        }
        return level;
    },

    getWeakestModule(hubData, modules) {
        if (!hubData || !modules) return null;
        let weakest = null;
        let lowestScore = 101;
        modules.forEach(m => {
            const data = (hubData.modules || {})[m.id];
            if (data && data.lastScore > 0 && data.lastScore < lowestScore) {
                lowestScore = data.lastScore;
                weakest = m;
            }
        });
        return weakest;
    }
};

// ===== OFFLINE INDICATOR =====
if ('serviceWorker' in navigator) {
    window.addEventListener('online', () => {
        const el = document.getElementById('offlineIndicator');
        if (el) el.style.display = 'none';
    });
    window.addEventListener('offline', () => {
        const el = document.getElementById('offlineIndicator');
        if (el) el.style.display = 'flex';
    });
}
