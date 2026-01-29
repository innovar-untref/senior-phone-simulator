// APP STATE & LOGIC

// --- DATA: MEDICATIONS ---
const defaultMeds = [
    { id: 1, name: "Pastilla de la Presión", time: "09:00", taken: false, type: "pill" },
    { id: 2, name: "Vitamina C", time: "10:00", taken: false, type: "capsule" },
    { id: 3, name: "Gotas para los Ojos", time: "20:00", taken: false, type: "drop" }
];

let myMeds = JSON.parse(localStorage.getItem('myMeds')) || defaultMeds;
let activeAlarmMed = null;

// Clock & Alarm Loop
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = timeString;

    checkAlarms(timeString);
}


function checkAlarms(currentTime) {
    const overlay = document.getElementById('alarm-overlay');
    if (!overlay.classList.contains('hidden')) return;

    const medToTake = myMeds.find(med => med.time === currentTime && !med.taken);

    if (medToTake) {
        triggerAlarm(medToTake);
    }
}

function triggerAlarm(med) {
    activeAlarmMed = med;
    const overlay = document.getElementById('alarm-overlay');
    document.getElementById('alarm-med-name').textContent = med.name;
    document.getElementById('alarm-time-display').textContent = med.time;

    overlay.classList.remove('hidden');
}

function confirmAlarmTake() {
    if (activeAlarmMed) {
        toggleMedTaken(activeAlarmMed.id, true);
        activeAlarmMed = null;
    }
    document.getElementById('alarm-overlay').classList.add('hidden');
}

function snoozeAlarm() {
    document.getElementById('alarm-overlay').classList.add('hidden');
    alert("Te recordaremos en 5 minutos.");
}

function debugForceAlarm() {
    triggerAlarm(myMeds[0]);
}

// Meds UI Logic
function renderMeds() {
    const container = document.getElementById('meds-list-container');
    if (!container) return;

    container.innerHTML = '';
    myMeds.sort((a, b) => a.time.localeCompare(b.time));

    myMeds.forEach(med => {
        const isDone = med.taken;
        const card = document.createElement('div');
        card.className = `med-item-card ${isDone ? 'med-item-done' : ''}`;

        card.innerHTML = `
            <div class="med-info">
                <h3>${med.name}</h3>
                <p>⏰ ${med.time}</p>
            </div>
            <button class="med-check-btn ${isDone ? 'checked' : ''}" onclick="toggleMedTaken(${med.id})">
                ${isDone ? '✔' : ''}
            </button>
        `;
        container.appendChild(card);
    });
    localStorage.setItem('myMeds', JSON.stringify(myMeds));
}

function toggleMedTaken(id, forcedState = null) {
    const med = myMeds.find(m => m.id === id);
    if (med) {
        med.taken = forcedState !== null ? forcedState : !med.taken;
        renderMeds();
    }
}

function resetMedsData() {
    myMeds.forEach(m => m.taken = false);
    renderMeds();
    alert("Día reiniciado. Todas las pastillas marcadas como pendientes.");
}

renderMeds();
setInterval(updateClock, 1000);
updateClock();


// --- NAVIGATION ---
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });

    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');

        if (screenId === 'meds-screen') renderMeds();
    }
}

function goHome() {
    showScreen('home-screen');
    currentNumber = "";
    updateDisplay();
}

// --- PHONE DIALER (FUNCTIONAL) ---
let currentNumber = "";

function dialDigit(digit) {
    if (currentNumber.length < 15) {
        currentNumber += digit;
        updateDisplay();
    }
}

function deleteDigit() {
    currentNumber = currentNumber.slice(0, -1);
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('phone-number-display');
    if (display) {
        display.textContent = currentNumber;
    }
}

function makeCall() {
    if (currentNumber.length > 0) {
        window.open(`tel:${currentNumber}`, '_self');
    } else {
        alert("⚠️ Por favor ingrese un número primero.");
    }
}

function callContact(name, number) {
    window.open(`tel:${number}`, '_self');
}

// --- SOS LOGIC (FUNCTIONAL) ---
function triggerSOS() {
    window.open('tel:911', '_self');
}

// --- WHATSAPP LOGIC ---
const chatData = {
    'Agustín Pizzichini': [
        { text: "¡Hola Agustín! ¿Cómo estás?", type: "out" },
        { text: "¡Hola! Todo bien por acá. ¿Necesitás ayuda con el celu?", type: "in" },
        { text: "No, solo probaba. ¡Gracias!", type: "out" }
    ],
    'Profesora Estefanía': [
        { text: "¡Hola grupo! Recuerden nuestro encuentro.", type: "in" },
        { text: "Nos encontramos los martes a partir de las 9:00 am.", type: "in" },
        { text: "¡Perfecto, ahí estaré! Muchas gracias, profe.", type: "out" },
        { text: "Traigan sus dudas anotadas.", type: "in" }
    ],
    'Grupo Familia': [
        { text: "Carlos: Nos vemos el domingo. Asado!", type: "in" },
        { text: "Lucía: ¡Qué rico! Llevo el postre.", type: "in" },
        { text: "Yo llevo el vino.", type: "out" }
    ]
};

function openChat(name, number = null) {
    if (number) {
        document.getElementById('whatsapp-real-btn').onclick = () => window.open(`https://wa.me/${number}`, '_blank');
        document.getElementById('whatsapp-real-btn').style.display = 'block';
    } else {
        document.getElementById('whatsapp-real-btn').style.display = 'none';
    }

    const title = document.getElementById('chat-title-name');
    const container = document.getElementById('chat-messages');

    title.textContent = name;
    container.innerHTML = '';

    const messages = chatData[name] || [];
    messages.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble msg-${msg.type}`;
        bubble.textContent = msg.text;
        container.appendChild(bubble);
    });

    showScreen('whatsapp-chat');
}

// --- INNOVAR APP LOGIC ---
function openInnovar() {
    const iframe = document.getElementById('innovar-frame');
    if (iframe) {
        iframe.src = iframe.src;
    }
    showScreen('innovar-screen');
}


// ==========================================
// GAMES LOGIC (NATIVE JS IMPLEMENTATION)
// ==========================================

function startGame(gameName) {
    const container = document.getElementById('game-container-content');
    container.innerHTML = ''; // Clear previous game
    showScreen('games-play-screen');

    if (gameName === '2048') init2048(container);
    if (gameName === 'wordsearch') initWordSearch(container);
    if (gameName === 'memory') initLogicMemory(container);
}

// --- 2048 GAME ---
let board2048 = [];
let score2048 = 0;

function init2048(container) {
    container.innerHTML = `
        <div style="text-align:center;">
             <div style="display:flex; justify-content:space-between; width:300px; margin-bottom:10px;">
                <span id="score-2048" style="font-weight:bold; font-size:20px;">Score: 0</span>
                <button onclick="init2048(document.getElementById('game-container-content'))" style="color:#666;">Reiniciar</button>
            </div>
            <div class="game-2048-board" id="board-2048"></div>
            <div class="game-controls">
                <button onclick="move2048('up')" class="game-btn">⬆️</button>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button onclick="move2048('left')" class="game-btn">⬅️</button>
                    <button onclick="move2048('down')" class="game-btn">⬇️</button>
                    <button onclick="move2048('right')" class="game-btn">➡️</button>
                </div>
            </div>
        </div>
    `;
    score2048 = 0;
    board2048 = Array(16).fill(0);
    spawnTile2048();
    spawnTile2048();
    render2048();
}

function spawnTile2048() {
    let emptyIndices = board2048.map((val, idx) => val === 0 ? idx : null).filter(val => val !== null);
    if (emptyIndices.length > 0) {
        let idx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        board2048[idx] = Math.random() > 0.9 ? 4 : 2;
    }
}

function render2048() {
    const el = document.getElementById('board-2048');
    const scoreEl = document.getElementById('score-2048');
    if (!el) return;

    el.innerHTML = '';
    board2048.forEach(val => {
        const tile = document.createElement('div');
        tile.className = `tile-2048 tile-${val}`;
        tile.textContent = val > 0 ? val : '';
        el.appendChild(tile);
    });

    if (scoreEl) scoreEl.textContent = `Score: ${score2048}`;
}

function move2048(dir) {
    let oldBoard = [...board2048];
    let moved = false;

    // Helper functions for grid manipulation
    const getRow = (r) => [board2048[r * 4], board2048[r * 4 + 1], board2048[r * 4 + 2], board2048[r * 4 + 3]];
    const getCol = (c) => [board2048[c], board2048[c + 4], board2048[c + 8], board2048[c + 12]];

    const setRow = (r, arr) => {
        board2048[r * 4] = arr[0]; board2048[r * 4 + 1] = arr[1]; board2048[r * 4 + 2] = arr[2]; board2048[r * 4 + 3] = arr[3];
    };
    const setCol = (c, arr) => {
        board2048[c] = arr[0]; board2048[c + 4] = arr[1]; board2048[c + 8] = arr[2]; board2048[c + 12] = arr[3];
    };

    const slideMerge = (arr) => {
        // Filter zeros
        let current = arr.filter(x => x !== 0);

        // Merge
        for (let i = 0; i < current.length - 1; i++) {
            if (current[i] === current[i + 1]) {
                current[i] *= 2;
                score2048 += current[i];
                current[i + 1] = 0;
            }
        }

        // Filter zeros again after merge and pad
        current = current.filter(x => x !== 0);
        while (current.length < 4) current.push(0);
        return current;
    };

    if (dir === 'left') {
        for (let i = 0; i < 4; i++) {
            let row = getRow(i);
            let newRow = slideMerge(row);
            setRow(i, newRow);
        }
    } else if (dir === 'right') {
        for (let i = 0; i < 4; i++) {
            let row = getRow(i);
            let newRow = slideMerge(row.reverse()).reverse(); // Reverse for right slide
            setRow(i, newRow);
        }
    } else if (dir === 'up') {
        for (let i = 0; i < 4; i++) {
            let col = getCol(i);
            let newCol = slideMerge(col);
            setCol(i, newCol);
        }
    } else if (dir === 'down') {
        for (let i = 0; i < 4; i++) {
            let col = getCol(i);
            let newCol = slideMerge(col.reverse()).reverse(); // Reverse for down slide
            setCol(i, newCol);
        }
    }

    // Check if board changed
    if (JSON.stringify(oldBoard) !== JSON.stringify(board2048)) {
        spawnTile2048();
        render2048();
    }
}


// --- WORD SEARCH (SOPA DE LETRAS) ---
const words = ["AMOR", "PAZ", "VIDA", "SOL", "LUZ"];
let selectedCells = [];

function initWordSearch(container) {
    container.innerHTML = `
        <h3 style="margin-bottom:10px; color:#333;">Busca: AMOR, PAZ, VIDA, SOL, LUZ</h3>
        <div class="word-search-grid" id="ws-grid"></div>
        <div id="ws-feedback" style="height:30px; color:green; font-weight:bold; margin-top:10px;"></div>
        <button onclick="startGame('wordsearch')" style="margin-top:10px;">Nuevo Juego</button>
    `;

    const gridEl = document.getElementById('ws-grid');
    const size = 8;
    const grid = Array(size * size).fill('');
    const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

    // Place words simply (horizontal only for ease)
    words.forEach(word => {
        let placed = false;
        while (!placed) {
            let row = Math.floor(Math.random() * size);
            let col = Math.floor(Math.random() * (size - word.length));
            let fit = true;
            for (let i = 0; i < word.length; i++) {
                if (grid[row * size + col + i] !== '') fit = false;
            }
            if (fit) {
                for (let i = 0; i < word.length; i++) grid[row * size + col + i] = word[i];
                placed = true;
            }
        }
    });

    // Fill rest
    for (let i = 0; i < grid.length; i++) {
        if (grid[i] === '') grid[i] = letters[Math.floor(Math.random() * letters.length)];
    }

    // Render
    grid.forEach((char, idx) => {
        const cell = document.createElement('div');
        cell.className = 'ws-cell';
        cell.textContent = char;
        cell.onclick = () => toggleSelectWord(cell, char);
        gridEl.appendChild(cell);
    });
}

function toggleSelectWord(cell, char) {
    if (cell.classList.contains('found')) return;

    cell.classList.toggle('selected');
    if (cell.classList.contains('selected')) {
        selectedCells.push({ el: cell, char: char });
    } else {
        selectedCells = selectedCells.filter(c => c.el !== cell);
    }

    // Check match
    const currentWord = selectedCells.map(c => c.char).join('');
    if (words.includes(currentWord)) {
        selectedCells.forEach(c => {
            c.el.classList.remove('selected');
            c.el.classList.add('found');
        });
        document.getElementById('ws-feedback').textContent = `¡Encontraste: ${currentWord}!`;
        selectedCells = [];
    } else if (selectedCells.length > 5) {
        // Reset if too long
        selectedCells.forEach(c => c.el.classList.remove('selected'));
        selectedCells = [];
    }
}


// --- LOGIC MEMORY (GEOMETRIC SHAPES) ---
function initLogicMemory(container) {
    container.innerHTML = `
        <div id="memory-board" class="memory-board"></div>
        <button onclick="startGame('memory')" style="margin: 20px; padding: 10px 20px; font-size: 18px;">Reiniciar</button>
    `;

    const shapes = [
        { type: 'circle', color: 'red' },
        { type: 'square', color: 'blue' },
        { type: 'triangle', color: 'green' },
        { type: 'circle', color: 'yellow' },
        { type: 'square', color: 'purple' },
        { type: 'triangle', color: 'orange' },
        { type: 'circle', color: 'cyan' },
        { type: 'square', color: 'magenta' }
    ];

    // Duplicate and shuffle
    const cards = [...shapes, ...shapes];
    cards.sort(() => 0.5 - Math.random());

    const board = document.getElementById('memory-board');
    let flipped = [];
    let matched = [];

    cards.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.id = index;

        // Create Shape Element
        const shape = document.createElement('div');
        shape.className = `shape-${item.type}`;
        if (item.type === 'triangle') shape.style.borderBottomColor = item.color;
        else shape.style.backgroundColor = item.color;

        card.onclick = () => {
            if (flipped.length < 2 && !card.classList.contains('flipped') && !matched.includes(card)) {
                card.innerHTML = ''; // Start clean
                card.appendChild(shape.cloneNode(true));
                card.classList.add('flipped');
                flipped.push({ el: card, item: item });

                if (flipped.length === 2) {
                    const c1 = flipped[0];
                    const c2 = flipped[1];

                    if (c1.item.type === c2.item.type && c1.item.color === c2.item.color) {
                        matched.push(c1.el, c2.el);
                        flipped = [];
                        if (matched.length === cards.length) setTimeout(() => alert("¡Excelente memoria lógica! 🧠✨"), 500);
                    } else {
                        setTimeout(() => {
                            c1.el.classList.remove('flipped');
                            c2.el.classList.remove('flipped');
                            c1.el.innerHTML = '';
                            c2.el.innerHTML = '';
                            flipped = [];
                        }, 1000);
                    }
                }
            }
        };
        board.appendChild(card);
    });
}
