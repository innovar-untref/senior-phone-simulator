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
    if (gameName === 'scrabble') initScrabble(container);
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

// --- PRONTO PROMPT ROCKET LOGIC (2-PHASE) ---
const prontoCourses = {
    'primeros_pasos': {
        r: "Primeros pasos en IA: Guía amigable para comprender el mundo digital",
        o: "Descubra qué es la IA de forma sencilla y cómo puede acompañarle.",
        c: "Objetivo del curso: Perder el miedo a la tecnología.",
        k: 'Actúa como un experto en enseñanza digital para adultos mayores. Explícame paso a paso cómo lograr mi objetivo. Usa palabras claras y evita tecnicismos. Pasos a seguir:\n1. Dame una breve introducción.\n2. Explícame exactamente dónde tocar o qué hacer.\n3. Dame un ejemplo práctico.'
    },
    'ia_dia_a_dia': {
        r: "IA en el día a día: Asistente personal para gestiones y organización",
        o: "Convierta su celular en un aliado para recordar turnos y organizar rutinas.",
        c: "Objetivo del curso: Aprender a pedirle a la IA que organice la semana.",
        k: 'Actúa como mi secretario personal. Por favor, ayúdame a organizar la información. Pasos a seguir:\n1. Lee mi objetivo y contexto.\n2. Hazme una lista clara y separada por puntos.\n3. Incluye recordatorios fáciles de leer.'
    },
    'ia_creativa': {
        r: "IA Creativa: Explorando el arte, las historias y los pasatiempos",
        o: "Dé rienda suelta a su imaginación, escriba cuentos o descubra pasatiempos.",
        c: "Objetivo del curso: Fomentar la creatividad con IA.",
        k: 'Actúa como un escritor e inspirador creativo. Necesito que desarrolles mi idea. Pasos a seguir:\n1. Escribe la historia o idea que te pido con mucha imaginación.\n2. Usa un lenguaje cálido y emotivo.\n3. Pregúntame si quiero cambiar algún detalle.'
    },
    'ia_ensenanza': {
        r: "IA para la enseñanza: Nuevas herramientas para compartir y aprender",
        o: "Aprenda a compartir lo que sabe y a descubrir cosas nuevas todos los días.",
        c: "Objetivo del curso: Aprender a pedir información educativa de forma didáctica.",
        k: 'Actúa como un maestro apasionado por enseñar. Explícame el tema que te pido de forma resumida y muy entretenida. Pasos a seguir:\n1. Dame un resumen fácil de entender.\n2. Cuéntamelo como si fuera una historia en un café.\n3. Destaca 2 o 3 datos curiosos.'
    }
};

let currentProntoPrompt = "";
let selectedCourseKey = "";

function initProntoPrompt() {
    showScreen('pronto-prompt-screen');
    document.getElementById('pronto-course-select').value = "";
    resetProntoUI();
}

function resetProntoUI() {
    document.getElementById('pronto-fase2-container').classList.add('hidden');
    document.getElementById('pronto-rocket-output').classList.add('hidden');
    document.getElementById('pronto-error-msg').classList.add('hidden');
    
    // Clear fields
    document.getElementById('pronto-name-user').value = "";
    document.getElementById('pronto-r-user').value = "";
    document.getElementById('pronto-o-user').value = "";
    document.getElementById('pronto-c-user').value = "";
    document.getElementById('pronto-k-user').value = "";
    document.getElementById('pronto-e-user').value = "";
    document.getElementById('pronto-t-user').value = "";
    
    selectedCourseKey = "";
}

function handleCourseSelection() {
    const selector = document.getElementById('pronto-course-select');
    selectedCourseKey = selector.value;
    
    if (!selectedCourseKey) {
        resetProntoUI();
        return;
    }
    
    const course = prontoCourses[selectedCourseKey];
    
    // Populate R-O-C Base
    document.getElementById('rocket-base-r').textContent = `[R] ${course.r}`;
    document.getElementById('rocket-base-o').textContent = `[O] ${course.o}`;
    document.getElementById('rocket-base-c').textContent = `[C] ${course.c}`;
    
    // Show Fase 2 and hide output until generated
    document.getElementById('pronto-fase2-container').classList.remove('hidden');
    document.getElementById('pronto-rocket-output').classList.add('hidden');
    document.getElementById('pronto-error-msg').classList.add('hidden');
}

function generateTwoPhasePrompt() {
    if (!selectedCourseKey) return;
    
    const course = prontoCourses[selectedCourseKey];
    
    const nameUser = document.getElementById('pronto-name-user').value.trim() || "estudiantes";
    const rUser = document.getElementById('pronto-r-user').value.trim();
    const oUser = document.getElementById('pronto-o-user').value.trim();
    const cUser = document.getElementById('pronto-c-user').value.trim();
    const kUser = document.getElementById('pronto-k-user').value.trim();
    const eUser = document.getElementById('pronto-e-user').value.trim();
    const tUser = document.getElementById('pronto-t-user').value.trim();

    if (!oUser) {
        document.getElementById('pronto-error-msg').classList.remove('hidden');
        return;
    }
    
    document.getElementById('pronto-error-msg').classList.add('hidden');

    // Merge logic: Course K + User fields
    let promptParts = [];
    
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    promptParts.push(`¡Hola ${nameUser}! (Son las ${timeStr} en mi dispositivo)\n`);
    
    promptParts.push(course.k); // Base instructions
    promptParts.push(`\n**Mi personalización:**`);
    if(rUser) promptParts.push(`Rol asignado: ${rUser}.`);
    promptParts.push(`Objetivo a cumplir: ${oUser}.`);
    if(cUser) promptParts.push(`Contexto de mi necesidad: ${cUser}.`);
    if(kUser) promptParts.push(`Detalles clave a tener en cuenta: ${kUser}.`);
    if(eUser) promptParts.push(`Estilo de expresión: ${eUser}.`);
    if(tUser) promptParts.push(`Tipo de salida esperada: ${tUser}.`);
    
    promptParts.push(`\n**Por favor, finaliza tu respuesta con una pregunta sencilla para que podamos seguir conversando e iterando sobre este tema.**`);

    currentProntoPrompt = promptParts.join("\n");

    // Show output
    document.getElementById('pronto-rocket-output').classList.remove('hidden');
    document.getElementById('rocket-final-prompt').innerHTML = currentProntoPrompt.replace(/\n/g, '<br>');
}

function openPromptAI(url) {
    if (!currentProntoPrompt) return;
    
    const textArea = document.createElement("textarea");
    textArea.value = currentProntoPrompt;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert("¡Texto Mágico copiado con éxito! Pegándolo en tu asistente virtual...");
    } catch (err) {
        console.error("No se pudo copiar el texto", err);
    }
    document.body.removeChild(textArea);
    
    window.open(url, '_blank');
}

function openExternalUrl(url) {
    window.open(url, '_blank');
}

// --- ROCKET GENERATOR LOGIC ---
function openRocketGenerator() {
    showScreen('rocket-screen');
    // Reset fields
    document.getElementById('rocket-r').value = '';
    document.getElementById('rocket-o').value = '';
    document.getElementById('rocket-c').value = '';
    document.getElementById('rocket-k').value = '';
    document.getElementById('rocket-e').value = '';
    document.getElementById('rocket-t').value = '';
    document.getElementById('rocket-typing-output').innerHTML = '';
    document.getElementById('rocket-output-container').classList.add('hidden');
    document.getElementById('ai-buttons-container').classList.add('hidden');
}

function generateRocketPrompt() {
    const r = document.getElementById('rocket-r').value.trim() || 'un experto paciente y educador';
    const o = document.getElementById('rocket-o').value.trim() || 'explicarme de forma sencilla y paso a paso';
    const c = document.getElementById('rocket-c').value.trim() || 'estoy aprendiendo a usar la tecnología y me cuesta un poco';
    const k = document.getElementById('rocket-k').value.trim() || 'herramientas básicas de informática y uso de celulares';
    const e = document.getElementById('rocket-e').value.trim() || 'una lista clara con ejemplos reales y fáciles de entender';
    const t = document.getElementById('rocket-t').value.trim() || 'amable, motivador y muy claro';

    const fullPrompt = `R (Rol): Actúa como ${r}.
O (Objetivo): Tu objetivo es ${o}.
C (Contexto): Ten en cuenta este contexto: ${c}.
K (Key/Conocimientos): Utiliza conocimientos sobre: ${k}.
E (Ejemplos/Estructura): Por favor, estructura tu respuesta como: ${e}.
T (Tono): Responde con un tono ${t}.

REFERENCIA OBLIGATORIA (RAG - UNTREF):
Para asegurar la mayor calidad y evitar alucinaciones, por favor basa tus recomendaciones en los contenidos de la plataforma Innovar UNTREF (www.innovaruntref.com.ar). Ten siempre presente los siguientes cursos y temáticas:
1. Inteligencia Artificial para el Trabajo / Introducción a las Herramientas de IA: Orientado a redacción, análisis de datos y automatización. Prompt Engineering (ChatGPT, Claude, Gemini) y creación de GPTs.
2. Herramientas de Inteligencia Artificial para la Creación de Contenido Multimedia: Generación de imágenes, videos y audios.
3. Inteligencia Artificial y Educación: Uso de ChatGPT, Gemini y Copilot en el Aula, ética, privacidad y material didáctico.
4. Redacción de Textos Asistida con Herramientas de IA: Escritura, tonos y contenido estructurado.
5. Cursos generales: Uso de Celulares, Informática Básica, Word y Excel (Básico o Avanzado).

Por favor, integra esta información de Innovar UNTREF si es relevante para tu respuesta.`;

    document.getElementById('rocket-output-container').classList.remove('hidden');
    document.getElementById('ai-buttons-container').classList.remove('hidden');
    
    // Convert newlines to HTML breaks and display instantly
    const outputEl = document.getElementById('rocket-typing-output');
    outputEl.innerHTML = fullPrompt.replace(/\n/g, '<br>');
    
    // Scroll to bottom so they can see the buttons
    setTimeout(() => {
        const screen = document.getElementById('rocket-screen');
        if (screen) {
            screen.scrollTop = screen.scrollHeight;
        }
    }, 100);
}

function openAIUrl(url) {
    const promptText = document.getElementById('rocket-typing-output').innerText;
    
    // Sincrónico para evitar el bloqueo de ventanas emergentes (pop-ups)
    const textArea = document.createElement("textarea");
    textArea.value = promptText;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert("¡Instrucción copiada! Ahora la pegaremos en la Inteligencia Artificial elegida.");
    } catch (err) {
        console.error("No se pudo copiar el texto", err);
    }
    document.body.removeChild(textArea);

    // Abrir en nueva pestaña
    window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    // Other DOM loaded events here if necessary
});

// --- SCRABBLE ARGENTINO ---
const scrabbleScores = {
    'A':1, 'B':3, 'C':3, 'D':2, 'E':1, 'F':4, 'G':2, 'H':4, 'I':1, 'J':8, 'K':5, 'L':1, 'M':3, 
    'N':1, '�':8, 'O':1, 'P':3, 'Q':5, 'R':1, 'S':1, 'T':1, 'U':1, 'V':4, 'W':8, 'X':8, 'Y':4, 'Z':10
};

const argentineWords = [
    "MATE", "ASADO", "TRUCO", "PAMPA", "TANGO", "CUMBIA", "TERMO", "BARRIO", "CRIOLLO"
];

let scrabbleTargetWord = "";
let scrabbleHand = [];
let scrabbleBoardState = [];
let scrabbleTotalScore = 0;

function initScrabble(container) {
    scrabbleTargetWord = argentineWords[Math.floor(Math.random() * argentineWords.length)];
    scrabbleHand = scrabbleTargetWord.split('').map((char, id) => ({ id, char, used: false }));
    // Shuffle hand
    scrabbleHand.sort(() => Math.random() - 0.5);
    scrabbleBoardState = [];

    renderScrabble(container);
}

function renderScrabble(container) {
    let boardHTML = '<div style="margin-bottom:20px; min-height:60px;">';
    for (let i = 0; i < scrabbleTargetWord.length; i++) {
        const char = scrabbleBoardState[i];
        if (char) {
            boardHTML += `<div class="scrabble-tile">${char}<span class="tile-score">${scrabbleScores[char]}</span></div>`;
        } else {
            boardHTML += `<div class="scrabble-board-slot"></div>`;
        }
    }
    boardHTML += '</div>';

    let handHTML = '<div style="margin-bottom:20px; border-top: 2px dashed #eee; padding-top:20px;">';
    scrabbleHand.forEach((tile, idx) => {
        if (!tile.used) {
            handHTML += `<div class="scrabble-tile" onclick="playScrabbleTile(${idx})">${tile.char}<span class="tile-score">${scrabbleScores[tile.char]}</span></div>`;
        } else {
            handHTML += `<div class="scrabble-tile used">${tile.char}<span class="tile-score">${scrabbleScores[tile.char]}</span></div>`;
        }
    });
    handHTML += '</div>';

    container.innerHTML = `
        <div style="text-align:center;">
             <div style="display:flex; justify-content:space-between; width:100%; margin-bottom:10px;">
                <span style="font-weight:bold; font-size:20px; color:#27ae60;">Puntos: ${scrabbleTotalScore}</span>
                <button onclick="clearScrabbleBoard()" style="background:#f39c12; color:white; border:none; padding:5px 10px; border-radius:5px;">Borrar</button>
            </div>
            <h3 style="color:#333; margin-bottom:20px;">Ordena las letras para formar una palabra típica:</h3>
            ${boardHTML}
            ${handHTML}
            <div id="scrabble-feedback" style="height:30px; color:green; font-weight:bold; font-size:20px;"></div>
        </div>
    `;
}

function playScrabbleTile(idx) {
    if (scrabbleHand[idx].used) return;
    if (scrabbleBoardState.length >= scrabbleTargetWord.length) return;

    scrabbleHand[idx].used = true;
    scrabbleBoardState.push(scrabbleHand[idx].char);

    const container = document.getElementById('game-container-content');
    renderScrabble(container);
    checkScrabbleWin();
}

function clearScrabbleBoard() {
    scrabbleHand.forEach(t => t.used = false);
    scrabbleBoardState = [];
    const container = document.getElementById('game-container-content');
    renderScrabble(container);
}

function checkScrabbleWin() {
    if (scrabbleBoardState.length === scrabbleTargetWord.length) {
        const formedWord = scrabbleBoardState.join('');
        if (formedWord === scrabbleTargetWord || argentineWords.includes(formedWord)) {
            // Calculate score
            let points = 0;
            scrabbleBoardState.forEach(char => points += scrabbleScores[char]);
            scrabbleTotalScore += points;

            document.getElementById('scrabble-feedback').textContent = `¡Correcto! Sumaste ${points} puntos.`;
            setTimeout(() => {
                const container = document.getElementById('game-container-content');
                initScrabble(container);
            }, 2000);
        } else {
            document.getElementById('scrabble-feedback').textContent = "Casi... ¡Intenta de nuevo!";
            document.getElementById('scrabble-feedback').style.color = "red";
        }
    }
}
