/**
 * console.js - In-app console for logging game events
 * 
 * Provides a console interface that logs all game events with timestamps,
 * types, and optional metadata. Supports filtering, export, and auto-scroll.
 */

/**
 * Log types for categorization
 */
export const LOG_TYPES = {
    INFO: 'info',
    AI: 'ai',
    PLAYER: 'player',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
};

let logs = [];
let filterType = 'all';

/**
 * Logs a message to the console
 * @param {string} type - Log type (from LOG_TYPES)
 * @param {string} message - Message text
 * @param {Object} [meta] - Optional metadata object
 */
export function consoleLog(type, message, meta = null) {
    const logEntry = {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        type,
        message,
        meta
    };
    
    logs.push(logEntry);
    
    // Render to DOM if console panel exists
    renderLogEntry(logEntry);
    
    // Auto-scroll to bottom
    autoScrollConsole();
}

/**
 * Renders a single log entry to the DOM
 * @param {Object} logEntry - Log entry object
 */
function renderLogEntry(logEntry) {
    const consoleContent = document.getElementById('console-content');
    if (!consoleContent) return;
    
    // Skip if filtered out
    if (filterType !== 'all' && logEntry.type !== filterType) {
        return;
    }
    
    const entry = document.createElement('div');
    entry.className = 'console-entry';
    entry.setAttribute('data-type', logEntry.type);
    entry.setAttribute('data-id', logEntry.id);
    
    const timeStr = logEntry.timestamp.toLocaleTimeString();
    const typeStr = logEntry.type.toUpperCase();
    
    entry.innerHTML = `
        <span class="console-entry-time">${timeStr}</span>
        <span class="console-entry-type">${typeStr}</span>
        <span class="console-entry-message">${escapeHtml(logEntry.message)}</span>
    `;
    
    consoleContent.appendChild(entry);
}

/**
 * Escapes HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Auto-scrolls console to bottom
 */
function autoScrollConsole() {
    const consoleContent = document.getElementById('console-content');
    if (consoleContent) {
        requestAnimationFrame(() => {
            consoleContent.scrollTop = consoleContent.scrollHeight;
        });
    }
}

/**
 * Clears all console logs
 */
export function clearConsole() {
    logs = [];
    const consoleContent = document.getElementById('console-content');
    if (consoleContent) {
        consoleContent.innerHTML = '';
    }
}

/**
 * Sets console filter type
 * @param {string} type - Filter type ('all' or specific log type)
 */
export function setConsoleFilter(type) {
    filterType = type;
    refreshConsole();
}

/**
 * Refreshes console display based on current filter
 */
function refreshConsole() {
    const consoleContent = document.getElementById('console-content');
    if (!consoleContent) return;
    
    consoleContent.innerHTML = '';
    
    const filteredLogs = filterType === 'all' 
        ? logs 
        : logs.filter(log => log.type === filterType);
    
    filteredLogs.forEach(log => renderLogEntry(log));
    autoScrollConsole();
}

/**
 * Exports all logs as a text file
 */
export function exportLogs() {
    let text = 'Connect Four Game Console Logs\n';
    text += '='.repeat(50) + '\n\n';
    
    logs.forEach(log => {
        const timeStr = log.timestamp.toLocaleString();
        text += `[${timeStr}] [${log.type.toUpperCase()}] ${log.message}\n`;
        
        if (log.meta) {
            text += `  Meta: ${JSON.stringify(log.meta, null, 2)}\n`;
        }
        
        text += '\n';
    });
    
    // Create download link
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `connect-four-logs-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Initializes console UI event handlers
 */
export function initConsole() {
    const filterSelect = document.getElementById('console-filter');
    const clearBtn = document.getElementById('btn-clear-console');
    const exportBtn = document.getElementById('btn-export-logs');
    
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            setConsoleFilter(e.target.value);
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearConsole();
            consoleLog(LOG_TYPES.INFO, 'Console cleared');
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportLogs();
            consoleLog(LOG_TYPES.INFO, 'Logs exported');
        });
    }
}


