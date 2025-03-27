import { trigrams, hexagramNames, hexagramUnicode } from './divinationData.js';

class DivinationService {
    static trigrams = trigrams;
    static hexagramNames = hexagramNames;
    static hexagramUnicode = hexagramUnicode;

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

    // 模擬解卦（實際應用中這裡會調用 Gemini API）
    async getReading(hexagram) {
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
                
                這只是示例解釋，實際使用時將透過 Gemini API 獲取更詳細的解讀。`);
            }, 1000);
        });
    }
}

// 導出服務實例
export const divinationService = new DivinationService();