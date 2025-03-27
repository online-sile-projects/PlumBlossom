class DivinationService {
    // 八卦基本資料
    static trigrams = {
        qian: { name: '乾', symbol: '☰', nature: '天', attribute: '健' },
        dui: { name: '兌', symbol: '☱', nature: '澤', attribute: '悅' },
        li: { name: '離', symbol: '☲', nature: '火', attribute: '麗' },
        zhen: { name: '震', symbol: '☳', nature: '雷', attribute: '動' },
        xun: { name: '巽', symbol: '☴', nature: '風', attribute: '入' },
        kan: { name: '坎', symbol: '☵', nature: '水', attribute: '陷' },
        gen: { name: '艮', symbol: '☶', nature: '山', attribute: '止' },
        kun: { name: '坤', symbol: '☷', nature: '地', attribute: '順' }
    };

    static hexagramNames = {
        // 乾卦相關
        '111111': '乾為天',
        '111110': '天風姤',
        '111101': '天火同人',
        '111100': '天雷无妄',
        '111011': '天澤履',
        '111010': '天水訟',
        '111001': '天山遁',
        '111000': '天地否',
        
        // 兌卦相關
        '011111': '澤天夬',
        '011110': '兌為澤',
        '011101': '澤火革',
        '011100': '澤雷隨',
        '011011': '澤澤節',
        '011010': '澤水困',
        '011001': '澤山咸',
        '011000': '澤地萃',
        
        // 離卦相關
        '101111': '火天大有',
        '101110': '火風鼎',
        '101101': '離為火',
        '101100': '火雷噬嗑',
        '101011': '火澤睽',
        '101010': '火水未濟',
        '101001': '火山旅',
        '101000': '火地晉',
        
        // 震卦相關
        '001111': '雷天大壯',
        '001110': '雷風恆',
        '001101': '雷火豐',
        '001100': '震為雷',
        '001011': '雷澤歸妹',
        '001010': '雷水解',
        '001001': '雷山小過',
        '001000': '雷地豫',
        
        // 巽卦相關
        '110111': '風天小畜',
        '110110': '巽為風',
        '110101': '風火家人',
        '110100': '風雷益',
        '110011': '風澤中孚',
        '110010': '風水渙',
        '110001': '風山漸',
        '110000': '風地觀',
        
        // 坎卦相關
        '010111': '水天需',
        '010110': '水風井',
        '010101': '水火既濟',
        '010100': '水雷屯',
        '010011': '水澤節',
        '010010': '坎為水',
        '010001': '水山蹇',
        '010000': '水地比',
        
        // 艮卦相關
        '100111': '山天大畜',
        '100110': '山風蠱',
        '100101': '山火賁',
        '100100': '山雷頤',
        '100011': '山澤損',
        '100010': '山水蒙',
        '100001': '艮為山',
        '100000': '山地剝',
        
        // 坤卦相關
        '000111': '地天泰',
        '000110': '地風升',
        '000101': '地火明夷',
        '000100': '地雷復',
        '000011': '地澤臨',
        '000010': '地水師',
        '000001': '地山謙',
        '000000': '坤為地'
    };

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
        
        return {
            lines,
            upperTrigram: this.getTrigramByIndex(upperTrigramIndex),
            lowerTrigram: this.getTrigramByIndex(lowerTrigramIndex),
            hexagramName,
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