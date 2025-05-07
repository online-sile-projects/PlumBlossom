import React, { useState } from 'react';
import LLMResponseRecorder from './LLMResponseRecorder';
import { generateDivinationPrompt } from '../utils/promptGenerator';

const LLMDivinationAnalysis = ({ divinationResult }) => {
  const [showPrompt, setShowPrompt] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // 使用匯入的函式生成提示詞
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
      });
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
      
      {/* 新增 LLM 回覆紀錄元件 */}
      <LLMResponseRecorder divinationResult={divinationResult} />
    </div>
  );
};

export default LLMDivinationAnalysis;
