import { divinationService } from './divinationService.js';
import { divinationComponents } from './components.js';
import { geminiClient } from './apiClient.js';

// 歷史記錄管理類
class HistoryManager {
    constructor() {
        this.historyKey = 'plumBlossom_history';
        this.maxHistoryItems = 50;
    }

    // 獲取所有歷史記錄
    getHistory() {
        const history = localStorage.getItem(this.historyKey);
        return history ? JSON.parse(history) : [];
    }

    // 添加新的歷史記錄
    addToHistory(record) {
        let history = this.getHistory();
        history.unshift({
            ...record,
            timestamp: new Date().toISOString()
        });

        // 限制歷史記錄數量
        if (history.length > this.maxHistoryItems) {
            history = history.slice(0, this.maxHistoryItems);
        }

        localStorage.setItem(this.historyKey, JSON.stringify(history));
        this.displayHistory();
    }

    // 清除所有歷史記錄
    clearHistory() {
        localStorage.removeItem(this.historyKey);
        this.displayHistory();
    }

    // 顯示歷史記錄
    displayHistory() {
        const history = this.getHistory();
        const historyList = document.getElementById('history-list');
        const historyPanel = document.getElementById('history-panel');

        if (history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">暫無歷史記錄</div>';
            return;
        }

        // 更新歷史記錄面板標題
        const historyTitle = historyPanel.querySelector('h3');
        if (!historyTitle.querySelector('.clear-history')) {
            historyTitle.innerHTML = `歷史記錄 <button class="clear-history">清除全部</button>`;
            const clearButton = historyTitle.querySelector('.clear-history');
            clearButton.addEventListener('click', () => this.clearHistory());
        }

        // 顯示歷史記錄列表
        historyList.innerHTML = history.map(record => `
            <div class="history-item" data-record='${JSON.stringify(record)}'>
                <div class="date">${new Date(record.timestamp).toLocaleString('zh-TW')}</div>
                <div class="question">${record.hexagram.question}</div>
                <div class="hexagram-info">
                    <span>${record.hexagram.original.hexagramName} ${record.hexagram.original.hexagramSymbol}</span>
                    ${record.hexagram.changingLines.some(x => x) ? 
                        `<span>→</span><span>${record.hexagram.changed.hexagramName} ${record.hexagram.changed.hexagramSymbol}</span>` 
                        : ''}
                </div>
            </div>
        `).join('');

        // 為每個歷史記錄項添加點擊事件
        historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const record = JSON.parse(item.dataset.record);
                divinationComponents.renderHexagram(record.hexagram);
                divinationComponents.displayReading(record.reading);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('question-input');
    const submitButton = document.getElementById('submit-question');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const apiStatusElement = document.getElementById('api-status');
    const toggleSettingsButton = document.getElementById('toggle-settings');
    const apiSettingsPanel = document.getElementById('api-settings');
    
    // 初始化歷史記錄管理器
    const historyManager = new HistoryManager();
    
    // 初始化時顯示歷史記錄
    historyManager.displayHistory();
    
    // 初始化 API 金鑰設定
    initApiSettings();
    
    // 處理排卦請求
    async function handleDivination() {
        const question = questionInput.value.trim();
        
        if (!question) {
            divinationComponents.showError('請輸入您的問題');
            return;
        }
        
        // 檢查是否有設定 API 金鑰
        if (!geminiClient.apiKey) {
            showApiKeyError('請先設定 Gemini API 金鑰');
            return;
        }
        
        try {
            // 生成卦象
            const hexagram = divinationService.generateHexagram(question);
            
            // 顯示卦象
            divinationComponents.renderHexagram(hexagram);
            
            // 顯示載入狀態
            divinationComponents.showLoading();
            
            // 獲取解卦結果
            const reading = await divinationService.getReading(hexagram);
            
            // 顯示解卦結果
            divinationComponents.displayReading(reading);

            // 添加到歷史記錄
            historyManager.addToHistory({ hexagram, reading });
            
        } catch (error) {
            console.error('排卦過程發生錯誤:', error);
            divinationComponents.showError('排卦過程發生錯誤，請稍後再試');
        }
    }
    
    // 初始化 API 金鑰設定
    function initApiSettings() {
        // 從本地儲存讀取 API 金鑰
        const savedApiKey = localStorage.getItem('geminiApiKey');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
            geminiClient.setApiKey(savedApiKey);
            showApiKeySuccess('已載入儲存的 API 金鑰');
        }
        
        // 儲存 API 金鑰按鈕事件
        saveApiKeyButton.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                showApiKeyError('請輸入有效的 API 金鑰');
                return;
            }
            
            // 儲存 API 金鑰
            localStorage.setItem('geminiApiKey', apiKey);
            geminiClient.setApiKey(apiKey);
            showApiKeySuccess('API 金鑰已成功儲存');
        });
        
        // 設定設定面板的摺疊功能
        toggleSettingsButton.addEventListener('click', () => {
            const settingsContent = apiSettingsPanel.querySelector('.input-group');
            const isVisible = getComputedStyle(settingsContent).display !== 'none';
            
            if (isVisible) {
                settingsContent.style.display = 'none';
                apiStatusElement.style.display = 'none';
                toggleSettingsButton.textContent = '▸ 顯示設定';
            } else {
                settingsContent.style.display = 'flex';
                apiStatusElement.style.display = 'block';
                toggleSettingsButton.textContent = '▾ 隱藏設定';
            }
        });
    }
    
    // 顯示 API 金鑰錯誤訊息
    function showApiKeyError(message) {
        apiStatusElement.textContent = message;
        apiStatusElement.className = 'status-message status-error';
    }
    
    // 顯示 API 金鑰成功訊息
    function showApiKeySuccess(message) {
        apiStatusElement.textContent = message;
        apiStatusElement.className = 'status-message status-success';
    }
    
    // 註冊事件監聽器
    submitButton.addEventListener('click', handleDivination);
    
    // 支援按下 Enter 鍵提交
    questionInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleDivination();
        }
    });
});