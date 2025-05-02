/**
 * LLM API 整合模組 (重構)
 * 此檔案為相容性橋接檔案，實際模組已移至 ./llm/ 目錄下
 */

// 重新匯出所有功能
export { generateDivinationPrompt, callLLMAPI } from './llm';

// 警告訊息
console.warn('警告：llmApi.js 已被棄用，請改用 utils/llm/ 目錄下的模組');
