import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Copy, Check, Crown, User, LogOut, Play } from 'lucide-react';

export default function Lobby() {
  const { room, playerId, players, leaveRoom, toggleReady, startGame } = useGame();
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isHost = playerId === room.hostId;
  const allReady = players.length > 0 && players.every(p => p.isReady);
  const currentPlayer = players.find(p => p.playerId === playerId);

  // Sync local ready state with server state
  React.useEffect(() => {
    if (currentPlayer) {
      setIsReady(currentPlayer.isReady);
    }
  }, [currentPlayer]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReadyToggle = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    toggleReady(newReadyState);
  };

  const handleStartGame = () => {
    if (isHost) {
      startGame();
    }
  };

  const difficultyInfo = {
    easy: { label: 'Easy', color: 'text-green-400', size: '15×15' },
    medium: { label: 'Medium', color: 'text-yellow-400', size: '25×25' },
    hard: { label: 'Hard', color: 'text-red-400', size: '35×35' },
  };

  const difficulty = difficultyInfo[room.settings.difficulty];
  const timerMin = Math.floor(room.settings.timerDuration / 60);
  const timerSec = room.settings.timerDuration % 60;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            Game Lobby
          </h1>
          <p className="text-blue-200">Waiting for players...</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Room Info */}
          <div className="md:col-span-1 space-y-4">
            {/* Room Code */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-sm font-medium text-blue-200 mb-3">Room Code</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-3xl font-mono font-bold tracking-wider text-center py-3 glass-dark rounded-lg">
                  {room.roomId}
                </div>
                <button
                  onClick={copyRoomCode}
                  className="p-3 glass-dark hover:bg-white/20 rounded-lg transition-colors"
                  title="Copy room code"
                >
                  {copied ? (
                    <Check className="w-6 h-6 text-green-400" />
                  ) : (
                    <Copy className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Game Settings */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-sm font-medium text-blue-200 mb-4">Game Settings</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Difficulty:</span>
                  <span className={`font-bold ${difficulty.color}`}>
                    {difficulty.label} ({difficulty.size})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Timer:</span>
                  <span className="font-bold">
                    {timerMin}:{timerSec.toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Players:</span>
                  <span className="font-bold">
                    {room.playerCount}/{room.settings.maxPlayers}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-200">Tunnel Mode:</span>
                  <span className={`font-bold ${room.settings.tunnelMode ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {room.settings.tunnelMode ? '🕯️ Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="md:col-span-2 glass p-6 rounded-xl">
            <h3 className="text-lg font-bold mb-4">
              Players ({room.playerCount}/{room.settings.maxPlayers})
            </h3>
            <div className="space-y-3 mb-6">
              {players.map((player) => (
                <div
                  key={player.playerId}
                  className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                    player.playerId === playerId
                      ? 'bg-blue-500/30 border-2 border-blue-400'
                      : 'glass-dark'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    player.isReady ? 'bg-green-500/30' : 'bg-gray-500/30'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{player.username}</span>
                      {player.playerId === room.hostId && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                      {player.playerId === playerId && (
                        <span className="text-xs px-2 py-1 bg-blue-500/30 rounded">You</span>
                      )}
                    </div>
                  </div>
                  <div>
                    {player.isReady ? (
                      <span className="text-sm text-green-400 font-medium">Ready</span>
                    ) : (
                      <span className="text-sm text-gray-400">Not Ready</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={leaveRoom}
                className="px-6 py-3 rounded-lg glass-dark hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Leave Room
              </button>

              {!isHost && (
                <button
                  onClick={handleReadyToggle}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    isReady
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  }`}
                >
                  {isReady ? 'Ready!' : 'Ready Up'}
                </button>
              )}

              {isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={room.playerCount === 0 || !allReady}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Game
                </button>
              )}
            </div>

            {isHost && (
              <p className="text-sm text-blue-200 text-center mt-4">
                {allReady ? 'All players are ready. You can start the game.' : 'Waiting for all players to ready up.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

