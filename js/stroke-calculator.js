/**
 * 康熙筆畫計算引擎
 * Stroke Calculator for Glyph-based Casting
 */

class StrokeCalculator {
    constructor(kangxiMap) {
        this.exceptions = kangxiMap || {};
        // 基本部首筆畫修正 (若不在例外表中)
        this.radicalCorrections = {
            // 這些通常在例外表中已經包含，但作為 fallback
            '氵': 4,
            '扌': 4,
            '忄': 4,
            '艹': 6,
            '辶': 7,
            '阝': 8 // 這裡比較複雜，左耳8右耳7，簡化處理或需上下文
        };
    }

    /**
     * 獲取單字筆畫
     * @param {string} char - 單個漢字
     */
    getStrokeCount(char) {
        if (!char) return 0;

        // 1. 查例外表
        if (this.exceptions[char]) {
            return this.exceptions[char];
        }

        // 2. 簡單估算 (這裡在瀏覽器端沒有完整的康熙字典庫，只能用 Unicode 擴展或其他方式估算，
        // 或者依賴用戶輸入的準確性。在 MVP 階段，我們可能需要一個較大的字庫，
        // 或者暫時使用簡單的 lookup + fallback)
        // 
        // 由於無法內建完整字典，這裡我們假設對於不在例外表的字，
        // 我們暫時無法準確獲取"康熙"筆畫，只能獲取"通用"筆畫。
        // 實際專案中應引入完整康熙字典資料庫。
        // 
        // 這裡示範一個簡單的 fallback：
        return this.estimateStroke(char);
    }

    /**
     * 估算筆畫 (僅作參考，實際應使用字典)
     * 這裡目前無法實現真正的筆畫計算，除非引入龐大的 mapping。
     * 為了演示，我們假設用戶輸入的是正確的，或者我們只能處理例外表中的字。
     * 
     * 為了讓系統可用，我們可以用一個簡單的 hack:
     * 如果是測試模式，我們可以擴充 Kangxi-Stroke-Map.json
     */
    estimateStroke(char) {
        // TODO: Integrate a proper stroke counting library or database
        // For now, return a placeholder or try to use some heuristic?
        // Heuristics are hard for Chinese characters.
        // We will rely on the exceptions map being populated for the demo cases.
        console.warn(`Warning: No stroke count found for ${char}, returning 0. Please add to Kangxi-Stroke-Map.`);
        return 0;
    }

    /**
     * 計算文字起卦
     * @param {string} text - 輸入文字
     * @param {number} hour - 時辰數 (1-12)
     */
    calculateTextHexagram(text, hour) {
        let totalStrokes = 0;
        let charCount = 0;

        for (let char of text) {
            if (char.trim() === '') continue;
            const strokes = this.getStrokeCount(char);
            if (strokes === 0) {
                // 如果遇到未知筆畫，暫時以 1 計算避免崩潰，並記錄
                totalStrokes += 1; 
            } else {
                totalStrokes += strokes;
            }
            charCount++;
        }

        // 梅花易數文字起卦規則：
        // 兩字：前一字上卦，後一字下卦
        // 三字：前一字上卦，後兩字下卦
        // 多字：平分，若奇數，上卦少一字，下卦多一字
        
        let upperStrokes = 0;
        let lowerStrokes = 0;

        if (charCount === 1) {
            // 一字占：左半為陽(上)，右半為陰(下) -> 太複雜，通常不建議一字占除非拆字
            // 這裡簡化：筆畫為上卦，筆畫+時辰為下卦
            upperStrokes = totalStrokes;
            lowerStrokes = totalStrokes + hour;
        } else if (charCount === 2) {
            upperStrokes = this.getStrokeCount(text[0]);
            lowerStrokes = this.getStrokeCount(text[1]);
        } else {
            const splitIndex = Math.floor(charCount / 2); // e.g. 3->1, 4->2
            // 上卦字數少 (天輕清於上)
            const upperText = text.substring(0, splitIndex);
            const lowerText = text.substring(splitIndex);

            for (let c of upperText) upperStrokes += this.getStrokeCount(c);
            for (let c of lowerText) lowerStrokes += this.getStrokeCount(c);
        }

        // 上卦 = 上部總筆畫 % 8
        // 下卦 = 下部總筆畫 % 8
        // 動爻 = 總筆畫 + 時辰 % 6 (這是常見的一種變體，或者 (上+下)%6)
        // 邵子原意：
        // 均分後，上卦數 = 上部筆畫，下卦數 = 下部筆畫
        // 上卦 = 上數 % 8
        // 下卦 = 下數 % 8
        // 動爻 = (總數 + 時辰) % 6
        
        // 修正：如果是一字占，totalStrokes 已經包含時辰了嗎？
        // 讓我們統一邏輯：
        // 1. 分配上下部筆畫
        // 2. 取卦
        // 3. 取動爻

        return {
            upperNum: upperStrokes,
            lowerNum: lowerStrokes,
            totalNum: totalStrokes + hour
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StrokeCalculator;
} else {
    window.StrokeCalculator = StrokeCalculator;
}
