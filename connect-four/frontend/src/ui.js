/**
 * ui.js - UI rendering and interaction handling
 * 
 * Manages SVG board rendering, disc animations, column interactions,
 * keyboard navigation, and visual feedback.
 */

import { ROWS, COLS } from './board.js';

const DISC_RADIUS = 35;
const COLUMN_WIDTH = 100;
const ROW_HEIGHT = 85;
const BOARD_PADDING = 20;
const BOARD_WIDTH = COLS * COLUMN_WIDTH + BOARD_PADDING * 2;
const BOARD_HEIGHT = ROWS * ROW_HEIGHT + BOARD_PADDING * 2;

/**
 * Creates SVG board and sets up click handlers
 * @param {HTMLElement} containerEl - Container element for board
 * @param {Function} onColumnClick - Callback when column is clicked (col) => void
 * @returns {SVGElement} The created SVG element
 */
export function createBoardSVG(containerEl, onColumnClick) {
    // Clear container
    containerEl.innerHTML = '';
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', BOARD_WIDTH);
    svg.setAttribute('height', BOARD_HEIGHT);
    svg.setAttribute('viewBox', `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`);
    svg.classList.add('board-svg');
    
    // Create board background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', BOARD_WIDTH);
    bg.setAttribute('height', BOARD_HEIGHT);
    bg.setAttribute('stroke-width', '3');
    bg.classList.add('board-bg');
    svg.appendChild(bg);
    
    // Create board cells (holes)
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cellX = BOARD_PADDING + col * COLUMN_WIDTH + COLUMN_WIDTH / 2;
            const cellY = BOARD_PADDING + row * ROW_HEIGHT + ROW_HEIGHT / 2;
            
            // Cell background (hole)
            const cell = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            cell.setAttribute('cx', cellX);
            cell.setAttribute('cy', cellY);
            cell.setAttribute('r', DISC_RADIUS + 2);
            cell.setAttribute('stroke-width', '2');
            cell.classList.add('board-cell');
            svg.appendChild(cell);
        }
    }
    
    // Create clickable column zones (invisible rectangles)
    for (let col = 0; col < COLS; col++) {
        const zone = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        zone.setAttribute('x', BOARD_PADDING + col * COLUMN_WIDTH);
        zone.setAttribute('y', 0);
        zone.setAttribute('width', COLUMN_WIDTH);
        zone.setAttribute('height', BOARD_HEIGHT);
        zone.setAttribute('fill', 'transparent');
        zone.setAttribute('cursor', 'pointer');
        zone.classList.add('column-zone');
        zone.setAttribute('data-column', col);
        zone.setAttribute('aria-label', `Column ${col + 1}`);
        
        zone.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!zone.classList.contains('disabled')) {
                onColumnClick(col);
            }
        });
        
        svg.appendChild(zone);
    }
    
    containerEl.appendChild(svg);
    return svg;
}

/**
 * Renders all discs on the board with optional animation
 * @param {SVGElement} svgEl - SVG element containing board
 * @param {number[][]} board - Current board state
 * @param {Object} animationOptions - Animation options
 * @param {boolean} [animationOptions.animateNew] - Animate newly placed discs
 * @param {number} [animationOptions.newDiscRow] - Row of new disc to animate
 * @param {number} [animationOptions.newDiscCol] - Column of new disc to animate
 */
export function renderDiscs(svgEl, board, animationOptions = {}) {
    // Remove existing discs (but keep board structure)
    const existingDiscs = svgEl.querySelectorAll('.disc');
    existingDiscs.forEach(disc => disc.remove());
    
    // Render all discs
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const player = board[row][col];
            if (player !== 0) {
                const cellX = BOARD_PADDING + col * COLUMN_WIDTH + COLUMN_WIDTH / 2;
                const cellY = BOARD_PADDING + row * ROW_HEIGHT + ROW_HEIGHT / 2;
                
                const disc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                disc.setAttribute('cx', cellX);
                disc.setAttribute('cy', cellY);
                disc.setAttribute('r', DISC_RADIUS);
                disc.setAttribute('data-row', row);
                disc.setAttribute('data-col', col);
                
                // Set color based on player
                if (player === 1) {
                    disc.setAttribute('fill', '#e63946');
                    disc.classList.add('player1-disc');
                } else {
                    disc.setAttribute('fill', '#ffd60a');
                    disc.classList.add('player2-disc');
                }
                
                disc.setAttribute('stroke', '#000');
                disc.setAttribute('stroke-width', '2');
                disc.classList.add('disc');
                
                // Animate new disc drop
                if (animationOptions.animateNew && 
                    row === animationOptions.newDiscRow && 
                    col === animationOptions.newDiscCol) {
                    // Start disc at top of column
                    const startY = BOARD_PADDING - DISC_RADIUS;
                    disc.setAttribute('cy', startY);
                    disc.classList.add('dropping');
                    
                    // Use requestAnimationFrame for smooth animation
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            disc.setAttribute('cy', cellY);
                        });
                    });
                } else {
                    disc.setAttribute('cy', cellY);
                }
                
                svgEl.appendChild(disc);
            }
        }
    }
}

/**
 * Highlights winning line with pulsing animation
 * @param {SVGElement} svgEl - SVG element containing board
 * @param {number[][]} line - Array of [row, col] coordinates for winning line
 */
export function highlightWinningLine(svgEl, line) {
    // Remove existing highlights
    const existingHighlights = svgEl.querySelectorAll('.winning-disc');
    existingHighlights.forEach(el => el.remove());
    
    // Add winning class to discs in winning line
    line.forEach(([row, col]) => {
        const disc = svgEl.querySelector(`.disc[data-row="${row}"][data-col="${col}"]`);
        if (disc) {
            disc.classList.add('winning');
            disc.classList.add('winning-disc');
        }
    });
}

/**
 * Computes column index from client X coordinate
 * Used for keyboard navigation and precise click detection
 * @param {SVGElement} svgEl - SVG element
 * @param {number} clientX - Mouse/client X coordinate
 * @returns {number} Column index (0-based) or -1 if outside board
 */
export function getColFromClientX(svgEl, clientX) {
    const rect = svgEl.getBoundingClientRect();
    const svgX = clientX - rect.left;
    
    // Check bounds
    if (svgX < BOARD_PADDING || svgX > BOARD_WIDTH - BOARD_PADDING) {
        return -1;
    }
    
    // Calculate column
    const relativeX = svgX - BOARD_PADDING;
    const col = Math.floor(relativeX / COLUMN_WIDTH);
    
    // Validate column index
    if (col >= 0 && col < COLS) {
        return col;
    }
    
    return -1;
}

/**
 * Updates column hover state for keyboard navigation
 * @param {SVGElement} svgEl - SVG element
 * @param {number} col - Column index to highlight, or -1 to clear
 */
export function highlightColumn(svgEl, col) {
    // Remove existing highlights
    const zones = svgEl.querySelectorAll('.column-zone');
    zones.forEach(zone => {
        zone.classList.remove('keyboard-focus');
    });
    
    // Add highlight to specified column
    if (col >= 0 && col < COLS) {
        const zone = svgEl.querySelector(`.column-zone[data-column="${col}"]`);
        if (zone) {
            zone.classList.add('keyboard-focus');
        }
    }
}

/**
 * Enables or disables column interactions
 * @param {SVGElement} svgEl - SVG element
 * @param {boolean} disabled - True to disable, false to enable
 */
export function setColumnsDisabled(svgEl, disabled) {
    const zones = svgEl.querySelectorAll('.column-zone');
    zones.forEach(zone => {
        if (disabled) {
            zone.classList.add('disabled');
        } else {
            zone.classList.remove('disabled');
        }
    });
}

/**
 * Updates AI face display
 * @param {string} emoji - Emoji to display
 * @param {string} text - Text to display
 */
export function updateAIFaceDisplay(emoji, text) {
    const faceEl = document.getElementById('ai-face');
    const textEl = document.getElementById('ai-text');
    
    if (faceEl) {
        // Add scale animation
        faceEl.style.transform = 'scale(1.2)';
        setTimeout(() => {
            faceEl.textContent = emoji;
            faceEl.style.transform = 'scale(1)';
        }, 150);
    }
    
    if (textEl) {
        // Fade transition
        textEl.style.opacity = '0';
        setTimeout(() => {
            textEl.textContent = text;
            textEl.style.opacity = '1';
        }, 150);
    }
}

/**
 * Updates game status text
 * @param {string} text - Status text to display
 */
export function updateGameStatus(text) {
    const statusEl = document.getElementById('game-status');
    if (statusEl) {
        statusEl.textContent = text;
    }
}

/**
 * Sets up keyboard navigation for board
 * @param {SVGElement} svgEl - SVG element
 * @param {Function} onColumnSelect - Callback when column is selected (col) => void
 * @param {Function} onDrop - Callback when drop is triggered () => void
 * @returns {Function} Cleanup function to remove event listeners
 */
export function setupKeyboardNavigation(svgEl, onColumnSelect, onDrop) {
    let currentCol = 3; // Start at center column
    
    const handleKeyDown = (e) => {
        if (svgEl.classList.contains('disabled')) {
            return;
        }
        
        // Only respond to arrow keys and Enter/Space
        if (!['ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                currentCol = Math.max(0, currentCol - 1);
                highlightColumn(svgEl, currentCol);
                onColumnSelect(currentCol);
                break;
            case 'ArrowRight':
                e.preventDefault();
                currentCol = Math.min(COLS - 1, currentCol + 1);
                highlightColumn(svgEl, currentCol);
                onColumnSelect(currentCol);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (onDrop) {
                    onDrop(currentCol);
                }
                break;
        }
    };
    
    // Focus board container for keyboard events
    const container = svgEl.parentElement;
    if (container) {
        container.addEventListener('keydown', handleKeyDown);
        container.setAttribute('tabindex', '0');
    }
    
    // Don't show initial highlight (only show on keyboard interaction)
    // highlightColumn(svgEl, currentCol);
    
    // Return cleanup function
    return () => {
        if (container) {
            container.removeEventListener('keydown', handleKeyDown);
        }
    };
}

// Export constants for use in other modules
export { DISC_RADIUS, COLUMN_WIDTH, ROW_HEIGHT, BOARD_PADDING };

