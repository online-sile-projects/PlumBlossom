/**
 * 梅花易數核心計算引擎
 * Hexagram Engine for Plum Blossom Yi Jing
 */

class HexagramEngine {
    constructor(hexagramData) {
        this.data = hexagramData;
        this.EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        this.TRIGRAM_NUMBERS = {
            '乾': 1, '兌': 2, '離': 3, '震': 4, 
            '巽': 5, '坎': 6, '艮': 7, '坤': 8
        };
        this.FIVE_ELEMENTS = {
            1: '金', // 乾
            2: '金', // 兌
            3: '火', // 離
            4: '木', // 震
            5: '木', // 巽
            6: '水', // 坎
            7: '土', // 艮
            8: '土'  // 坤
        };
    }

    /**
     * 獲取地支數 (1-12)
     * @param {string} branch - 地支字符
     * @returns {number}
     */
    getBranchNumber(branch) {
        const index = this.EARTHLY_BRANCHES.indexOf(branch);
        return index !== -1 ? index + 1 : 0;
    }

    /**
     * 時間起卦
     * @param {number} year - 農曆年支數 (1-12)
     * @param {number} month - 農曆月數 (1-12)
     * @param {number} day - 農曆日數 (1-30)
     * @param {number} hour - 農曆時支數 (1-12)
     */
    calculateTimeHexagram(year, month, day, hour) {
        // 上卦 = (年+月+日) % 8
        let upperNum = (year + month + day) % 8;
        if (upperNum === 0) upperNum = 8;

        // 下卦 = (年+月+日+時) % 8
        let lowerNum = (year + month + day + hour) % 8;
        if (lowerNum === 0) lowerNum = 8;

        // 動爻 = (年+月+日+時) % 6
        let movingLine = (year + month + day + hour) % 6;
        if (movingLine === 0) movingLine = 6;

        return this.processHexagramResult(upperNum, lowerNum, movingLine);
    }

    /**
     * 數字起卦 (用於測字等)
     * @param {number} num1 - 第一個數 (上卦)
     * @param {number} num2 - 第二個數 (下卦)
     * @param {number} total - 總數 (用於動爻)
     */
    calculateNumberHexagram(num1, num2, total) {
        let upperNum = num1 % 8;
        if (upperNum === 0) upperNum = 8;

        let lowerNum = num2 % 8;
        if (lowerNum === 0) lowerNum = 8;

        let movingLine = total % 6;
        if (movingLine === 0) movingLine = 6;

        return this.processHexagramResult(upperNum, lowerNum, movingLine);
    }

    /**
     * 處理並生成完整卦象資訊
     */
    processHexagramResult(upperNum, lowerNum, movingLine) {
        const original = this.getHexagramByTrigrams(upperNum, lowerNum);
        const mutual = this.generateMutualHexagram(upperNum, lowerNum);
        const changed = this.generateChangedHexagram(upperNum, lowerNum, movingLine);

        // 判斷體用
        // 動爻所在之卦為用，另一卦為體
        // movingLine: 1,2,3 -> 下卦動 -> 下卦為用，上卦為體
        // movingLine: 4,5,6 -> 上卦動 -> 上卦為用，下卦為體
        const isUpperMoving = movingLine > 3;
        const tiTrigramNum = isUpperMoving ? lowerNum : upperNum;
        const yongTrigramNum = isUpperMoving ? upperNum : lowerNum;

        const tiElement = this.FIVE_ELEMENTS[tiTrigramNum];
        const yongElement = this.FIVE_ELEMENTS[yongTrigramNum];
        
        const relation = this.analyzeRelation(tiElement, yongElement);

        return {
            original: { ...original, movingLine },
            mutual: mutual,
            changed: changed,
            analysis: {
                ti: { number: tiTrigramNum, element: tiElement },
                yong: { number: yongTrigramNum, element: yongElement },
                relation: relation
            }
        };
    }

    /**
     * 根據上下卦數查找卦象
     */
    getHexagramByTrigrams(upper, lower) {
        // data.json structure: hexagrams array
        // We need to find hexagram where topTrigram == upper and bottomTrigram == lower
        const hex = this.data.hexagrams.find(h => h.topTrigram === upper && h.bottomTrigram === lower);
        return hex || null;
    }

    /**
     * 生成互卦
     * 互卦由本卦的 234 爻組成下卦，345 爻組成上卦
     * 
     * 本卦 6 爻 (由下而上 1-6):
     * 上卦: 6 (上爻), 5 (五爻), 4 (四爻)
     * 下卦: 3 (三爻), 2 (二爻), 1 (初爻)
     * 
     * 互卦下卦 (234):
     * 2: 下卦中爻
     * 3: 下卦上爻
     * 4: 上卦下爻
     * 
     * 互卦上卦 (345):
     * 3: 下卦上爻
     * 4: 上卦下爻
     * 5: 上卦中爻
     */
    generateMutualHexagram(upperNum, lowerNum) {
        const upperBin = this.getTrigramBinary(upperNum); // "111"
        const lowerBin = this.getTrigramBinary(lowerNum); // "111"

        // Combine to 6 lines string, index 0 is top (line 6), index 5 is bottom (line 1)
        // Wait, binary usually MSB is top? 
        // Let's check data.json. 
        // Trigram 1 (乾) binary "111".
        // Hexagram 1 (乾) binary "111111".
        // Usually in binary representation for I Ching, it's often Top bit = Top line or Bottom bit = Bottom line.
        // Let's assume standard string order: "111" -> 1(top), 1(middle), 1(bottom).
        // Let's verify with data.json if possible.
        // Trigram 4 (震) binary "001". 震 is ☳ (one yang at bottom, two yin above).
        // So "001" -> 0(top/yin), 0(middle/yin), 1(bottom/yang).
        // Correct. String index 0 is Top line, index 2 is Bottom line.
        
        // Hexagram: Upper Trigram on top of Lower Trigram.
        // Full binary string = UpperBinary + LowerBinary.
        // Index 0-2: Upper Trigram lines (Top, Middle, Bottom of Upper) -> Lines 6, 5, 4 of Hexagram
        // Index 3-5: Lower Trigram lines (Top, Middle, Bottom of Lower) -> Lines 3, 2, 1 of Hexagram
        
        const fullBin = upperBin + lowerBin;
        
        // Line 1: fullBin[5]
        // Line 2: fullBin[4]
        // Line 3: fullBin[3]
        // Line 4: fullBin[2]
        // Line 5: fullBin[1]
        // Line 6: fullBin[0]

        // Mutual Lower (2,3,4):
        // Top (Line 4): fullBin[2]
        // Mid (Line 3): fullBin[3]
        // Bot (Line 2): fullBin[4]
        const mutualLowerBin = fullBin[2] + fullBin[3] + fullBin[4];

        // Mutual Upper (3,4,5):
        // Top (Line 5): fullBin[1]
        // Mid (Line 4): fullBin[2]
        // Bot (Line 3): fullBin[3]
        const mutualUpperBin = fullBin[1] + fullBin[2] + fullBin[3];

        const mutualUpperNum = this.getTrigramNumberByBinary(mutualUpperBin);
        const mutualLowerNum = this.getTrigramNumberByBinary(mutualLowerBin);

        return this.getHexagramByTrigrams(mutualUpperNum, mutualLowerNum);
    }

    /**
     * 生成變卦
     * @param {number} movingLine - 動爻位置 (1-6)
     */
    generateChangedHexagram(upperNum, lowerNum, movingLine) {
        const upperBin = this.getTrigramBinary(upperNum);
        const lowerBin = this.getTrigramBinary(lowerNum);
        let fullBin = upperBin + lowerBin; // 0=Line6 ... 5=Line1

        // Convert string to array to mutate
        let binArray = fullBin.split('');
        
        // Calculate index to flip
        // movingLine 1 -> index 5
        // movingLine 6 -> index 0
        const indexToFlip = 6 - movingLine;
        
        // Flip bit
        binArray[indexToFlip] = binArray[indexToFlip] === '1' ? '0' : '1';
        
        const newFullBin = binArray.join('');
        const newUpperBin = newFullBin.substring(0, 3);
        const newLowerBin = newFullBin.substring(3, 6);

        const newUpperNum = this.getTrigramNumberByBinary(newUpperBin);
        const newLowerNum = this.getTrigramNumberByBinary(newLowerBin);

        return this.getHexagramByTrigrams(newUpperNum, newLowerNum);
    }

    getTrigramBinary(number) {
        const trigram = this.data.trigrams.find(t => t.number === number);
        return trigram ? trigram.binary : "000";
    }

    getTrigramNumberByBinary(binary) {
        const trigram = this.data.trigrams.find(t => t.binary === binary);
        return trigram ? trigram.number : 0;
    }

    /**
     * 分析體用生剋
     */
    analyzeRelation(tiElement, yongElement) {
        // 五行生剋
        // 金生水，水生木，木生火，火生土，土生金
        // 金剋木，木剋土，土剋水，水剋火，火剋金
        
        if (tiElement === yongElement) return "比和 (吉)";
        
        const generating = {
            '金': '水', '水': '木', '木': '火', '火': '土', '土': '金'
        };
        
        const overcoming = {
            '金': '木', '木': '土', '土': '水', '水': '火', '火': '金'
        };

        if (generating[tiElement] === yongElement) return "體生用 (凶)"; // 洩氣
        if (generating[yongElement] === tiElement) return "用生體 (大吉)"; // 進益
        
        if (overcoming[tiElement] === yongElement) return "體剋用 (小吉)"; // 掌控
        if (overcoming[yongElement] === tiElement) return "用剋體 (大凶)"; // 受制

        return "未知關係";
    }
}

// Export for Node.js or Browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HexagramEngine;
} else {
    window.HexagramEngine = HexagramEngine;
}
