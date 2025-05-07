import React, { useState, useEffect } from 'react';

const LLMResponseRecorder = ({ divinationResult }) => {
  const [response, setResponse] = useState('');
  const [savedResponses, setSavedResponses] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [responseLLMSource, setResponseLLMSource] = useState('');
  
  // 載入已儲存的回覆
  useEffect(() => {
    const loadSavedResponses = () => {
      const saved = localStorage.getItem('llmResponses');
      if (saved) {
        try {
          setSavedResponses(JSON.parse(saved));
        } catch (err) {
          console.error('載入已儲存回覆時發生錯誤:', err);
          setSavedResponses([]);
        }
      }
    };
    
    loadSavedResponses();
  }, []);
  
  // 儲存回覆到本機儲存空間
  const saveResponse = () => {
    if (!response.trim() || !responseLLMSource.trim()) return;
    
    const timestamp = new Date().toISOString();
    const questionText = divinationResult.question || '未指定問題';
    const hexagramInfo = `${divinationResult.mainHexagram.name}卦`;
    
    const newResponse = {
      id: Date.now(),
      timestamp,
      question: questionText,
      hexagram: hexagramInfo,
      response,
      source: responseLLMSource,
    };
    
    const updatedResponses = [...savedResponses, newResponse];
    setSavedResponses(updatedResponses);
    
    // 儲存到 localStorage
    try {
      localStorage.setItem('llmResponses', JSON.stringify(updatedResponses));
    } catch (err) {
      console.error('儲存回覆時發生錯誤:', err);
    }
    
    // 清空當前回覆輸入框
    setResponse('');
    setResponseLLMSource('');
  };
  
  // 刪除已儲存的回覆
  const deleteResponse = (id) => {
    const updatedResponses = savedResponses.filter(item => item.id !== id);
    setSavedResponses(updatedResponses);
    localStorage.setItem('llmResponses', JSON.stringify(updatedResponses));
  };
  
  // 格式化日期時間
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  return (
    <div className="llm-response-recorder">
      <h3>LLM 回覆紀錄</h3>
      
      <div className="tabs">
        <button 
          className={activeTab === 'current' ? 'active' : ''} 
          onClick={() => setActiveTab('current')}
        >
          紀錄新回覆
        </button>
        <button 
          className={activeTab === 'saved' ? 'active' : ''} 
          onClick={() => setActiveTab('saved')}
        >
          已儲存回覆 ({savedResponses.length})
        </button>
      </div>
      
      {activeTab === 'current' ? (
        <div className="current-response">
          <div className="form-group">
            <label>LLM 來源：</label>
            <select 
              value={responseLLMSource} 
              onChange={(e) => setResponseLLMSource(e.target.value)}
            >
              <option value="">請選擇 LLM 來源</option>
              <option value="ChatGPT">ChatGPT</option>
              <option value="Claude">Claude</option>
              <option value="Gemini">Gemini</option>
              <option value="DeepSeek">DeepSeek</option>
              <option value="Perplexity">Perplexity</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>LLM 回覆內容：</label>
            <textarea 
              value={response} 
              onChange={(e) => setResponse(e.target.value)}
              placeholder="請將 LLM 的回覆貼到此處..."
              rows={10}
            />
          </div>
          
          <button 
            onClick={saveResponse}
            disabled={!response.trim() || !responseLLMSource.trim()}
            className="save-btn"
          >
            儲存回覆
          </button>
        </div>
      ) : (
        <div className="saved-responses">
          {savedResponses.length === 0 ? (
            <p className="no-data">尚無已儲存的回覆</p>
          ) : (
            <div className="response-list">
              {savedResponses.map(item => (
                <div className="response-item" key={item.id}>
                  <div className="response-header">
                    <div className="response-meta">
                      <strong>問題：</strong> {item.question}<br />
                      <strong>卦象：</strong> {item.hexagram}<br />
                      <strong>來源：</strong> {item.source}<br />
                      <strong>時間：</strong> {formatDateTime(item.timestamp)}
                    </div>
                    <button 
                      className="delete-btn" 
                      onClick={() => deleteResponse(item.id)}
                    >
                      刪除
                    </button>
                  </div>
                  <div className="response-content">
                    {item.response.split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LLMResponseRecorder;
