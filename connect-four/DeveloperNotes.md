# Developer Notes

## Known Non-Critical Issues

1. **Deep Minimax Performance**: The hard AI uses depth 4-5 by default. For deeper searches (depth 6+), consider moving minimax to a Web Worker to prevent UI blocking.

2. **localStorage Size Limits**: Each game stores full board snapshots. After ~100-200 games, localStorage may approach browser limits (typically 5-10MB). Consider implementing:
   - Delta compression for moves
   - Automatic cleanup of old games
   - Export/import functionality for long-term storage

3. **Animation Timing**: Disc drop animations are set to 500ms. If you want faster gameplay, reduce to 300-400ms. Bounce easing can be adjusted in `styles.css` via `transition-timing-function`.

## Performance Tips

1. **requestAnimationFrame**: All JS-driven animations use `requestAnimationFrame` for smooth 60fps updates.

2. **CSS Transforms**: Disc drops use `transform` instead of `top/left` to leverage GPU acceleration and avoid repaints.

3. **Event Debouncing**: Mouse clicks and keyboard inputs are debounced to prevent race conditions during animations.

4. **Memory Management**: Event listeners are properly cleaned up when creating new boards (container innerHTML cleared before re-binding).

5. **Minimax Optimization**: Alpha-beta pruning reduces search space by ~70-90% compared to naive minimax.

## Animation Tuning

### Disc Drop Animation
- Current: 500ms with `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce easing)
- To make faster: Change `transition-duration` in `.disc` class to `300ms`
- To remove bounce: Use `ease-out` instead of custom bezier

### AI Face Transitions
- Current: 300ms fade with scale transform
- Adjust `.ai-face-box` transition timing if needed

### Console Log Entry
- Current: 200ms slide-in animation
- Adjust `.console-entry` transition if you want instant or slower reveals

## Recommended Future Enhancements

### High Priority
1. **Web Worker for Deep AI**: Move minimax to a Web Worker for depth 6+ searches without blocking UI
2. ~~**Sound Effects**~~: ✅ COMPLETED - Implemented using Web Audio API (see `sound.js`)
3. **Move Validation Warnings**: Show visual feedback when player tries to drop in a full column

### Medium Priority
1. **Multiplayer via WebSockets**: Add online multiplayer support
2. **Text-to-Speech (TTS)**: Read AI phrases aloud for enhanced accessibility
3. **Advanced Statistics**: Track win rates, average game length, move patterns
4. **Custom Themes**: Allow users to customize color schemes beyond colorblind mode

### Low Priority
1. **Variable Board Sizes**: Support 5×6, 8×9, or custom dimensions
2. **Tournament Mode**: Best-of-N series with AI difficulty progression
3. **Move Hints**: Optional "show best move" feature for learning
4. **Export Game as GIF**: Generate animated GIFs of replays

## Code Architecture Notes

### Module Dependencies
```
app.js (main)
├── board.js (pure game logic, no DOM)
├── ai.js (depends on board.js)
├── ui.js (DOM manipulation, depends on board.js)
├── history.js (localStorage, depends on board.js)
├── console.js (global utility, no dependencies)
└── sound.js (Web Audio API, no dependencies)
```

### Sound System (`sound.js`)

The sound system uses the Web Audio API to generate sounds programmatically:

- **No external files needed**: All sounds are synthesized in real-time
- **Sounds available**:
  - `playDiscDrop()`: Falling tone (600Hz → 200Hz, 200ms)
  - `playWin()`: Ascending arpeggio (C-E-G-C major chord)
  - `playLose()`: Descending sad tone (400Hz → 200Hz, 500ms)
  - `playDraw()`: Neutral double beep (440Hz)
  - `playAIThinking()`: Subtle beep (800Hz, 100ms)
  - `playClick()`: Button click (800Hz square wave, 50ms)
  - `playError()`: Low buzz (150Hz sawtooth, 200ms)
  
- **Usage**: Call `setSoundEnabled(true)` to enable, then call any play function
- **Browser compatibility**: Works in all modern browsers with Web Audio API support

### State Management
- Game state is centralized in `app.js`
- Board state is managed by `board.js` functions (immutable patterns where possible)
- UI state (animations, disabled inputs) is managed in `ui.js`

### Testing Strategy
- `board.test.js` covers core game logic (win detection, move validation)
- AI tests verify legal move generation across all difficulties
- UI and history modules are tested manually (consider adding E2E tests with Playwright)

## Debugging Tips

1. **Console Logging**: The in-app console logs all events. Use browser DevTools console for debugging code execution.

2. **Board State Inspection**: Call `board.printBoard(currentBoard)` in console to see ASCII representation.

3. **localStorage Inspection**: 
   ```javascript
   JSON.parse(localStorage.getItem('connectFourHistory_v1'))
   ```

4. **Animation Debugging**: Add `debugger` statement in animation callbacks to inspect timing.

5. **AI Move Debugging**: Enable verbose logging in `ai.js` to see evaluation scores and chosen moves.

## Browser Compatibility Notes

- ES Modules: Requires modern browser (Chrome 61+, Firefox 60+, Safari 11+)
- localStorage: Supported in all modern browsers
- SVG: Full support in all browsers
- CSS Grid/Flexbox: Used for layout, supported in all modern browsers

## Security Considerations

- No user input is sent to any server (frontend-only)
- localStorage data is local to browser (privacy-friendly)
- No external dependencies loaded from CDN (offline-capable after initial load)

## Performance Benchmarks

- Board render: < 16ms (60fps)
- Disc drop animation: 500ms (smooth)
- AI Easy move: < 10ms
- AI Medium move: < 50ms
- AI Hard move (depth 4): 200-500ms
- AI Hard move (depth 6): 1-3 seconds (consider Web Worker)

## Code Style

- ES6+ features: Arrow functions, destructuring, template literals
- Naming: camelCase for variables/functions, PascalCase for classes
- Comments: JSDoc-style for exported functions, inline comments for complex logic
- Error Handling: Try-catch around localStorage operations, graceful fallbacks

