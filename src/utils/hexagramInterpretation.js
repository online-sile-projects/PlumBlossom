/**
 * 示範如何使用 enhanceHexagramData 函式來增強卦象資料
 */

import data from '../assets/data.json';
import enhanceHexagramData from './enhanceHexagramData';

// 增強卦象資料，添加上掛下掛詳細資訊
const enhancedData = enhanceHexagramData(data);

/**
 * 獲取論卦時需要的完整資訊
 * @param {number} hexagramNumber - 卦象編號 (1-64)
 * @returns {Object} - 包含上掛下掛資訊及論卦相關爻辭的對象
 */
export function getHexagramInterpretation(hexagramNumber) {
  if (hexagramNumber < 1 || hexagramNumber > 64) {
    throw new Error('卦象編號必須在 1 到 64 之間');
  }
  
  const hexagram = enhancedData.hexagrams[hexagramNumber - 1];
  
  if (!hexagram) {
    throw new Error(`找不到編號為 ${hexagramNumber} 的卦象`);
  }
  
  return {
    // 基本卦象資訊
    number: hexagram.number,
    name: hexagram.name,
    character: hexagram.character,
    binary: hexagram.binary,
    
    // 上掛資訊
    topTrigram: hexagram.topTrigramInfo,
    
    // 下掛資訊
    bottomTrigram: hexagram.bottomTrigramInfo,
    
    // 上下掛組合屬性
    combinedAttributes: hexagram.combinedAttributes,
    
    // 卦辭
    text: hexagram.text,
    description: hexagram.description,
    
    // 論卦相關爻辭
    keyYaoTexts: hexagram.yaoCombination,
    
    // 完整爻資訊
    allYao: hexagram.yao
  };
}

/**
 * 獲取論卦時的上下掛互動分析
 * @param {number} hexagramNumber - 卦象編號 (1-64)
 * @returns {Object} - 包含上下掛互動分析的對象
 */
export function getTrigramInteraction(hexagramNumber) {
  const hexagram = getHexagramInterpretation(hexagramNumber);
  
  const { topTrigram, bottomTrigram } = hexagram;
  
  return {
    hexagramName: hexagram.name,
    summary: `此卦由${bottomTrigram.name}卦(${bottomTrigram.nature})在下，${topTrigram.name}卦(${topTrigram.nature})在上組成，整體表現為「${bottomTrigram.nature}${topTrigram.nature}」之象。`,
    elementInteraction: `下卦五行屬${bottomTrigram.element}，上卦五行屬${topTrigram.element}，${analyzeElements(bottomTrigram.element, topTrigram.element)}。`,
    familyRelation: `下卦${bottomTrigram.family}，上卦${topTrigram.family}，${analyzeFamilyRelation(bottomTrigram.family, topTrigram.family)}。`,
    temperamentRelation: `下卦性情為${bottomTrigram.temperament}，上卦性情為${topTrigram.temperament}，${analyzeTemperament(bottomTrigram.temperament, topTrigram.temperament)}。`,
  };
}

/**
 * 分析兩個五行元素間的關係
 * @private
 */
function analyzeElements(bottomElement, topElement) {
  if (bottomElement === topElement) {
    return `兩者相同，呈現${bottomElement}生${bottomElement}的和諧之象`;
  }
  
  const relations = {
    '木木': '相生',
    '木火': '木生火',
    '木土': '木剋土',
    '木金': '金剋木',
    '木水': '水生木',
    '火木': '火剋金',
    '火火': '相生',
    '火土': '火生土',
    '火金': '火被水剋',
    '火水': '火剋水',
    '土木': '土被木剋',
    '土火': '土剋水',
    '土土': '相生',
    '土金': '土生金',
    '土水': '水剋火',
    '金木': '金剋木',
    '金火': '金被火剋',
    '金土': '金被土生',
    '金金': '相生',
    '金水': '金生水',
    '水木': '水生木',
    '水火': '水剋火',
    '水土': '土剋水',
    '水金': '水被金生',
    '水水': '相生'
  };
  
  return relations[`${bottomElement}${topElement}`] || '五行關係複雜';
}

/**
 * 分析家庭關係
 * @private
 */
function analyzeFamilyRelation(bottomFamily, topFamily) {
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
  
  const bottomSimpleFamily = simplifyFamily(bottomFamily);
  const topSimpleFamily = simplifyFamily(topFamily);
  
  return relations[`${bottomSimpleFamily}${topSimpleFamily}`] || '家庭關係複雜多變';
}

/**
 * 簡化家庭稱謂
 * @private
 */
function simplifyFamily(family) {
  if (family.includes('父')) return '父';
  if (family.includes('母') || family.includes('女')) return '母';
  if (family.includes('長男')) return '兄';
  if (family.includes('中男') || family.includes('少男')) return '弟';
  if (family.includes('子')) return '子';
  return family;
}

/**
 * 分析性情關係
 * @private
 */
function analyzeTemperament(bottomTemperament, topTemperament) {
  if (bottomTemperament === topTemperament) {
    return `兩者性情相似，互相呼應，展現出${bottomTemperament}的整體氣象`;
  }
  
  const temperamentPairs = {
    '健悅': '剛健而愉快',
    '健麗': '剛健而光明',
    '健動': '剛健而活潑',
    '健入': '剛健而柔順',
    '悅健': '愉快而剛健',
    '悅麗': '愉快而光明',
    '悅動': '愉快而活潑',
    '悅入': '愉快而柔順',
    '麗健': '光明而剛健',
    '麗悅': '光明而愉快',
    '麗動': '光明而活潑',
    '麗入': '光明而柔順',
    '動健': '活潑而剛健',
    '動悅': '活潑而愉快',
    '動麗': '活潑而光明',
    '動入': '活潑而柔順',
    '入健': '柔順而剛健',
    '入悅': '柔順而愉快',
    '入麗': '柔順而光明',
    '入動': '柔順而活潑'
  };
  
  return temperamentPairs[`${bottomTemperament}${topTemperament}`] || '性情關係多樣複雜';
}

export default {
  getHexagramInterpretation,
  getTrigramInteraction
};
