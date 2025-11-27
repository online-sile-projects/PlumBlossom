/**
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Engines
    let hexagramData = null;
    try {
        const response = await fetch('data/data.json');
        hexagramData = await response.json();
    } catch (e) {
        console.error('Failed to load hexagram data:', e);
        alert('資料載入失敗，請檢查 data/data.json');
        return;
    }

    const hexEngine = new HexagramEngine(hexagramData);
    const strokeCalc = new StrokeCalculator(null); // Load exceptions if needed
    // Try to load stroke map
    try {
        const mapRes = await fetch('data/Kangxi-Stroke-Map.json');
        const mapData = await mapRes.json();
        strokeCalc.exceptions = mapData;
    } catch (e) {
        console.warn('Failed to load stroke map, using defaults');
    }

    const aiInterpreter = new AIInterpreter();

    // UI Elements
    const els = {
        currentLunarTime: document.getElementById('currentLunarTime'),
        tabTime: document.getElementById('tabTime'),
        tabText: document.getElementById('tabText'),
        modeTime: document.getElementById('modeTime'),
        modeText: document.getElementById('modeText'),
        inputSection: document.getElementById('inputSection'),
        resultSection: document.getElementById('resultSection'),
        startDivinationBtn: document.getElementById('startDivinationBtn'),
        startTextDivinationBtn: document.getElementById('startTextDivinationBtn'),
        textInput: document.getElementById('textInput'),
        questionInput: document.getElementById('questionInput'),
        questionInputText: document.getElementById('questionInputText'),

        // Result Elements
        originalName: document.getElementById('originalHexagramName'),
        originalVisual: document.getElementById('originalHexagramVisual'),
        originalText: document.getElementById('originalHexagramText'),
        mutualName: document.getElementById('mutualHexagramName'),
        mutualVisual: document.getElementById('mutualHexagramVisual'),
        mutualText: document.getElementById('mutualHexagramText'),
        changedName: document.getElementById('changedHexagramName'),
        changedVisual: document.getElementById('changedHexagramVisual'),
        changedText: document.getElementById('changedHexagramText'),
        tiYongInfo: document.getElementById('tiYongInfo'),
        movingLineInfo: document.getElementById('movingLineInfo'),
        aiPrompt: document.getElementById('aiPrompt'),
        copyPromptBtn: document.getElementById('copyPromptBtn')
    };

    // State
    let currentMode = 'time'; // 'time' or 'text'
    let currentQuestion = ''; // Store user's question

    // Initialize Lunar Time Display
    updateLunarTime();
    setInterval(updateLunarTime, 1000);

    function updateLunarTime() {
        // Using lunar-javascript
        if (typeof Lunar === 'undefined') return;
        const d = Lunar.fromDate(new Date());
        els.currentLunarTime.textContent = `${d.getYearInGanZhi()}年 ${d.getMonthInChinese()}月 ${d.getDayInChinese()} ${d.getTimeZhi()}時`;
    }

    // Event Listeners
    els.tabTime.addEventListener('click', () => switchMode('time'));
    els.tabText.addEventListener('click', () => switchMode('text'));

    els.startDivinationBtn.addEventListener('click', handleTimeDivination);
    els.startTextDivinationBtn.addEventListener('click', handleTextDivination);

    function switchMode(mode) {
        currentMode = mode;
        if (mode === 'time') {
            els.tabTime.classList.add('bg-ink', 'text-paper', 'shadow-md');
            els.tabTime.classList.remove('hover:bg-black/5', 'text-ink/70');
            els.tabText.classList.remove('bg-ink', 'text-paper', 'shadow-md');
            els.tabText.classList.add('hover:bg-black/5', 'text-ink/70');

            els.modeTime.classList.remove('hidden');
            els.modeText.classList.add('hidden');
        } else {
            els.tabText.classList.add('bg-ink', 'text-paper', 'shadow-md');
            els.tabText.classList.remove('hover:bg-black/5', 'text-ink/70');
            els.tabTime.classList.remove('bg-ink', 'text-paper', 'shadow-md');
            els.tabTime.classList.add('hover:bg-black/5', 'text-ink/70');

            els.modeText.classList.remove('hidden');
            els.modeTime.classList.add('hidden');
        }
    }

    // Copy to clipboard function
    els.copyPromptBtn.addEventListener('click', async () => {
        const promptText = els.aiPrompt.textContent;
        try {
            await navigator.clipboard.writeText(promptText);
            els.copyPromptBtn.innerHTML = `
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                已複製
            `;
            setTimeout(() => {
                els.copyPromptBtn.innerHTML = `
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    複製
                `;
            }, 2000);
        } catch (err) {
            alert('複製失敗，請手動複製');
        }
    });

    async function handleTimeDivination() {
        const d = Lunar.fromDate(new Date());
        currentQuestion = els.questionInput.value.trim();

        const yearZhi = d.getYearZhi();
        const month = d.getMonth();
        const day = d.getDay();
        const timeZhi = d.getTimeZhi();

        const yearNum = hexEngine.getBranchNumber(yearZhi);
        const timeNum = hexEngine.getBranchNumber(timeZhi);

        console.log(`Time Casting: Year=${yearZhi}(${yearNum}), Month=${month}, Day=${day}, Time=${timeZhi}(${timeNum})`);

        const result = hexEngine.calculateTimeHexagram(yearNum, month, day, timeNum);

        const inputStr = `${d.getYearInGanZhi()}年 ${d.getMonthInChinese()}月 ${d.getDayInChinese()} ${timeZhi}時`;
        displayResult(result, '時間起卦', inputStr);
    }

    async function handleTextDivination() {
        const text = els.textInput.value.trim();
        currentQuestion = els.questionInputText.value.trim();

        if (!text) {
            alert('請輸入文字');
            return;
        }

        const d = Lunar.fromDate(new Date());
        const timeZhi = d.getTimeZhi();
        const timeNum = hexEngine.getBranchNumber(timeZhi);

        // Calculate numbers from text
        const nums = strokeCalc.calculateTextHexagram(text, timeNum);
        const result = hexEngine.calculateNumberHexagram(nums.upperNum, nums.lowerNum, nums.totalNum);

        displayResult(result, '測字起卦', text);
    }

    function displayResult(result, method, inputVal) {
        // Show Result Section
        els.inputSection.classList.add('hidden');
        els.resultSection.classList.remove('hidden');

        // Render Hexagrams
        renderHexagram(els.originalVisual, result.original, true);
        renderHexagram(els.mutualVisual, result.mutual, false);
        renderHexagram(els.changedVisual, result.changed, false);

        // Texts
        els.originalName.textContent = result.original.name;
        els.originalText.textContent = result.original.text;

        els.mutualName.textContent = result.mutual.name;
        els.mutualText.textContent = result.mutual.text;

        els.changedName.textContent = result.changed.name;
        els.changedText.textContent = result.changed.text;

        // Info
        els.tiYongInfo.textContent = `體${result.analysis.ti.element} 用${result.analysis.yong.element} | ${result.analysis.relation}`;
        els.movingLineInfo.textContent = `${result.original.movingLine}爻動`;

        // Generate Prompt for AI
        const prompt = aiInterpreter.assembleContext(result, method, inputVal);
        const fullPrompt = currentQuestion
            ? `【我的問題】\n${currentQuestion}\n\n${prompt}`
            : prompt;

        els.aiPrompt.textContent = fullPrompt;
    }

    function renderHexagram(container, hexData, showMoving) {
        container.innerHTML = '';
        // hexData.binary is string "111111" (Top to Bottom usually in data.json?)
        // Let's check data.json structure again.
        // In data.json: "binary": "111111" for 乾.
        // Usually binary strings in I Ching JSONs are Top-to-Bottom or Bottom-to-Top.
        // My HexagramEngine logic assumed:
        // "111" -> Top, Mid, Bot.
        // Let's assume the binary string in hexData is Top-to-Bottom (index 0 is line 6).

        const binary = hexData.binary; // 6 chars

        // We render from Top (Line 6) to Bottom (Line 1)
        // So just iterate the string.

        for (let i = 0; i < 6; i++) {
            const isYang = binary[i] === '1';
            const lineNum = 6 - i; // 6, 5, 4, 3, 2, 1

            const wrapper = document.createElement('div');
            wrapper.className = 'hex-line-wrapper';

            const line = document.createElement('div');
            line.className = isYang ? 'yang-line' : 'yin-line';

            wrapper.appendChild(line);

            // Moving line indicator
            if (showMoving && lineNum === hexData.movingLine) {
                const indicator = document.createElement('div');
                indicator.className = 'moving-line-indicator';
                wrapper.appendChild(indicator);
                wrapper.classList.add('moving');
            }

            container.appendChild(wrapper);
        }
    }
});
