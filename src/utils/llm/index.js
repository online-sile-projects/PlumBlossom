/**
 * LLM 模組整合匯出點
 */

import { generateDivinationPrompt } from './promptGenerator';
import { callLLMAPI } from './llmApiClient';
import apiConfig from './apiConfig';

// 匯出所有功能
export {
  generateDivinationPrompt,
  callLLMAPI,
  apiConfig
};
