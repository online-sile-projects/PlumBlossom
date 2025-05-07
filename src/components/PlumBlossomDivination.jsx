import React, { useState, useEffect } from 'react';
import { divination, getHistoryFromLocalStorage } from '../utils/plumBlossom';
import LLMDivinationAnalysis from './LLMDivinationAnalysis';
import '../styles/LLMDivinationAnalysis.css';

// 導入易經資料
import hexagramsData from '../assets/data.json';

// 卦象顯示組件
const HexagramDisplay = ({ hexagram, title, changingLines = [] }) => {
  if (!hexagram) return <div>加載中...</div>;
  
  // 上掛下掛資訊
  const hasTrigramInfo = hexagram.topTrigramInfo && hexagram.bottomTrigramInfo;

  return (
    <div className="hexagram-display">
      <h3>{title} - {hexagram.name} ({hexagram.character})</h3>
      
      {/* 上掛下掛資訊 */}
      {hasTrigramInfo && (
        <div className="trigram-info">
          <div className="trigram-info-container">
            <div className="top-trigram">
              <h4>上掛: {hexagram.topTrigramInfo.name} {hexagram.topTrigramInfo.character}</h4>
              <p>性質: {hexagram.topTrigramInfo.nature}</p>
              <p>五行: {hexagram.topTrigramInfo.element}</p>
              <p>家族: {hexagram.topTrigramInfo.family}</p>
            </div>
            <div className="bottom-trigram">
              <h4>下掛: {hexagram.bottomTrigramInfo.name} {hexagram.bottomTrigramInfo.character}</h4>
              <p>性質: {hexagram.bottomTrigramInfo.nature}</p>
              <p>五行: {hexagram.bottomTrigramInfo.element}</p>
              <p>家族: {hexagram.bottomTrigramInfo.family}</p>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* 論卦時用到的爻辭 */}
      {hexagram.yaoCombination && (
        <div className="yao-texts">
          <h4>論卦關鍵爻辭</h4>
          <div className="yao-text-container">
            {hexagram.yaoCombination.initial && (
              <div className="yao-text-item">
                <strong>初爻 ({hexagram.yao[0].name}):</strong> {hexagram.yaoCombination.initial.text}
                {hexagram.yaoCombination.initial.description?.text && (
                  <div className="yao-translation">
                    <em>白話翻譯: {hexagram.yaoCombination.initial.description.text}</em>
                  </div>
                )}
              </div>
            )}
            {hexagram.yaoCombination.fifth && (
              <div className="yao-text-item">
                <strong>五爻 ({hexagram.yao[4].name}):</strong> {hexagram.yaoCombination.fifth.text}
                {hexagram.yaoCombination.fifth.description?.text && (
                  <div className="yao-translation">
                    <em>白話翻譯: {hexagram.yaoCombination.fifth.description.text}</em>
                  </div>
                )}
              </div>
            )}
            {hexagram.yaoCombination.usage && (
              <div className="yao-text-item">
                <strong>用爻 ({hexagram.yao[6].name}):</strong> {hexagram.yaoCombination.usage.text}
                {hexagram.yaoCombination.usage.description?.text && (
                  <div className="yao-translation">
                    <em>白話翻譯: {hexagram.yaoCombination.usage.description.text}</em>
                  </div>
                )}
              </div>
            )}
            
            {changingLines.map(lineNumber => (
              <div key={lineNumber} className="changing-yao-text">
                <strong>變爻 ({hexagram.yao[lineNumber-1].name}):</strong> {hexagram.yao[lineNumber-1].text}
                {hexagram.yao[lineNumber-1].description?.text && (
                  <div className="yao-translation">
                    <em>白話翻譯: {hexagram.yao[lineNumber-1].description.text}</em>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// 歷史記錄組件
const DivinationHistory = ({ history, onSelectHistory }) => {
  if (!history || history.length === 0) {
    return <div>暫無歷史記錄</div>;
  }

  // 新增刪除歷史記錄的函數
  const handleDelete = (index, event) => {
    event.stopPropagation(); // 防止事件冒泡到 li 上觸發選擇功能
    
    // 從 localStorage 中取得歷史記錄
    let savedHistory = getHistoryFromLocalStorage();
    
    // 刪除指定索引的記錄
    savedHistory.splice(index, 1);
    
    // 更新 localStorage
    localStorage.setItem('plumBlossomHistory', JSON.stringify(savedHistory));
    
    // 重新載入歷史記錄
    window.location.reload();
  };

  return (
    <div className="divination-history">
      <h3>歷史記錄</h3>
      <ul>
        {history.map((item, index) => (
          <li key={index} onClick={() => onSelectHistory(item)}>
            <strong>{item.question}</strong>
            {item.mainHexagram && item.mainHexagram.name ? 
              <> - {item.mainHexagram.name} ({new Date(item.timestamp).toLocaleString()})</> : 
              <> ({new Date(item.timestamp).toLocaleString()})</>
            }
            <button 
              className="delete-history-btn" 
              onClick={(e) => handleDelete(index, e)}
              style={{ marginLeft: '10px', color: 'red' }}
            >
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// 主要排盤組件
// 上下掛互動分析組件
const TrigramAnalysis = ({ hexagram }) => {
  if (!hexagram || !hexagram.topTrigramInfo || !hexagram.bottomTrigramInfo) {
    return null;
  }
  
  const { topTrigramInfo, bottomTrigramInfo } = hexagram;
  
  return (
    <div className="trigram-analysis">
      <h3>上下掛互動分析</h3>
      <div className="analysis-content">
        <p>
          <strong>整體概述：</strong> 
          此卦由{bottomTrigramInfo.name}卦({bottomTrigramInfo.nature})在下，{topTrigramInfo.name}卦({topTrigramInfo.nature})在上組成，
          整體表現為「{bottomTrigramInfo.nature}{topTrigramInfo.nature}」之象。
        </p>
        <p>
          <strong>五行關係：</strong>
          下卦五行屬{bottomTrigramInfo.element}，上卦五行屬{topTrigramInfo.element}。
          {bottomTrigramInfo.element === topTrigramInfo.element ? 
            `兩者相同，呈現${bottomTrigramInfo.element}生${bottomTrigramInfo.element}的和諧之象。` : 
            `兩者五行互動，形成複雜的關係。`}
        </p>
        <p>
          <strong>卦位情況：</strong>
          下卦代表內在或基礎，表示{bottomTrigramInfo.name}({bottomTrigramInfo.nature})；
          上卦代表外在或表現，表示{topTrigramInfo.name}({topTrigramInfo.nature})。
          這種內外組合反映出事物發展的內在動力與外部條件。
        </p>
        <p>
          <strong>卦象變化：</strong>
          若有變爻，則卦象將產生相應變化，從而呈現事物發展的趨勢。
        </p>
      </div>
    </div>
  );
};

const PlumBlossomDivination = () => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

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
      const divinationResult = divination(question, hexagramsData);
      
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
    // 確保歷史記錄項目有效
    if (historyItem && historyItem.question && historyItem.mainHexagram) {
      setResult(historyItem);
      setQuestion(historyItem.question);
    } else {
      console.warn('嘗試載入無效的歷史記錄');
      setError('無效的歷史記錄項目');
    }
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
          
          <div className="analysis-toggle">
            <button onClick={() => setShowAnalysis(!showAnalysis)}>
              {showAnalysis ? '隱藏上下掛分析' : '顯示上下掛分析'}
            </button>
          </div>
          
          {showAnalysis && <TrigramAnalysis hexagram={result.mainHexagram} />}
          
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
          
          {/* LLM 論掛分析 */}
          <LLMDivinationAnalysis divinationResult={result} />
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
