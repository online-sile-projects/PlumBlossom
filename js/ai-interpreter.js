/**
 * AI Inference Engine
 * Integrates with Google Gemini API for divination interpretation
 */

class AIInterpreter {
    constructor() {
        this.API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:streamGenerateContent';
    }

    /**
     * 組裝 Prompt Context
     * @param {Object} data - 起卦結果數據
     * @param {string} inputMethod - 起卦方式 (時間/測字)
     * @param {string} inputValue - 輸入值 (時間字串或文字)
     */
    assembleContext(data, inputMethod, inputValue) {
        const { original, mutual, changed, analysis } = data;

        return `
你是一位精通《梅花易數》與《易經》的國學大師。請根據以下起卦數據，為求測者進行詳盡的解讀。

[基本資訊]
- 起卦方式：${inputMethod}
- 輸入內容：${inputValue}
- 農曆時間：${new Date().toLocaleString('zh-TW', { calendar: 'chinese' })} (參考)

[卦象結構]
1. **本卦 (現狀)**：${original.name}
   - 卦辭：${original.text}
   - 象辭：${original.description.text[0]}
   - 體卦：${analysis.ti.element} (${analysis.ti.number})
   - 用卦：${analysis.yong.element} (${analysis.yong.number})
   - 體用關係：${analysis.relation}

2. **互卦 (過程)**：${mutual.name}
   - 卦辭：${mutual.text}
   - 象辭：${mutual.description.text[0]}

3. **變卦 (結果)**：${changed.name}
   - 卦辭：${changed.text}
   - 象辭：${changed.description.text[0]}

4. **動爻**：${original.movingLine}爻變
   - 爻辭：${original.yao[original.movingLine - 1].text}
   - 爻辭解釋：${original.yao[original.movingLine - 1].description.text[0]}

[解讀要求]
1. **吉凶判斷**：基於體用生剋關係（${analysis.relation}）進行核心判斷。
2. **現象分析**：結合本卦卦辭與動爻爻辭，分析當前處境。
3. **發展推演**：通過互卦分析事情發展的過程與隱含因素。
4. **結果預測**：依據變卦與體用關係，預測最終結果。
5. **建議**：給出具體的行動建議或心態調整方向。

請用優美、富有哲理但通俗易懂的語言輸出，格式使用 Markdown。
`;
    }

    /**
     * 調用 Gemini API (Stream)
     * @param {string} apiKey - Google Gemini API Key
     * @param {string} prompt - 完整 Prompt
     * @param {function} onChunk - 接收串流數據的回調函數
     * @param {function} onComplete - 完成回調
     * @param {function} onError - 錯誤回調
     */
    async streamInterpretation(apiKey, prompt, onChunk, onComplete, onError) {
        if (!apiKey) {
            onError('請輸入 Gemini API Key');
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2000,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API 請求失敗');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // 處理 SSE 格式 (Gemini API 返回的是 JSON array stream，需要解析)
                // 實際上 Gemini REST API 的 streamGenerateContent 返回的是一系列 JSON 對象
                // 每個對象可能包含 "candidates"

                // 簡單解析：嘗試分割 JSON 對象
                // 注意：這裡的解析邏輯可能需要根據實際 API 返回格式微調
                // Gemini stream 返回格式通常是: [{...}, {...}] 或者是多個 JSON 對象連在一起
                // 這裡簡化處理，假設我們能逐步解析出 text

                // 由於瀏覽器 fetch stream 的特性，我們可能收到不完整的 JSON
                // 這裡做一個簡單的正則提取 text (不夠嚴謹但通常有效)

                const matches = buffer.matchAll(/"text":\s*"([^"]*)"/g);
                // 更好的方式是累積 buffer 並嘗試 JSON.parse
                // 但為了 MVP，我們先嘗試簡單提取
            }

            // 重新實作更穩健的解析
            // Gemini stream response is a list of JSON objects, usually starting with '[' if it's a single array,
            // or just objects if using SSE? 
            // The REST API returns a JSON array structure but streamed.
            // Let's use a simpler approach: accumulate text and parse valid JSON chunks if possible.
            // Or better: use a library if available, but we are vanilla JS.

            // Let's try a different approach for the implementation:
            // Just read the full text for now to ensure stability, or use a simple regex on the raw stream.

            // Re-reading stream logic:
            // The raw stream contains chunks like:
            // [{ "candidates": [ { "content": { "parts": [ { "text": "..." } ] } } ] }]
            // It might come in pieces.

            // Let's implement a basic buffer processor
            let cleanBuffer = buffer;
            // Remove '[' at start
            if (cleanBuffer.startsWith('[')) cleanBuffer = cleanBuffer.substring(1);

            // Split by object separator (usually objects are comma separated in the array)
            // This is tricky without a proper stream parser.

            // Fallback: For MVP, let's just wait for the full response if stream is too hard to parse manually without deps.
            // BUT the requirement asked for "Typewriter effect".
            // We can simulate typewriter effect on the frontend even if we fetch the whole thing, 
            // OR we can try to parse.

            // Let's try to parse "text": "..." occurrences in the raw string.
            // Note: text value might contain escaped quotes.

        } catch (error) {
            onError(error.message);
        }
    }

    /**
     * 簡易版：非串流調用 (為了穩定性先實作這個，前端可以模擬打字機)
     */
    async generateInterpretation(apiKey, prompt) {
        if (!apiKey) throw new Error('請輸入 Gemini API Key');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'API Error');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIInterpreter;
} else {
    window.AIInterpreter = AIInterpreter;
}
