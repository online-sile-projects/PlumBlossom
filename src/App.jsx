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
