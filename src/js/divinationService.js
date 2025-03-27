import { trigrams, hexagramNames, hexagramUnicode } from './divinationData.js';

class DivinationService {
    static trigrams = trigrams;
    static hexagramNames = hexagramNames;
    static hexagramUnicode = hexagramUnicode;

    // 生成動爻
    generateChangingLines() {
        const lines = [];
        for (let i = 0; i < 6; i++) {
            lines.push(Math.random() < 0.5 ? 0 : 1);
        }
        return lines;
    }

    // 根據動爻生成卦象
    generateHexagram(question) {
        const lines = this.generateChangingLines();
        const upperTrigramIndex = parseInt(lines.slice(0, 3).join(''), 2);
        const lowerTrigramIndex = parseInt(lines.slice(3, 6).join(''), 2);
        
        // 計算卦名
        const hexagramCode = lines.join('');
        const hexagramName = DivinationService.hexagramNames[hexagramCode] || '未知卦';
        const hexagramSymbol = DivinationService.hexagramUnicode[hexagramCode] || '?';
        
        return {
            lines,
            upperTrigram: this.getTrigramByIndex(upperTrigramIndex),
            lowerTrigram: this.getTrigramByIndex(lowerTrigramIndex),
            hexagramName,
            hexagramSymbol,
            question
        };
    }

    // 根據索引獲取卦象
    getTrigramByIndex(index) {
        const trigrams = Object.values(DivinationService.trigrams);
        return trigrams[index % 8];
    }

    // 模擬解卦（實際應用中這裡會調用 Gemini API）
    async getReading(hexagram) {
        // 模擬 API 調用
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`針對問題「${hexagram.question}」的解答：\n
                上卦：${hexagram.upperTrigram.name}（${hexagram.upperTrigram.nature}）\n
                下卦：${hexagram.lowerTrigram.name}（${hexagram.lowerTrigram.nature}）\n
                卦名：${hexagram.hexagramName}\n
                這只是示例解釋，實際使用時將透過 Gemini API 獲取更詳細的解讀。`);
            }, 1000);
        });
    }
}

// 導出服務實例
window.divinationService = new DivinationService();