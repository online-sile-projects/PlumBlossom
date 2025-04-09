class DivinationComponents {
    constructor() {
        this.hexagramDisplay = document.getElementById('hexagram-display');
        this.readingResult = document.getElementById('reading-result');
    }

    // 繪製卦象（包含本卦和變卦）
    renderHexagram(hexagramData) {
        const originalHexagram = this.renderSingleHexagram(hexagramData.original, '本卦');
        const changedHexagram = hexagramData.changingLines.some(x => x)
            ? this.renderSingleHexagram(hexagramData.changed, '變卦')
            : '';
        const overlappingHexagram = this.renderSingleHexagram(hexagramData.overlapping, '互卦');
        const hiddenHexagram = this.renderSingleHexagram(hexagramData.hidden, '伏卦');
        
        const changingLinesInfo = hexagramData.changingLines.some(x => x)
            ? `<div class="changing-lines">
                變爻：${hexagramData.changingLines.map((isChanging, i) => 
                    isChanging ? `<span class="changing-line">${i + 1}</span>` : ''
                ).filter(x => x).join('、')}
            </div>`
            : '<div class="changing-lines">無變爻</div>';

        this.hexagramDisplay.innerHTML = `
            <div class="hexagrams-container">
                <div class="primary-hexagrams">
                    ${originalHexagram}
                    ${changingLinesInfo}
                    ${changedHexagram}
                </div>
                <div class="secondary-hexagrams">
                    <div class="hexagram-row">
                        ${overlappingHexagram}
                        ${hiddenHexagram}
                    </div>
                </div>
            </div>
        `;
    }

    // 渲染單個卦象
    renderSingleHexagram(hexagram, title) {
        // 檢查資料完整性
        if (!hexagram || !hexagram.lines || !hexagram.upperTrigram || !hexagram.lowerTrigram) {
            console.warn(`無效的卦象資料: ${title}`);
            return `
                <div class="hexagram-container error">
                    <div class="hexagram-header">
                        <h3 class="hexagram-title">${title}</h3>
                        <span class="hexagram-symbol">?</span>
                        <h3 class="hexagram-name">資料錯誤</h3>
                    </div>
                </div>
            `;
        }

        return `
            <div class="hexagram-container">
                <div class="hexagram-header">
                    <h3 class="hexagram-title">${title}</h3>
                    <span class="hexagram-symbol">${hexagram.hexagramSymbol || '?'}</span>
                    <h3 class="hexagram-name">${hexagram.hexagramName || '未知卦'}</h3>
                </div>
                <div class="trigrams">
                    <div class="upper-trigram">
                        <h4>${hexagram.upperTrigram.name || '?'} ${hexagram.upperTrigram.symbol || ''}</h4>
                        <p>性質：${hexagram.upperTrigram.nature || '未知'}</p>
                    </div>
                    <div class="lower-trigram">
                        <h4>${hexagram.lowerTrigram.name || '?'} ${hexagram.lowerTrigram.symbol || ''}</h4>
                        <p>性質：${hexagram.lowerTrigram.nature || '未知'}</p>
                    </div>
                </div>
                <div class="lines">
                    ${Array.isArray(hexagram.lines) ? hexagram.lines.map((line, index) => `
                        <div class="line ${line ? 'yang' : 'yin'}">
                            ${line ? '━━━━━' : '━━ ━━'}
                        </div>
                    `).join('') : '<div class="error">無效的爻線資料</div>'}
                </div>
            </div>
        `;
    }

    // 顯示解卦結果
    displayReading(reading) {
        this.readingResult.innerHTML = `
            <h3>解卦結果</h3>
            <div class="reading-content">
                ${reading.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>
        `;
    }

    // 顯示載入中狀態
    showLoading() {
        this.readingResult.innerHTML = '<div class="loading">解卦中...</div>';
    }

    // 顯示刪除確認提示
    showDeleteConfirm(timestamp, onConfirm) {
        const item = document.querySelector(`[data-timestamp="${timestamp}"]`).closest('.history-item');
        item.classList.add('deleting');
        
        if (confirm('確定要刪除這筆紀錄嗎？')) {
            item.classList.add('fade-out');
            setTimeout(() => {
                onConfirm(timestamp);
            }, 300);
        } else {
            item.classList.remove('deleting');
        }
    }

    // 顯示錯誤訊息
    showError(message) {
        this.readingResult.innerHTML = `<div class="error">${message}</div>`;
    }
}

// 導出元件實例
export const divinationComponents = new DivinationComponents();