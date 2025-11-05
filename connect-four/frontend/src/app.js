/**
 * app.js - Main application orchestrator
 * 
 * Coordinates all modules, manages game state, handles user interactions,
 * and orchestrates game flow including AI moves and game history.
 */

import {
    createBoard,
    cloneBoard,
    dropDisc,
    checkWin,
    isBoardFull,
    isColumnFull,
    getAvailableMoves,
    ROWS,
    COLS
} from './board.js';

import {
    getAIMove,
    updateAIFace,
    simulateThinkingDelay
} from './ai.js';

import {
    createBoardSVG,
    renderDiscs,
    highlightWinningLine,
    getColFromClientX,
    setupKeyboardNavigation,
    setColumnsDisabled,
    updateAIFaceDisplay,
    updateGameStatus,
    highlightColumn
} from './ui.js';

import {
    saveGame,
    getAllGames,
    clearHistory,
    replayGame,
    createMoveObject,
    generateGameId,
    formatGameSummary
} from './history.js';

import {
    consoleLog,
    LOG_TYPES,
    initConsole,
    clearConsole
} from './console.js';

import {
    setSoundEnabled,
    playDiscDrop,
    playWin,
    playLose,
    playDraw,
    playAIThinking,
    playClick,
    playError
} from './sound.js';

// Game state
let currentBoard = null;
let currentPlayer = 1; // 1 = Player 1 (Red), 2 = Player 2 / AI (Yellow)
let gameMode = 'ai'; // 'ai' or 'human'
let aiDifficulty = 'medium';
let playerOrder = 'player'; // 'player' or 'ai'
let isGameActive = false;
let isAnimating = false;
let moveHistory = [];
let undoStack = [];
let svgElement = null;
let keyboardCleanup = null;
let currentGameId = null;
let currentGameStartTime = null;

/**
 * Initializes the application
 */
function init() {
    // Initialize console
    initConsole();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load and display game history
    renderHistory();
    
    // Show new game modal on load
    showNewGameModal();
    
    consoleLog(LOG_TYPES.INFO, 'Application initialized');
}

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
    // New game button
    const btnNewGame = document.getElementById('btn-new-game');
    if (btnNewGame) {
        btnNewGame.addEventListener('click', showNewGameModal);
    }
    
    // New game form
    const newGameForm = document.getElementById('new-game-form');
    if (newGameForm) {
        newGameForm.addEventListener('submit', handleNewGameSubmit);
    }
    
    // Cancel modal
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    if (btnCancelModal) {
        btnCancelModal.addEventListener('click', hideNewGameModal);
    }
    
    // Toggle console
    const btnToggleConsole = document.getElementById('btn-toggle-console');
    if (btnToggleConsole) {
        btnToggleConsole.addEventListener('click', toggleConsole);
    }
    
    // Toggle history
    const btnToggleHistory = document.getElementById('btn-toggle-history');
    if (btnToggleHistory) {
        btnToggleHistory.addEventListener('click', toggleHistory);
    }
    
    // Close history button (for mobile)
    const btnCloseHistory = document.getElementById('btn-close-history');
    if (btnCloseHistory) {
        btnCloseHistory.addEventListener('click', toggleHistory);
    }
    
    // Undo button
    const btnUndo = document.getElementById('btn-undo');
    if (btnUndo) {
        btnUndo.addEventListener('click', handleUndo);
    }
    
    // Difficulty selector
    const difficultySelect = document.getElementById('difficulty-select');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
            aiDifficulty = e.target.value;
        });
    }
    
    // Accessibility controls
    const colorblindMode = document.getElementById('colorblind-mode');
    if (colorblindMode) {
        colorblindMode.addEventListener('change', (e) => {
            document.body.classList.toggle('colorblind', e.target.checked);
            consoleLog(LOG_TYPES.INFO, `Colorblind mode ${e.target.checked ? 'enabled' : 'disabled'}`);
        });
    }
    
    const highContrastMode = document.getElementById('high-contrast-mode');
    if (highContrastMode) {
        highContrastMode.addEventListener('change', (e) => {
            document.body.classList.toggle('high-contrast', e.target.checked);
            consoleLog(LOG_TYPES.INFO, `High contrast mode ${e.target.checked ? 'enabled' : 'disabled'}`);
        });
    }
    
    const darkMode = document.getElementById('dark-mode');
    if (darkMode) {
        darkMode.addEventListener('change', (e) => {
            document.body.classList.toggle('dark-mode', e.target.checked);
            consoleLog(LOG_TYPES.INFO, `Dark mode ${e.target.checked ? 'enabled' : 'disabled'}`);
        });
    }
    
    // Clear history
    const btnClearHistory = document.getElementById('btn-clear-history');
    if (btnClearHistory) {
        btnClearHistory.addEventListener('click', handleClearHistory);
    }
    
    // Close modal on overlay click
    const modalOverlay = document.getElementById('new-game-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideNewGameModal();
            }
        });
    }
}

/**
 * Shows new game modal
 */
function showNewGameModal() {
    const modal = document.getElementById('new-game-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Reset form
        const form = document.getElementById('new-game-form');
        if (form) {
            form.reset();
            document.getElementById('game-mode').value = 'ai';
            document.getElementById('player-order').value = 'player';
            document.getElementById('modal-difficulty').value = 'medium';
        }
    }
}

/**
 * Hides new game modal
 */
function hideNewGameModal() {
    const modal = document.getElementById('new-game-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Handles new game form submission
 */
function handleNewGameSubmit(e) {
    e.preventDefault();
    
    const gameModeSelect = document.getElementById('game-mode');
    const playerOrderSelect = document.getElementById('player-order');
    const difficultySelect = document.getElementById('modal-difficulty');
    const soundEffectsCheckbox = document.getElementById('sound-effects');
    
    gameMode = gameModeSelect.value;
    playerOrder = playerOrderSelect.value;
    aiDifficulty = difficultySelect.value;
    
    // Enable sound if checkbox is checked
    if (soundEffectsCheckbox) {
        setSoundEnabled(soundEffectsCheckbox.checked);
        if (soundEffectsCheckbox.checked) {
            consoleLog(LOG_TYPES.INFO, 'Sound effects enabled');
        }
    }
    
    // Sync difficulty selector
    const mainDifficultySelect = document.getElementById('difficulty-select');
    if (mainDifficultySelect) {
        mainDifficultySelect.value = aiDifficulty;
    }
    
    hideNewGameModal();
    playClick();
    startNewGame();
}

/**
 * Starts a new game
 */
function startNewGame() {
    // Clear previous state
    if (keyboardCleanup) {
        keyboardCleanup();
        keyboardCleanup = null;
    }
    
    currentBoard = createBoard();
    moveHistory = [];
    undoStack = [];
    currentGameId = generateGameId();
    currentGameStartTime = Date.now();
    
    // Set starting player
    if (playerOrder === 'player') {
        currentPlayer = 1;
    } else {
        currentPlayer = 2; // AI starts
    }
    
    isGameActive = true;
    
    // Clear console and log new game
    clearConsole();
    consoleLog(LOG_TYPES.INFO, `New game started - Mode: ${gameMode}, Difficulty: ${aiDifficulty}, ${playerOrder === 'player' ? 'Player' : 'AI'} starts`);
    
    // Create board SVG
    const container = document.getElementById('board-svg-container');
    if (container) {
        svgElement = createBoardSVG(container, handleColumnClick);
        
        // Set up keyboard navigation
        keyboardCleanup = setupKeyboardNavigation(
            svgElement,
            (col) => {
                // Column selection feedback
                highlightColumn(svgElement, col);
            },
            (col) => {
                // Drop on Enter/Space
                handleColumnClick(col);
            }
        );
        
        // Initial render
        renderDiscs(svgElement, currentBoard);
    }
    
    // Update AI face
    if (gameMode === 'ai') {
        const face = updateAIFace({ event: 'neutral' });
        updateAIFaceDisplay(face.emoji, face.text);
    }
    
    // Update status
    updateGameStatus('Game in progress');
    
    // Enable undo button
    const btnUndo = document.getElementById('btn-undo');
    if (btnUndo) {
        btnUndo.disabled = false;
    }
    
    // If AI starts, make AI move
    if (playerOrder === 'ai' && gameMode === 'ai') {
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

/**
 * Handles column click
 */
function handleColumnClick(col) {
    if (!isGameActive || isAnimating) {
        return;
    }
    
    // Check if it's player's turn (in AI mode, prevent clicking during AI's turn)
    if (gameMode === 'ai' && currentPlayer === 2) {
        return; // AI's turn
    }
    
    // In human vs human mode, both players can click (no restriction)
    
    // Check if column is full
    if (isColumnFull(currentBoard, col)) {
        consoleLog(LOG_TYPES.WARNING, `Column ${col + 1} is full!`);
        playError();
        return;
    }
    
    makeMove(col, currentPlayer);
}

/**
 * Makes a move for a player
 */
async function makeMove(col, player) {
    if (isAnimating) {
        return;
    }
    
    isAnimating = true;
    setColumnsDisabled(svgElement, true);
    
    // Save state for undo
    undoStack.push({
        board: cloneBoard(currentBoard),
        player: currentPlayer,
        moveHistoryLength: moveHistory.length
    });
    
    // Drop disc
    const result = dropDisc(currentBoard, col, player);
    
    if (!result.success) {
        isAnimating = false;
        setColumnsDisabled(svgElement, false);
        return;
    }
    
    // Log move
    const playerName = player === 1 ? 'Player 1' : (gameMode === 'ai' ? 'AI' : 'Player 2');
    consoleLog(LOG_TYPES.PLAYER, `${playerName} dropped disc in column ${col + 1}`);
    
    // Play drop sound
    playDiscDrop();
    
    // Render with animation
    renderDiscs(svgElement, currentBoard, {
        animateNew: true,
        newDiscRow: result.row,
        newDiscCol: col
    });
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Create move object for history (BEFORE checking win, so winning move is included)
    const moveNumber = moveHistory.length + 1;
    const moveObj = createMoveObject(
        moveNumber,
        player,
        col,
        result.row,
        null,
        null,
        cloneBoard(currentBoard)
    );
    moveHistory.push(moveObj);
    
    // Check for win
    const winCheck = checkWin(currentBoard, result.row, col, player);
    
    if (winCheck.win) {
        // Game over - player won
        handleGameOver(player, winCheck.line);
        isAnimating = false;
        return;
    }
    
    // Check for draw
    if (isBoardFull(currentBoard)) {
        handleGameOver(null, []);
        isAnimating = false;
        return;
    }
    
    // Check if player blocked AI's imminent win (only in AI mode)
    let blockedAIWin = false;
    if (gameMode === 'ai' && player === 1) {
        // Check if AI would have won on next move by testing all columns
        const availableMoves = getAvailableMoves(currentBoard);
        for (const testCol of availableMoves) {
            const testBoard = cloneBoard(currentBoard);
            const testResult = dropDisc(testBoard, testCol, 2);
            if (testResult.success) {
                const testWin = checkWin(testBoard, testResult.row, testCol, 2);
                if (testWin.win) {
                    blockedAIWin = true;
                    break;
                }
            }
        }
        
        if (blockedAIWin) {
            const frustratedFace = updateAIFace({ event: 'frustrated' });
            updateAIFaceDisplay(frustratedFace.emoji, frustratedFace.text);
            consoleLog(LOG_TYPES.AI, `Oof, nice block! ${frustratedFace.text}`);
        }
    }
    
    // Switch player
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    
    isAnimating = false;
    
    // Update status
    if (gameMode === 'ai') {
        if (currentPlayer === 2) {
            updateGameStatus('AI thinking...');
            // Make AI move after short delay
            setTimeout(() => {
                makeAIMove();
            }, 300);
        } else {
            updateGameStatus('Your turn');
        }
    } else {
        updateGameStatus(`Player ${currentPlayer}'s turn`);
    }
    
    setColumnsDisabled(svgElement, false);
}

/**
 * Makes AI move
 */
async function makeAIMove() {
    if (!isGameActive || isAnimating || currentPlayer !== 2) {
        return;
    }
    
    isAnimating = true;
    setColumnsDisabled(svgElement, true);
    
    // Update AI face to thinking
    const thinkingFace = updateAIFace({ event: 'thinking' });
    updateAIFaceDisplay(thinkingFace.emoji, thinkingFace.text);
    consoleLog(LOG_TYPES.AI, 'AI is thinking...');
    playAIThinking();
    
    // Simulate thinking delay
    await simulateThinkingDelay();
    
    // Get AI move
    const aiCol = getAIMove(currentBoard, aiDifficulty, 2);
    
    if (aiCol === -1 || isColumnFull(currentBoard, aiCol)) {
        consoleLog(LOG_TYPES.ERROR, 'AI selected invalid move!');
        isAnimating = false;
        setColumnsDisabled(svgElement, false);
        return;
    }
    
    // Save state for undo
    undoStack.push({
        board: cloneBoard(currentBoard),
        player: currentPlayer,
        moveHistoryLength: moveHistory.length
    });
    
    // Drop disc
    const result = dropDisc(currentBoard, aiCol, 2);
    
    if (!result.success) {
        isAnimating = false;
        setColumnsDisabled(svgElement, false);
        return;
    }
    
    // Get AI reaction
    const aiReaction = updateAIFace({ event: 'happy' });
    updateAIFaceDisplay(aiReaction.emoji, aiReaction.text);
    
    // Log move
    consoleLog(LOG_TYPES.AI, `AI dropped disc in column ${aiCol + 1} - ${aiReaction.text}`);
    
    // Play drop sound
    playDiscDrop();
    
    // Render with animation
    renderDiscs(svgElement, currentBoard, {
        animateNew: true,
        newDiscRow: result.row,
        newDiscCol: aiCol
    });
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Create move object with AI face/text (BEFORE checking win, so winning move is included)
    const moveNumber = moveHistory.length + 1;
    const moveObj = createMoveObject(
        moveNumber,
        2,
        aiCol,
        result.row,
        aiReaction.emoji,
        aiReaction.text,
        cloneBoard(currentBoard)
    );
    moveHistory.push(moveObj);
    
    // Check for win
    const winCheck = checkWin(currentBoard, result.row, aiCol, 2);
    
    if (winCheck.win) {
        // AI won
        const winFace = updateAIFace({ event: 'smug' });
        updateAIFaceDisplay(winFace.emoji, winFace.text);
        handleGameOver(2, winCheck.line);
        isAnimating = false;
        return;
    }
    
    // Check for draw
    if (isBoardFull(currentBoard)) {
        const drawFace = updateAIFace({ event: 'draw' });
        updateAIFaceDisplay(drawFace.emoji, drawFace.text);
        handleGameOver(null, []);
        isAnimating = false;
        return;
    }
    
    // Switch to player
    currentPlayer = 1;
    updateGameStatus('Your turn');
    
    isAnimating = false;
    setColumnsDisabled(svgElement, false);
}

/**
 * Handles game over
 */
function handleGameOver(winner, winningLine) {
    isGameActive = false;
    isAnimating = true;
    setColumnsDisabled(svgElement, true);
    
    // Highlight winning line
    if (winningLine.length > 0) {
        highlightWinningLine(svgElement, winningLine);
    }
    
    // Update status
    let statusText = '';
    if (winner === null) {
        statusText = 'Draw game!';
        consoleLog(LOG_TYPES.INFO, 'Game ended in a draw');
        playDraw();
    } else if (winner === 1) {
        statusText = 'Player 1 wins!';
        consoleLog(LOG_TYPES.SUCCESS, 'Player 1 wins!');
        playWin();
        
        if (gameMode === 'ai') {
            const sadFace = updateAIFace({ event: 'sad' });
            updateAIFaceDisplay(sadFace.emoji, sadFace.text);
        }
    } else {
        statusText = gameMode === 'ai' ? 'AI wins!' : 'Player 2 wins!';
        consoleLog(LOG_TYPES.SUCCESS, statusText);
        
        if (gameMode === 'ai') {
            playLose();
        } else {
            playWin();
        }
    }
    
    updateGameStatus(statusText);
    
    // Save game to history
    const historyItem = {
        id: currentGameId,
        timestamp: currentGameStartTime,
        mode: gameMode,
        difficulty: aiDifficulty,
        playerOrder: playerOrder,
        moves: [...moveHistory],
        finalBoard: cloneBoard(currentBoard),
        winner: winner
    };
    
    saveGame(historyItem);
    consoleLog(LOG_TYPES.INFO, 'Game saved to history');
    
    // Refresh history display
    renderHistory();
    
    // Disable undo
    const btnUndo = document.getElementById('btn-undo');
    if (btnUndo) {
        btnUndo.disabled = true;
    }
    
    isAnimating = false;
}

/**
 * Handles undo
 */
function handleUndo() {
    if (!isGameActive || isAnimating || undoStack.length === 0) {
        return;
    }
    
    const lastState = undoStack.pop();
    currentBoard = lastState.board;
    currentPlayer = lastState.player;
    moveHistory = moveHistory.slice(0, lastState.moveHistoryLength);
    
    // Re-render board
    renderDiscs(svgElement, currentBoard);
    
    consoleLog(LOG_TYPES.INFO, 'Move undone');
    
    // Update status
    if (gameMode === 'ai') {
        updateGameStatus(currentPlayer === 1 ? 'Your turn' : 'AI thinking...');
    } else {
        updateGameStatus(`Player ${currentPlayer}'s turn`);
    }
}

/**
 * Toggles console visibility
 */
function toggleConsole() {
    const consolePanel = document.getElementById('console-panel');
    const btnToggle = document.getElementById('btn-toggle-console');
    
    if (consolePanel && btnToggle) {
        const isVisible = consolePanel.style.display !== 'none';
        consolePanel.style.display = isVisible ? 'none' : 'flex';
        btnToggle.textContent = isVisible ? 'Show Console' : 'Hide Console';
    }
}

/**
 * Toggles history panel visibility
 */
function toggleHistory() {
    const historyPanel = document.getElementById('history-panel');
    const btnToggle = document.getElementById('btn-toggle-history');
    
    if (historyPanel && btnToggle) {
        const isVisible = historyPanel.style.display !== 'none';
        historyPanel.style.display = isVisible ? 'none' : 'block';
        btnToggle.textContent = isVisible ? 'History' : 'Hide History';
    }
}

/**
 * Renders game history list
 */
function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const games = getAllGames();
    const recentGames = games.slice(-20).reverse(); // Last 20, newest first
    
    historyList.innerHTML = '';
    
    if (recentGames.length === 0) {
        historyList.innerHTML = '<p>No games played yet.</p>';
        return;
    }
    
    recentGames.forEach(game => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-item-header">
                <strong>${formatGameSummary(game)}</strong>
                <button class="btn btn-small replay-btn" data-game-id="${game.id}">Replay</button>
            </div>
            <div class="history-item-details">
                <p>Mode: ${game.mode} | Difficulty: ${game.difficulty} | Moves: ${game.moves.length}</p>
            </div>
        `;
        
        // Expand on click
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('replay-btn')) {
                item.classList.toggle('expanded');
            }
        });
        
        // Replay button
        const replayBtn = item.querySelector('.replay-btn');
        if (replayBtn) {
            replayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startReplay(game.id);
            });
        }
        
        historyList.appendChild(item);
    });
}

/**
 * Starts replay of a game
 */
function startReplay(gameId) {
    const replayModal = document.getElementById('replay-modal');
    const replayBoardContainer = document.getElementById('replay-board-container');
    const replayTimeline = document.getElementById('replay-timeline');
    
    if (!replayModal || !replayBoardContainer) return;
    
    replayModal.style.display = 'flex';
    
    // Clear containers
    replayBoardContainer.innerHTML = '';
    replayTimeline.innerHTML = '';
    
    // Create replay board
    const replaySvg = createBoardSVG(replayBoardContainer, () => {});
    setColumnsDisabled(replaySvg, true);
    
    let currentStep = 0;
    let isPlaying = false;
    let replaySpeed = 1.0;
    let replayTimeout = null;
    
    // Replay controls
    const btnPlay = document.getElementById('btn-replay-play');
    const btnPrev = document.getElementById('btn-replay-prev');
    const btnNext = document.getElementById('btn-replay-next');
    const speedSlider = document.getElementById('replay-speed');
    const speedValue = document.getElementById('replay-speed-value');
    const btnClose = document.getElementById('btn-close-replay');
    
    const game = getAllGames().find(g => g.id === gameId);
    if (!game) return;
    
    // Build timeline
    game.moves.forEach((move, index) => {
        const moveBtn = document.createElement('div');
        moveBtn.className = `timeline-move ${move.player === 1 ? 'player1' : 'player2'}`;
        moveBtn.textContent = index + 1;
        moveBtn.setAttribute('data-move-index', index);
        moveBtn.addEventListener('click', () => {
            currentStep = index;
            updateReplayDisplay();
        });
        replayTimeline.appendChild(moveBtn);
    });
    
    // Update replay display
    function updateReplayDisplay() {
        // Rebuild board to current step
        let board = createBoard();
        for (let i = 0; i <= currentStep && i < game.moves.length; i++) {
            const move = game.moves[i];
            board[move.row][move.column] = move.player;
        }
        
        renderDiscs(replaySvg, board);
        
        // Update timeline
        document.querySelectorAll('.timeline-move').forEach((btn, idx) => {
            btn.classList.toggle('active', idx === currentStep);
        });
        
        // Update AI face if it's an AI move
        if (currentStep < game.moves.length) {
            const move = game.moves[currentStep];
            if (move.aiFace && move.aiText) {
                updateAIFaceDisplay(move.aiFace, move.aiText);
            }
        }
    }
    
    // Play/pause
    function togglePlay() {
        isPlaying = !isPlaying;
        btnPlay.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
        
        if (isPlaying) {
            playNext();
        } else {
            if (replayTimeout) {
                clearTimeout(replayTimeout);
            }
        }
    }
    
    function playNext() {
        if (!isPlaying) return;
        
        if (currentStep < game.moves.length - 1) {
            currentStep++;
            updateReplayDisplay();
            replayTimeout = setTimeout(playNext, 1000 / replaySpeed);
        } else {
            isPlaying = false;
            btnPlay.textContent = '▶ Play';
        }
    }
    
    btnPlay.addEventListener('click', togglePlay);
    btnPrev.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateReplayDisplay();
        }
    });
    btnNext.addEventListener('click', () => {
        if (currentStep < game.moves.length - 1) {
            currentStep++;
            updateReplayDisplay();
        }
    });
    
    speedSlider.addEventListener('input', (e) => {
        replaySpeed = parseFloat(e.target.value);
        speedValue.textContent = `${replaySpeed.toFixed(1)}×`;
    });
    
    btnClose.addEventListener('click', () => {
        replayModal.style.display = 'none';
        isPlaying = false;
        if (replayTimeout) {
            clearTimeout(replayTimeout);
        }
    });
    
    // Initial display
    updateReplayDisplay();
}

/**
 * Handles clear history
 */
function handleClearHistory() {
    if (confirm('Are you sure you want to clear all game history?')) {
        clearHistory();
        renderHistory();
        consoleLog(LOG_TYPES.INFO, 'Game history cleared');
    }
}


// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

