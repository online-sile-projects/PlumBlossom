import React, { useState, useEffect } from 'react';
import { divination, getHistoryFromLocalStorage } from '../utils/plumBlossom';

// 導入易經資料
import hexagramsData from '../assets/data.json';

// 卦象顯示組件
const HexagramDisplay = ({ hexagram, title, changingLines = [] }) => {
  if (!hexagram) return <div>加載中...</div>;

  return (
    <div className="hexagram-display">
      <h3>{title} - {hexagram.name} ({hexagram.character})</h3>
      <div className="hexagram-lines">
        {hexagram.binary.split('').map((bit, index) => {
          // 注意：索引是從0開始，但爻的位置是從下往上數，從1開始
          const linePosition = 6 - index;
          const isChangingLine = changingLines.includes(linePosition);
          
          return (
            <div 
              key={index} 
              className={`hexagram-line ${bit === '1' ? 'yang' : 'yin'} ${isChangingLine ? 'changing' : ''}`}
            >
              {bit === '1' ? '—' : '– –'}
            </div>
          );
        })}
      </div>
      <p className="hexagram-text">{hexagram.text}</p>
      <p className="hexagram-description">{hexagram.description.text}</p>
    </div>
  );
};

// 歷史記錄組件
const DivinationHistory = ({ history, onSelectHistory }) => {
  if (!history || history.length === 0) {
    return <div>暫無歷史記錄</div>;
  }

  return (
    <div className="divination-history">
      <h3>歷史記錄</h3>
      <ul>
        {history.map((item, index) => (
          <li key={index} onClick={() => onSelectHistory(item)}>
            <strong>{item.question}</strong> - {item.mainHexagram.name} ({new Date(item.timestamp).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
};

// 主要排盤組件
const PlumBlossomDivination = () => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 載入歷史記錄
  useEffect(() => {
    try {
      const savedHistory = getHistoryFromLocalStorage();
      setHistory(savedHistory);
    } catch (err) {
      console.error('無法載入歷史記錄:', err);
      setError('無法載入歷史記錄，請檢查瀏覽器設置。');
    }
  }, []);

  // 執行排盤
  const handleDivination = () => {
    if (!question.trim()) {
      setError('請輸入您的問題');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 執行排盤算法
      const divinationResult = divination(question, hexagramsData.hexagrams);
      
      setResult(divinationResult);
      
      // 更新歷史記錄
      setHistory([divinationResult, ...history].slice(0, 20));
      
      setLoading(false);
    } catch (err) {
      console.error('排盤過程中發生錯誤:', err);
      setError('排盤過程中發生錯誤，請重試。');
      setLoading(false);
    }
  };

  // 選擇歷史記錄
  const handleSelectHistory = (historyItem) => {
    setResult(historyItem);
    setQuestion(historyItem.question);
  };

  return (
    <div className="plum-blossom-divination">
      <h2>梅花易數排盤</h2>
      
      <div className="divination-input">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="請輸入您的問題..."
          disabled={loading}
        />
        <button onClick={handleDivination} disabled={loading}>
          {loading ? '排盤中...' : '開始排盤'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {result && (
        <div className="divination-result">
          <h3>問題: {result.question}</h3>
          <p>排盤時間: {new Date(result.timestamp).toLocaleString()}</p>
          
          <div className="hexagrams-container">
            <HexagramDisplay 
              hexagram={result.mainHexagram}
              title="本卦"
              changingLines={result.changingLines}
            />
            
            <HexagramDisplay 
              hexagram={result.changedHexagram}
              title="變卦"
            />
            
            <HexagramDisplay 
              hexagram={result.overlappingHexagram}
              title="互卦"
            />
            
            <HexagramDisplay 
              hexagram={result.hiddenHexagram}
              title="伏卦"
            />
          </div>
        </div>
      )}
      
      <div className="history-section">
        <DivinationHistory 
          history={history}
          onSelectHistory={handleSelectHistory}
        />
      </div>
    </div>
  );
};

export default PlumBlossomDivination;
