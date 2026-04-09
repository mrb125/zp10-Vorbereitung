/**
 * AI-based Misconception Detection for Free-text Answers (D5)
 * Uses Claude API (optional — works without it, just skips AI analysis)
 *
 * IMPORTANT: API key is stored in localStorage, never sent to any server except Anthropic.
 */

const AIMVChecker = {
  API_KEY_STORAGE: 'zp10_ai_api_key',

  isAvailable() {
    return !!localStorage.getItem(this.API_KEY_STORAGE);
  },

  setApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem(this.API_KEY_STORAGE, key.trim());
    }
  },

  removeApiKey() {
    localStorage.removeItem(this.API_KEY_STORAGE);
  },

  /**
   * Analyze a free-text student answer for misconceptions.
   * @param {string} studentAnswer - The student's free-text answer
   * @param {object} question - { text, correctAnswer }
   * @param {Array} misconceptions - [{ id, description }]
   * @returns {object|null} { detectedMVs, confidence, explanation } or null
   */
  async checkAnswer(studentAnswer, question, misconceptions) {
    if (!this.isAvailable()) return null;
    if (!studentAnswer || !studentAnswer.trim()) return null;

    const apiKey = localStorage.getItem(this.API_KEY_STORAGE);

    const prompt = `Du bist ein Mathe-Diagnostik-Assistent für die ZP10 (Zentrale Prüfungen Klasse 10, NRW).

Analysiere die Schülerantwort auf folgende Fehlvorstellungen:
${misconceptions.map(mv => `- ${mv.id}: ${mv.description}`).join('\n')}

Aufgabe: ${question.text}
Korrekte Antwort: ${question.correctAnswer}
Schülerantwort: ${studentAnswer}

Antworte NUR im JSON-Format:
{
  "detectedMVs": ["MV1"],
  "confidence": 0.85,
  "explanation": "Die Antwort zeigt..."
}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      const text = data.content[0].text;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return null;
    } catch (e) {
      console.warn('[AIMVChecker] Analysis failed:', e);
      return null;
    }
  }
};
