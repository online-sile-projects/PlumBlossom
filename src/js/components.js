class DivinationComponents {
    constructor() {
        this.hexagramDisplay = document.getElementById('hexagram-display');
        this.readingResult = document.getElementById('reading-result');
        this.apiKeyInput = null;
        this.apiKeyStatus = null;
        this.settingsPanel = null;
    }
    
    // 繪製卦象（包含本卦和變卦）
    renderHexagram(hexagramData) {
        const originalHexagram = this.renderSingleHexagram(hexagramData.original, '本卦');
        const changedHexagram = hexagramData.changingLines.some(x => x)
            ? this.renderSingleHexagram(hexagramData.changed, '變卦')
            : '';
        
        const changingLinesInfo = hexagramData.changingLines.some(x => x)
            ? `<div class="changing-lines">
                變爻：${hexagramData.changingLines.map((isChanging, i) => 
                    isChanging ? `<span class="changing-line">${i + 1}</span>` : ''
                ).filter(x => x).join('、')}
            </div>`
            : '<div class="changing-lines">無變爻</div>';
        this.hexagramDisplay.innerHTML = `
            <div class="hexagrams-container">
                ${originalHexagram}
                ${changingLinesInfo}
                ${changedHexagram}
            </div>
        `;
    }
    
    // 渲染單個卦象
    renderSingleHexagram(hexagram, title) {
        return `
            <div class="hexagram-container">
                <div class="hexagram-header">
                    <h3 class="hexagram-title">${title}</h3>
                    <span class="hexagram-symbol">${hexagram.hexagramSymbol}</span>
                    <h3 class="hexagram-name">${hexagram.hexagramName}</h3>
                </div>
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
                    ${hexagram.lines.map((line, index) => `
                        <div class="line ${line ? 'yang' : 'yin'}">
                            ${line ? '━━━━━' : '━━ ━━'}
                        </div>
                    `).join('')}
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
    
    // 顯示錯誤訊息
    showError(message) {
        this.readingResult.innerHTML = `<div class="error">${message}</div>`;
    }
    
    // 創建並顯示 API 設定面板
    createApiKeyPanel() {
        // 如果面板已存在，先移除
        if (this.settingsPanel) {
            this.settingsPanel.remove();
        }
        
        const panel = document.createElement('div');
        panel.className = 'api-settings-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>Gemini API 設定</h3>
                <button id="close-settings" class="close-button">✕</button>
            </div>
            <div class="api-form">
                <label for="api-key-input">API 金鑰:</label>
                <input type="password" id="api-key-input" placeholder="請輸入 Gemini API 金鑰">
                <div class="api-buttons">
                    <button id="save-api-key">儲存</button>
                    <button id="toggle-api-view">顯示/隱藏</button>
                    <button id="clear-api-key">清除</button>
                </div>
                <div class="api-key-status"></div>
            </div>
            <div class="api-info">
                <p>使用 Gemini API 可獲得更加專業、準確的占卜分析。您可以在 <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a> 申請 API 金鑰。</p>
                <p>您的 API 金鑰將只存儲在您的瀏覽器中，不會被發送到任何伺服器。</p>
            </div>
        `;
        
        // 添加到頁面中
        const appContainer = document.querySelector('.app-container') || document.body;
        appContainer.appendChild(panel);
        this.settingsPanel = panel;
        
        // 保存元素引用
        this.apiKeyInput = document.getElementById('api-key-input');
        this.apiKeyStatus = document.querySelector('.api-key-status');
        
        // 設置關閉按鈕事件
        const closeBtn = document.getElementById('close-settings');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.style.display = 'none';
            });
        }
        
        this.setupApiPanelEvents();
        
        return {
            panel,
            input: this.apiKeyInput,
            saveButton: document.getElementById('save-api-key'),
            toggleButton: document.getElementById('toggle-api-view'),
            clearButton: document.getElementById('clear-api-key'),
            closeButton: closeBtn
        };
    }
    
    // 設置 API 面板的事件處理
    setupApiPanelEvents() {
        const toggleViewBtn = document.getElementById('toggle-api-view');
        if (toggleViewBtn && this.apiKeyInput) {
            toggleViewBtn.addEventListener('click', () => {
                if (this.apiKeyInput.type === 'password') {
                    this.apiKeyInput.type = 'text';
                } else {
                    this.apiKeyInput.type = 'password';
                }
            });
        }
    }
    
    // 更新 API 金鑰狀態顯示
    updateApiKeyStatus(isSet) {
        if (!this.apiKeyStatus) return;
        
        if (isSet) {
            this.apiKeyStatus.innerHTML = `
                <span class="api-status-set">API 金鑰已設定 ✅</span>
            `;
        } else {
            this.apiKeyStatus.innerHTML = `
                <span class="api-status