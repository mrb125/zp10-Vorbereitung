/**
 * ZP10 Spaced Repetition Engine
 * Leitner-Box System basierend auf Fehlvorstellungen (MV)
 *
 * Box 1: Wiederholung nach 1 Tag
 * Box 2: Wiederholung nach 3 Tagen
 * Box 3: Wiederholung nach 7 Tagen
 * Box 4: Wiederholung nach 21 Tagen
 * Box 5: Gemeistert (keine Wiederholung noetig)
 */

const SpacedRepetition = {
  BOXES: [
    { box: 1, intervalDays: 1, label: 'Täglich' },
    { box: 2, intervalDays: 3, label: 'Alle 3 Tage' },
    { box: 3, intervalDays: 7, label: 'Wöchentlich' },
    { box: 4, intervalDays: 21, label: 'Alle 3 Wochen' },
    { box: 5, intervalDays: Infinity, label: 'Gemeistert' }
  ],

  STORAGE_KEY: 'zp10_spaced_repetition',

  getData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : { items: {}, lastReview: null };
    } catch (e) {
      return { items: {}, lastReview: null };
    }
  },

  saveData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('SpacedRepetition: localStorage save failed', e);
    }
  },

  /**
   * Update an item after answering a question related to a misconception.
   * @param {string} moduleId - e.g. 'lineare-funktionen'
   * @param {string} mvId - e.g. 'MV1'
   * @param {boolean} correct - was the MV-related question answered correctly?
   * @returns {object} updated item
   */
  updateItem(moduleId, mvId, correct) {
    const data = this.getData();
    const key = `${moduleId}__${mvId}`;

    if (!data.items[key]) {
      data.items[key] = {
        moduleId,
        mvId,
        box: 1,
        lastReview: new Date().toISOString(),
        nextReview: new Date().toISOString(),
        correctStreak: 0,
        totalReviews: 0
      };
    }

    const item = data.items[key];
    item.totalReviews++;
    item.lastReview = new Date().toISOString();

    if (correct) {
      item.correctStreak++;
      item.box = Math.min(item.box + 1, 5);
    } else {
      item.correctStreak = 0;
      item.box = 1;
    }

    // Calculate next review date
    const boxConfig = this.BOXES.find(b => b.box === item.box);
    if (boxConfig && boxConfig.intervalDays !== Infinity) {
      const next = new Date();
      next.setDate(next.getDate() + boxConfig.intervalDays);
      item.nextReview = next.toISOString();
    } else {
      item.nextReview = null; // mastered
    }

    data.items[key] = item;
    data.lastReview = new Date().toISOString();
    this.saveData(data);
    return item;
  },

  /**
   * Get all items due for review right now.
   * @returns {Array} sorted by urgency (lowest box first)
   */
  getDueItems() {
    const data = this.getData();
    const now = new Date();
    return Object.values(data.items).filter(item => {
      if (item.box >= 5) return false;
      if (!item.nextReview) return false;
      return new Date(item.nextReview) <= now;
    }).sort((a, b) => a.box - b.box);
  },

  /**
   * Get summary statistics across all items.
   */
  getStats() {
    const data = this.getData();
    const items = Object.values(data.items);
    const boxCounts = [0, 0, 0, 0, 0, 0]; // index 0 unused
    items.forEach(item => boxCounts[item.box]++);
    return {
      total: items.length,
      due: this.getDueItems().length,
      mastered: boxCounts[5],
      boxCounts,
      items
    };
  },

  /**
   * Get items for a specific module.
   */
  getModuleItems(moduleId) {
    const data = this.getData();
    return Object.values(data.items).filter(item => item.moduleId === moduleId);
  },

  /**
   * Bulk update after completing a full module diagnostic.
   * @param {string} moduleId
   * @param {Array<string>} triggeredMVs - MV IDs that were triggered (wrong answers)
   * @param {Array<string>} allMVs - all MV IDs in the module
   */
  updateAfterDiagnostic(moduleId, triggeredMVs, allMVs) {
    const triggered = new Set(triggeredMVs || []);
    (allMVs || []).forEach(mvId => {
      this.updateItem(moduleId, mvId, !triggered.has(mvId));
    });
  },

  /**
   * Count mastered misconceptions (box >= 4).
   */
  getMasteredCount() {
    const data = this.getData();
    return Object.values(data.items).filter(item => item.box >= 4).length;
  },

  /**
   * Get items grouped by module.
   */
  getItemsByModule() {
    const data = this.getData();
    const grouped = {};
    Object.values(data.items).forEach(item => {
      if (!grouped[item.moduleId]) grouped[item.moduleId] = [];
      grouped[item.moduleId].push(item);
    });
    return grouped;
  }
};
