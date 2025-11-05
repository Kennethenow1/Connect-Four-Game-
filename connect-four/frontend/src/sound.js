/**
 * sound.js - Sound effects using Web Audio API
 * 
 * Generates sound effects programmatically without requiring audio files.
 * Provides simple but effective feedback for game events.
 */

let audioContext = null;
let soundEnabled = false;

/**
 * Initializes the audio context
 */
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

/**
 * Enables or disables sound effects
 * @param {boolean} enabled - Whether sounds should be enabled
 */
export function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    if (enabled) {
        initAudioContext();
    }
}

/**
 * Gets current sound enabled state
 * @returns {boolean} Whether sounds are enabled
 */
export function isSoundEnabled() {
    return soundEnabled;
}

/**
 * Plays a disc drop sound (falling tone)
 */
export function playDiscDrop() {
    if (!soundEnabled) return;
    
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Falling tone
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    
    // Fade out
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.type = 'sine';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
}

/**
 * Plays a win sound (ascending arpeggio)
 */
export function playWin() {
    if (!soundEnabled) return;
    
    const ctx = initAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C major chord
    
    notes.forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        const startTime = ctx.currentTime + index * 0.1;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
    });
}

/**
 * Plays a lose sound (descending tone)
 */
export function playLose() {
    if (!soundEnabled) return;
    
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Descending sad tone
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.type = 'sine';
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
}

/**
 * Plays a draw sound (neutral beep)
 */
export function playDraw() {
    if (!soundEnabled) return;
    
    const ctx = initAudioContext();
    
    for (let i = 0; i < 2; i++) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 440;
        oscillator.type = 'sine';
        
        const startTime = ctx.currentTime + i * 0.15;
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.1);
    }
}

/**
 * Plays AI thinking sound (subtle beep)
 */
export function playAIThinking() {
    if (!soundEnabled) return;
    
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
}

/**
 * Plays a click/button sound
 */
export function playClick() {
    if (!soundEnabled) return;
    
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
}

/**
 * Plays an error sound (low buzz)
 */
export function playError() {
    if (!soundEnabled) return;
    
    const ctx = initAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 150;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
}


