/**
 * board.js - Core Connect Four game board logic
 * 
 * This module provides all functions for managing the game board state,
 * validating moves, detecting wins, and evaluating board positions.
 * All functions work with a 2D array representation where:
 * - 0 = empty cell
 * - 1 = Player 1 (Red)
 * - 2 = Player 2 / AI (Yellow)
 * 
 * Board indexing: [row][col] where row 0 is top, row ROWS-1 is bottom.
 * Gravity works bottom-up: discs fall to the lowest empty row in a column.
 */

const ROWS = 6;
const COLS = 7;
const WIN_LENGTH = 4;

/**
 * Creates a new empty board (2D array)
 * @returns {number[][]} 6x7 array filled with zeros
 */
export function createBoard() {
    return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

/**
 * Creates a deep copy of the board to avoid mutations
 * @param {number[][]} board - Source board
 * @returns {number[][]} Deep copy of board
 */
export function cloneBoard(board) {
    return board.map(row => [...row]);
}

/**
 * Finds the lowest empty row in a column (gravity simulation)
 * Since discs fall down, we check from bottom (ROWS-1) to top (0)
 * Returns -1 if column is full
 * 
 * @param {number[][]} board - Current board state
 * @param {number} col - Column index (0-based)
 * @returns {number} Row index of lowest empty cell, or -1 if column is full
 */
export function getLowestEmptyRow(board, col) {
    // Validate column index
    if (col < 0 || col >= COLS) {
        return -1;
    }
    
    // Check from bottom to top (gravity: discs fall down)
    // Start at ROWS-1 (bottom row) and go up to 0 (top row)
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
            return row;
        }
    }
    
    // Column is full if we didn't find an empty cell
    return -1;
}

/**
 * Drops a disc into the specified column
 * Mutates the board and returns success status and row where disc landed
 * 
 * @param {number[][]} board - Board to modify (will be mutated)
 * @param {number} col - Column index (0-based)
 * @param {number} player - Player number (1 or 2)
 * @returns {{success: boolean, row: number}} Success status and row index
 */
export function dropDisc(board, col, player) {
    const row = getLowestEmptyRow(board, col);
    
    if (row === -1) {
        return { success: false, row: -1 };
    }
    
    // Place disc at the lowest empty row
    board[row][col] = player;
    return { success: true, row };
}

/**
 * Checks if a column is completely full
 * @param {number[][]} board - Current board state
 * @param {number} col - Column index
 * @returns {boolean} True if column is full (top cell is occupied)
 */
export function isColumnFull(board, col) {
    // Column is full if the top cell (row 0) is occupied
    return board[0][col] !== 0;
}

/**
 * Checks if the entire board is full (draw condition)
 * @param {number[][]} board - Current board state
 * @returns {boolean} True if all cells are occupied
 */
export function isBoardFull(board) {
    // Board is full if all top cells are occupied
    return board[0].every(cell => cell !== 0);
}

/**
 * Checks for a winning line starting from a given position
 * Checks horizontal, vertical, and both diagonals
 * 
 * @param {number[][]} board - Current board state
 * @param {number} startRow - Starting row index
 * @param {number} startCol - Starting column index
 * @param {number} player - Player number to check (1 or 2)
 * @returns {{win: boolean, line: number[][]}} Win status and winning line coordinates
 */
export function checkWin(board, startRow, startCol, player) {
    // Directions: [deltaRow, deltaCol]
    const directions = [
        [0, 1],   // Horizontal (right)
        [1, 0],   // Vertical (down)
        [1, 1],   // Diagonal down-right
        [1, -1]   // Diagonal down-left
    ];
    
    for (const [dRow, dCol] of directions) {
        const line = [[startRow, startCol]];
        let count = 1; // Count includes starting position
        
        // Check forward direction
        for (let i = 1; i < WIN_LENGTH; i++) {
            const row = startRow + dRow * i;
            const col = startCol + dCol * i;
            
            // Bounds check: ensure we don't go outside board
            if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
                break;
            }
            
            if (board[row][col] === player) {
                line.push([row, col]);
                count++;
            } else {
                break;
            }
        }
        
        // Check backward direction (only if forward didn't complete the line)
        if (count < WIN_LENGTH) {
            for (let i = 1; i < WIN_LENGTH; i++) {
                const row = startRow - dRow * i;
                const col = startCol - dCol * i;
                
                // Bounds check
                if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
                    break;
                }
                
                if (board[row][col] === player) {
                    line.unshift([row, col]); // Add to beginning
                    count++;
                } else {
                    break;
                }
            }
        }
        
        // Found a winning line
        if (count >= WIN_LENGTH) {
            // Ensure line is exactly WIN_LENGTH (may be longer if checking from middle)
            const winningLine = line.slice(0, WIN_LENGTH);
            return { win: true, line: winningLine };
        }
    }
    
    return { win: false, line: [] };
}

/**
 * Gets all available (non-full) columns where a disc can be dropped
 * @param {number[][]} board - Current board state
 * @returns {number[]} Array of column indices that are not full
 */
export function getAvailableMoves(board) {
    const moves = [];
    for (let col = 0; col < COLS; col++) {
        if (!isColumnFull(board, col)) {
            moves.push(col);
        }
    }
    return moves;
}

/**
 * Evaluates board position for a given player
 * Returns a numeric score: positive = good for player, negative = bad
 * Used by AI minimax algorithm
 * 
 * Heuristic considers:
 * - Immediate wins/losses (highest priority)
 * - Threat detection (3 in a row with open ends)
 * - Center column preference
 * - Connected pieces
 * 
 * @param {number[][]} board - Current board state
 * @param {number} player - Player number to evaluate for (1 or 2)
 * @returns {number} Evaluation score
 */
export function evaluateBoard(board, player) {
    const opponent = player === 1 ? 2 : 1;
    let score = 0;
    
    // Check for immediate win/loss
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === player) {
                const winCheck = checkWin(board, row, col, player);
                if (winCheck.win) {
                    return 10000; // Very high score for win
                }
            }
            if (board[row][col] === opponent) {
                const winCheck = checkWin(board, row, col, opponent);
                if (winCheck.win) {
                    return -10000; // Very low score for loss
                }
            }
        }
    }
    
    // Center column preference (column 3, index 3)
    // Center control is strategically important
    for (let row = 0; row < ROWS; row++) {
        if (board[row][3] === player) {
            score += 3;
        } else if (board[row][3] === opponent) {
            score -= 3;
        }
    }
    
    // Count connected pieces (2s and 3s)
    // Horizontal connections
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 1; col++) {
            if (board[row][col] === player && board[row][col + 1] === player) {
                score += 2;
            }
            if (board[row][col] === opponent && board[row][col + 1] === opponent) {
                score -= 2;
            }
        }
    }
    
    // Vertical connections
    for (let row = 0; row < ROWS - 1; row++) {
        for (let col = 0; col < COLS; col++) {
            if (board[row][col] === player && board[row + 1][col] === player) {
                score += 2;
            }
            if (board[row][col] === opponent && board[row + 1][col] === opponent) {
                score -= 2;
            }
        }
    }
    
    // Diagonal down-right connections
    for (let row = 0; row < ROWS - 1; row++) {
        for (let col = 0; col < COLS - 1; col++) {
            if (board[row][col] === player && board[row + 1][col + 1] === player) {
                score += 2;
            }
            if (board[row][col] === opponent && board[row + 1][col + 1] === opponent) {
                score -= 2;
            }
        }
    }
    
    // Diagonal down-left connections
    for (let row = 0; row < ROWS - 1; row++) {
        for (let col = 1; col < COLS; col++) {
            if (board[row][col] === player && board[row + 1][col - 1] === player) {
                score += 2;
            }
            if (board[row][col] === opponent && board[row + 1][col - 1] === opponent) {
                score -= 2;
            }
        }
    }
    
    return score;
}

/**
 * Prints board as ASCII art for debugging
 * @param {number[][]} board - Board to print
 * @returns {string} ASCII representation
 */
export function printBoard(board) {
    let output = '\n';
    output += '  0 1 2 3 4 5 6\n';
    output += '  -------------\n';
    
    for (let row = 0; row < ROWS; row++) {
        output += `${row}|`;
        for (let col = 0; col < COLS; col++) {
            const cell = board[row][col];
            if (cell === 0) {
                output += ' .';
            } else if (cell === 1) {
                output += ' R'; // Red
            } else {
                output += ' Y'; // Yellow
            }
        }
        output += '\n';
    }
    output += '  -------------\n';
    
    return output;
}

// Export constants for use in other modules
export { ROWS, COLS, WIN_LENGTH };


