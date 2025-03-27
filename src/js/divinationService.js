import { trigrams, hexagramNames, hexagramUnicode } from './divinationData.js';
import { geminiClient } from './apiClient.js';

class DivinationService {
    static trigrams = trigrams;
    static hexagramNames = hexagramNames;
    static hexagramUnicode = hexagramUnicode;
    
    constructor() {
        this.apiKey = ''; // 請在使用時填入您的 Gemini API 金鑰
    }

    // 設定 API 金鑰
    setApiKey(key) {
        this.apiKey = key;
    }

    // 生成爻（包含變爻信息）
    generateLines() {
        const lines = [];
        const changingLines = Array(6).fill(false);
        
        // 先生成六個爻
        for (let i = 0; i < 6; i++) {
            const random = Math.random() * 2;
            lines.push(random < 1 ? 0 : 1);  // 隨機生成陰爻(0)或陽爻(1)
        }

        // 隨機選擇一個變爻位置（1-6）
        const changingLinePosition = Math.floor(Math.random() * 6);
        changingLines[changingLinePosition] = true;
        
        return { lines, changingLines };
    }

    // 根據爻生成卦象
    generateHexagram(question) {
        const { lines, changingLines } = this.generateLines();
        
        // 計算本卦
        const originalHexagram = this.calculateHexagram(lines);
        
        // 計算變卦
        const changedLines = lines.map((line, index) => 
            changingLines[index] ? (line === 1 ? 0 : 1) : line
        );
        const changedHexagram = this.calculateHexagram(changedLines);
        
        return {
            original: {
                ...originalHexagram,
                lines
            },
            changed: {
                ...changedHexagram,
                lines: changedLines
            },
            changingLines,
            question
        };
    }

    // 計算單個卦象的資訊
    calculateHexagram(lines) {
        const upperTrigramIndex = parseInt(lines.slice(0, 3).join(''), 2);
        const lowerTrigramIndex = parseInt(lines.slice(3, 6).join(''), 2);
        const hexagramCode = lines.join('');
        
        return {
            upperTrigram: this.getTrigramByIndex(upperTrigramIndex),
            lowerTrigram: this.getTrigramByIndex(lowerTrigramIndex),
            hexagramName: DivinationService.hexagramNames[hexagramCode] || '未知卦',
            hexagramSymbol: DivinationService.hexagramUnicode[hexagramCode] || '?'
        };
    }

    // 根據索引獲取卦象
    getTrigramByIndex(index) {
        const trigrams = Object.values(DivinationService.trigrams);
        return trigrams[index % 8];
    }

    // 生成用於 Gemini API 的占卜提示文字
    generateDivinationPrompt(hexagram) {
        const changingLinesText = hexagram.changingLines.some(x => x) 
            ? `變爻：${hexagram.changingLines.map((isChanging, i) => isChanging ? i + 1 : '').filter(x => x).join('、')}爻` 
            : '無變爻';

        return `請以專業易經占卜師的角度，針對問題「${hexagram.question}」進行梅花易數解卦分析：
        
        本卦：${hexagram.original.hexagramName}（${hexagram.original.hexagramSymbol}）
        上卦：${hexagram.original.upperTrigram.name}（${hexagram.original.upperTrigram.nature}）
        下卦：${hexagram.original.lowerTrigram.name}（${hexagram.original.lowerTrigram.nature}）
        ${changingLinesText}
        變卦：${hexagram.changed.hexagramName}（${hexagram.changed.hexagramSymbol}）
        上卦：${hexagram.changed.upperTrigram.name}（${hexagram.changed.upperTrigram.nature}）
        下卦：${hexagram.changed.lowerTrigram.name}（${hexagram.changed.lowerTrigram.nature}）
        
        請給我詳細的解釋，包括：
        1. 本卦與變卦象徵的含義
        2. 卦爻辭的解讀
        3. 針對問題的具體指引與建議
        4. 吉凶判斷
        5. 近期發展趨勢

        請用繁體中文回答，並以易經與梅花易數的傳統智慧為基礎，提供深入且實用的解讀。`;
    }

    // 使用 Gemini API 進行解卦
    async getReadingWithGemini(hexagram) {
        if (!this.apiKey) {
            throw new Error('請先設定 Gemini API 金鑰');
        }

        const prompt = this.generateDivinationPrompt(hexagram);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
                responseMimeType: "text/plain"
            }
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // 解析 API 回應
            if (data && 
                data.candidates && 
                data.candidates[0] && 
                data.candidates[0].content && 
                data.candidates[0].content.parts && 
                data.candidates[0].content.parts[0] && 
                data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('無法解析 API 回應');
            }
        } catch (error) {
            console.error('呼叫 Gemini API 時發生錯誤:', error);
            return this.getFallbackReading(hexagram); // 當 API 失敗時使用備用解卦方法
        }
    }

    // 備用解卦方法（當 API 無法使用時）
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
        
        【注意】Gemini API 連接失敗，這是一個基本解讀，無法提供詳細分析。請檢查網路連接或 API 金鑰設定。`;
    }

    // 解卦主方法（兼容舊版本）
    async getReading(hexagram) {
        if (this.apiKey) {
            return this.getReadingWithGemini(hexagram);
        } else {
            // 以下是原本的模擬解卦方法
            return new Promise((resolve) => {
                setTimeout(() => {
                    const changingLinesText = hexagram.changingLines.some(x => x) 
                        ? `\n變爻：${hexagram.changingLines.map((isChanging, i) => isChanging ? i + 1 : '').filter(x => x).join('、')}爻\n` 
                        : '\n無變爻\n';
                    
                    resolve(`針對問題「${hexagram.question}」的解答：\n
                    本卦：${hexagram.original.hexagramName}（${hexagram.original.hexagramSymbol}）
                    上卦：${hexagram.original.upperTrigram.name}（${hexagram.original.upperTrigram.nature}）
                    下卦：${hexagram.original.lowerTrigram.name}（${hexagram.original.lowerTrigram.nature}）
                    ${changingLinesText}
                    變卦：${hexagram.changed.hexagramName}（${hexagram.changed.hexagramSymbol}）
                    上卦：${hexagram.changed.upperTrigram.name}（${hexagram.changed.upperTrigram.nature}）
                    下卦：${hexagram.changed.lowerTrigram.name}（${hexagram.changed.lowerTrigram.nature}）
                    
                    【注意】這是未設定 API 金鑰的示例解釋，請使用 setApiKey 方法設置 Gemini API 金鑰以獲得詳細解讀。`);
                }, 1000);
            });
        }
    }
}

// 導出服務實例
export const divinationService = new DivinationService();