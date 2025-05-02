/**
 * LLM API 整合模組
 * 支援 ChatGPT API、Gemini API、DeepSeek API
 */

// 生成解盤提示詞
export const generateDivinationPrompt = (divinationResult) => {
  if (!divinationResult || !divinationResult.mainHexagram) {
    return '';
  }
  
  const { question, mainHexagram, changedHexagram, changingLines, overlappingHexagram, hiddenHexagram } = divinationResult;
  
  // 判斷是否有變爻
  const hasChangingLines = changingLines && changingLines.length > 0;

  // 生成提示詞
  let prompt = `我正在使用梅花易數進行占卜，請你以易經專家角度解讀我的卦象。\n\n`;
  prompt += `問題: ${question}\n\n`;
  
  // 本卦資訊
  prompt += `本卦：${mainHexagram.name} (${mainHexagram.character})\n`;
  prompt += `卦辭：${mainHexagram.text}\n`;
  prompt += `上掛：${mainHexagram.topTrigramInfo.name} (${mainHexagram.topTrigramInfo.nature}、${mainHexagram.topTrigramInfo.element})\n`;
  prompt += `下掛：${mainHexagram.bottomTrigramInfo.name} (${mainHexagram.bottomTrigramInfo.nature}、${mainHexagram.bottomTrigramInfo.element})\n\n`;
  
  // 互卦資訊
  if (overlappingHexagram) {
    prompt += `互卦：${overlappingHexagram.name} (${overlappingHexagram.character})\n`;
    prompt += `卦辭：${overlappingHexagram.text}\n\n`;
  }
  
  // 伏卦資訊
  if (hiddenHexagram) {
    prompt += `伏卦：${hiddenHexagram.name} (${hiddenHexagram.character})\n`;
    prompt += `卦辭：${hiddenHexagram.text}\n\n`;
  }
  
  // 變爻資訊
  if (hasChangingLines) {
    prompt += `變爻：${changingLines.join('、')} 爻\n`;
    changingLines.forEach(line => {
      const yao = mainHexagram.yao[line-1];
      if (yao) {
        prompt += `第${line}爻辭：${yao.text}\n`;
      }
    });
    
    // 變卦資訊
    if (changedHexagram) {
      prompt += `\n變卦：${changedHexagram.name} (${changedHexagram.character})\n`;
      prompt += `卦辭：${changedHexagram.text}\n`;
    }
  }
  
  prompt += `\n請提供以下內容：\n`;
  prompt += `1. 卦象解釋：分析本卦的基本含義\n`;
  prompt += `2. 問題解析：針對我的問題提供有針對性的解讀\n`;
  
  if (overlappingHexagram) {
    prompt += `3. 互卦分析：解讀互卦的意涵與本卦的關係\n`;
  }
  
  if (hiddenHexagram) {
    prompt += `4. 伏卦分析：解讀伏卦所揭示的隱含因素\n`;
  }
  
  if (hasChangingLines) {
    prompt += `5. 變爻分析：解讀變爻的特殊意涵，及其對本卦的影響\n`;
    prompt += `6. 變卦啟示：分析變卦所反映的未來趨勢\n`;
  }
  
  prompt += `7. 建議與總結：給予實際可行的建議\n\n`;
  prompt += `請用易經的觀點分析，避免空泛籠統的回答，盡量具體且有深度。`;
  
  return prompt;
};

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

// 呼叫 LLM API
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
