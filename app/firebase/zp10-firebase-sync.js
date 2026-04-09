/**
 * ZP10 Diagnose - Unified Firebase Sync Module
 *
 * Provides offline-first result synchronization for diagnostic modules.
 * All modules can include this script and use ZP10Sync to save results.
 *
 * USAGE:
 * <script src="firebase/zp10-firebase-sync.js"></script>
 *
 * After module completion:
 * ZP10Sync.saveResult(moduleId, {
 *   score: 12,
 *   maxScore: 20,
 *   percentage: 60,
 *   xp: 50,
 *   triggeredMVs: ['MV1', 'MV2'],
 *   klp: ['KLP1'],
 *   timeUsed: 300
 * });
 */

const ZP10Sync = (() => {
  // Configuration
  const SYNC_PREFIX = 'zp10_result_';
  const QUEUE_KEY = 'zp10_sync_queue';
  const STATUS_KEY = 'zp10_sync_status';
  const FIRE_BASE_CONFIG_LOADED = window.firebaseConfigLoaded || false;

  // State
  let currentUser = null;
  let isFirebaseAvailable = false;
  let syncInProgress = false;
  let pendingQueue = [];

  /**
   * Initialize the sync module
   * Check if Firebase config is loaded and user is authenticated
   */
  async function init() {
    try {
      // Check if Firebase was loaded (firebaseConfigLoaded global variable)
      if (window.firebase && window.db && window.auth) {
        isFirebaseAvailable = true;

        // Set up auth state listener
        if (window.onAuthChange) {
          window.onAuthChange((user) => {
            currentUser = user;
            if (user) {
              syncPendingResults();
            }
          });
        }
      }

      // Load pending sync queue from localStorage
      loadPendingQueue();

      // Try to sync if user is already authenticated
      if (isFirebaseAvailable && currentUser) {
        await syncPendingResults();
      }
    } catch (error) {
      console.warn('[ZP10Sync] Firebase initialization failed (graceful degradation)', error);
      isFirebaseAvailable = false;
    }
  }

  /**
   * Check if Firebase is connected and online
   */
  function isOnline() {
    return isFirebaseAvailable && currentUser !== null && navigator.onLine;
  }

  /**
   * Get current user
   */
  function getUser() {
    return currentUser;
  }

  /**
   * Save module result - offline-first approach
   * Always saves to localStorage, then tries Firebase
   */
  async function saveResult(moduleId, data) {
    if (!moduleId || !data) {
      console.error('[ZP10Sync] Missing moduleId or data');
      return false;
    }

    // Prepare result data
    const resultData = {
      moduleId,
      score: data.score || 0,
      maxScore: data.maxScore || 0,
      percentage: data.percentage || 0,
      xp: data.xp || 0,
      triggeredMVs: data.triggeredMVs || [],
      klp: data.klp || [],
      timeUsed: data.timeUsed || 0,
      timestamp: new Date().toISOString(),
      synced: false
    };

    try {
      // Step 1: Always save to localStorage first (offline-first)
      const localKey = `${SYNC_PREFIX}${moduleId}_${Date.now()}`;
      localStorage.setItem(localKey, JSON.stringify({
        type: 'module',
        moduleId,
        result: resultData,
        savedAt: new Date().toISOString()
      }));

      updateStatus('pending');

      // Step 2: Try to sync to Firebase if available
      if (isOnline() && currentUser) {
        await syncSingleResult(moduleId, resultData, localKey);
      } else {
        // Add to pending queue for later sync
        addToPendingQueue(moduleId, resultData, localKey);
      }

      return true;
    } catch (error) {
      console.error('[ZP10Sync] Error saving result:', error);
      updateStatus('error');
      return false;
    }
  }

  /**
   * Sync a single result to Firebase
   */
  async function syncSingleResult(moduleId, resultData, localKey) {
    try {
      if (!window.saveModuleResult || !currentUser) {
        throw new Error('Firebase functions not available');
      }

      // Call Firebase function to save result
      await window.saveModuleResult(currentUser.uid, moduleId, resultData);

      // Mark as synced in localStorage
      const localData = JSON.parse(localStorage.getItem(localKey));
      localData.synced = true;
      localData.syncedAt = new Date().toISOString();
      localStorage.setItem(localKey, JSON.stringify(localData));

      // Remove from pending queue
      removeFromPendingQueue(moduleId);

      updateStatus('synced');
      console.log(`[ZP10Sync] Result synced for module: ${moduleId}`);
    } catch (error) {
      console.warn(`[ZP10Sync] Could not sync to Firebase for module ${moduleId}:`, error);
      // Keep in pending queue for retry
      addToPendingQueue(moduleId, resultData, localKey);
    }
  }

  /**
   * Sync all pending results
   */
  async function syncPendingResults() {
    if (syncInProgress || !isOnline()) {
      return;
    }

    syncInProgress = true;
    updateStatus('syncing');

    try {
      const allKeys = Object.keys(localStorage);
      const syncKeys = allKeys.filter(key => key.startsWith(SYNC_PREFIX));

      let syncedCount = 0;

      for (const key of syncKeys) {
        try {
          const data = JSON.parse(localStorage.getItem(key));

          // Skip already synced items
          if (data.synced) {
            continue;
          }

          if (data.type === 'module') {
            await syncSingleResult(data.moduleId, data.result, key);
            syncedCount++;
          }

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`[ZP10Sync] Error syncing item ${key}:`, error);
        }
      }

      if (syncedCount > 0) {
        console.log(`[ZP10Sync] Synced ${syncedCount} pending results`);
        updateStatus('synced');
      } else {
        updateStatus('synced');
      }
    } catch (error) {
      console.error('[ZP10Sync] Error during sync:', error);
      updateStatus('error');
    } finally {
      syncInProgress = false;
    }
  }

  /**
   * Load pending queue from localStorage
   */
  function loadPendingQueue() {
    try {
      const queueData = localStorage.getItem(QUEUE_KEY);
      pendingQueue = queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.warn('[ZP10Sync] Error loading pending queue:', error);
      pendingQueue = [];
    }
  }

  /**
   * Add item to pending queue
   */
  function addToPendingQueue(moduleId, resultData, localKey) {
    if (!pendingQueue.find(item => item.moduleId === moduleId)) {
      pendingQueue.push({
        moduleId,
        localKey,
        addedAt: new Date().toISOString(),
        retries: 0
      });
      savePendingQueue();
    }
  }

  /**
   * Remove item from pending queue
   */
  function removeFromPendingQueue(moduleId) {
    pendingQueue = pendingQueue.filter(item => item.moduleId !== moduleId);
    savePendingQueue();
  }

  /**
   * Save pending queue to localStorage
   */
  function savePendingQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(pendingQueue));
    } catch (error) {
      console.warn('[ZP10Sync] Error saving pending queue:', error);
    }
  }

  /**
   * Get count of pending syncs
   */
  function getPendingCount() {
    const allKeys = Object.keys(localStorage);
    const syncKeys = allKeys.filter(key => key.startsWith(SYNC_PREFIX));
    return syncKeys.filter(key => {
      const data = JSON.parse(localStorage.getItem(key));
      return !data.synced;
    }).length;
  }

  /**
   * Update sync status in localStorage
   */
  function updateStatus(status) {
    try {
      localStorage.setItem(STATUS_KEY, JSON.stringify({
        status,
        timestamp: new Date().toISOString(),
        pendingCount: getPendingCount()
      }));

      // Dispatch custom event for status changes
      window.dispatchEvent(new CustomEvent('zp10-sync-status', {
        detail: { status, pendingCount: getPendingCount() }
      }));
    } catch (error) {
      console.warn('[ZP10Sync] Error updating status:', error);
    }
  }

  /**
   * Show sync status indicator in the page
   */
  function showSyncStatus(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[ZP10Sync] Container ${containerId} not found`);
      return;
    }

    // Create status indicator
    const indicator = document.createElement('div');
    indicator.id = 'zp10-sync-indicator';
    indicator.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.3s;
    `;

    // Update indicator based on status
    function updateIndicator() {
      try {
        const statusData = JSON.parse(localStorage.getItem(STATUS_KEY));
        const status = statusData?.status || 'offline';
        const pendingCount = statusData?.pendingCount || 0;

        let bgColor, textColor, emoji, text;

        switch (status) {
          case 'synced':
            bgColor = '#EEF0FF';
            textColor = '#388e3c';
            emoji = '✓';
            text = 'Synchronisiert';
            break;
          case 'syncing':
            bgColor = '#FFF3E0';
            textColor = '#f57c00';
            emoji = '↻';
            text = 'Wird synchronisiert...';
            break;
          case 'pending':
            bgColor = '#FFF3E0';
            textColor = '#f57c00';
            emoji = '◐';
            text = `${pendingCount} ausstehend`;
            break;
          case 'error':
            bgColor = '#FFEBEE';
            textColor = '#d32f2f';
            emoji = '!';
            text = 'Fehler';
            break;
          default:
            bgColor = '#F5F5F5';
            textColor = '#999';
            emoji = '◌';
            text = 'Offline';
        }

        indicator.style.backgroundColor = bgColor;
        indicator.style.color = textColor;
        indicator.innerHTML = `<span style="font-size: 14px;">${emoji}</span> ${text}`;
      } catch (error) {
        console.warn('[ZP10Sync] Error updating indicator:', error);
      }
    }

    // Initial update
    updateIndicator();

    // Listen for status changes
    window.addEventListener('zp10-sync-status', updateIndicator);

    // Append indicator to container
    container.appendChild(indicator);
  }

  /**
   * Force sync attempt
   */
  async function forceSyncNow() {
    if (isOnline()) {
      await syncPendingResults();
      return true;
    }
    return false;
  }

  /**
   * Get sync statistics
   */
  function getStats() {
    const allKeys = Object.keys(localStorage);
    const syncKeys = allKeys.filter(key => key.startsWith(SYNC_PREFIX));

    let totalResults = 0;
    let syncedResults = 0;
    let pendingResults = 0;

    syncKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        totalResults++;
        if (data.synced) {
          syncedResults++;
        } else {
          pendingResults++;
        }
      } catch (error) {
        console.warn('[ZP10Sync] Error reading stats:', error);
      }
    });

    return {
      total: totalResults,
      synced: syncedResults,
      pending: pendingResults,
      online: isOnline(),
      user: currentUser?.email || null
    };
  }

  /**
   * Clear all local results (use with caution!)
   */
  function clearLocal() {
    const allKeys = Object.keys(localStorage);
    const syncKeys = allKeys.filter(key => key.startsWith(SYNC_PREFIX));
    syncKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(QUEUE_KEY);
    localStorage.removeItem(STATUS_KEY);
    console.warn('[ZP10Sync] Local cache cleared');
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('[ZP10Sync] Back online, attempting to sync...');
    syncPendingResults();
  });

  window.addEventListener('offline', () => {
    console.log('[ZP10Sync] Offline detected');
    updateStatus('offline');
  });

  // Public API
  return {
    init,
    isOnline,
    saveResult,
    getUser,
    showSyncStatus,
    forceSyncNow,
    getStats,
    getPendingCount,
    clearLocal,
    syncPendingResults
  };
})();

// Make it available globally
window.ZP10Sync = ZP10Sync;
