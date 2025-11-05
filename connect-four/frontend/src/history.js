/**
 * history.js - Game history and replay system
 * 
 * Manages saving games to localStorage, retrieving history,
 * and replaying games with full animation support.
 */

import { createBoard, cloneBoard } from './board.js';

const STORAGE_KEY = 'connectFourHistory_v1';

/**
 * Saves a completed game to localStorage
 * @param {Object} historyItem - Game data to save
 * @param {string} historyItem.id - Unique game ID
 * @param {number} historyItem.timestamp - Timestamp (ms since epoch)
 * @param {string} historyItem.mode - 'ai' or 'human'
 * @param {string} historyItem.difficulty - AI difficulty ('easy', 'medium', 'hard')
 * @param {string} historyItem.playerOrder - 'player' or 'ai'
 * @param {Object[]} historyItem.moves - Array of move objects
 * @param {number[][]} historyItem.finalBoard - Final board state
 * @param {number|null} historyItem.winner - Winner (1, 2, or null for draw)
 */
export function saveGame(historyItem) {
    try {
        const existing = getAllGames();
        existing.push(historyItem);
        
        // Keep only last 100 games to avoid localStorage overflow
        const trimmed = existing.slice(-100);
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        return true;
    } catch (error) {
        console.error('Failed to save game history:', error);
        return false;
    }
}

/**
 * Retrieves all saved games from localStorage
 * @returns {Object[]} Array of game history items
 */
export function getAllGames() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return [];
        }
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to load game history:', error);
        return [];
    }
}

/**
 * Clears all game history from localStorage
 */
export function clearHistory() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear history:', error);
        return false;
    }
}

/**
 * Gets a specific game by ID
 * @param {string} gameId - Game ID to retrieve
 * @returns {Object|null} Game data or null if not found
 */
export function getGameById(gameId) {
    const games = getAllGames();
    return games.find(game => game.id === gameId) || null;
}

/**
 * Replays a game step by step
 * @param {string} gameId - Game ID to replay
 * @param {Function} onStepCallback - Callback for each step: (stepIndex, move, board) => void
 * @param {number} speedMs - Delay between moves in milliseconds
 * @returns {Promise<void>} Promise that resolves when replay completes
 */
export async function replayGame(gameId, onStepCallback, speedMs = 1000) {
    const game = getGameById(gameId);
    if (!game) {
        throw new Error(`Game ${gameId} not found`);
    }
    
    // Rebuild board from moves
    let board = createBoard();
    let stepIndex = 0;
    let isPaused = false;
    let isStopped = false;
    
    // Store pause/resume controls
    const controls = {
        pause: () => { isPaused = true; },
        resume: () => { isPaused = false; },
        stop: () => { isStopped = true; }
    };
    
    // Expose controls to callback
    if (onStepCallback.setControls) {
        onStepCallback.setControls(controls);
    }
    
    // Initial state
    onStepCallback(0, null, cloneBoard(board), game);
    
    // Step through moves
    for (const move of game.moves) {
        if (isStopped) break;
        
        // Wait if paused
        while (isPaused && !isStopped) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (isStopped) break;
        
        // Apply move to board
        const { column, row, player } = move;
        board[row][column] = player;
        
        stepIndex++;
        onStepCallback(stepIndex, move, cloneBoard(board), game);
        
        // Wait before next move
        await new Promise(resolve => setTimeout(resolve, speedMs));
    }
    
    return controls;
}

/**
 * Creates a move object for history tracking
 * @param {number} turn - Turn number (1-based)
 * @param {number} player - Player number (1 or 2)
 * @param {number} column - Column index
 * @param {number} row - Row index
 * @param {string} aiFace - AI face emoji (if AI move)
 * @param {string} aiText - AI text (if AI move)
 * @param {number[][]} boardSnapshot - Board state after move
 * @returns {Object} Move object
 */
export function createMoveObject(turn, player, column, row, aiFace = null, aiText = null, boardSnapshot = null) {
    return {
        turn,
        player,
        column,
        row,
        aiFace: aiFace || null,
        aiText: aiText || null,
        boardSnapshot: boardSnapshot ? cloneBoard(boardSnapshot) : null,
        timestamp: Date.now()
    };
}

/**
 * Generates a unique game ID
 * @returns {string} Unique game ID
 */
export function generateGameId() {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats game summary for display
 * @param {Object} game - Game object
 * @returns {string} Formatted summary
 */
export function formatGameSummary(game) {
    const date = new Date(game.timestamp);
    const winnerText = game.winner === null ? 'Draw' : game.winner === 1 ? 'Player 1' : 'Player 2';
    return `${date.toLocaleString()} - ${game.mode} - ${winnerText} - ${game.moves.length} moves`;
}


