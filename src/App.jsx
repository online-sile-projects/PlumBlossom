import { useState, useEffect } from 'react'
import './App.css'
import MyTemplate from './template/index.js'
import PlumBlossomDivination from './components/PlumBlossomDivination'
import './styles/PlumBlossomDivination.css'

function App() {
  const [showConsoleInstructions, setShowConsoleInstructions] = useState(true);
  
  // 在控制台中暴露梅花易數的功能
  useEffect(() => {
    // 引入數據和工具函數
    import('./utils/plumBlossom').then(plumBlossom => {
      import('./assets/data.json').then(data => {
        // 導入 LLM API 模組
        import('./utils/llmApi').then(llmApi => {
          // 在全局對象中添加梅花易數功能
          window.PlumBlossom = {
            ...plumBlossom,
            data: data.default,
            performDivination: (question) => {
              return plumBlossom.divination(question, data.default);
            },
            // 加入 LLM API 相關功能
            generatePrompt: (result) => {
              return llmApi.generateDivinationPrompt(result);
            },
            callLLMAPI: (prompt, apiType, apiKey, apiUrl) => {
              return llmApi.callLLMAPI(prompt, apiType, apiKey, apiUrl);
            }
          };
          
          // 顯示說明
          console.log('%c梅花易數排盤工具已加載', 'font-size: 16px; color: #4CAF50; font-weight: bold;');
          console.log('%c使用方法：', 'color: #2196F3;');
          console.log('PlumBlossom.performDivination("你的問題") - 進行排盤並返回結果');
          console.log('PlumBlossom.getHistoryFromLocalStorage() - 獲取歷史記錄');
          console.log('PlumBlossom.generatePrompt(結果) - 生成 LLM 提示詞');
          console.log('PlumBlossom.callLLMAPI(提示詞, "openai|gemini|deepseek", "API金鑰", "自訂API端點") - 調用 LLM API');
        });
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {showConsoleInstructions && (
        <div className="p-4 bg-yellow-100 text-yellow-800 flex justify-between items-center">
          <div>
            <p className="font-bold">提示：</p>
            <p>您可以在 Chrome 控制台中使用 <code>PlumBlossom.performDivination("問題")</code> 進行排盤</p>
            <p>新增 LLM 論掛功能! 可用於生成提示詞與呼叫 LLMs API 進行深度解析</p>
          </div>
          <button 
            onClick={() => setShowConsoleInstructions(false)}
            className="px-3 py-1 bg-yellow-200 rounded hover:bg-yellow-300"
          >
            關閉
          </button>
        </div>
      )}
      
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">梅花易數排盤系統</h1>
        <PlumBlossomDivination />
      </div>
    </div>
  )
}

export default App
