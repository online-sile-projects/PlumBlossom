/**
 * LLM API 設定模組
 * 包含不同 LLM 服務的 API 設定
 */

// API 設定
const apiConfig = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    getHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    prepareBody: (prompt) => ({
      model: 'gpt-4',
      messages: [
        { "role": "system", "content": "你是一位精通易經和梅花易數的專業占卜師，具有深厚的哲學素養和豐富的實踐經驗。" },
        { "role": "user", "content": prompt }
      ]
    }),
    parseResponse: (response) => {
      if (response.choices && response.choices[0] && response.choices[0].message) {
        return response.choices[0].message.content;
      }
      throw new Error('無法解析 ChatGPT API 回應');
    }
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    getHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
    }),
    prepareBody: (prompt) => ({
      contents: [
        { "role": "user", "parts": [{ "text": prompt }] }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }),
    prepareUrl: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    parseResponse: (response) => {
      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        return response.candidates[0].content.parts[0].text;
      }
      throw new Error('無法解析 Gemini API 回應');
    }
  },
  deepseek: {
    url: 'https://api.deepseek.com/v1/chat/completions',
    getHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    prepareBody: (prompt) => ({
      model: 'deepseek-chat',
      messages: [
        { "role": "system", "content": "你是一位精通易經和梅花易數的專業占卜師，具有深厚的哲學素養和豐富的實踐經驗。" },
        { "role": "user", "content": prompt }
      ]
    }),
    parseResponse: (response) => {
      if (response.choices && response.choices[0] && response.choices[0].message) {
        return response.choices[0].message.content;
      }
      throw new Error('無法解析 DeepSeek API 回應');
    }
  }
};

export default apiConfig;
