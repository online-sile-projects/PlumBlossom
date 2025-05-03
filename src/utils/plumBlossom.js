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
const divination = (question = '', data) => {
  const hexagramsData = data.hexagrams; // 獲取卦象資料
  
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
  
  // 添加上掛下掛詳細資訊
  const enhancedMainHexagram = enhanceHexagramWithTrigramInfo(mainHexagram, data);
  const enhancedChangedHexagram = changedHexagram ? enhanceHexagramWithTrigramInfo(changedHexagram, data) : null;
  const enhancedOverlappingHexagram = overlappingHexagram ? enhanceHexagramWithTrigramInfo(overlappingHexagram, data) : null;
  const enhancedHiddenHexagram = hiddenHexagram ? enhanceHexagramWithTrigramInfo(hiddenHexagram, data) : null;
  
  // 組合結果
  const result = {
    question,
    mainHexagram: enhancedMainHexagram,
    changedHexagram: enhancedChangedHexagram,
    overlappingHexagram: enhancedOverlappingHexagram,
    hiddenHexagram: enhancedHiddenHexagram,
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
  const rawHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
  
  // 過濾不完整或無效的歷史記錄
  return rawHistory.filter(item => 
    item && 
    item.question && 
    item.mainHexagram && 
    item.mainHexagram.name
  );
};

// 增強卦象資訊，添加上掛下掛詳細資料
const enhanceHexagramWithTrigramInfo = (hexagram, data) => {
  if (!hexagram) return null;
  
  // 獲取三爻卦資料
  const trigrams = data.trigrams || [];
  if (!trigrams || trigrams.length === 0) {
    console.warn('缺少三爻卦(trigrams)資料');
    return hexagram;
  }
  
  // 獲取上掛和下掛索引
  const topTrigramIndex = hexagram.topTrigram - 1; // 索引從0開始
  const bottomTrigramIndex = hexagram.bottomTrigram - 1; // 索引從0開始
  
  // 獲取三爻卦詳細資訊
  const topTrigram = trigrams[topTrigramIndex];
  const bottomTrigram = trigrams[bottomTrigramIndex];
  
  if (!topTrigram || !bottomTrigram) {
    console.warn('無法找到對應的三爻卦資訊');
    return hexagram;
  }

  // 添加上掛下掛詳細資訊
  const enhancedHexagram = {
    ...hexagram,
    topTrigramInfo: {
      name: topTrigram.name,
      character: topTrigram.character,
      nature: topTrigram.nature,
      element: topTrigram.element,
      family: topTrigram.family,
      position: topTrigram.position,
      temperament: topTrigram.temperament,
      animal: topTrigram.animal,
      body: topTrigram.body
    },
    bottomTrigramInfo: {
      name: bottomTrigram.name,
      character: bottomTrigram.character,
      nature: bottomTrigram.nature,
      element: bottomTrigram.element,
      family: bottomTrigram.family,
      position: bottomTrigram.position,
      temperament: bottomTrigram.temperament,
      animal: bottomTrigram.animal,
      body: bottomTrigram.body
    },
    combinedAttributes: {
      nature: `${bottomTrigram.nature}${topTrigram.nature}`,
      family: `${bottomTrigram.family}${topTrigram.family}`,
      elements: `${bottomTrigram.element}${topTrigram.element}`,
    }
  };
  
  // 添加論卦相關爻辭摘要
  enhancedHexagram.yaoCombination = {
    // 初爻 (代表開始或基礎)
    initial: hexagram.yao && hexagram.yao[0] ? {
      text: hexagram.yao[0].text,
      description: hexagram.yao[0].description ? hexagram.yao[0].description.text : []
    } : null,
    
    // 二爻 (代表發展或進行)
    second: hexagram.yao && hexagram.yao[1] ? {
      text: hexagram.yao[1].text,
      description: hexagram.yao[1].description ? hexagram.yao[1].description.text : []
    } : null,
    
    // 三爻 (代表轉折)
    third: hexagram.yao && hexagram.yao[2] ? {
      text: hexagram.yao[2].text,
      description: hexagram.yao[2].description ? hexagram.yao[2].description.text : []
    } : null,
    
    // 四爻 (代表準備或過渡)
    fourth: hexagram.yao && hexagram.yao[3] ? {
      text: hexagram.yao[3].text,
      description: hexagram.yao[3].description ? hexagram.yao[3].description.text : []
    } : null,
    
    // 五爻 (代表結果或成就)
    fifth: hexagram.yao && hexagram.yao[4] ? {
      text: hexagram.yao[4].text,
      description: hexagram.yao[4].description ? hexagram.yao[4].description.text : []
    } : null,
    
    // 六爻 (代表結局)
    sixth: hexagram.yao && hexagram.yao[5] ? {
      text: hexagram.yao[5].text,
      description: hexagram.yao[5].description ? hexagram.yao[5].description.text : []
    } : null,
    
    // 用爻 (若存在，代表特殊指引)
    usage: hexagram.yao && hexagram.yao[6] ? {
      text: hexagram.yao[6].text,
      description: hexagram.yao[6].description ? hexagram.yao[6].description.text : []
    } : null
  };
  
  return enhancedHexagram;
};

// 進行論卦分析（上下掛互動）
const analyzeTrigramInteraction = (hexagram) => {
  if (!hexagram || !hexagram.topTrigramInfo || !hexagram.bottomTrigramInfo) {
    return null;
  }
  
  const { topTrigramInfo, bottomTrigramInfo } = hexagram;
  
  return {
    hexagramName: hexagram.name,
    summary: `此卦由${bottomTrigramInfo.name}卦(${bottomTrigramInfo.nature})在下，${topTrigramInfo.name}卦(${topTrigramInfo.nature})在上組成，整體表現為「${bottomTrigramInfo.nature}${topTrigramInfo.nature}」之象。`,
    elementInteraction: `下卦五行屬${bottomTrigramInfo.element}，上卦五行屬${topTrigramInfo.element}，${analyzeElements(bottomTrigramInfo.element, topTrigramInfo.element)}。`,
    familyRelation: `下卦${bottomTrigramInfo.family}，上卦${topTrigramInfo.family}，${analyzeFamilyRelation(bottomTrigramInfo.family, topTrigramInfo.family)}。`,
    temperamentRelation: `下卦性情為${bottomTrigramInfo.temperament}，上卦性情為${topTrigramInfo.temperament}，${analyzeTemperament(bottomTrigramInfo.temperament, topTrigramInfo.temperament)}。`,
  };
};

// 分析兩個五行元素間的關係
const analyzeElements = (bottomElement, topElement) => {
  if (bottomElement === topElement) {
    return `兩者相同，呈現${bottomElement}生${bottomElement}的和諧之象`;
  }
  
  const relations = {
    '金金': '相生',
    '金水': '金生水',
    '金木': '金剋木',
    '金火': '金被火剋',
    '金土': '金被土生',
    '水水': '相生',
    '水木': '水生木',
    '水火': '水剋火',
    '水土': '水被土剋',
    '水金': '水被金生',
    '木木': '相生',
    '木火': '木生火',
    '木土': '木剋土',
    '木金': '木被金剋',
    '木水': '木被水生',
    '火火': '相生',
    '火土': '火生土',
    '火金': '火剋金',
    '火水': '火被水剋',
    '火木': '火被木生',
    '土土': '相生',
    '土金': '土生金',
    '土水': '土剋水',
    '土火': '土被火生',
    '土木': '土被木剋'
  };
  
  return relations[`${bottomElement}${topElement}`] || '五行關係複雜';
};

// 分析家庭關係
const analyzeFamilyRelation = (bottomFamily, topFamily) => {
  // 簡化家庭稱謂
  const simplifyFamily = (family) => {
    if (family.includes('父')) return '父';
    if (family.includes('母') || family.includes('女')) return '母';
    if (family.includes('長男')) return '兄';
    if (family.includes('中男') || family.includes('少男')) return '弟';
    if (family.includes('子')) return '子';
    return family;
  };
  
  const bottomSimple = simplifyFamily(bottomFamily);
  const topSimple = simplifyFamily(topFamily);
  
  const relations = {
    '父父': '強勢而剛健',
    '父母': '剛強而柔順',
    '父兄': '權威和教導',
    '父弟': '引導與保護',
    '父子': '教導與培養',
    '母父': '柔順與堅定',
    '母母': '柔順而和諧',
    '母兄': '關愛與指導',
    '母弟': '照顧與呵護',
    '母子': '養育與關懷',
    '兄父': '尊敬與學習',
    '兄母': '依賴與照顧',
    '兄兄': '競爭與合作',
    '兄弟': '互助與共進',
    '兄子': '引領與影響',
    '弟父': '順從與依靠',
    '弟母': '親近與依賴',
    '弟兄': '學習與追隨',
    '弟弟': '和諧與協作',
    '弟子': '成長與發展',
    '子父': '尊重與承傳',
    '子母': '依附與滋養',
    '子兄': '學習與仰望',
    '子弟': '友愛與同行',
    '子子': '延續與希望'
  };
  
  return relations[`${bottomSimple}${topSimple}`] || '家庭關係複雜多變';
};

// 分析性情關係
const analyzeTemperament = (bottomTemperament, topTemperament) => {
  if (bottomTemperament === topTemperament) {
    return `兩者性情相似，互相呼應，展現出${bottomTemperament}的整體氣象`;
  }
  
  const temperamentPairs = {
    '健健': '剛健無比',
    '健悅': '剛健而愉快',
    '健麗': '剛健而光明',
    '健動': '剛健而活潑',
    '健入': '剛健而柔順',
    '悅健': '愉快而剛健',
    '悅悅': '愉快無比',
    '悅麗': '愉快而光明',
    '悅動': '愉快而活潑',
    '悅入': '愉快而柔順',
    '麗健': '光明而剛健',
    '麗悅': '光明而愉快',
    '麗麗': '光明無比',
    '麗動': '光明而活潑',
    '麗入': '光明而柔順',
    '動健': '活潑而剛健',
    '動悅': '活潑而愉快',
    '動麗': '活潑而光明',
    '動動': '活潑無比',
    '動入': '活潑而柔順',
    '入健': '柔順而剛健',
    '入悅': '柔順而愉快',
    '入麗': '柔順而光明',
    '入動': '柔順而活潑',
    '入入': '柔順無比'
  };
  
  return temperamentPairs[`${bottomTemperament}${topTemperament}`] || '性情關係多樣複雜';
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
  getHistoryFromLocalStorage,
  enhanceHexagramWithTrigramInfo,
  analyzeTrigramInteraction
};
