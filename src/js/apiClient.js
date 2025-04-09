// Gemini API 客戶端
class GeminiApiClient {
    constructor(apiKey) {
        this.apiKey = apiKey || '';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    }

    // 設定 API 金鑰
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // 呼叫 Gemini API 進行卜卦解析
    async getPlumBlossomDivination(hexagram) {
        if (!this.apiKey) {
            throw new Error('未設定 Gemini API 金鑰');
        }

        // 組合關於卜卦的詳細信息，作為輸入文本
        const inputText = this.createDivinationPrompt(hexagram);
        console.log('Gemini API 輸入內容：', inputText);

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: inputText
                                }
                            ]
                        }
                    ],
                    systemInstruction: {
                        role: "user",
                        parts: [
                            {
                                text: "你是一位精通易經與梅花易數的專家。你將根據用戶提供的卦象、變爻位置等信息，結合傳統易學理論和梅花易數方法，提供詳盡的解卦分析。請給予明確的指引和建議，並使用繁體中文回應。"
                            }
                        ]
                    },
                    generationConfig: {
                        temperature: 1,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192,
                        responseMimeType: "text/plain"
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API 請求失敗: ${response.status}`);
            }

            const data = await response.json();
            
            // 從回應中提取文本內容
            if (data.candidates && data.candidates.length > 0 && 
                data.candidates[0].content && 
                data.candidates[0].content.parts && 
                data.candidates[0].content.parts.length > 0) {
                
                return data.candidates[0].content.parts[0].text;
            } else {
                return "無法獲取解卦結果，請稍後再試。";
            }
        } catch (error) {
            console.error("呼叫 Gemini API 時發生錯誤:", error);
            return `API 呼叫失敗: ${error.message}。使用備用模式返回基本解析結果。`;
        }
    }

    // 創建用於請求 Gemini API 的提示文本
    createDivinationPrompt(hexagram) {
        const changingLinesText = hexagram.changingLines.some(x => x) 
            ? `變爻：${hexagram.changingLines.map((isChanging, i) => isChanging ? i + 1 : '').filter(x => x).join('、')}爻` 
            : '無變爻';
            
        return `請根據以下梅花易數卜卦信息，提供詳細解讀：

問題：「${hexagram.question}」

本卦：${hexagram.original.hexagramName}（${hexagram.original.hexagramSymbol}）
上卦：${hexagram.original.upperTrigram.name}（${hexagram.original.upperTrigram.nature}）
下卦：${hexagram.original.lowerTrigram.name}（${hexagram.original.lowerTrigram.nature}）

${changingLinesText}

變卦：${hexagram.changed.hexagramName}（${hexagram.changed.hexagramSymbol}）
上卦：${hexagram.changed.upperTrigram.name}（${hexagram.changed.upperTrigram.nature}）
下卦：${hexagram.changed.lowerTrigram.name}（${hexagram.changed.lowerTrigram.nature}）

互卦：${hexagram.overlapping.hexagramName}（${hexagram.overlapping.hexagramSymbol}）
上卦：${hexagram.overlapping.upperTrigram.name}（${hexagram.overlapping.upperTrigram.nature}）
下卦：${hexagram.overlapping.lowerTrigram.name}（${hexagram.overlapping.lowerTrigram.nature}）

伏卦：${hexagram.hidden.hexagramName}（${hexagram.hidden.hexagramSymbol}）
上卦：${hexagram.hidden.upperTrigram.name}（${hexagram.hidden.upperTrigram.nature}）
下卦：${hexagram.hidden.lowerTrigram.name}（${hexagram.hidden.lowerTrigram.nature}）

請提供：
1. 卦象總體解讀
2. 變爻分析與意義
3. 互卦與伏卦的啟示
4. 對問題的具體建議和指導
5. 未來發展趨勢預測`;
    }

    // 提供後備解析，當 API 無法使用時
    getFallbackReading(hexagram) {
        const changingLinesText = hexagram.changingLines.some(x => x) 
            ? `\n變爻：${hexagram.changingLines.map((isChanging, i) => isChanging ? i + 1 : '').filter(x => x).join('、')}爻\n` 
            : '\n無變爻\n';
            
        return `針對問題「${hexagram.question}」的解答：\n
        本卦：${hexagram.original.hexagramName}（${hexagram.original.hexagramSymbol}）
        上卦：${hexagram.original.upperTrigram.name}（${hexagram.original.upperTrigram.nature}）
        下卦：${hexagram.original.lowerTrigram.name}（${hexagram.original.lowerTrigram.nature}）
        ${changingLinesText}
        變卦：${hexagram.changed.hexagramName}（${hexagram.changed.hexagramSymbol}）
        上卦：${hexagram.changed.upperTrigram.name}（${hexagram.changed.upperTrigram.nature}）
        下卦：${hexagram.changed.lowerTrigram.name}（${hexagram.changed.lowerTrigram.nature}）
        
        【注意】這是備用解讀，Gemini API 無法使用。請檢查網絡連接或 API 設定。`;
    }
}

// 導出 API 客戶端實例
export const geminiClient = new GeminiApiClient();