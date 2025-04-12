import { divinationComponents } from './components.js';

// 歷史記錄管理類
export class HistoryManager {
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
            timestamp: new Date().toISOString(),
            note: ''  // 新增備註欄位
        });

        // 限制歷史記錄數量
        if (history.length > this.maxHistoryItems) {
            history = history.slice(0, this.maxHistoryItems);
        }

        localStorage.setItem(this.historyKey, JSON.stringify(history));
        this.displayHistory();
    }

    // 新增編輯備註的方法
    updateNote(timestamp, note) {
        let history = this.getHistory();
        history = history.map(item => {
            if (item.timestamp === timestamp) {
                return { ...item, note };
            }
            return item;
        });
        localStorage.setItem(this.historyKey, JSON.stringify(history));
        this.displayHistory();
    }

    // 清除所有歷史記錄
    clearHistory() {
        localStorage.removeItem(this.historyKey);
        this.displayHistory();
    }

    // 刪除單筆歷史記錄
    deleteHistoryItem(timestamp) {
        let history = this.getHistory();
        history = history.filter(item => item.timestamp !== timestamp);
        localStorage.setItem(this.historyKey, JSON.stringify(history));
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
                <div class="date">
                    ${new Date(record.timestamp).toLocaleString('zh-TW')}
                    <button class="delete-item" data-timestamp="${record.timestamp}">✕</button>
                </div>
                <div class="question">${record.hexagram.question}</div>
                <div class="hexagram-info">
                    <span>${record.hexagram.original.hexagramName} ${record.hexagram.original.hexagramSymbol}</span>
                    ${record.hexagram.changingLines.some(x => x) ? 
                        `<span>→</span><span>${record.hexagram.changed.hexagramName} ${record.hexagram.changed.hexagramSymbol}</span>` 
                        : ''}
                </div>
                <div class="note-section">
                    <textarea class="note-input" placeholder="點擊此處添加備註..." data-timestamp="${record.timestamp}">${record.note || ''}</textarea>
                </div>
            </div>
        `).join('');

        // 為備註輸入框添加事件監聽
        historyList.querySelectorAll('.note-input').forEach(textarea => {
            textarea.addEventListener('change', (e) => {
                const timestamp = e.target.dataset.timestamp;
                const note = e.target.value;
                this.updateNote(timestamp, note);
            });
        });

        // 為每個歷史記錄項添加點擊事件
        historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-item')) {
                    const record = JSON.parse(item.dataset.record);
                    this.onHistoryItemClick(record);
                }
            });
        });

        // 為刪除按鈕添加點擊事件
        historyList.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const timestamp = button.dataset.timestamp;
                if (divinationComponents) {
                    divinationComponents.showDeleteConfirm(timestamp, (confirmedTimestamp) => {
                        this.deleteHistoryItem(confirmedTimestamp);
                    });
                } else {
                    // 如果 divinationComponents 不可用，使用基本確認
                    if (confirm('確定要刪除這筆紀錄嗎？')) {
                        this.deleteHistoryItem(timestamp);
                    }
                }
            });
        });
    }

    // 設定歷史記錄項目點擊時的回調函數
    setHistoryItemClickHandler(callback) {
        this.onHistoryItemClick = callback;
    }
}

// 導出歷史記錄管理器實例
export const historyManager = new HistoryManager();
