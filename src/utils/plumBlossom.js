/**
 * 梅花易排盤核心邏輯
 */

// 根據數字產生卦的二進制表示
const generateHexagram = (number) => {
  const binaryString = number.toString(2).padStart(6, '0');
  return binaryString;
};

// 根據時間生成卦象
const generateHexagramByTime = () => {
  const now = new Date();
  // 使用時間各部分生成一個數字，這裡做一個簡單的實現
  // 實際梅花易數的演算法可能更複雜，可以在此進一步調整
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  
  // 混合時間各部分產生一個 0-63 之間的數
  const hexagramNumber = Math.floor(
    ((hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds) % 64
  );
  
  return hexagramNumber;
};

// 生成變卦 (將變爻的位置從陰變陽，從陽變陰)
const generateChangedHexagram = (originalBinary, changingLines = []) => {
  if (!changingLines || changingLines.length === 0) {
    return originalBinary;
  }

  let result = '';
  for (let i = 0; i < originalBinary.length; i++) {
    // 位置是從下到上的，對應二進制從右到左
    const position = originalBinary.length - 1 - i; 
    if (changingLines.includes(position + 1)) {
      // 變爻，0變1，1變0
      result += originalBinary[i] === '0' ? '1' : '0';
    } else {
      result += originalBinary[i];
    }
  }
  return result;
};

// 生成互卦 (以二爻、三爻、四爻為互卦下部，以三爻、四爻、五爻為互卦上部)
const generateOverlappingHexagram = (originalBinary) => {
  // 互卦下部 (原卦的 2,3,4 爻)
  const lowerPart = originalBinary.substr(2, 3);
  // 互卦上部 (原卦的 3,4,5 爻)
  const upperPart = originalBinary.substr(3, 3);
  
  return upperPart + lowerPart;
};

// 生成伏卦 (六爻的反卦)
const generateHiddenHexagram = (originalBinary) => {
  let result = '';
  for (let i = 0; i < originalBinary.length; i++) {
    result += originalBinary[i] === '0' ? '1' : '0';
  }
  return result;
};

// 根據二進制找到對應的卦象
const findHexagramByBinary = (binaryString, hexagramsData) => {
  return hexagramsData.find(hexagram => hexagram.binary === binaryString);
};

// 依據問題計算出本卦
const calculateMainHexagram = (question = '') => {
  // 在實際梅花易數中，計算本卦的方法通常結合問題內容、時間等因素
  // 這裡採用簡化方法，結合問題字串長度和當前時間
  const questionLength = question.length;
  const timeValue = new Date().getTime() % 64;
  const hexagramIndex = (questionLength + timeValue) % 64;
  
  return hexagramIndex === 0 ? 64 : hexagramIndex; // 易經卦序從1開始，而非從0
};

// 判斷變爻
const determineChangingLines = (question = '') => {
  // 實際梅花易數中，變爻的確定方法較複雜
  // 這裡採用簡化方法，基於問題特徵和時間
  const now = new Date();
  const seed = now.getSeconds() + now.getMilliseconds() + question.length;
  
  // 隨機決定變爻數量 (1-3個)
  const numberOfChanges = (seed % 3) + 1;
  
  // 選擇變爻位置
  const changingLines = [];
  for (let i = 0; i < numberOfChanges; i++) {
    // 選擇1-6之間的爻位
    let line = ((seed * (i + 1)) % 6) + 1;
    
    // 確保不重複
    while (changingLines.includes(line)) {
      line = (line % 6) + 1;
    }
    
    changingLines.push(line);
  }
  
  return changingLines.sort((a, b) => a - b); // 從小到大排序
};

// 排盤主函數
const divination = (question = '', hexagramsData) => {
  // 計算本卦
  const mainHexagramNumber = calculateMainHexagram(question);
  const mainHexagram = hexagramsData[mainHexagramNumber - 1]; // 因為索引從0開始，而卦序從1開始
  
  // 確定變爻
  const changingLines = determineChangingLines(question);
  
  // 計算變卦
  const changedHexagramBinary = generateChangedHexagram(mainHexagram.binary, changingLines);
  const changedHexagram = findHexagramByBinary(changedHexagramBinary, hexagramsData);
  
  // 計算互卦
  const overlappingHexagramBinary = generateOverlappingHexagram(mainHexagram.binary);
  const overlappingHexagram = findHexagramByBinary(overlappingHexagramBinary, hexagramsData);
  
  // 計算伏卦
  const hiddenHexagramBinary = generateHiddenHexagram(mainHexagram.binary);
  const hiddenHexagram = findHexagramByBinary(hiddenHexagramBinary, hexagramsData);
  
  // 組合結果
  const result = {
    question,
    mainHexagram,
    changedHexagram,
    overlappingHexagram,
    hiddenHexagram,
    changingLines,
    timestamp: new Date().toISOString()
  };
  
  // 存儲到 localStorage
  saveToLocalStorage(result);
  
  return result;
};

// 存儲到 localStorage
const saveToLocalStorage = (divinationResult) => {
  // 獲取已有的歷史記錄
  const historyKey = 'plumBlossom_history';
  const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
  
  // 添加新的記錄
  existingHistory.unshift(divinationResult);
  
  // 限制歷史記錄數量，最多保存20條
  const limitedHistory = existingHistory.slice(0, 20);
  
  // 保存回 localStorage
  localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
};

// 從 localStorage 獲取歷史記錄
const getHistoryFromLocalStorage = () => {
  const historyKey = 'plumBlossom_history';
  return JSON.parse(localStorage.getItem(historyKey) || '[]');
};

export {
  generateHexagram,
  generateHexagramByTime,
  generateChangedHexagram,
  generateOverlappingHexagram,
  generateHiddenHexagram,
  findHexagramByBinary,
  calculateMainHexagram,
  determineChangingLines,
  divination,
  saveToLocalStorage,
  getHistoryFromLocalStorage
};
