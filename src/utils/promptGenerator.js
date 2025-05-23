/**
 * 提示詞生成模組
 * 負責生成與易經相關的提示詞
 */

// 生成卦象爻辭提示詞
const generateYaoCombinationPrompt = (hexagram, hexagramType) => {
  let prompt = '';
  
  if (!hexagram || !hexagram.yaoCombination) {
    return prompt;
  }
  
  prompt += `\n${hexagramType}關鍵爻辭：\n`;
  
  // 初爻
  if (hexagram.yaoCombination.initial) {
    prompt += `初爻：${hexagram.yaoCombination.initial.text}\n`;
    if (hexagram.yaoCombination.initial.description?.text) {
      prompt += `初爻白話翻譯：${hexagram.yaoCombination.initial.description.text}\n`;
    }
  }
  
  // 五爻
  if (hexagram.yaoCombination.fifth) {
    prompt += `五爻：${hexagram.yaoCombination.fifth.text}\n`;
    if (hexagram.yaoCombination.fifth.description?.text) {
      prompt += `五爻白話翻譯：${hexagram.yaoCombination.fifth.description.text}\n`;
    }
  }
  
  // 用爻
  if (hexagram.yaoCombination.usage) {
    prompt += `用爻：${hexagram.yaoCombination.usage.text}\n`;
    if (hexagram.yaoCombination.usage.description?.text) {
      prompt += `用爻白話翻譯：${hexagram.yaoCombination.usage.description.text}\n`;
    }
  }
  
  return prompt;
};

// 生成解盤提示詞
export const generateDivinationPrompt = (divinationResult) => {
  if (!divinationResult || !divinationResult.mainHexagram) {
    return '';
  }
  
  const { question, mainHexagram, changedHexagram, changingLines, overlappingHexagram, hiddenHexagram } = divinationResult;
  
  // 判斷是否有變爻
  const hasChangingLines = changingLines && changingLines.length > 0;

  // 生成提示詞
  let prompt = `我正在使用梅花易數進行占卜，請你以易經專家角度解讀我的卦象。\n\n`;
  prompt += `問題: ${question}\n\n`;
  
  // 本卦資訊
  prompt += `本卦：${mainHexagram.name} (${mainHexagram.character})\n`;
  prompt += `卦辭：${mainHexagram.text}\n`;
  prompt += `上掛：${mainHexagram.topTrigramInfo.name} (${mainHexagram.topTrigramInfo.nature}、${mainHexagram.topTrigramInfo.element})\n`;
  prompt += `下掛：${mainHexagram.bottomTrigramInfo.name} (${mainHexagram.bottomTrigramInfo.nature}、${mainHexagram.bottomTrigramInfo.element})\n`;
  
  // 添加本卦關鍵爻辭
  prompt += generateYaoCombinationPrompt(mainHexagram, '本卦');
  prompt += '\n';
  
  // 互卦資訊
  if (overlappingHexagram) {
    prompt += `互卦：${overlappingHexagram.name} (${overlappingHexagram.character})\n`;
    prompt += `卦辭：${overlappingHexagram.text}\n`;
    
      // 添加互卦關鍵爻辭
    prompt += generateYaoCombinationPrompt(overlappingHexagram, '互卦');
    prompt += '\n';
  }
  
  // 伏卦資訊
  if (hiddenHexagram) {
    prompt += `伏卦：${hiddenHexagram.name} (${hiddenHexagram.character})\n`;
    prompt += `卦辭：${hiddenHexagram.text}\n`;
    
    // 添加伏卦關鍵爻辭
    prompt += generateYaoCombinationPrompt(hiddenHexagram, '伏卦');
    prompt += '\n';
  }
  
  // 變爻資訊
  if (hasChangingLines) {
    prompt += `變爻：${changingLines.join('、')} 爻\n`;
    changingLines.forEach(line => {
      const yao = mainHexagram.yao[line-1];
      if (yao) {
        prompt += `第${line}爻辭：${yao.text}\n`;
      }
    });
    
    // 變卦資訊
    if (changedHexagram) {
      prompt += `\n變卦：${changedHexagram.name} (${changedHexagram.character})\n`;
      prompt += `卦辭：${changedHexagram.text}\n`;
      
      // 添加變卦關鍵爻辭
      prompt += generateYaoCombinationPrompt(changedHexagram, '變卦');
      prompt += '\n';
    }
  }
  
  prompt += `請提供以下內容：\n`;
  prompt += `1. 卦象解釋：分析本卦的基本含義\n`;
  prompt += `2. 問題解析：針對我的問題提供有針對性的解讀\n`;
  
  if (overlappingHexagram) {
    prompt += `3. 互卦分析：解讀互卦的意涵與本卦的關係\n`;
  }
  
  if (hiddenHexagram) {
    prompt += `4. 伏卦分析：解讀伏卦所揭示的隱含因素\n`;
  }
  
  if (hasChangingLines) {
    prompt += `5. 變爻分析：解讀變爻的特殊意涵，及其對本卦的影響\n`;
    prompt += `6. 變卦啟示：分析變卦所反映的未來趨勢\n`;
  }
  
  prompt += `7. 建議與總結：給予實際可行的建議\n\n`;
  prompt += `請用易經的觀點分析，避免泛泛籠統的回答，盡量具體且有深度。`;
  
  return prompt;
};
