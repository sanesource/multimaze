import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Gamepad2, Users, Trophy, Zap } from 'lucide-react';

export default function Home() {
  const { createRoom, joinRoom, error, clearError } = useGame();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [difficulty, setDifficulty] = useState('hard');
  const [timerDuration, setTimerDuration] = useState(300);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [enableCheckpoints, setEnableCheckpoints] = useState(false);
  const [tunnelMode, setTunnelMode] = useState(false);
  const [teamMode, setTeamMode] = useState(false);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    createRoom(username.trim(), {
      difficulty,
      timerDuration: parseInt(timerDuration),
      maxPlayers: parseInt(maxPlayers),
      enableCheckpoints: teamMode ? true : enableCheckpoints, // Team mode forces checkpoints
      tunnelMode,
      teamMode,
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!username.trim() || !roomCode.trim()) return;
    
    joinRoom(roomCode.trim().toUpperCase(), username.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="w-20 h-20 text-blue-400 animate-bounce-slow" />
          </div>
          <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            MultiMaze
          </h1>
          <p className="text-xl text-blue-200">
            Race through mazes with friends in real-time!
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 glass-dark border-red-500/50 rounded-lg text-red-300 text-center">
            {error}
            <button
              onClick={clearError}
              className="ml-4 text-sm underline hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Menu */}
        {!showCreate && !showJoin && (
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <button
              onClick={() => setShowCreate(true)}
              className="glass p-8 rounded-2xl hover:bg-white/20 transition-all transform hover:scale-105 group"
            >
              <Users className="w-16 h-16 mb-4 text-blue-400 mx-auto group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Create Room</h2>
              <p className="text-blue-200">Start a new game and invite friends</p>
            </button>

            <button
              onClick={() => setShowJoin(true)}
              className="glass p-8 rounded-2xl hover:bg-white/20 transition-all transform hover:scale-105 group"
            >
              <Zap className="w-16 h-16 mb-4 text-purple-400 mx-auto group-hover:scale-110 transition-transform" />
              <h2 className="text-2xl font-bold mb-2">Join Room</h2>
              <p className="text-blue-200">Enter a room code to join</p>
            </button>
          </div>
        )}

        {/* Create Room Form */}
        {showCreate && (
          <div className="max-w-md mx-auto glass p-8 rounded-2xl animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center">Create Room</h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-lg glass-dark border-white/20 focus:border-blue-400 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-dark border-white/20 focus:border-blue-400 outline-none transition-colors"
                >
                  <option value="easy">Easy (15×15)</option>
                  <option value="medium">Medium (25×25)</option>
                  <option value="hard">Hard (35×35)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Timer Duration</label>
                <select
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-dark border-white/20 focus:border-blue-400 outline-none transition-colors"
                >
                  <option value="120">2 minutes</option>
                  <option value="180">3 minutes</option>
                  <option value="300">5 minutes</option>
                  <option value="420">7 minutes</option>
                  <option value="600">10 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Players</label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg glass-dark border-white/20 focus:border-blue-400 outline-none transition-colors"
                >
                  <option value="2">2 Players</option>
                  <option value="4">4 Players</option>
                  <option value="6">6 Players</option>
                  <option value="8">8 Players</option>
                  <option value="10">10 Players</option>
                  <option value="12">12 Players</option>
                  <option value="14">14 Players</option>
                  <option value="16">16 Players</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg glass-dark border border-white/20">
                <input
                  type="checkbox"
                  id="teamMode"
                  checked={teamMode}
                  onChange={(e) => setTeamMode(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-400 cursor-pointer"
                />
                <label htmlFor="teamMode" className="flex-1 cursor-pointer">
                  <div className="font-medium">🏆 Team Mode</div>
                  <div className="text-sm text-blue-200">Players join Team A or B and race together with shared checkpoints</div>
                </label>
              </div>

              {!teamMode && (
                <div className="flex items-center gap-3 p-4 rounded-lg glass-dark border border-white/20">
                  <input
                    type="checkbox"
                    id="enableCheckpoints"
                    checked={enableCheckpoints}
                    onChange={(e) => setEnableCheckpoints(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  />
                  <label htmlFor="enableCheckpoints" className="flex-1 cursor-pointer">
                    <div className="font-medium">Enable Checkpoints</div>
                    <div className="text-sm text-blue-200">Players must reach 3 checkpoints in order before the final goal</div>
                  </label>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 glass-dark rounded-lg">
                <input
                  type="checkbox"
                  id="tunnelMode"
                  checked={tunnelMode}
                  onChange={(e) => setTunnelMode(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-black/30 text-blue-500 focus:ring-2 focus:ring-blue-400"
                />
                <label htmlFor="tunnelMode" className="text-sm font-medium cursor-pointer flex-1">
                  <span className="text-yellow-400">🕯️ Tunnel Mode</span>
                  <span className="block text-xs text-blue-200 mt-1">
                    Limited vision with candle + 3 lightning charges (Spacebar)
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-6 py-3 rounded-lg glass-dark hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-semibold transition-all transform hover:scale-105"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Join Room Form */}
        {showJoin && (
          <div className="max-w-md mx-auto glass p-8 rounded-2xl animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center">Join Room</h2>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-lg glass-dark border-white/20 focus:border-blue-400 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg glass-dark border-white/20 focus:border-blue-400 outline-none transition-colors text-2xl tracking-wider text-center font-mono"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoin(false)}
                  className="flex-1 px-6 py-3 rounded-lg glass-dark hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold transition-all transform hover:scale-105"
                >
                  Join Room
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Features */}
        {!showCreate && !showJoin && (
          <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass p-6 rounded-xl text-center">
              <Trophy className="w-10 h-10 mb-3 text-yellow-400 mx-auto" />
              <h3 className="font-bold mb-2">Competitive</h3>
              <p className="text-sm text-blue-200">Race against friends and climb the rankings</p>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <Zap className="w-10 h-10 mb-3 text-blue-400 mx-auto" />
              <h3 className="font-bold mb-2">Real-time</h3>
              <p className="text-sm text-blue-200">Synchronized gameplay across all players</p>
            </div>
            <div className="glass p-6 rounded-xl text-center">
              <Gamepad2 className="w-10 h-10 mb-3 text-purple-400 mx-auto" />
              <h3 className="font-bold mb-2">Simple Controls</h3>
              <p className="text-sm text-blue-200">Use arrow keys or WASD to navigate</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
