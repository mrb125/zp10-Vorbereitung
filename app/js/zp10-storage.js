/**
 * ZP10 Storage Layer
 * Primary: IndexedDB (async, structured, large capacity)
 * Fallback: localStorage (sync, 5MB limit)
 * Server-Sync: PHP-Backend auf lima-city (optional)
 *
 * Konfiguration: ZP10Storage.SERVER_URL und ZP10Storage.API_KEY setzen
 * bevor die ersten Ergebnisse gespeichert werden, z.B. in index.html:
 *
 *   ZP10Storage.SERVER_URL = 'https://deine-domain.de/api';
 *   ZP10Storage.API_KEY    = 'DEIN_KEY';
 */

const ZP10Storage = {
  DB_NAME: 'zp10_db',
  DB_VERSION: 1,
  _db: null,
  _ready: false,

  // ─── Server-Sync Konfiguration ───────────────────────────────────────────
  // Priorität: 1. explizit gesetzt, 2. localStorage, 3. api-config.js (deploy-generiert)
  get SERVER_URL() {
    return this._SERVER_URL
      || localStorage.getItem('zp10_server_url')
      || window.ZP10_SERVER_URL
      || null;
  },
  set SERVER_URL(v) { this._SERVER_URL = v; },
  get API_KEY() {
    return this._API_KEY
      || localStorage.getItem('zp10_server_key')
      || window.ZP10_API_KEY
      || null;
  },
  set API_KEY(v) { this._API_KEY = v; },
  _SERVER_URL: null,
  _API_KEY: null,

  async init() {
    if (this._db) return this._db;

    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not available, using localStorage fallback');
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('moduleResults')) {
          const store = db.createObjectStore('moduleResults', { keyPath: 'id', autoIncrement: true });
          store.createIndex('moduleId', 'moduleId', { unique: false });
          store.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('hubData')) {
          db.createObjectStore('hubData', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('spacedRepetition')) {
          const srStore = db.createObjectStore('spacedRepetition', { keyPath: 'key' });
          srStore.createIndex('nextReview', 'nextReview', { unique: false });
          srStore.createIndex('box', 'box', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this._db = event.target.result;
        this._ready = true;
        resolve(this._db);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB open failed, using localStorage fallback');
        reject(event.target.error);
      };
    });
  },

  async _tx(storeName, mode, fn) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const result = fn(store);
      if (result && result.onsuccess !== undefined) {
        result.onsuccess = () => resolve(result.result);
        result.onerror = (e) => reject(e.target.error);
      } else {
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
      }
    });
  },

  async put(storeName, data) {
    return this._tx(storeName, 'readwrite', store => store.put(data));
  },

  async get(storeName, key) {
    return this._tx(storeName, 'readonly', store => store.get(key));
  },

  async getAll(storeName) {
    return this._tx(storeName, 'readonly', store => store.getAll());
  },

  async getByIndex(storeName, indexName, value) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const index = tx.objectStore(storeName).index(indexName);
      const req = index.getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async delete(storeName, key) {
    return this._tx(storeName, 'readwrite', store => store.delete(key));
  },

  // ─── High-level API ───

  async saveModuleResult(moduleId, result) {
    result.moduleId = moduleId;
    result.date = result.date || new Date().toISOString();
    try {
      await this.put('moduleResults', result);
    } catch (e) { /* fallback handled by caller */ }

    // Also save to localStorage as fallback
    try {
      const key = `zp10_${moduleId}_results`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(result);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) { /* localStorage full */ }

    // Server-Sync (falls konfiguriert)
    this._syncToServer(moduleId, result);
  },

  // ─── PHP-Server Sync ─────────────────────────────────────────────────────

  _syncToServer(moduleId, result) {
    if (!this.SERVER_URL || !this.API_KEY) return;
    const payload = {
      studentCode: result.studentCode || localStorage.getItem('zp10_student_code') || 'GAST',
      moduleId,
      score:      result.score      ?? 0,
      maxScore:   result.maxScore   ?? 0,
      percentage: result.percentage ?? 0,
      xp:         result.xp        ?? 0,
      mode:       result.mode       || 'diagnose',
      confidence: result.confidence || null,
    };
    fetch(this.SERVER_URL + '/save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': this.API_KEY },
      body: JSON.stringify(payload),
      keepalive: true // funktioniert auch beim Seitenbeenden
    }).catch(() => {
      // Offline → in localStorage-Warteschlange ablegen
      try {
        const q = JSON.parse(localStorage.getItem('zp10_sync_queue') || '[]');
        q.push({ moduleId, result, ts: Date.now() });
        localStorage.setItem('zp10_sync_queue', JSON.stringify(q.slice(-50))); // max 50
      } catch (e) {}
    });
  },

  // Warteschlange nachträglich senden (z.B. beim nächsten App-Start)
  async flushSyncQueue() {
    if (!this.SERVER_URL || !this.API_KEY) return;
    let queue;
    try { queue = JSON.parse(localStorage.getItem('zp10_sync_queue') || '[]'); }
    catch (e) { return; }
    if (!queue.length) return;

    const remaining = [];
    for (const item of queue) {
      try {
        const res = await fetch(this.SERVER_URL + '/save.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': this.API_KEY },
          body: JSON.stringify({
            studentCode: item.result.studentCode || localStorage.getItem('zp10_student_code') || 'GAST',
            moduleId: item.moduleId, ...item.result
          })
        });
        if (!res.ok) remaining.push(item);
      } catch (e) { remaining.push(item); }
    }
    localStorage.setItem('zp10_sync_queue', JSON.stringify(remaining));
  },

  async getModuleResults(moduleId) {
    try {
      return await this.getByIndex('moduleResults', 'moduleId', moduleId);
    } catch (e) {
      const key = `zp10_${moduleId}_results`;
      try { return JSON.parse(localStorage.getItem(key) || '[]'); }
      catch (e2) { return []; }
    }
  },

  async saveHubData(key, value) {
    try { await this.put('hubData', { key, value }); } catch (e) { /* fallback */ }
    try { localStorage.setItem(`zp10_hub_${key}`, JSON.stringify(value)); } catch (e) { /* full */ }
  },

  async getHubData(key) {
    try {
      const result = await this.get('hubData', key);
      return result ? result.value : null;
    } catch (e) {
      try {
        const raw = localStorage.getItem(`zp10_hub_${key}`);
        return raw ? JSON.parse(raw) : null;
      } catch (e2) { return null; }
    }
  },

  // ─── Migration ───

  async migrateFromLocalStorage() {
    try {
      const migrated = await this.get('hubData', '_idb_migrated');
      if (migrated) return;
    } catch (e) { return; } // IDB not available

    console.log('[ZP10Storage] Migrating localStorage → IndexedDB...');
    let count = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('zp10_')) continue;

      try {
        const value = JSON.parse(localStorage.getItem(key));

        if (key.includes('result')) {
          const moduleId = key.replace('zp10_', '').replace('_results', '').replace('_result', '');
          const results = Array.isArray(value) ? value : [value];
          for (const result of results) {
            result.moduleId = moduleId;
            await this.put('moduleResults', result);
            count++;
          }
        } else if (key === 'zp10_spaced_repetition') {
          if (value.items) {
            for (const [itemKey, item] of Object.entries(value.items)) {
              item.key = itemKey;
              await this.put('spacedRepetition', item);
              count++;
            }
          }
        } else {
          await this.put('hubData', { key, value });
          count++;
        }
      } catch (e) {
        console.warn(`[ZP10Storage] Migration failed for ${key}:`, e);
      }
    }

    await this.put('hubData', { key: '_idb_migrated', value: true });
    console.log(`[ZP10Storage] Migration complete: ${count} items`);
  }
};

// Auto-init + migrate + request persistent storage
if (typeof window !== 'undefined') {
  ZP10Storage.init()
    .then(() => ZP10Storage.migrateFromLocalStorage())
    .catch(() => {}); // graceful fallback to localStorage

  // T3: Request persistent storage
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(granted => {
      if (granted) console.log('[ZP10Storage] Persistent storage granted');
    });
  }
}
