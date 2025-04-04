import { divinationService } from './divinationService.js';
import { divinationComponents } from './components.js';
import { geminiClient } from './apiClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('question-input');
    const submitButton = document.getElementById('submit-question');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyButton = document.getElementById('save-api-key');
    const apiStatusElement = document.getElementById('api-status');
    const toggleSettingsButton = document.getElementById('toggle-settings');
    const apiSettingsPanel = document.getElementById('api-settings');
    
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