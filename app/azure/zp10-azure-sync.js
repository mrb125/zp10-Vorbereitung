/**
 * ZP10 Azure Sync Module
 * Lightweight sync for diagnostic modules using Azure AD + Functions
 * Always saves locally first, syncs to Azure when online
 *
 * Usage:
 *   ZP10Sync.init({clientId, tenantId, apiBase});
 *   await ZP10Sync.login();
 *   await ZP10Sync.saveResult(moduleId, data);
 */

const ZP10Sync = {
  // Configuration - teacher sets once, stores in localStorage
  config: {
    clientId: '',
    tenantId: '',
    apiBase: '',
    authority: ''
  },

  // State
  _user: null,
  _msal: null,
  _statusCallbacks: [],
  _stats: {
    synced: 0,
    pending: 0,
    failed: 0,
    lastSync: null
  },

  /**
   * Initialize sync with Azure config
   * @param {Object} config - {clientId, tenantId, apiBase, authority}
   */
  init(config) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this._loadLocalConfig();
    this._initMSAL();
    this._loadPendingQueue();
    this._setupOfflineDetection();
    return this;
  },

  /**
   * Load config from localStorage (teacher setup)
   */
  _loadLocalConfig() {
    const stored = localStorage.getItem('zp10_azure_config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.config = { ...this.config, ...parsed };
      } catch (e) {
        console.warn('Failed to parse Azure config from localStorage', e);
      }
    }
  },

  /**
   * Save config to localStorage
   */
  saveConfig() {
    localStorage.setItem('zp10_azure_config', JSON.stringify(this.config));
  },

  /**
   * Initialize MSAL (Microsoft Authentication Library)
   */
  _initMSAL() {
    if (!this.config.clientId || !this.config.tenantId) {
      console.log('ZP10Sync: Azure not configured, using localStorage only');
      return;
    }

    const msalConfig = {
      auth: {
        clientId: this.config.clientId,
        authority: this.config.authority || `https://login.microsoftonline.com/${this.config.tenantId}`,
        redirectUri: window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
      },
      system: {
        allowNativeBroker: false
      }
    };

    // Only load MSAL if script is available
    if (typeof msal !== 'undefined') {
      try {
        this._msal = new msal.PublicClientApplication(msalConfig);
        this._msal.initialize().then(() => {
          const accounts = this._msal.getAllAccounts();
          if (accounts.length > 0) {
            this._user = accounts[0];
            this._fireStatusEvent('authenticated');
          }
        }).catch(err => {
          console.error('MSAL initialization failed:', err);
        });
      } catch (e) {
        console.warn('MSAL not available or failed to initialize:', e);
        this._msal = null;
      }
    }
  },

  /**
   * Login with Microsoft school account
   * @returns {Promise<Object>} User object {id, displayName, mail, photo}
   */
  async login() {
    if (!this._msal) {
      this._fireStatusEvent('offline');
      return null;
    }

    try {
      const scopes = ['user.read'];
      const response = await this._msal.loginPopup({ scopes });

      this._user = response.account;
      await this._fetchUserDetails();

      localStorage.setItem('zp10_last_user', JSON.stringify({
        id: this._user.homeAccountId,
        displayName: this._user.name,
        mail: this._user.mail
      }));

      this._fireStatusEvent('authenticated');
      return this._user;
    } catch (error) {
      console.error('Login failed:', error);
      if (error.errorCode !== 'user_cancelled') {
        this._fireStatusEvent('auth-error');
      }
      return null;
    }
  },

  /**
   * Fetch additional user details (photo, etc)
   */
  async _fetchUserDetails() {
    if (!this._msal || !this._user) return;

    try {
      const token = await this._getToken();
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const details = await response.json();
        this._user = {
          ...this._user,
          ...details,
          mail: details.userPrincipalName
        };
      }
    } catch (error) {
      console.warn('Failed to fetch user details:', error);
    }
  },

  /**
   * Get current user
   * @returns {Object|null} User object or null
   */
  getUser() {
    return this._user || null;
  },

  /**
   * Check if user is teacher (in Lehrer group)
   * Requires Azure AD group membership check
   */
  async isTeacher() {
    if (!this._user || !this._msal) return false;

    try {
      const token = await this._getToken();
      const response = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Check for "Lehrer" or "Teachers" group
        return data.value?.some(group =>
          group.displayName?.includes('Lehrer') ||
          group.displayName?.includes('Teachers')
        ) || false;
      }
    } catch (error) {
      console.warn('Failed to check teacher status:', error);
    }

    return false;
  },

  /**
   * Get access token from MSAL
   */
  async _getToken() {
    if (!this._msal || !this._user) return null;

    try {
      const response = await this._msal.acquireTokenSilent({
        scopes: ['user.read'],
        account: this._user
      });
      return response.accessToken;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  },

  /**
   * Logout
   */
  async logout() {
    if (this._msal && this._user) {
      await this._msal.logout();
    }
    this._user = null;
    localStorage.removeItem('zp10_last_user');
    this._fireStatusEvent('logged-out');
  },

  /**
   * Save result to localStorage, queue for Azure sync
   * @param {string} moduleId - Module identifier
   * @param {Object} data - Result data
   * @returns {Promise<Object>} Save result {success, synced, queued}
   */
  async saveResult(moduleId, data) {
    const timestamp = new Date().toISOString();
    const result = {
      moduleId,
      data,
      timestamp,
      userId: this._user?.homeAccountId || 'offline',
      synced: false
    };

    // Always save to localStorage first (hub compatibility)
    const hubData = this._getHubData();
    if (!hubData.results) hubData.results = {};
    if (!hubData.results[moduleId]) hubData.results[moduleId] = [];
    hubData.results[moduleId].push(result);
    hubData.lastUpdate = timestamp;
    localStorage.setItem('zp10_hub_data', JSON.stringify(hubData));

    let synced = false;
    let error = null;

    // Try to sync if online and authenticated
    if (this.isOnline() && this._user && this.config.apiBase) {
      try {
        await this._syncResult(result);
        synced = true;
        this._stats.synced++;
      } catch (err) {
        error = err.message;
        this._addToPendingQueue(result);
        this._stats.pending++;
      }
    } else if (this._user && this.config.apiBase) {
      // Authenticated but offline - queue for later
      this._addToPendingQueue(result);
      this._stats.pending++;
    }

    this._fireStatusEvent('result-saved', { moduleId, synced, error });
    return { success: true, synced, queued: !synced, error };
  },

  /**
   * Sync a single result to Azure
   */
  async _syncResult(result) {
    const token = await this._getToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${this.config.apiBase}/api/results/${result.moduleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(result)
    });

    if (!response.ok) {
      throw new Error(`Azure sync failed: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Load pending queue from localStorage
   */
  _loadPendingQueue() {
    const queue = localStorage.getItem('zp10_pending_sync');
    if (queue) {
      try {
        const items = JSON.parse(queue);
        this._stats.pending = items.length;
      } catch (e) {
        console.warn('Failed to parse pending queue', e);
      }
    }
  },

  /**
   * Add result to pending sync queue
   */
  _addToPendingQueue(result) {
    const queue = localStorage.getItem('zp10_pending_sync') || '[]';
    const items = JSON.parse(queue);
    items.push(result);
    localStorage.setItem('zp10_pending_sync', JSON.stringify(items));
  },

  /**
   * Sync all pending results
   * @returns {Promise<Object>} Sync stats {synced, failed, remaining}
   */
  async syncPending() {
    const queueStr = localStorage.getItem('zp10_pending_sync');
    if (!queueStr) {
      return { synced: 0, failed: 0, remaining: 0 };
    }

    const queue = JSON.parse(queueStr);
    let synced = 0;
    let failed = 0;
    const remaining = [];

    if (!this.isOnline() || !this._user) {
      return { synced: 0, failed: 0, remaining: queue.length };
    }

    for (const result of queue) {
      try {
        await this._syncResult(result);
        synced++;
        this._stats.synced++;
      } catch (error) {
        console.error('Failed to sync result:', error);
        failed++;
        remaining.push(result);
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem('zp10_pending_sync', JSON.stringify(remaining));
      this._stats.pending = remaining.length;
    } else {
      localStorage.removeItem('zp10_pending_sync');
      this._stats.pending = 0;
    }

    this._stats.lastSync = new Date().toISOString();
    this._fireStatusEvent('sync-complete', { synced, failed, remaining: remaining.length });

    return { synced, failed, remaining: remaining.length };
  },

  /**
   * Get sync statistics
   */
  getStats() {
    return { ...this._stats };
  },

  /**
   * Check if online
   */
  isOnline() {
    return navigator.onLine;
  },

  /**
   * Setup online/offline detection
   */
  _setupOfflineDetection() {
    window.addEventListener('online', () => {
      this._fireStatusEvent('online');
      // Auto-sync when coming back online
      if (this._user) {
        this.syncPending().catch(err => console.error('Auto-sync failed:', err));
      }
    });

    window.addEventListener('offline', () => {
      this._fireStatusEvent('offline');
    });
  },

  /**
   * Show sync status indicator in UI
   * @param {string} containerId - Target container ID
   */
  showSyncStatus(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const status = this._getSyncStatusHTML();
    container.innerHTML = status;

    // Update on status changes
    this._statusCallbacks.push((event, data) => {
      container.innerHTML = this._getSyncStatusHTML();
    });
  },

  /**
   * Generate sync status HTML
   */
  _getSyncStatusHTML() {
    const online = this.isOnline();
    const authenticated = !!this._user;
    const stats = this.getStats();

    let statusClass = 'zp10-sync-status';
    let statusText = '';
    let indicator = '';

    if (!this.config.apiBase) {
      statusClass += ' offline';
      statusText = 'Nur lokal (Azure nicht konfiguriert)';
      indicator = '⚙️';
    } else if (!online) {
      statusClass += ' offline';
      statusText = `Offline (${stats.pending} ausstehend)`;
      indicator = '⚪';
    } else if (!authenticated) {
      statusClass += ' offline';
      statusText = 'Nicht angemeldet';
      indicator = '⚪';
    } else if (stats.pending > 0) {
      statusClass += ' pending';
      statusText = `Wird synchronisiert (${stats.pending} ausstehend)`;
      indicator = '🟡';
    } else {
      statusClass += ' synced';
      statusText = 'Synchronisiert';
      indicator = '🟢';
    }

    if (stats.lastSync) {
      statusText += ` · Letzte Sync: ${new Date(stats.lastSync).toLocaleTimeString('de-DE')}`;
    }

    return `
      <div class="${statusClass}">
        <span class="indicator">${indicator}</span>
        <span class="text">${statusText}</span>
      </div>
    `;
  },

  /**
   * Register callback for status events
   */
  onStatusChange(callback) {
    this._statusCallbacks.push(callback);
  },

  /**
   * Fire status event
   */
  _fireStatusEvent(event, data = {}) {
    const customEvent = new CustomEvent('zp10-sync-status', {
      detail: { event, data, timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(customEvent);

    this._statusCallbacks.forEach(cb => {
      try {
        cb(event, data);
      } catch (e) {
        console.error('Status callback error:', e);
      }
    });
  },

  /**
   * Get hub data from localStorage
   */
  _getHubData() {
    const stored = localStorage.getItem('zp10_hub_data');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to parse hub data', e);
      }
    }
    return {
      modules: {},
      results: {},
      lastUpdate: null
    };
  },

  /**
   * Import results from JSON (fallback for local-only mode)
   */
  importResults(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      const hubData = this._getHubData();
      hubData.results = { ...hubData.results, ...data.results };
      hubData.lastUpdate = new Date().toISOString();
      localStorage.setItem('zp10_hub_data', JSON.stringify(hubData));
      this._fireStatusEvent('import-complete', { count: Object.keys(data.results || {}).length });
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  },

  /**
   * Export all results as JSON
   */
  exportResults() {
    const hubData = this._getHubData();
    return JSON.stringify(hubData, null, 2);
  }
};

// Auto-initialize on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ZP10Sync.init();
  });
} else {
  ZP10Sync.init();
}
