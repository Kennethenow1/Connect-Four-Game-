/**
 * ai.js - AI opponent implementation with multiple difficulty levels
 * 
 * Provides AI move generation for three difficulty levels:
 * - Easy: Random valid moves
 * - Medium: Greedy algorithm (win/block + center preference)
 * - Hard: Minimax with alpha-beta pruning
 * 
 * Also manages AI face expressions and reactions to game events.
 */

import {
    getAvailableMoves,
    dropDisc,
    checkWin,
    evaluateBoard,
    cloneBoard,
    ROWS,
    COLS
} from './board.js';

/**
 * Gets AI move based on difficulty level
 * Always returns a legal column (never returns invalid move)
 * 
 * @param {number[][]} board - Current board state
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {number} aiPlayer - Player number for AI (1 or 2)
 * @returns {number} Column index to play (guaranteed to be legal)
 */
export function getAIMove(board, difficulty, aiPlayer) {
    const availableMoves = getAvailableMoves(board);
    
    // Safety check: if no moves available, return -1 (shouldn't happen)
    if (availableMoves.length === 0) {
        return -1;
    }
    
    switch (difficulty) {
        case 'easy':
            return getEasyMove(availableMoves);
        case 'medium':
            return getMediumMove(board, availableMoves, aiPlayer);
        case 'hard':
            return getHardMove(board, availableMoves, aiPlayer);
        default:
            return getEasyMove(availableMoves);
    }
}

/**
 * Easy AI: Random move selection
 * @param {number[]} availableMoves - Array of legal column indices
 * @returns {number} Random column index
 */
function getEasyMove(availableMoves) {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
}

/**
 * Medium AI: Greedy algorithm
 * Priority order:
 * 1. Win immediately if possible
 * 2. Block opponent from winning
 * 3. Prefer center columns
 * 4. Otherwise random
 * 
 * @param {number[][]} board - Current board state
 * @param {number[]} availableMoves - Legal column indices
 * @param {number} aiPlayer - AI player number
 * @returns {number} Best column index
 */
function getMediumMove(board, availableMoves, aiPlayer) {
    const opponent = aiPlayer === 1 ? 2 : 1;
    
    // 1. Check for winning move
    for (const col of availableMoves) {
        const testBoard = cloneBoard(board);
        const result = dropDisc(testBoard, col, aiPlayer);
        if (result.success) {
            const winCheck = checkWin(testBoard, result.row, col, aiPlayer);
            if (winCheck.win) {
                return col; // Win immediately
            }
        }
    }
    
    // 2. Check for blocking opponent's winning move
    for (const col of availableMoves) {
        const testBoard = cloneBoard(board);
        const result = dropDisc(testBoard, col, opponent);
        if (result.success) {
            const winCheck = checkWin(testBoard, result.row, col, opponent);
            if (winCheck.win) {
                return col; // Block opponent
            }
        }
    }
    
    // 3. Prefer center columns (columns 3, 2, 4, 1, 5, 0, 6)
    const centerOrder = [3, 2, 4, 1, 5, 0, 6];
    for (const col of centerOrder) {
        if (availableMoves.includes(col)) {
            return col;
        }
    }
    
    // 4. Fallback to random (shouldn't reach here, but safety)
    return getEasyMove(availableMoves);
}

/**
 * Hard AI: Minimax with alpha-beta pruning
 * Searches game tree to find optimal move
 * 
 * @param {number[][]} board - Current board state
 * @param {number[]} availableMoves - Legal column indices
 * @param {number} aiPlayer - AI player number
 * @param {number} depth - Search depth (default 5)
 * @returns {number} Best column index
 */
function getHardMove(board, availableMoves, aiPlayer, depth = 5) {
    const opponent = aiPlayer === 1 ? 2 : 1;
    let bestScore = -Infinity;
    let bestMove = availableMoves[0]; // Default to first available
    
    // Try each available move and evaluate with minimax
    for (const col of availableMoves) {
        const testBoard = cloneBoard(board);
        const result = dropDisc(testBoard, col, aiPlayer);
        
        if (!result.success) continue;
        
        // Evaluate this move
        const score = minimax(
            testBoard,
            depth - 1,
            false, // AI just moved, so opponent's turn
            aiPlayer,
            opponent,
            -Infinity,
            Infinity
        );
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = col;
        }
    }
    
    return bestMove;
}

/**
 * Minimax algorithm with alpha-beta pruning
 * Recursively evaluates game tree to find optimal move
 * 
 * @param {number[][]} board - Current board state
 * @param {number} depth - Remaining search depth
 * @param {boolean} isMaximizing - True if maximizing player's turn
 * @param {number} aiPlayer - AI player number
 * @param {number} opponent - Opponent player number
 * @param {number} alpha - Alpha value for pruning
 * @param {number} beta - Beta value for pruning
 * @returns {number} Evaluation score
 */
function minimax(board, depth, isMaximizing, aiPlayer, opponent, alpha, beta) {
    // Terminal conditions
    if (depth === 0) {
        return evaluateBoard(board, aiPlayer);
    }
    
    // Check for wins/losses
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === aiPlayer) {
                const winCheck = checkWin(board, row, col, aiPlayer);
                if (winCheck.win) {
                    return 10000 + depth; // Prefer faster wins
                }
            }
            if (board[row][col] === opponent) {
                const winCheck = checkWin(board, row, col, opponent);
                if (winCheck.win) {
                    return -10000 - depth; // Avoid faster losses
                }
            }
        }
    }
    
    const availableMoves = getAvailableMoves(board);
    
    // Draw condition
    if (availableMoves.length === 0) {
        return 0; // Draw
    }
    
    if (isMaximizing) {
        // AI's turn: maximize score
        let maxScore = -Infinity;
        
        for (const col of availableMoves) {
            const testBoard = cloneBoard(board);
            const result = dropDisc(testBoard, col, aiPlayer);
            
            if (!result.success) continue;
            
            const score = minimax(testBoard, depth - 1, false, aiPlayer, opponent, alpha, beta);
            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            
            // Alpha-beta pruning
            if (beta <= alpha) {
                break;
            }
        }
        
        return maxScore;
    } else {
        // Opponent's turn: minimize score
        let minScore = Infinity;
        
        for (const col of availableMoves) {
            const testBoard = cloneBoard(board);
            const result = dropDisc(testBoard, col, opponent);
            
            if (!result.success) continue;
            
            const score = minimax(testBoard, depth - 1, true, aiPlayer, opponent, alpha, beta);
            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            
            // Alpha-beta pruning
            if (beta <= alpha) {
                break;
            }
        }
        
        return minScore;
    }
}

/**
 * AI Face emotion states and text variations
 */
const AI_EMOTIONS = {
    neutral: {
        emoji: '😐',
        texts: ["Let's play.", "Ready when you are.", "Your move.", "I'm ready."]
    },
    thinking: {
        emoji: '🤔',
        texts: ["Thinking...", "Let me see...", "Hmm...", "Calculating..."]
    },
    happy: {
        emoji: '😄',
        texts: ["Nice move!", "Good play!", "Interesting!", "I like this!"]
    },
    frustrated: {
        emoji: '😤',
        texts: ["Oof, nice block!", "You got me!", "Almost had it!", "Not fair!"]
    },
    smug: {
        emoji: '😎',
        texts: ["Victory!", "I win!", "Too easy!", "Checkmate!"]
    },
    sad: {
        emoji: '😢',
        texts: ["You got me!", "Well played!", "I lost...", "Good game!"]
    },
    draw: {
        emoji: '😶',
        texts: ["A tie.", "Draw game.", "Even match.", "Nobody wins."]
    }
};

/**
 * Updates AI face based on game event
 * Returns emoji and text to display
 * 
 * @param {Object} params - Event parameters
 * @param {string} params.event - Event type: 'neutral', 'thinking', 'happy', 'frustrated', 'smug', 'sad', 'draw'
 * @param {string} [params.customText] - Optional custom text override
 * @param {number} [params.aiScoreChange] - Score change for AI (positive = good, negative = bad)
 * @returns {{emoji: string, text: string}} Face emoji and text
 */
export function updateAIFace({ event, customText, aiScoreChange }) {
    const emotion = AI_EMOTIONS[event] || AI_EMOTIONS.neutral;
    
    let text = customText;
    if (!text) {
        // Pick random text from emotion's text array
        const texts = emotion.texts;
        text = texts[Math.floor(Math.random() * texts.length)];
    }
    
    // Adjust emotion based on score change if provided
    if (aiScoreChange !== undefined) {
        if (aiScoreChange > 50 && event === 'thinking') {
            // AI gained significant advantage
            return {
                emoji: AI_EMOTIONS.happy.emoji,
                text: AI_EMOTIONS.happy.texts[Math.floor(Math.random() * AI_EMOTIONS.happy.texts.length)]
            };
        } else if (aiScoreChange < -50 && event === 'thinking') {
            // AI lost significant advantage
            return {
                emoji: AI_EMOTIONS.frustrated.emoji,
                text: AI_EMOTIONS.frustrated.texts[Math.floor(Math.random() * AI_EMOTIONS.frustrated.texts.length)]
            };
        }
    }
    
    return {
        emoji: emotion.emoji,
        text: text
    };
}

/**
 * Simulates AI thinking delay
 * Returns a promise that resolves after random delay (500-1000ms)
 * 
 * @param {Function} onThinking - Callback to call during thinking (for UI updates)
 * @returns {Promise<void>} Promise that resolves after delay
 */
export function simulateThinkingDelay(onThinking) {
    const delay = 500 + Math.random() * 500; // 500-1000ms
    
    if (onThinking) {
        onThinking();
    }
    
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}


