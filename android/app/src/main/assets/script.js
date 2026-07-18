const BOARD_SIZE = 8;
let board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

let state = {
    phase: 'setup',
    turn: 'TAZ',
    playerSide: 'TAZ',
    selectedPayloads: [],
    meshedCoords: new Set(),
    selectedTile: null,
    validMoves: [],
    payloadsDelivered: 0,
    payloadsIntercepted: 0,
    totalPayloads: 2
};

const unicodePieces = {
    TAZ_P: '⬡',
    TAZ_P_PAYLOAD: '⬢',
    TAZ_N: '♞',
    MEGA_R: '♜',
    MEGA_B: '♝',
    MEGA_Q: '♛',
    MEGA_K: '♚'
};

const boardEl = document.getElementById('board');
const actionBtn = document.getElementById('action-btn');
const resetBtn = document.getElementById('reset-btn');
const factionSelectEl = document.getElementById('faction-select');
const statusMessageEl = document.getElementById('status-message');
const delivEl = document.getElementById('payloads-delivered');
const intercEl = document.getElementById('payloads-intercepted');

factionSelectEl.addEventListener('change', (e) => {
    state.playerSide = e.target.value;
    initGame();
});

function initGame() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    state = {
        phase: 'setup',
        turn: 'TAZ',
        playerSide: factionSelectEl.value,
        selectedPayloads: [],
        meshedCoords: new Set(),
        selectedTile: null,
        validMoves: [],
        payloadsDelivered: 0,
        payloadsIntercepted: 0,
        totalPayloads: 2
    };

    for (let c = 0; c < BOARD_SIZE; c++) {
        board[6][c] = { type: 'P', side: 'TAZ', payload: false };
    }
    board[7][1] = { type: 'N', side: 'TAZ' };
    board[7][6] = { type: 'N', side: 'TAZ' };

    board[0][0] = { type: 'R', side: 'MEGA' };
    board[0][7] = { type: 'R', side: 'MEGA' };
    board[0][2] = { type: 'B', side: 'MEGA' };
    board[0][5] = { type: 'B', side: 'MEGA' };
    board[0][3] = { type: 'Q', side: 'MEGA' };
    board[0][4] = { type: 'K', side: 'MEGA' };

    factionSelectEl.disabled = false;

    updateUIPanels();
    renderBoard();
    
    logConsole("SYS: READY", "system");
}

function logConsole(message, faction = 'system') {
    console.log(`[${faction.toUpperCase()}] ${message}`);
}

function updateUIPanels() {
    delivEl.innerText = `${state.payloadsDelivered} / 1`;
    intercEl.innerText = `${state.payloadsIntercepted} / ${state.totalPayloads}`;

    if (state.phase === 'setup') {
        if (state.playerSide === 'TAZ') {
            actionBtn.innerText = "INIT MESH";
            actionBtn.disabled = state.selectedPayloads.length !== 2;
            statusMessageEl.innerText = `SETUP: TAZ [PAYLOAD: ${state.selectedPayloads.length}/2]`;
        } else {
            actionBtn.innerText = "INIT SIM";
            actionBtn.disabled = false;
            statusMessageEl.innerText = `SETUP: MEGA [AWAITING INIT]`;
        }
    } else if (state.phase === 'play') {
        actionBtn.innerText = "RUNNING";
        actionBtn.disabled = true;
        statusMessageEl.innerText = `TURN: ${state.turn}`;
    } else if (state.phase === 'ended') {
        actionBtn.innerText = "HALTED";
        actionBtn.disabled = true;
    }
}

function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const tile = document.createElement('div');
            tile.className = `tile ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
            tile.dataset.r = r;
            tile.dataset.c = c;

            const key = `${r},${c}`;
            if (state.selectedTile === key) tile.classList.add('selected');
            if (state.phase === 'setup' && state.selectedPayloads.includes(key) && state.playerSide === 'TAZ') {
                tile.classList.add('setup-selected');
            }
            if (state.meshedCoords.has(key)) tile.classList.add('meshed');

            const validMoveObj = state.validMoves.find(m => m.r === r && m.c === c);
            if (validMoveObj) {
                tile.classList.add(validMoveObj.type === 'capture' ? 'valid-capture' : 'valid-move');
            }

            const piece = board[r][c];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${piece.side.toLowerCase()}`;
                
                if (piece.side === 'TAZ') {
                    if (piece.type === 'P') {
                        const showAsPayload = piece.payload && (state.playerSide === 'TAZ' || state.phase === 'ended');
                        pieceEl.innerText = showAsPayload ? unicodePieces.TAZ_P_PAYLOAD : unicodePieces.TAZ_P;
                    } else {
                        pieceEl.innerText = unicodePieces[`TAZ_${piece.type}`];
                    }
                } else {
                    pieceEl.innerText = unicodePieces[`MEGA_${piece.type}`];
                }
                tile.appendChild(pieceEl);
            }

            tile.addEventListener('click', () => handleTileClick(r, c));
            boardEl.appendChild(tile);
        }
    }
}

function handleTileClick(r, c) {
    if (state.phase === 'ended') return;

    const key = `${r},${c}`;
    
    if (state.phase === 'setup') {
        if (state.playerSide === 'TAZ' && r === 6) {
            const index = state.selectedPayloads.indexOf(key);
            if (index > -1) {
                state.selectedPayloads.splice(index, 1);
                board[r][c].payload = false;
            } else if (state.selectedPayloads.length < 2) {
                state.selectedPayloads.push(key);
                board[r][c].payload = true;
            }
            updateUIPanels();
            renderBoard();
        }
        return;
    }

    if (state.phase === 'play' && state.turn === state.playerSide) {
        const targetMove = state.validMoves.find(m => m.r === r && m.c === c);
        if (targetMove) {
            executeMove(state.selectedTile, key);
            return;
        }

        const piece = board[r][c];
        if (piece && piece.side === state.playerSide) {
            state.selectedTile = key;
            state.validMoves = generateLegalMoves(r, c, board);
        } else {
            state.selectedTile = null;
            state.validMoves = [];
        }
        renderBoard();
    }
}

function generateLegalMoves(r, c, currentBoard) {
    const piece = currentBoard[r][c];
    if (!piece) return [];

    let moves = [];

    if (piece.side === 'TAZ') {
        if (piece.type === 'P') {
            if (r - 1 >= 0 && !currentBoard[r - 1][c]) {
                moves.push({ r: r - 1, c: c, type: 'move' });
                if (r === 6 && !currentBoard[r - 2][c]) {
                    moves.push({ r: r - 2, c: c, type: 'move' });
                }
            }
            const diagLeft = { r: r - 1, c: c - 1 };
            const diagRight = { r: r - 1, c: c + 1 };
            
            [diagLeft, diagRight].forEach(coord => {
                if (coord.r >= 0 && coord.c >= 0 && coord.c < BOARD_SIZE) {
                    const target = currentBoard[coord.r][coord.c];
                    if (target && target.side === 'MEGA') {
                        moves.push({ r: coord.r, c: coord.c, type: 'capture' });
                    }
                }
            });

            const isMeshed = state.meshedCoords.has(`${r},${c}`);
            if (isMeshed && r - 1 >= 0) {
                const directBlocker = currentBoard[r - 1][c];
                if (directBlocker && directBlocker.side === 'MEGA') {
                    [c - 1, c + 1].forEach(adjCol => {
                        if (adjCol >= 0 && adjCol < BOARD_SIZE) {
                            if (!currentBoard[r - 1][adjCol]) {
                                if (verifyMeshPreserved(r, c, r - 1, adjCol)) {
                                    moves.push({ r: r - 1, c: adjCol, type: 'move' });
                                }
                            }
                        }
                    });
                }
            }
        } else if (piece.type === 'N') {
            const offsets = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            offsets.forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    const target = currentBoard[nr][nc];
                    if (!target) {
                        moves.push({ r: nr, c: nc, type: 'move' });
                    } else if (target.side === 'MEGA') {
                        moves.push({ r: nr, c: nc, type: 'capture' });
                    }
                }
            });
        }
    } else if (piece.side === 'MEGA') {
        let dirs = [];
        if (piece.type === 'R') {
            dirs = [[-1,0], [1,0], [0,-1], [0,1]];
        } else if (piece.type === 'B') {
            dirs = [[-1,-1], [-1,1], [1,-1], [1,1]];
        } else if (piece.type === 'Q' || piece.type === 'K') {
            dirs = [[-1,0], [1,0], [0,-1], [0,1], [-1,-1], [-1,1], [1,-1], [1,1]];
        }

        if (piece.type === 'K') {
            dirs.forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    const target = currentBoard[nr][nc];
                    if (!target) {
                        moves.push({ r: nr, c: nc, type: 'move' });
                    } else if (target.side === 'TAZ') {
                        moves.push({ r: nr, c: nc, type: 'capture' });
                    }
                }
            });
        } else {
            dirs.forEach(([dr, dc]) => {
                let step = 1;
                while (true) {
                    const nr = r + (dr * step);
                    const nc = c + (dc * step);
                    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;

                    const target = currentBoard[nr][nc];
                    if (!target) {
                        moves.push({ r: nr, c: nc, type: 'move' });
                    } else {
                        if (target.side === 'TAZ') {
                            if (target.type === 'P' && state.meshedCoords.has(`${nr},${nc}`)) {
                                const isAdjacent = (Math.abs(r - nr) <= 1 && Math.abs(c - nc) <= 1);
                                if (isAdjacent) {
                                    moves.push({ r: nr, c: nc, type: 'capture' });
                                }
                            } else {
                                moves.push({ r: nr, c: nc, type: 'capture' });
                            }
                        }
                        break;
                    }
                    step++;
                }
            });
        }
    }

    return moves;
}

function verifyMeshPreserved(fromR, fromC, toR, toC) {
    const tempBoard = Array(BOARD_SIZE).fill(null).map((_, r) => {
        return Array(BOARD_SIZE).fill(null).map((_, c) => {
            return board[r][c] ? { ...board[r][c] } : null;
        });
    });

    tempBoard[toR][toC] = tempBoard[fromR][fromC];
    tempBoard[fromR][fromC] = null;

    const tempMesh = calculateSovereignMesh(tempBoard);
    return tempMesh.has(`${toR},${toC}`);
}

function calculateSovereignMesh(grid) {
    const visited = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
    const meshCoords = new Set();

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = grid[r][c];
            if (piece && piece.side === 'TAZ' && piece.type === 'P' && !visited[r][c]) {
                const group = [];
                exploreGroup(r, c, group, grid, visited);
                if (group.length >= 3) {
                    group.forEach(coord => meshCoords.add(coord));
                }
            }
        }
    }
    return meshCoords;
}

function exploreGroup(r, c, group, grid, visited) {
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return;
    if (visited[r][c]) return;
    
    const piece = grid[r][c];
    if (!piece || piece.side !== 'TAZ' || piece.type !== 'P') return;

    visited[r][c] = true;
    group.push(`${r},${c}`);

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) {
                exploreGroup(r + dr, c + dc, group, grid, visited);
            }
        }
    }
}

function executeMove(fromKey, toKey) {
    const [fromR, fromC] = fromKey.split(',').map(Number);
    const [toR, toC] = toKey.split(',').map(Number);
    const mover = board[fromR][fromC];
    const target = board[toR][toC];

    const fString = `[R:${8 - fromR} F:${fromC + 1}]`;
    const tString = `[R:${8 - toR} F:${toC + 1}]`;

    if (target) {
        if (target.side === 'TAZ' && target.type === 'P') {
            if (target.payload) {
                state.payloadsIntercepted++;
                logConsole(`ALERT: PAYLOAD LOST ${tString}`, "mega");
            } else {
                logConsole(`CHAFF LOST ${tString}`, "system");
            }
        } else {
            logConsole(`DISCONNECT: ${target.side} ${target.type} ${tString}`, state.turn.toLowerCase());
        }
    }

    board[toR][toC] = mover;
    board[fromR][fromC] = null;

    logConsole(`ROUTE: ${fString} -> ${tString}`, mover.side.toLowerCase());

    if (mover.side === 'TAZ' && mover.type === 'P' && toR === 0) {
        if (mover.payload) {
            state.payloadsDelivered++;
            logConsole(`SUCCESS: PAYLOAD ROUTED`, "taz");
        } else {
            logConsole(`DECOY ROUTED`, "taz");
            const knightCount = countTAZKnights();
            if (knightCount < 2) {
                board[toR][toC] = { type: 'N', side: 'TAZ' };
                logConsole(`PROMOTION: TAZ N`, "taz");
            } else {
                board[toR][toC] = null;
                logConsole(`DISCONNECT: TAZ DECOY`, "system");
            }
        }
    }

    state.selectedTile = null;
    state.validMoves = [];
    state.meshedCoords = calculateSovereignMesh(board);

    if (verifyTerminationStates()) return;

    state.turn = (state.turn === 'TAZ') ? 'MEGA' : 'TAZ';
    updateUIPanels();
    renderBoard();

    if (state.phase === 'play') {
        if (state.turn === 'MEGA' && state.playerSide === 'TAZ') {
            setTimeout(executeMegacorpTurnAI, 600);
        } else if (state.turn === 'TAZ' && state.playerSide === 'MEGA') {
            setTimeout(executeTAZTurnAI, 600);
        }
    }
}

function countTAZKnights() {
    let count = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.side === 'TAZ' && p.type === 'N') count++;
        }
    }
    return count;
}

function verifyTerminationStates() {
    if (state.payloadsDelivered >= 1) {
        endGame('TAZ', 'TAZ WIN // ROUTED');
        return true;
    }

    if (state.payloadsIntercepted >= state.totalPayloads) {
        endGame('MEGA', 'MEGA WIN // COMPROMISED');
        return true;
    }

    let hasMegacorp = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] && board[r][c].side === 'MEGA') {
                hasMegacorp = true;
                break;
            }
        }
    }
    if (!hasMegacorp) {
        endGame('TAZ', 'TAZ WIN // BLACKOUT');
        return true;
    }

    const nextTurn = state.turn === 'TAZ' ? 'MEGA' : 'TAZ';
    let activeMoves = false;

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.side === nextTurn) {
                const m = generateLegalMoves(r, c, board);
                if (m.length > 0) {
                    activeMoves = true;
                    break;
                }
            }
        }
    }

    if (!activeMoves) {
        if (nextTurn === 'MEGA') {
            endGame('TAZ', 'TAZ WIN // STALEMATE');
        } else {
            endGame('MEGA', 'MEGA WIN // STALEMATE');
        }
        return true;
    }

    return false;
}

function endGame(winner, msg) {
    state.phase = 'ended';
    updateUIPanels();
    renderBoard();

    statusMessageEl.innerHTML = `<strong style="color: ${winner === 'TAZ' ? 'var(--neon-green)' : 'var(--neon-amber)'}">${msg}</strong>`;
    logConsole(`HALT: ${msg}`, winner.toLowerCase());
}

function executeMegacorpTurnAI() {
    if (state.phase !== 'play' || state.turn !== 'MEGA') return;

    const allMoves = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece && piece.side === 'MEGA') {
                const moves = generateLegalMoves(r, c, board);
                moves.forEach(m => {
                    allMoves.push({
                        from: `${r},${c}`,
                        to: `${m.r},${m.c}`,
                        type: m.type,
                        pieceType: piece.type
                    });
                });
            }
        }
    }

    if (allMoves.length === 0) {
        verifyTerminationStates();
        return;
    }

    allMoves.forEach(m => {
        m.score = evaluateMegacorpMove(m);
    });

    allMoves.sort((a, b) => b.score - a.score);
    const chosenMove = allMoves[0];
    executeMove(chosenMove.from, chosenMove.to);
}

function evaluateMegacorpMove(move) {
    const [fromR, fromC] = move.from.split(',').map(Number);
    const [toR, toC] = move.to.split(',').map(Number);
    const piece = board[fromR][fromC];
    const target = board[toR][toC];

    let score = 0;

    if (target && target.side === 'TAZ') {
        if (target.type === 'N') {
            score += 100;
        } else if (target.type === 'P') {
            const distanceThreatBonus = (7 - toR) * 15;
            score += 50 + distanceThreatBonus;
        }
    }

    if (piece.type === 'R' || piece.type === 'Q') {
        if (toR + 1 < BOARD_SIZE && board[toR + 1][toC] && board[toR + 1][toC].type === 'P') {
            score += 30;
        }
    }

    if (isAttackedByStingray(toR, toC, board)) {
        const values = { K: 120, Q: 90, R: 50, B: 30 };
        score -= values[piece.type];
    }

    score += toR * 2.5;

    if (piece.type === 'K') {
        const adjToMesh = isAdjacentToMeshedPawn(toR, toC);
        if (adjToMesh) score += 40;
    }

    score += Math.random() * 6;
    return score;
}

function executeTAZTurnAI() {
    if (state.phase !== 'play' || state.turn !== 'TAZ') return;

    const allMoves = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (piece && piece.side === 'TAZ') {
                const moves = generateLegalMoves(r, c, board);
                moves.forEach(m => {
                    allMoves.push({
                        from: `${r},${c}`,
                        to: `${m.r},${m.c}`,
                        type: m.type,
                        pieceType: piece.type
                    });
                });
            }
        }
    }

    if (allMoves.length === 0) {
        verifyTerminationStates();
        return;
    }

    allMoves.forEach(m => {
        m.score = evaluateTAZMove(m);
    });

    allMoves.sort((a, b) => b.score - a.score);
    const chosenMove = allMoves[0];
    executeMove(chosenMove.from, chosenMove.to);
}

function evaluateTAZMove(move) {
    const [fromR, fromC] = move.from.split(',').map(Number);
    const [toR, toC] = move.to.split(',').map(Number);
    const piece = board[fromR][fromC];
    const target = board[toR][toC];

    let score = 0;

    if (target && target.side === 'MEGA') {
        const targetValues = { K: 200, Q: 150, R: 90, B: 60 };
        score += targetValues[target.type] || 40;
    }

    if (piece.type === 'P') {
        const advanceBonus = (6 - toR) * 12;
        score += advanceBonus;

        if (piece.payload) {
            score += (6 - toR) * 8;
        }

        if (toR === 0) {
            score += piece.payload ? 1000 : 250;
        }

        if (verifyMeshPreserved(fromR, fromC, toR, toC)) {
            score += 35;
        }
    }

    if (piece.type === 'N') {
        score += 20;
        if (target && target.side === 'MEGA') {
            score += 40;
        }
    }

    if (isUnderCorpSights(toR, toC, board)) {
        if (piece.type === 'P' && state.meshedCoords.has(`${toR},${toC}`)) {
            if (isAdjacentToFieldIR(toR, toC)) {
                score -= 60;
            }
        } else {
            score -= 80;
        }
    }

    score += Math.random() * 5;
    return score;
}

function isUnderCorpSights(r, c, grid) {
    for (let tr = 0; tr < BOARD_SIZE; tr++) {
        for (let tc = 0; tc < BOARD_SIZE; tc++) {
            const piece = grid[tr][tc];
            if (piece && piece.side === 'MEGA' && piece.type !== 'K') {
                const moves = generateLegalMoves(tr, tc, grid);
                if (moves.some(m => m.r === r && m.c === c)) return true;
            }
        }
    }
    return false;
}

function isAdjacentToFieldIR(r, c) {
    for (let rIdx = 0; rIdx < BOARD_SIZE; rIdx++) {
        for (let cIdx = 0; cIdx < BOARD_SIZE; cIdx++) {
            const p = board[rIdx][cIdx];
            if (p && p.side === 'MEGA' && p.type === 'K') {
                return Math.abs(r - rIdx) <= 1 && Math.abs(c - cIdx) <= 1;
            }
        }
    }
    return false;
}

function isAttackedByStingray(r, c, grid) {
    const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of offsets) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const p = grid[nr][nc];
            if (p && p.side === 'TAZ' && p.type === 'N') return true;
        }
    }
    return false;
}

function isAdjacentToMeshedPawn(r, c) {
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    if (state.meshedCoords.has(`${nr},${nc}`)) return true;
                }
            }
        }
    }
    return false;
}

function autoSelectTAZPayloads() {
    state.selectedPayloads = [];
    const cols = [0, 1, 2, 3, 4, 5, 6, 7];
    cols.sort(() => Math.random() - 0.5);
    
    const c1 = cols[0];
    const c2 = cols[1];
    
    board[6][c1].payload = true;
    board[6][c2].payload = true;
    
    state.selectedPayloads = [`6,${c1}`, `6,${c2}`];
}

actionBtn.addEventListener('click', () => {
    if (state.phase === 'setup') {
        factionSelectEl.disabled = true;
        if (state.playerSide === 'TAZ') {
            if (state.selectedPayloads.length === 2) {
                state.phase = 'play';
                state.meshedCoords = calculateSovereignMesh(board);
                updateUIPanels();
                renderBoard();
                logConsole("START", "taz");
            }
        } else {
            autoSelectTAZPayloads();
            state.phase = 'play';
            state.meshedCoords = calculateSovereignMesh(board);
            updateUIPanels();
            renderBoard();
            logConsole("START", "mega");
            setTimeout(executeTAZTurnAI, 600);
        }
    }
});

resetBtn.addEventListener('click', () => {
    initGame();
});

initGame();
