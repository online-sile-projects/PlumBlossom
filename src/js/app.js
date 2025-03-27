import { divinationService } from './divinationService.js';
import { divinationComponents } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('question-input');
    const submitButton = document.getElementById('submit-question');

    // 處理排卦請求
    async function handleDivination() {
        const question = questionInput.value.trim();
        
        if (!question) {
            divinationComponents.showError('請輸入您的問題');
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