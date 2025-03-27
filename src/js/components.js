class DivinationComponents {
    constructor() {
        this.hexagramDisplay = document.getElementById('hexagram-display');
        this.readingResult = document.getElementById('reading-result');
    }

    // 繪製卦象
    renderHexagram(hexagram) {
        const lines = hexagram.lines;
        const hexagramHtml = `
            <div class="hexagram-container">
                <h3 class="hexagram-name">${hexagram.hexagramName}</h3>
                <div class="trigrams">
                    <div class="upper-trigram">
                        <h4>${hexagram.upperTrigram.name} ${hexagram.upperTrigram.symbol}</h4>
                        <p>性質：${hexagram.upperTrigram.nature}</p>
                    </div>
                    <div class="lower-trigram">
                        <h4>${hexagram.lowerTrigram.name} ${hexagram.lowerTrigram.symbol}</h4>
                        <p>性質：${hexagram.lowerTrigram.nature}</p>
                    </div>
                </div>
                <div class="lines">
                    ${lines.map((line, index) => `
                        <div class="line ${line ? 'yang' : 'yin'}">
                            ${line ? '━━━━━' : '━━ ━━'}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        this.hexagramDisplay.innerHTML = hexagramHtml;
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

    // 顯示錯誤訊息
    showError(message) {
        this.readingResult.innerHTML = `<div class="error">${message}</div>`;
    }
}

// 導出元件實例
window.divinationComponents = new DivinationComponents();