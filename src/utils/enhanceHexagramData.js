/**
 * 強化卦象資料，添加上掛下掛詳細資訊
 * 此函式將為每個卦象添加上掛和下掛的詳細資訊，並包含論卦時需用到的爻辭
 */

function enhanceHexagramData(data) {
  const { hexagrams, trigrams } = data;
  
  return {
    ...data,
    hexagrams: hexagrams.map(hexagram => {
      const { topTrigram, bottomTrigram } = hexagram;
      
      // 獲取上掛和下掛的詳細資訊
      const topTrigramInfo = trigrams[topTrigram - 1];
      const bottomTrigramInfo = trigrams[bottomTrigram - 1];
      
      return {
        ...hexagram,
        topTrigramInfo: {
          name: topTrigramInfo.name,
          character: topTrigramInfo.character,
          nature: topTrigramInfo.nature,
          element: topTrigramInfo.element,
          family: topTrigramInfo.family,
          position: topTrigramInfo.position,
          temperament: topTrigramInfo.temperament,
        },
        bottomTrigramInfo: {
          name: bottomTrigramInfo.name,
          character: bottomTrigramInfo.character,
          nature: bottomTrigramInfo.nature,
          element: bottomTrigramInfo.element,
          family: bottomTrigramInfo.family,
          position: bottomTrigramInfo.position,
          temperament: bottomTrigramInfo.temperament,
        },
        combinedAttributes: {
          nature: `${bottomTrigramInfo.nature}${topTrigramInfo.nature}`,
          family: `${bottomTrigramInfo.family}${topTrigramInfo.family}`,
          elements: `${bottomTrigramInfo.element}${topTrigramInfo.element}`,
        },
        yaoCombination: getYaoCombination(hexagram.yao)
      };
    })
  };
}

/**
 * 獲取卦爻組合資訊，用於論卦
 * @param {Array} yao 爻陣列
 * @returns {Object} 爻組合資訊
 */
function getYaoCombination(yao) {
  // 篩選出論卦時常用的爻辭
  const keyYaoTexts = {
    // 初爻 (代表開始或基礎)
    initial: yao[0] ? {
      text: yao[0].text,
      description: yao[0].description ? yao[0].description.text : []
    } : null,
    
    // 二爻 (代表發展或進行)
    second: yao[1] ? {
      text: yao[1].text,
      description: yao[1].description ? yao[1].description.text : []
    } : null,
    
    // 三爻 (代表轉折)
    third: yao[2] ? {
      text: yao[2].text,
      description: yao[2].description ? yao[2].description.text : []
    } : null,
    
    // 四爻 (代表準備或過渡)
    fourth: yao[3] ? {
      text: yao[3].text,
      description: yao[3].description ? yao[3].description.text : []
    } : null,
    
    // 五爻 (代表結果或成就)
    fifth: yao[4] ? {
      text: yao[4].text,
      description: yao[4].description ? yao[4].description.text : []
    } : null,
    
    // 六爻 (代表結局)
    sixth: yao[5] ? {
      text: yao[5].text,
      description: yao[5].description ? yao[5].description.text : []
    } : null,
    
    // 用爻 (若存在，代表特殊指引)
    usage: yao[6] ? {
      text: yao[6].text,
      description: yao[6].description ? yao[6].description.text : []
    } : null
  };
  
  return keyYaoTexts;
}

export default enhanceHexagramData;
