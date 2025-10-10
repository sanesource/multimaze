# MultiMaze Backend

Real-time multiplayer maze game backend built with Node.js, Express, and Socket.io.

## Features

- 🎮 Real-time multiplayer gameplay using WebSocket (Socket.io)
- 🏰 Procedural maze generation with multiple difficulty levels
- 🎯 Room-based game sessions with up to 16 players
- 🏆 Dynamic ranking and scoring system
- ⚡ High-performance A\* pathfinding
- 🔒 Input validation and security measures
- 📊 Game statistics and monitoring

## Tech Stack

- **Runtime:** Node.js (v16+)
- **Framework:** Express.js
- **Real-time:** Socket.io
- **Security:** Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd multimaze/backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MAX_ROOMS=50
MAX_PLAYERS_PER_ROOM=16
ROOM_INACTIVITY_TIMEOUT=600000
POSITION_UPDATE_INTERVAL=100
```

## Running the Server

### Development mode (with auto-reload):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### REST API

#### Health Check

```
GET /api/health
```

Returns server health status.

#### Server Statistics

```
GET /api/stats
```

Returns current server statistics (rooms, players, etc.).

#### List Public Rooms

```
GET /api/rooms
```

Returns list of available rooms.

#### Get Room Details

```
GET /api/rooms/:roomId
```

Returns details of a specific room.

#### Validate Room Code

```
POST /api/rooms/validate
Body: { "roomCode": "ABC123" }
```

Validates if a room code is valid and joinable.

## Socket.io Events

### Client → Server Events

#### Create Room

```javascript
socket.emit(
  "create-room",
  {
    username: "PlayerName",
    settings: {
      difficulty: "medium", // 'easy', 'medium', 'hard'
      timerDuration: 300, // seconds (120-600)
      maxPlayers: 16, // 2-16
    },
  },
  (response) => {
    // response: { success, data: { roomId, playerId, room } }
  }
);
```

#### Join Room

```javascript
socket.emit(
  "join-room",
  {
    roomCode: "ABC123",
    username: "PlayerName",
  },
  (response) => {
    // response: { success, data: { roomId, playerId, room } }
  }
);
```

#### Leave Room

```javascript
socket.emit("leave-room");
```

#### Player Ready

```javascript
socket.emit("player-ready", {
  isReady: true,
});
```

#### Start Game (Host only)

```javascript
socket.emit("start-game");
```

#### Player Move

```javascript
socket.emit("player-move", {
  direction: "up", // 'up', 'down', 'left', 'right'
});
```

### Server → Client Events

#### Room Updated

```javascript
socket.on("room-updated", (room) => {
  // Room data with all players and settings
});
```

#### Player Joined

```javascript
socket.on("player-joined", (data) => {
  // { player, message }
});
```

#### Player Left

```javascript
socket.on("player-left", (data) => {
  // { playerId, username, message }
});
```

#### Game Started

```javascript
socket.on("game-started", (room) => {
  // Room data with maze
});
```

#### Player Moved

```javascript
socket.on("player-moved", (data) => {
  // { playerId, position, moves }
});
```

#### Player Finished

```javascript
socket.on("player-finished", (data) => {
  // { playerId, username, completionTime }
});
```

#### Winner Announced

```javascript
socket.on("winner-announced", (data) => {
  // { playerId, username }
});
```

#### Timer Update

```javascript
socket.on("timer-update", (data) => {
  // { elapsed, remaining }
});
```

#### Timer Warning

```javascript
socket.on("timer-warning", (data) => {
  // { remaining }  // At 60s, 30s, 10s
});
```

#### Game Ended

```javascript
socket.on("game-ended", (results) => {
  // Complete game results with rankings
});
```

#### Room Closed

```javascript
socket.on("room-closed", (data) => {
  // { message }
});
```

#### Player Disconnected

```javascript
socket.on("player-disconnected", (data) => {
  // { playerId, username }
});
```

#### Error

```javascript
socket.on("error", (data) => {
  // { message }
});
```

## Project Structure

```
backend/
├── config/
│   └── config.js           # Configuration settings
├── middleware/
│   └── errorHandler.js     # Error handling middleware
├── models/
│   ├── Maze.js            # Maze data model
│   ├── Player.js          # Player data model
│   └── Room.js            # Room data model
├── routes/
│   └── api.js             # REST API routes
├── services/
│   ├── mazeGenerator.js   # Maze generation logic
│   ├── rankingService.js  # Ranking calculation
│   └── roomManager.js     # Room management
├── sockets/
│   └── gameHandlers.js    # Socket.io event handlers
├── utils/
│   ├── pathfinding.js     # A* pathfinding algorithm
│   └── validation.js      # Input validation
├── .env.example           # Example environment variables
├── .gitignore            # Git ignore file
├── package.json          # Dependencies
├── README.md             # Documentation
└── server.js             # Main server file
```

## Game Flow

1. **Room Creation/Joining**

   - Player creates a room or joins with room code
   - Players gather in lobby
   - Players mark themselves as ready

2. **Game Start**

   - Host starts the game
   - Server generates maze
   - Players are assigned start positions
   - Timer begins

3. **Gameplay**

   - Players navigate maze using arrow keys/WASD
   - Real-time position updates via WebSocket
   - First to reach endpoint wins
   - Timer counts down

4. **Game End**
   - Game ends when timer expires or all players finish
   - Rankings calculated based on completion time/distance
   - Results displayed to all players

## Maze Difficulty Levels

- **Easy:** 15x15 grid, straightforward paths
- **Medium:** 25x25 grid, moderate complexity
- **Hard:** 35x35 grid, high complexity with dead ends

## Security Features

- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Server-side movement validation

## Performance

- Position updates: Every 100ms
- Supports 50+ concurrent rooms
- Supports 500+ concurrent users
- Auto-cleanup of inactive rooms

## Development

### Running Tests

```bash
npm test
```

### Code Structure Guidelines

- Models: Data structures and business logic
- Services: Core game logic and algorithms
- Routes: REST API endpoints
- Sockets: Real-time WebSocket handlers
- Utils: Helper functions and utilities
- Middleware: Express middleware functions

## Troubleshooting

### Port already in use

```bash
# Change PORT in .env file or kill the process
lsof -ti:3000 | xargs kill
```

### Connection refused

- Check if CORS_ORIGIN matches your frontend URL
- Verify firewall settings

### High latency

- Check POSITION_UPDATE_INTERVAL in .env
- Ensure server has adequate resources

## License

MIT

## Author

MultiMaze Team

## Version

1.0.0
