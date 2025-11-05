/**
 * board.test.js - Vitest tests for board.js module
 * 
 * Tests core game logic including move validation, win detection,
 * and board state management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    createBoard,
    cloneBoard,
    dropDisc,
    checkWin,
    isColumnFull,
    isBoardFull,
    getAvailableMoves,
    getLowestEmptyRow,
    ROWS,
    COLS
} from '../board.js';

describe('Board Creation', () => {
    it('should create an empty 6x7 board', () => {
        const board = createBoard();
        expect(board.length).toBe(ROWS);
        expect(board[0].length).toBe(COLS);
        expect(board.every(row => row.every(cell => cell === 0))).toBe(true);
    });
    
    it('should clone board without mutation', () => {
        const board = createBoard();
        const cloned = cloneBoard(board);
        cloned[0][0] = 1;
        expect(board[0][0]).toBe(0);
    });
});

describe('getLowestEmptyRow', () => {
    let board;
    
    beforeEach(() => {
        board = createBoard();
    });
    
    it('should return bottom row (5) for empty column', () => {
        expect(getLowestEmptyRow(board, 0)).toBe(ROWS - 1);
    });
    
    it('should return correct row after drops', () => {
        board[5][0] = 1; // Drop in column 0
        expect(getLowestEmptyRow(board, 0)).toBe(4);
        
        board[4][0] = 1;
        expect(getLowestEmptyRow(board, 0)).toBe(3);
    });
    
    it('should return -1 for full column', () => {
        // Fill column 0
        for (let row = 0; row < ROWS; row++) {
            board[row][0] = 1;
        }
        expect(getLowestEmptyRow(board, 0)).toBe(-1);
    });
    
    it('should return -1 for invalid column', () => {
        expect(getLowestEmptyRow(board, -1)).toBe(-1);
        expect(getLowestEmptyRow(board, COLS)).toBe(-1);
    });
});

describe('dropDisc', () => {
    let board;
    
    beforeEach(() => {
        board = createBoard();
    });
    
    it('should drop disc in empty column', () => {
        const result = dropDisc(board, 0, 1);
        expect(result.success).toBe(true);
        expect(result.row).toBe(ROWS - 1);
        expect(board[ROWS - 1][0]).toBe(1);
    });
    
    it('should drop disc on top of existing disc', () => {
        dropDisc(board, 0, 1);
        const result = dropDisc(board, 0, 2);
        expect(result.success).toBe(true);
        expect(result.row).toBe(ROWS - 2);
        expect(board[ROWS - 2][0]).toBe(2);
    });
    
    it('should fail on full column', () => {
        // Fill column 0
        for (let row = 0; row < ROWS; row++) {
            board[row][0] = 1;
        }
        const result = dropDisc(board, 0, 2);
        expect(result.success).toBe(false);
        expect(result.row).toBe(-1);
    });
});

describe('isColumnFull', () => {
    let board;
    
    beforeEach(() => {
        board = createBoard();
    });
    
    it('should return false for empty column', () => {
        expect(isColumnFull(board, 0)).toBe(false);
    });
    
    it('should return true when top cell is occupied', () => {
        board[0][0] = 1;
        expect(isColumnFull(board, 0)).toBe(true);
    });
    
    it('should return false when only bottom cells are occupied', () => {
        board[5][0] = 1;
        expect(isColumnFull(board, 0)).toBe(false);
    });
});

describe('isBoardFull', () => {
    let board;
    
    beforeEach(() => {
        board = createBoard();
    });
    
    it('should return false for empty board', () => {
        expect(isBoardFull(board)).toBe(false);
    });
    
    it('should return true when all top cells are occupied', () => {
        for (let col = 0; col < COLS; col++) {
            board[0][col] = 1;
        }
        expect(isBoardFull(board)).toBe(true);
    });
    
    it('should return false when some columns are not full', () => {
        for (let col = 0; col < COLS - 1; col++) {
            board[0][col] = 1;
        }
        expect(isBoardFull(board)).toBe(false);
    });
});

describe('getAvailableMoves', () => {
    let board;
    
    beforeEach(() => {
        board = createBoard();
    });
    
    it('should return all columns for empty board', () => {
        const moves = getAvailableMoves(board);
        expect(moves.length).toBe(COLS);
        expect(moves).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
    
    it('should exclude full columns', () => {
        board[0][0] = 1; // Fill column 0
        board[0][3] = 1; // Fill column 3
        const moves = getAvailableMoves(board);
        expect(moves.length).toBe(COLS - 2);
        expect(moves).not.toContain(0);
        expect(moves).not.toContain(3);
    });
    
    it('should return empty array for full board', () => {
        for (let col = 0; col < COLS; col++) {
            board[0][col] = 1;
        }
        const moves = getAvailableMoves(board);
        expect(moves.length).toBe(0);
    });
});

describe('checkWin', () => {
    let board;
    
    beforeEach(() => {
        board = createBoard();
    });
    
    it('should detect horizontal win', () => {
        // Create horizontal win in row 5
        board[5][0] = 1;
        board[5][1] = 1;
        board[5][2] = 1;
        board[5][3] = 1;
        
        const result = checkWin(board, 5, 0, 1);
        expect(result.win).toBe(true);
        expect(result.line.length).toBe(4);
    });
    
    it('should detect vertical win', () => {
        // Create vertical win in column 0
        board[5][0] = 1;
        board[4][0] = 1;
        board[3][0] = 1;
        board[2][0] = 1;
        
        const result = checkWin(board, 5, 0, 1);
        expect(result.win).toBe(true);
        expect(result.line.length).toBe(4);
    });
    
    it('should detect diagonal down-right win', () => {
        // Create diagonal win
        board[5][0] = 1;
        board[4][1] = 1;
        board[3][2] = 1;
        board[2][3] = 1;
        
        const result = checkWin(board, 5, 0, 1);
        expect(result.win).toBe(true);
        expect(result.line.length).toBe(4);
    });
    
    it('should detect diagonal down-left win', () => {
        // Create diagonal win (down-left)
        board[5][3] = 1;
        board[4][2] = 1;
        board[3][1] = 1;
        board[2][0] = 1;
        
        const result = checkWin(board, 5, 3, 1);
        expect(result.win).toBe(true);
        expect(result.line.length).toBe(4);
    });
    
    it('should not detect win with only 3 in a row', () => {
        board[5][0] = 1;
        board[5][1] = 1;
        board[5][2] = 1;
        
        const result = checkWin(board, 5, 0, 1);
        expect(result.win).toBe(false);
    });
    
    it('should not detect win for wrong player', () => {
        board[5][0] = 1;
        board[5][1] = 1;
        board[5][2] = 1;
        board[5][3] = 1;
        
        const result = checkWin(board, 5, 0, 2);
        expect(result.win).toBe(false);
    });
    
    it('should detect win from middle of line', () => {
        // Win line: columns 1,2,3,4
        board[5][1] = 1;
        board[5][2] = 1;
        board[5][3] = 1;
        board[5][4] = 1;
        
        // Check from middle position
        const result = checkWin(board, 5, 2, 1);
        expect(result.win).toBe(true);
    });
    
    it('should handle edge cases at board boundaries', () => {
        // Win at top-left
        board[0][0] = 1;
        board[0][1] = 1;
        board[0][2] = 1;
        board[0][3] = 1;
        
        const result = checkWin(board, 0, 0, 1);
        expect(result.win).toBe(true);
        
        // Win at bottom-right
        board[5][3] = 1;
        board[5][4] = 1;
        board[5][5] = 1;
        board[5][6] = 1;
        
        const result2 = checkWin(board, 5, 6, 1);
        expect(result2.win).toBe(true);
    });
});

describe('Integration: Full Game Flow', () => {
    it('should handle a complete game scenario', () => {
        const board = createBoard();
        
        // Player 1 drops in column 3
        dropDisc(board, 3, 1);
        expect(getLowestEmptyRow(board, 3)).toBe(4);
        
        // Player 2 drops in column 3
        dropDisc(board, 3, 2);
        expect(getLowestEmptyRow(board, 3)).toBe(3);
        
        // Fill column 3 to top
        dropDisc(board, 3, 1);
        dropDisc(board, 3, 2);
        dropDisc(board, 3, 1);
        dropDisc(board, 3, 2);
        
        expect(isColumnFull(board, 3)).toBe(true);
        expect(getAvailableMoves(board).length).toBe(COLS - 1);
    });
    
    it('should detect win after multiple moves', () => {
        const board = createBoard();
        
        // Player 1 creates horizontal win
        dropDisc(board, 0, 1);
        dropDisc(board, 1, 1);
        dropDisc(board, 2, 1);
        const result = dropDisc(board, 3, 1);
        
        const winCheck = checkWin(board, result.row, 3, 1);
        expect(winCheck.win).toBe(true);
    });
});


