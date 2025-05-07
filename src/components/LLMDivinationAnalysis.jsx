import React, { useState } from 'react';
import { generateDivinationPrompt, callLLMAPI } from '../utils/llmApi';

const LLMDivinationAnalysis = ({ divinationResult }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiType, setApiType] = useState('openai');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [showPrompt, setShowPrompt] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // 生成提示詞
  const prompt = generateDivinationPrompt(divinationResult);
  
  // 複製提示詞到剪貼板
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('無法複製文本: ', err);
        setError('複製失敗，請手動選取複製');
      });
  };
  
  // 呼叫 LLM API
  const handleCallAPI = async () => {
    if (!apiKey) {
      setError('請輸入 API 金鑰');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await callLLMAPI(prompt, apiType, apiKey, customApiUrl || undefined);
      setInterpretation(result);
      setIsLoading(false);
    } catch (err) {
      console.error('API 呼叫錯誤:', err);
      setError(`API 呼叫失敗: ${err.message}`);
      setIsLoading(false);
    }
  };

  // 開啟 LLM 網站函式
  const openLLMWebsite = (url) => {
    window.open(url, '_blank');
  };
  
  if (!divinationResult || !divinationResult.mainHexagram) {
    return null;
  }
  
  return (
    <div className="llm-divination-analysis">
      <h3>LLM 論掛分析</h3>
      
      <div className="api-selection">
        <div className="form-group">
          <label>選擇 LLM API:</label>
          <select 
            value={apiType} 
            onChange={(e) => setApiType(e.target.value)}
            disabled={isLoading}
          >
            <option value="openai">ChatGPT (OpenAI)</option>
            <option value="gemini">Gemini (Google)</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>API 金鑰:</label>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="請輸入 API 金鑰"
            disabled={isLoading} 
          />
        </div>
        
        <div className="form-group">
          <label>自訂 API 端點 (選填):</label>
          <input 
            type="text" 
            value={customApiUrl} 
            onChange={(e) => setCustomApiUrl(e.target.value)}
            placeholder="例如: https://your-proxy.com/v1/chat/completions"
            disabled={isLoading} 
          />
          <small>若您使用自己的代理伺服器，可以在此輸入完整 URL</small>
        </div>
      </div>
      
      <div className="prompt-section">
        <div className="prompt-header">
          <button onClick={() => setShowPrompt(!showPrompt)}>
            {showPrompt ? '隱藏提示詞' : '顯示提示詞'}
          </button>
          {showPrompt && (
            <button onClick={handleCopyPrompt} disabled={!prompt}>
              {copied ? '已複製！' : '複製提示詞'}
            </button>
          )}
        </div>
        
        {showPrompt && (
          <>
            <div className="prompt-content">
              <pre>{prompt}</pre>
            </div>
            
            <div className="llm-quick-links">
              <h4>快速連結到 LLM 網站</h4>
              <div className="llm-buttons">
                <button onClick={() => openLLMWebsite('https://chat.deepseek.com/')}>
                  DeepSeek
                </button>
                <button onClick={() => openLLMWebsite('https://chatgpt.com/')}>
                  ChatGPT
                </button>
                <button onClick={() => openLLMWebsite('https://gemini.google.com/app')}>
                  Gemini
                </button>
                <button onClick={() => openLLMWebsite('https://claude.ai/')}>
                  Claude
                </button>
                <button onClick={() => openLLMWebsite('https://www.perplexity.ai/')}>
                  Perplexity
                </button>
              </div>
              <p className="hint">提示：複製上方提示詞後點擊按鈕前往您喜好的 LLM 網站貼上使用</p>
            </div>
          </>
        )}
      </div>
      
      <div className="api-action">
        <button 
          onClick={handleCallAPI} 
          disabled={isLoading || !apiKey}
          className="call-api-btn"
        >
          {isLoading ? '分析中...' : '呼叫 LLM API 進行論掛'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {interpretation && (
        <div className="interpretation-result">
          <h4>解卦結果</h4>
          <div className="interpretation-content">
            {interpretation.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMDivinationAnalysis;
