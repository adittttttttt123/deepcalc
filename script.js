document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initNeuronSection();
    initCNNSection();
    initRLSection();
    initAccordions();
});

/* ================= ACCORDIONS ================= */
function initAccordions() {
    const accordions = document.querySelectorAll('.accordion-btn');
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
}

/* ================= NAVIGATION ================= */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.simulator-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class
            navItems.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

/* ================= SECTION 1: NEURON & RELU ================= */
let reluChart;
function initNeuronSection() {
    const btn = document.getElementById('calc-relu-btn');
    const inX = document.getElementById('input-x');
    const inW = document.getElementById('input-w');
    const inB = document.getElementById('input-b');
    const funcSelect = document.getElementById('activation-func');
    
    const eqZ = document.getElementById('z-equation');
    const eqRelu = document.getElementById('relu-equation');

    const ctx = document.getElementById('reluChart').getContext('2d');

    // Init Chart
    const xValues = [];
    for (let i = -10; i <= 10; i++) xValues.push(i);

    reluChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xValues,
            datasets: [{
                label: 'Fungsi Aktivasi',
                data: [],
                borderColor: '#3b82f6',
                borderWidth: 3,
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.1,
                pointRadius: 0
            }, {
                label: 'Output',
                data: [],
                backgroundColor: '#10b981',
                borderColor: 'rgba(16, 185, 129, 0.6)',
                pointRadius: 12,
                pointHoverRadius: 16,
                pointBorderWidth: 4,
                type: 'scatter'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8', maxRotation: 0, minRotation: 0 } },
                y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } }
            },
            plugins: {
                legend: { labels: { color: '#f8fafc' } }
            }
        }
    });

    function calculate() {
        const x = parseFloat(inX.value) || 0;
        const w = parseFloat(inW.value) || 0;
        const b = parseFloat(inB.value) || 0;
        const funcType = funcSelect.value;

        const z = (x * w) + b;
        let actValue = 0;
        let funcLabel = '';
        let yValues = [];

        if (funcType === 'relu') {
            actValue = Math.max(0, z);
            funcLabel = 'ReLU f(z) = max(0, z)';
            yValues = xValues.map(v => Math.max(0, v));
            eqRelu.textContent = `f(z) = max(0, ${z.toFixed(2)}) = ${actValue.toFixed(2)}`;
        } else if (funcType === 'sigmoid') {
            actValue = 1 / (1 + Math.exp(-z));
            funcLabel = 'Sigmoid f(z) = 1 / (1 + e^-z)';
            yValues = xValues.map(v => 1 / (1 + Math.exp(-v)));
            eqRelu.textContent = `f(z) = 1 / (1 + e^-(${z.toFixed(2)})) = ${actValue.toFixed(2)}`;
        } else if (funcType === 'tanh') {
            actValue = Math.tanh(z);
            funcLabel = 'Tanh f(z) = tanh(z)';
            yValues = xValues.map(v => Math.tanh(v));
            eqRelu.textContent = `f(z) = tanh(${z.toFixed(2)}) = ${actValue.toFixed(2)}`;
        }

        eqZ.textContent = `z = (${x} * ${w}) + (${b}) = ${z.toFixed(2)}`;

        // Update Chart
        reluChart.data.datasets[0].label = funcLabel;
        reluChart.data.datasets[0].data = yValues;
        reluChart.data.datasets[1].data = [{x: z, y: actValue}];
        reluChart.update();
    }

    btn.addEventListener('click', calculate);
    [inX, inW, inB, funcSelect].forEach(input => input.addEventListener('input', calculate));
    
    calculate(); // Initial Calc
}

/* ================= SECTION 2: CNN SIMULATOR ================= */
let cnnAnimating = false;
function initCNNSection() {
    const inputGrid = document.getElementById('input-matrix');
    const filterGrid = document.getElementById('filter-matrix');
    const outputGrid = document.getElementById('output-matrix');
    const runBtn = document.getElementById('run-cnn-btn');
    const resetBtn = document.getElementById('reset-cnn-btn');

    // Data
    let inputData = Array(5).fill().map(() => Array(5).fill().map(() => Math.floor(Math.random() * 5)));
    let filterData = [
        [1, 0, -1],
        [1, 0, -1],
        [1, 0, -1]
    ];
    let outputData = Array(3).fill().map(() => Array(3).fill(0));

    function renderMatrix(container, data, className = '') {
        container.innerHTML = '';
        for (let r = 0; r < data.length; r++) {
            for (let c = 0; c < data[0].length; c++) {
                const cell = document.createElement('div');
                cell.className = `matrix-cell ${className}`;
                cell.id = `${container.id}-r${r}c${c}`;
                cell.textContent = data[r][c] !== null ? data[r][c] : '';
                container.appendChild(cell);
            }
        }
    }

    function initGrids() {
        inputData = Array(5).fill().map(() => Array(5).fill().map(() => Math.floor(Math.random() * 5)));
        outputData = Array(3).fill().map(() => Array(3).fill(null));
        renderMatrix(inputGrid, inputData, 'in-cell');
        renderMatrix(filterGrid, filterData, 'filt-cell');
        renderMatrix(outputGrid, outputData, 'out-cell');
    }

    async function runCNN() {
        if (cnnAnimating) return;
        cnnAnimating = true;
        runBtn.disabled = true;

        const sleep = ms => new Promise(r => setTimeout(r, ms));
        
        // Reset output visualization
        renderMatrix(outputGrid, Array(3).fill().map(() => Array(3).fill(null)), 'out-cell');
        
        // Create or get overlay box
        let overlay = document.getElementById('cnn-overlay-box');
        if(!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'cnn-overlay-box';
            overlay.className = 'filter-overlay';
            // Size based on 3x3 cells (each 40px + 4px gap = 128px)
            overlay.style.width = '128px';
            overlay.style.height = '128px';
            inputGrid.appendChild(overlay);
        }
        overlay.style.display = 'block';

        const mathEquation = document.getElementById('cnn-math-equation');

        for (let outR = 0; outR < 3; outR++) {
            for (let outC = 0; outC < 3; outC++) {
                // Clear highlights
                document.querySelectorAll('.highlight-input').forEach(el => el.classList.remove('highlight-input'));
                document.querySelectorAll('.highlight-filter').forEach(el => el.classList.remove('highlight-filter'));
                document.querySelectorAll('.highlight-output').forEach(el => el.classList.remove('highlight-output'));

                let sum = 0;
                let mathStr = '';
                
                // Move overlay
                overlay.style.left = `${outC * 44}px`;
                overlay.style.top = `${outR * 44}px`;

                // Highlight corresponding input area
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const inR = outR + i;
                        const inC = outC + j;
                        const inCell = document.getElementById(`input-matrix-r${inR}c${inC}`);
                        const filtCell = document.getElementById(`filter-matrix-r${i}c${j}`);
                        
                        inCell.classList.add('highlight-input');
                        filtCell.classList.add('highlight-filter');
                        
                        const mul = inputData[inR][inC] * filterData[i][j];
                        sum += mul;
                        
                        mathStr += `(${inputData[inR][inC]} &times; ${filterData[i][j]})`;
                        if (i !== 2 || j !== 2) mathStr += ' + ';
                    }
                }

                mathEquation.innerHTML = `${mathStr} = <strong>${sum}</strong>`;

                await sleep(500);

                // Update Output
                outputData[outR][outC] = sum;
                const outCell = document.getElementById(`output-matrix-r${outR}c${outC}`);
                outCell.textContent = sum;
                outCell.classList.add('highlight-output');
                outCell.classList.add('output-filled');
                
                await sleep(300);
            }
        }
        
        // Final clear
        document.querySelectorAll('.highlight-input').forEach(el => el.classList.remove('highlight-input'));
        document.querySelectorAll('.highlight-filter').forEach(el => el.classList.remove('highlight-filter'));
        document.querySelectorAll('.highlight-output').forEach(el => el.classList.remove('highlight-output'));
        overlay.style.display = 'none';
        
        cnnAnimating = false;
        runBtn.disabled = false;
    }

    runBtn.addEventListener('click', runCNN);
    resetBtn.addEventListener('click', () => {
        if (!cnnAnimating) initGrids();
    });

    initGrids();
}

/* ================= SECTION 3: Q-LEARNING & DQN ================= */
function initRLSection() {
    const mazeContainer = document.getElementById('maze-grid');
    const trainBtn = document.getElementById('train-rl-btn');
    const resetBtn = document.getElementById('reset-rl-btn');
    const qTableBody = document.querySelector('#q-table tbody');
    
    // Maze setup 4x4
    const size = 4;
    // 0 = empty, 1 = wall/fire, 2 = goal
    const map = [
        [0, 0, 0, 0],
        [0, 1, 0, 1],
        [0, 0, 0, 0],
        [0, 1, 0, 2]
    ];
    
    let agentPos = {r: 0, c: 0};
    let episode = 0;
    let totalReward = 0;
    let isTraining = false;
    
    // Q-Table [state_idx][action_idx]
    // states: r*4 + c (0 to 15)
    // actions: 0=Up, 1=Right, 2=Down, 3=Left
    let qTable = Array(16).fill().map(() => Array(4).fill(0));

    // UI Draw
    function drawMaze() {
        mazeContainer.innerHTML = '';
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                if (map[r][c] === 1) cell.classList.add('wall');
                if (map[r][c] === 2) cell.classList.add('goal');
                mazeContainer.appendChild(cell);
            }
        }
        // Add Agent
        const agent = document.createElement('div');
        agent.className = 'agent';
        agent.textContent = '🐭';
        agent.id = 'agent-icon';
        mazeContainer.appendChild(agent);
        updateAgentUI();
    }

    function updateAgentUI() {
        const agent = document.getElementById('agent-icon');
        // cell size 60px + 5px gap
        const x = agentPos.c * 65;
        const y = agentPos.r * 65;
        agent.style.transform = `translate(${x}px, ${y}px)`;
    }

    function drawPolicy() {
        document.querySelectorAll('.policy-arrow').forEach(el => el.remove());
        
        for(let s=0; s<16; s++) {
            let r = Math.floor(s/4);
            let c = s%4;
            if(map[r][c] !== 0) continue;
            
            let maxVal = -Infinity;
            let bestA = -1;
            let allZero = true;
            for(let a=0; a<4; a++) {
                if(qTable[s][a] !== 0) allZero = false;
                if(qTable[s][a] > maxVal) {
                    maxVal = qTable[s][a];
                    bestA = a;
                }
            }
            if(allZero) continue;
            
            const cell = mazeContainer.children[s];
            const arrow = document.createElement('div');
            arrow.className = 'policy-arrow';
            let icon = '';
            if(bestA === 0) icon = '↑';
            if(bestA === 1) icon = '→';
            if(bestA === 2) icon = '↓';
            if(bestA === 3) icon = '←';
            arrow.textContent = icon;
            cell.appendChild(arrow);
        }
    }

    function drawQTable() {
        qTableBody.innerHTML = '';
        for (let s = 0; s < 16; s++) {
            const tr = document.createElement('tr');
            tr.id = `qrow-${s}`;
            
            const tdS = document.createElement('td');
            tdS.textContent = `S(${Math.floor(s/4)},${s%4})`;
            tr.appendChild(tdS);
            
            for (let a = 0; a < 4; a++) {
                const tdA = document.createElement('td');
                tdA.id = `qcell-${s}-${a}`;
                tdA.textContent = qTable[s][a].toFixed(2);
                tr.appendChild(tdA);
            }
            qTableBody.appendChild(tr);
        }
    }

    function updateQTableUI(s, a) {
        const cell = document.getElementById(`qcell-${s}-${a}`);
        if(cell) {
            cell.textContent = qTable[s][a].toFixed(2);
            cell.classList.add('updated');
            setTimeout(() => cell.classList.remove('updated'), 300);
        }
    }

    // RL Parameters
    const alpha = 0.1; // learning rate
    const gamma = 0.9; // discount factor
    const epsilon = 0.2; // exploration rate

    function getAction(state) {
        if (Math.random() < epsilon) return Math.floor(Math.random() * 4); // explore
        // exploit
        let maxVal = -Infinity;
        let maxA = 0;
        for (let a = 0; a < 4; a++) {
            if (qTable[state][a] > maxVal) {
                maxVal = qTable[state][a];
                maxA = a;
            }
        }
        return maxA;
    }

    function step(action) {
        let nr = agentPos.r;
        let nc = agentPos.c;
        if (action === 0) nr--; // Up
        if (action === 1) nc++; // Right
        if (action === 2) nr++; // Down
        if (action === 3) nc--; // Left

        // Bound check
        if (nr < 0) nr = 0;
        if (nr >= size) nr = size - 1;
        if (nc < 0) nc = 0;
        if (nc >= size) nc = size - 1;

        let reward = -0.1; // step penalty
        let done = false;

        if (map[nr][nc] === 1) {
            reward = -1; // Fire
            done = true;
        } else if (map[nr][nc] === 2) {
            reward = 1; // Goal
            done = true;
        }

        return { nr, nc, reward, done };
    }

    const simSpeedInput = document.getElementById('sim-speed');
    const speedLabel = document.getElementById('speed-label');
    simSpeedInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if(val == 1) speedLabel.textContent = 'Lambat';
        else if(val == 2) speedLabel.textContent = 'Normal';
        else speedLabel.textContent = 'Cepat';
    });

    async function trainEpisode() {
        agentPos = {r: 0, c: 0};
        updateAgentUI();
        let done = false;
        
        let sleepTime = 100;
        if(simSpeedInput.value == 1) sleepTime = 300;
        if(simSpeedInput.value == 3) sleepTime = 0;
        
        while (!done && isTraining) {
            let state = agentPos.r * 4 + agentPos.c;
            let action = getAction(state);
            
            let { nr, nc, reward, isDone } = step(action);
            done = step(action).done;
            reward = step(action).reward;
            
            // Q-Learning update
            let nextState = nr * 4 + nc;
            let maxNextQ = Math.max(...qTable[nextState]);
            if (done) maxNextQ = 0;
            
            qTable[state][action] = qTable[state][action] + alpha * (reward + gamma * maxNextQ - qTable[state][action]);
            
            updateQTableUI(state, action);
            drawNNConnections(action); // update DQN visualization
            
            agentPos = {r: nr, c: nc};
            totalReward += reward;
            
            document.getElementById('reward-count').textContent = totalReward.toFixed(1);
            updateAgentUI();
            
            if(sleepTime > 0) await new Promise(res => setTimeout(res, sleepTime));
        }
        episode++;
        document.getElementById('ep-count').textContent = episode;
        drawPolicy();
    }

    trainBtn.addEventListener('click', async () => {
        if (isTraining) {
            isTraining = false;
            trainBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Latih Agen (Auto)';
        } else {
            isTraining = true;
            trainBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Berhenti';
            while (isTraining && episode < 50) {
                await trainEpisode();
            }
            if (episode >= 50) {
                isTraining = false;
                trainBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Latih Agen (Auto)';
            }
        }
    });

    resetBtn.addEventListener('click', () => {
        isTraining = false;
        trainBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Latih Agen (Auto)';
        episode = 0;
        totalReward = 0;
        agentPos = {r: 0, c: 0};
        qTable = Array(16).fill().map(() => Array(4).fill(0));
        document.getElementById('ep-count').textContent = episode;
        document.getElementById('reward-count').textContent = totalReward;
        updateAgentUI();
        drawQTable();
        clearCanvas();
    });

    // Tabs logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`tab-${btn.getAttribute('data-tab')}`).classList.add('active');
            if(btn.getAttribute('data-tab') === 'dqn') resizeCanvas();
        });
    });

    // Simple NN Visualization Drawing
    const canvas = document.getElementById('nn-canvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        const vis = document.querySelector('.nn-visualization');
        canvas.width = vis.clientWidth;
        canvas.height = vis.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.querySelectorAll('.node').forEach(n => n.classList.remove('active-node'));
    }

    function drawNNConnections(actionIndex) {
        if(document.getElementById('tab-dqn').classList.contains('active') === false) return;
        
        clearCanvas();
        resizeCanvas();

        const inNodes = document.querySelectorAll('.input-layer .node');
        const hidNodes = document.querySelectorAll('.hidden-layer .node');
        const outNodes = document.querySelectorAll('.output-layer .node');
        
        // Randomly highlight input & hidden to simulate thought process
        inNodes.forEach(n => n.classList.add('active-node'));
        
        let actHidden = [];
        hidNodes.forEach(n => {
            if(Math.random() > 0.3) {
                n.classList.add('active-node');
                actHidden.push(n);
            }
        });

        const targetOut = outNodes[actionIndex];
        targetOut.classList.add('active-node');

        // Draw lines
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        
        // In to Hidden
        inNodes.forEach(inN => {
            const r1 = inN.getBoundingClientRect();
            const cvRect = canvas.getBoundingClientRect();
            const x1 = r1.left + r1.width/2 - cvRect.left;
            const y1 = r1.top + r1.height/2 - cvRect.top;
            
            actHidden.forEach(hidN => {
                const r2 = hidN.getBoundingClientRect();
                const x2 = r2.left + r2.width/2 - cvRect.left;
                const y2 = r2.top + r2.height/2 - cvRect.top;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });
        });

        // Hidden to Out
        actHidden.forEach(hidN => {
            const r1 = hidN.getBoundingClientRect();
            const cvRect = canvas.getBoundingClientRect();
            const x1 = r1.left + r1.width/2 - cvRect.left;
            const y1 = r1.top + r1.height/2 - cvRect.top;
            
            outNodes.forEach((outN, aIdx) => {
                const r2 = outN.getBoundingClientRect();
                const x2 = r2.left + r2.width/2 - cvRect.left;
                const y2 = r2.top + r2.height/2 - cvRect.top;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                
                if (aIdx === actionIndex) {
                    ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
                    ctx.lineWidth = 4;
                } else {
                    ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
                    ctx.lineWidth = 1;
                }
                ctx.stroke();
            });
        });
    }

    drawMaze();
    drawQTable();
    setTimeout(resizeCanvas, 100);
}
