# Connect-Four-Game-
A cool project I worked on during my vibe coding class which as its name suggests, is a recreation of the connect four game. As you all will see its a complete frontend-only Connect Four game with an expressive AI opponent, comprehensive game history, and an in-app console. Built with vanilla JavaScript (ES modules) and a striking Neo-Brutalist aesthetic.

## Features

- **Neo-Brutalist UI**: Bold black outlines, hard shadows, and vibrant colors on an off-white background
- **Smooth Animations**: GPU-accelerated disc drops with bounce easing, pulsing win highlights, and fluid transitions
- **AI Opponent**: Three difficulty levels (Easy, Medium, Hard) with an expressive face that reacts to game events
- **Game Modes**: Human vs AI (default) and Human vs Human (local)
- **Game History**: All games saved to localStorage with full replay capability
- **In-App Console**: Verbose logging of all game events with export functionality
- **Accessibility**: Full keyboard navigation, ARIA labels, colorblind mode, and high-contrast mode
- **Undo**: Undo last move during active games

## Quick Start

```bash
npm install
cd...../Connect-Four-Game/connect-four Work yourway to the Connect-four directory

npm run dev
```

Then open `http://localhost:5173` in your browser.

### Keep Computer Awake While Server Runs

Prevent your computer from sleeping while the server is running:

```bash
# Option 1: Use npm script (simple)
npm run dev:awake

# Option 2: Use shell script (with auto-tunnel)
./start-with-tunnel.sh
```

Your computer will automatically stay awake and allow sleep again when you stop the server.

### Playing on the Same WiFi Network or Remotely

To allow others to play with you:

#### Option 1: Local Network (Same WiFi)
1. Start the dev server: `npm run dev`
2. Find your local IP address:
   - **Linux/Mac**: Run `hostname -I | awk '{print $1}'`
   - **Windows**: Run `ipconfig` and look for "IPv4 Address"
3. Share the URL: `http://YOUR_IP_ADDRESS:5173`
   - Example: `http://192.168.1.100:5173`

**Note**: Make sure your firewall allows incoming connections on port 5173.

#### Option 2: Public Link (Works Anywhere)
For playing across different networks:

```bash
npm run dev
# In a new terminal:
npx localtunnel --port 5173
```

This generates a public URL (e.g., `https://xxxx.loca.lt`) that works from any device, anywhere in the world!

### Mobile Support

The game is fully optimized for mobile devices with:
- ✅ Responsive design for all screen sizes
- ✅ Touch-optimized controls (44px+ tap targets)
- ✅ Prevents accidental zoom and text selection
- ✅ Mobile-friendly modals and panels
- ✅ Works great on iPhone, Android, tablets

## Running Tests

```bash
npm test
```

## Project Structure

```
connect-four/
├── package.json          # Project configuration and scripts
├── README.md            # This file
├── DeveloperNotes.md    # Implementation notes and future enhancements
└── frontend/
    ├── index.html       # Main HTML entry point
    ├── styles.css       # Neo-Brutalist styles and animations
    ├── assets/
    │   └── faces.svg    # AI face SVG assets (optional fallback)
    └── src/
        ├── app.js       # Main application orchestrator
        ├── board.js     # Core game board logic
        ├── ai.js        # AI opponent implementation
        ├── ui.js        # SVG rendering and UI interactions
        ├── history.js   # Game history and replay system
        ├── console.js   # In-app console system
        ├── sound.js     # Sound effects (Web Audio API)
        └── tests/
            └── board.test.js  # Vitest test suite
```

## How It Works

### Game Play

1. **Starting a Game**: Click "New Game" to open a modal where you can choose:
   - Game mode (Human vs AI or Human vs Human)
   - Who starts first (Player or AI)
   - AI difficulty (Easy, Medium, Hard)
   - Sound effects toggle (check to enable sound effects)

2. **Making Moves**:
   - **Mouse**: Click on any column to drop a disc
   - **Keyboard**: Use Left/Right arrows to navigate columns, Enter/Space to drop

3. **AI Behavior**:
   - **Easy**: Random valid moves
   - **Medium**: Greedy algorithm that prioritizes winning moves, blocking opponent wins, and center column preference
   - **Hard**: Minimax with alpha-beta pruning (depth 4-6) for optimal play

4. **AI Face Emotions**:
   - 😐 Neutral: Start of game
   - 🤔 Thinking: During AI computation
   - 😄 Happy: On clever moves or when gaining advantage
   - 😤 Frustrated: When player blocks imminent win
   - 😎 Smug: When AI wins or is confident
   - 😢 Sad: When AI loses
   - 😶 Draw: On a tie game

### Console & History

- **Console**: Toggle the console panel to see all game events logged with timestamps, types, and optional metadata
- **Export Logs**: Click "Export Logs" to download all console entries as a text file
- **Game History**: All completed games are saved to localStorage. Access the history panel to view past games and replay them step-by-step

### Replay System

Replays show:
- Timeline of all moves with disc icons
- Current move highlight
- Controls: Play/Pause, Step Forward/Back, Speed adjustment (0.2× to 2×)
- Full board state restoration including AI face updates

## Technical Details

### Board Logic (`board.js`)

The board is represented as a 2D array `[ROWS][COLS]` where:
- `0` = empty cell
- `1` = Player 1 (Red)
- `2` = Player 2 / AI (Yellow)

Gravity is handled by `getLowestEmptyRow()` which finds the bottommost empty cell in a column. Win detection checks horizontal, vertical, and both diagonal directions from every possible starting position.

### AI Implementation (`ai.js`)

- **Easy**: Random selection from available moves
- **Medium**: Uses `evaluateBoard()` heuristic with greedy selection
- **Hard**: Minimax with alpha-beta pruning, depth configurable (default 4-5 to prevent UI freeze)

The AI includes a simulated thinking delay (500-1000ms) and updates its face during computation.

### UI Rendering (`ui.js`)

Uses SVG for crisp, scalable rendering. Discs are animated using CSS transforms (GPU-accelerated) to avoid layout reflow. Column click zones are precisely mapped to avoid mis-registered clicks.

### History Storage (`history.js`)

Games are stored in localStorage under key `connectFourHistory_v1`. Each game record includes:
- Unique ID, timestamp, mode, difficulty, player order
- Array of moves with board snapshots
- Final board state and winner

## Accessibility

- Full keyboard navigation (Left/Right/Enter/Space)
- ARIA labels and live regions for screen readers
- Colorblind mode with alternate color palette
- High-contrast mode toggle
- Focus indicators on all interactive elements

## Browser Support

Modern browsers with ES module support (Chrome, Firefox, Safari, Edge - recent versions).

## License MIT
MIT License

Copyright (c) 2025 Kennethenow1

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
