# 🚀 Quick Start Guide

## Instant Setup (3 Steps)

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Start Servers

**Option A: Use the start script (easiest)**
```bash
chmod +x start.sh
./start.sh
```

**Option B: Manual start**

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 3. Play!

Open your browser and go to: **http://localhost:5173**

## 🎮 Quick Test (2 Players)

1. **Browser 1:**
   - Open http://localhost:5173
   - Click "Create Room"
   - Enter username: "Player1"
   - Click "Create Room"
   - **Copy the room code** (e.g., "ABC123")

2. **Browser 2 (or incognito tab):**
   - Open http://localhost:5173
   - Click "Join Room"
   - Enter username: "Player2"
   - Paste the room code
   - Click "Join Room"

3. **Start the game:**
   - In Browser 1, click "Start Game" (you're the host)
   - Use Arrow Keys or WASD to navigate
   - Race to the yellow endpoint!

## ⌨️ Controls

- **Arrow Keys** or **WASD**: Move your player
- **Goal**: Reach the yellow square before time runs out or before other players!

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill backend (port 3000)
lsof -ti:3000 | xargs kill

# Kill frontend (port 5173)
lsof -ti:5173 | xargs kill
```

### Backend Won't Start
```bash
cd backend
npm install
npm start
```

### Frontend Won't Start
```bash
cd frontend
npm install
npm run dev
```

### Can't Connect
1. Make sure both backend AND frontend are running
2. Check http://localhost:3000/api/health (should return "healthy")
3. Check http://localhost:5173 (should show the game)
4. Check browser console for errors (F12)

## ✅ Verify Everything Works

```bash
# Check backend
curl http://localhost:3000/api/health

# Check frontend
curl http://localhost:5173
```

Both should respond without errors!

## 🎉 Ready to Play!

That's it! You now have a fully working multiplayer maze game. 

- Create rooms with different difficulties
- Play with 2-8 friends simultaneously
- Compete for the fastest time
- See real-time rankings!

**Have fun! 🏆**
