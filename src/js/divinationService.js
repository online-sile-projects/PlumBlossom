import { trigrams, hexagramNames, hexagramUnicode } from './divinationData.js';
import { geminiClient } from './apiClient.js';

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

    // 計算互卦（交錯的爻）
    calculateOverlappingHexagram(lines) {
        // 互卦取第 2,3,4 爻作上卦，第 3,4,5 爻作下卦
        const overlappingLines = [
            lines[1], lines[2], lines[3],  // 上卦
            lines[2], lines[3], lines[4]   // 下卦
        ];
        return this.calculateHexagram(overlappingLines);
    }

    // 計算伏卦（陰陽反轉）
    calculateHiddenHexagram(lines) {
        // 伏卦是將原卦的陰陽反轉
        const hiddenLines = lines.map(line => line === 1 ? 0 : 1);
        return this.calculateHexagram(hiddenLines);
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

        // 計算互卦
        const overlappingHexagram = this.calculateOverlappingHexagram(lines);

        // 計算伏卦
        const hiddenHexagram = this.calculateHiddenHexagram(lines);
        
        return {
            original: {
                ...originalHexagram,
                lines
            },
            changed: {
                ...changedHexagram,
                lines: changedLines
            },
            overlapping: {
                ...overlappingHexagram
            },
            hidden: {
                ...hiddenHexagram
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

    // 解卦（通過 Gemini API）
    async getReading(hexagram) {
        try {
            // 使用 Gemini API 獲取解卦結果
            const reading = await geminiClient.getPlumBlossomDivination(hexagram);
            return reading;
        } catch (error) {
            console.error("獲取卦象解讀時發生錯誤:", error);
            // 使用後備方案，當 API 不可用時
            return geminiClient.getFallbackReading(hexagram);
        }
    }
}

// 導出服務實例
export const divinationService = new DivinationService();