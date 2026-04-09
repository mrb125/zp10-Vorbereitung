/**
 * ZP10 Global Theme System
 * Speichert Dark/Light + Akzentfarbe in localStorage, wirkt auf alle Seiten.
 * Einbinden vor </body>: <script src="../js/theme.js"></script>
 * Für Seiten im Root:    <script src="js/theme.js"></script>
 */
(function () {
  const STORAGE_KEY = 'zp10_theme';

  const ACCENTS = {
    indigo:  { primary: '#5B6CF0', accent: '#8B5CF6', light: 'rgba(91,108,240,0.12)', name: 'Indigo'  },
    teal:    { primary: '#0EA5E9', accent: '#06B6D4', light: 'rgba(14,165,233,0.12)',  name: 'Ozean'   },
    emerald: { primary: '#10B981', accent: '#34D399', light: 'rgba(16,185,129,0.12)',  name: 'Wald'    },
    amber:   { primary: '#F59E0B', accent: '#FBBF24', light: 'rgba(245,158,11,0.12)',  name: 'Amber'   },
    rose:    { primary: '#F43F5E', accent: '#FB7185', light: 'rgba(244,63,94,0.12)',   name: 'Rose'    },
  };

  function getPrefs() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  }
  function savePrefs(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

  function applyTheme(mode, accentKey) {
    const root = document.documentElement;
    // Dark / Light
    root.setAttribute('data-mode', mode);
    document.body?.setAttribute('data-theme', mode);

    // Akzentfarbe
    const a = ACCENTS[accentKey] || ACCENTS.indigo;
    const style = document.getElementById('zp10-theme-vars') || (() => {
      const s = document.createElement('style');
      s.id = 'zp10-theme-vars';
      document.head.appendChild(s);
      return s;
    })();
    style.textContent = `
      :root {
        --primary: ${a.primary} !important;
        --accent:  ${a.accent}  !important;
        --primary-light: ${a.light} !important;
      }
    `;
  }

  function init() {
    const p = getPrefs();
    const mode   = p.mode   || 'light';
    const accent = p.accent || 'indigo';
    applyTheme(mode, accent);
    return { mode, accent };
  }

  // ── Floating Theme Picker ────────────────────────────────────────────────
  function buildPicker() {
    if (document.getElementById('zp10-theme-picker')) return;

    const wrap = document.createElement('div');
    wrap.id = 'zp10-theme-picker';
    wrap.innerHTML = `
      <button id="zp10-theme-btn" title="Design ändern"
        style="width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;
               background:var(--primary,#5B6CF0);color:#fff;font-size:1.1rem;
               box-shadow:0 2px 10px rgba(0,0,0,0.25);transition:transform 0.15s;">🎨</button>
      <div id="zp10-theme-panel"
        style="display:none;position:absolute;bottom:52px;right:0;
               background:var(--surface,#1E293B);border:1px solid var(--border,#334155);
               border-radius:14px;padding:14px;width:220px;
               box-shadow:0 8px 32px rgba(0,0,0,0.35);z-index:10001;">
        <div style="font-weight:700;font-size:0.85rem;margin-bottom:10px;color:var(--text,#F1F5F9);">Design</div>

        <!-- Dark / Light -->
        <div style="display:flex;gap:6px;margin-bottom:12px;" id="zp10-mode-btns">
          <button data-mode="dark"  style="flex:1;padding:7px;border-radius:8px;border:2px solid transparent;cursor:pointer;font-size:0.82rem;font-weight:600;">🌙 Dunkel</button>
          <button data-mode="light" style="flex:1;padding:7px;border-radius:8px;border:2px solid transparent;cursor:pointer;font-size:0.82rem;font-weight:600;">☀️ Hell</button>
        </div>

        <!-- Akzentfarben -->
        <div style="font-weight:600;font-size:0.78rem;color:var(--text-secondary,#94a3b8);margin-bottom:7px;">Akzentfarbe</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;" id="zp10-accent-btns">
          ${Object.entries(ACCENTS).map(([k, a]) =>
            `<button data-accent="${k}" title="${a.name}"
              style="width:30px;height:30px;border-radius:50%;background:${a.primary};
                     border:3px solid transparent;cursor:pointer;transition:transform 0.1s;"></button>`
          ).join('')}
        </div>
      </div>`;

    Object.assign(wrap.style, {
      position: 'fixed', bottom: '20px', right: '20px', zIndex: '10000'
    });
    document.body.appendChild(wrap);

    // Toggle panel
    document.getElementById('zp10-theme-btn').addEventListener('click', () => {
      const panel = document.getElementById('zp10-theme-panel');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      updatePickerState();
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!wrap.contains(e.target))
        document.getElementById('zp10-theme-panel').style.display = 'none';
    });

    // Mode buttons
    wrap.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = getPrefs();
        p.mode = btn.dataset.mode;
        savePrefs(p);
        applyTheme(p.mode, p.accent || 'indigo');
        updatePickerState();
      });
    });

    // Accent buttons
    wrap.querySelectorAll('[data-accent]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = getPrefs();
        p.accent = btn.dataset.accent;
        savePrefs(p);
        applyTheme(p.mode || 'light', p.accent);
        updatePickerState();
      });
    });
  }

  function updatePickerState() {
    const p = getPrefs();
    const mode   = p.mode   || 'light';
    const accent = p.accent || 'indigo';

    document.querySelectorAll('#zp10-mode-btns [data-mode]').forEach(b => {
      const active = b.dataset.mode === mode;
      b.style.borderColor  = active ? 'var(--primary,#5B6CF0)' : 'transparent';
      b.style.background   = active ? 'var(--primary-light,rgba(91,108,240,0.15))' : 'var(--bg,#0F172A)';
      b.style.color        = 'var(--text,#F1F5F9)';
    });
    document.querySelectorAll('#zp10-accent-btns [data-accent]').forEach(b => {
      b.style.borderColor = b.dataset.accent === accent ? '#fff' : 'transparent';
      b.style.transform   = b.dataset.accent === accent ? 'scale(1.2)' : 'scale(1)';
    });
  }

  // Public API
  window.ZP10Theme = { init, applyTheme, getPrefs, savePrefs, ACCENTS };

  // Auto-init: apply theme before paint to avoid flash
  const prefs = init();

  // Build picker after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPicker);
  } else {
    buildPicker();
  }
})();
