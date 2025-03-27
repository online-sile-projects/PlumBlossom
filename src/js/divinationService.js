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
        
        // 這裡先返回簡單的結構，之後可以擴充
        return {
            lines,
            upperTrigram: this.getTrigramByIndex(upperTrigramIndex),
            lowerTrigram: this.getTrigramByIndex(lowerTrigramIndex),
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
                這只是示例解釋，實際使用時將透過 Gemini API 獲取更詳細的解讀。`);
            }, 1000);
        });
    }
}

// 導出服務實例
window.divinationService = new DivinationService();