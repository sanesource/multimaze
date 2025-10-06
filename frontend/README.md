# MultiMaze Frontend

Real-time multiplayer maze game frontend built with React, Vite, and Tailwind CSS.

## Features

- 🎨 Beautiful modern UI with glassmorphism design
- ⚡ Real-time multiplayer using Socket.io
- 🎮 Canvas-based maze rendering
- 📱 Responsive design
- ⌨️ Keyboard controls (Arrow keys / WASD)
- 🏆 Live rankings and statistics
- ⏱️ Real-time timer with warnings
- 👥 Player status tracking

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Real-time:** Socket.io Client
- **Icons:** Lucide React

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Home.jsx           # Landing page with create/join options
│   ├── Lobby.jsx          # Waiting room with player list
│   ├── Game.jsx           # Main game screen with maze
│   └── Results.jsx        # End game results and rankings
├── context/
│   └── GameContext.jsx    # Global game state management
├── services/
│   └── socket.js          # Socket.io connection service
├── App.jsx                # Main app component with routing
├── main.jsx               # Entry point
└── index.css              # Global styles with Tailwind
```

## Game Screens

### Home Screen

- Create new room with custom settings
- Join existing room with code
- View game features

### Lobby Screen

- Room code display and sharing
- Player list with ready status
- Game settings overview
- Host can start the game

### Game Screen

- Canvas-based maze visualization
- Real-time player positions
- Timer display with color warnings
- Keyboard controls
- Player status indicators

### Results Screen

- Final rankings with medals
- Individual player statistics
- Game statistics summary
- Play again or return home options

## Controls

- **Movement:** Arrow Keys or WASD
- **Ready Up:** Click "Ready Up" button in lobby
- **Start Game:** Host clicks "Start Game"

## Configuration

The frontend connects to the backend at `http://localhost:3000` by default. To change this, update the `SOCKET_URL` in `src/services/socket.js`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
