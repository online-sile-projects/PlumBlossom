/**
 * LLM API 呼叫客戶端
 * 處理與各種 LLM API 的通訊
 */

import apiConfig from './apiConfig';

/**
 * 呼叫 LLM API
 * @param {string} prompt - 提示詞
 * @param {string} apiType - API 類型 (openai, gemini, deepseek)
 * @param {string} apiKey - API 金鑰
 * @param {string|null} apiUrl - 自訂 API URL (選填)
 * @returns {Promise<string>} - 回應內容
 */
export async function callLLMAPI(prompt, apiType, apiKey, apiUrl = null) {
  if (!apiConfig[apiType]) {
    throw new Error(`不支援的 API 類型: ${apiType}`);
  }
  
  const config = apiConfig[apiType];
  let url = apiUrl || config.url;
  
  // 對於 Gemini 需要在 URL 添加 API Key
  if (apiType === 'gemini' && !apiUrl) {
    url = config.prepareUrl(apiKey);
  }
  
  try {
    const headers = config.getHeaders(apiKey);
    const body = config.prepareBody(prompt);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API 呼叫失敗：${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    return config.parseResponse(data);
  } catch (error) {
    console.error(`LLM API 呼叫錯誤:`, error);
    throw new Error(`LLM API 呼叫失敗：${error.message}`);
  }
}
