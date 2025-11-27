
const fs = require('fs');
const path = require('path');
const HexagramEngine = require('../js/hexagram-engine.js');

// Load Data
const dataPath = path.join(__dirname, '../data/data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const hexagramData = JSON.parse(rawData);

// Initialize Engine
const engine = new HexagramEngine(hexagramData);

console.log('=== 梅花易數 核心引擎測試 ===\n');

// Test Case 1: 觀梅占
// 辰年十二月十七日申時
// 辰(5) + 12 + 17 = 34
// 上卦: 34 % 8 = 2 (兌)
// 下卦: 34 + 申(9) = 43 % 8 = 3 (離)
// 動爻: 43 % 6 = 1 (初爻)
// 本卦: 澤火革
// 互卦: 天風姤 (革: 兌上離下 -> 011 101 -> 234=111(乾), 345=111(乾)? No wait.)
// Let's trace Mutual manually for 革 (49):
// Upper: 兌 (011) - Top, Mid, Bot
// Lower: 離 (101) - Top, Mid, Bot
// Full: 011101 (Top to Bottom)
// Mutual Lower (234): Lines 2,3,4 (from bottom 1-based) -> Indices 4,3,2 (from top 0-based)
// Index 0: 0
// Index 1: 1
// Index 2: 1
// Index 3: 1
// Index 4: 0
// Index 5: 1
// Mutual Lower (indices 4,3,2): 0, 1, 1 -> 011 (兌)? No.
// Let's re-read standard Mutual Hexagram construction.
// Hexagram lines: 6 5 4 3 2 1
// Mutual Lower: 2 3 4
// Mutual Upper: 3 4 5
//
// 革 (49):
// 6: 0 (陰)
// 5: 1 (陽)
// 4: 1 (陽)
// 3: 1 (陽)
// 2: 0 (陰)
// 1: 1 (陽)
//
// Mutual Lower (2,3,4): 0, 1, 1 (from bottom) -> Bottom=0, Mid=1, Top=1 -> 110 (巽)?
// Wait, 2=0, 3=1, 4=1.
// Lower Trigram is made of lines 1,2,3.
// Mutual Lower is made of lines 2,3,4.
// Line 2 is bottom of Mutual Lower.
// Line 3 is middle of Mutual Lower.
// Line 4 is top of Mutual Lower.
// So Mutual Lower = 1(top), 1(mid), 0(bot) -> 110 (巽 ☴)
// 
// Mutual Upper (3,4,5):
// Line 3 is bottom.
// Line 4 is middle.
// Line 5 is top.
// 3=1, 4=1, 5=1.
// So Mutual Upper = 1(top), 1(mid), 1(bot) -> 111 (乾 ☰)
//
// So Mutual Hexagram = Upper 乾, Lower 巽 -> 天風姤 (44).
//
// Changed Hexagram:
// Moving line 1.
// Original Line 1 is 1 (Yang). Changes to 0 (Yin).
// New Lower Trigram: 101 (離) -> 100 (艮)?
// Line 1 (bottom) changes from 1 to 0.
// Old Lower: 1(top), 0(mid), 1(bot) -> 離
// New Lower: 1(top), 0(mid), 0(bot) -> 艮
// Upper unchanged: 兌
// New Hexagram: 兌上艮下 -> 澤山咸 (31).

console.log('Test Case 1: 觀梅占 (辰年十二月十七日申時)');
const result1 = engine.calculateTimeHexagram(5, 12, 17, 9);

console.log(`本卦: ${result1.original.name} (上${result1.original.topTrigram}/下${result1.original.bottomTrigram})`);
console.log(`互卦: ${result1.mutual.name} (上${result1.mutual.topTrigram}/下${result1.mutual.bottomTrigram})`);
console.log(`變卦: ${result1.changed.name} (上${result1.changed.topTrigram}/下${result1.changed.bottomTrigram})`);
console.log(`動爻: ${result1.original.movingLine}`);
console.log(`體用: 體${result1.analysis.ti.element} 用${result1.analysis.yong.element} -> ${result1.analysis.relation}`);

// Verification
const pass1 = result1.original.name === '澤火革' && 
              result1.mutual.name === '天風姤' && 
              result1.changed.name === '澤山咸';

console.log(`Result: ${pass1 ? 'PASS' : 'FAIL'}`);
console.log('-----------------------------------');

// Test Case 2: 牡丹占
// 巳年三月十六日卯時
// 巳(6) + 3 + 16 = 25
// 上卦: 25 % 8 = 1 (乾)
// 下卦: 25 + 卯(4) = 29 % 8 = 5 (巽)
// 動爻: 29 % 6 = 5 (五爻)
// 本卦: 天風姤
// 互卦: 乾上乾下 -> 乾為天
// 變卦: 五爻變 -> 乾(111)變(101離) -> 火風鼎
// 
// 姤 (44):
// 6: 1
// 5: 1
// 4: 1
// 3: 1
// 2: 1
// 1: 0
//
// Mutual Lower (2,3,4): 1,1,1 -> 乾
// Mutual Upper (3,4,5): 1,1,1 -> 乾
// Mutual: 乾為天
//
// Changed (Line 5):
// Upper 乾 (111) -> Line 5 is middle. 1 -> 0.
// New Upper: 101 (離)
// Lower 巽 (110) unchanged.
// New Hexagram: 離上巽下 -> 火風鼎 (50).

console.log('Test Case 2: 牡丹占 (巳年三月十六日卯時)');
const result2 = engine.calculateTimeHexagram(6, 3, 16, 4);

console.log(`本卦: ${result2.original.name}`);
console.log(`互卦: ${result2.mutual.name}`);
console.log(`變卦: ${result2.changed.name}`);
console.log(`動爻: ${result2.original.movingLine}`);

const pass2 = result2.original.name === '天風姤' && 
              result2.mutual.name === '乾為天' && 
              result2.changed.name === '火風鼎';

console.log(`Result: ${pass2 ? 'PASS' : 'FAIL'}`);
