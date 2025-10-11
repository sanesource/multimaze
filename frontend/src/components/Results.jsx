import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Clock, Footprints, Target, Home, RotateCcw } from 'lucide-react';

export default function Results() {
  const { gameResults, leaveRoom, restartRoom, playerId, room } = useGame();

  if (!gameResults) return null;

  const isHost = playerId === room?.hostId;

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Winner Announcement */}
        <div className="text-center mb-8 animate-fade-in">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce-slow" />
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-transparent bg-clip-text">
            {gameResults.winner.username} Wins!
          </h1>
          <p className="text-xl text-blue-200">
            Completed in {formatTime(gameResults.winner.completionTime)}
          </p>
        </div>

        {/* Rankings */}
        <div className="glass p-8 rounded-2xl mb-6">
          <h2 className="text-3xl font-bold mb-6 text-center">Final Rankings</h2>
          <div className="space-y-3">
            {gameResults.rankings.map((player) => (
              <div
                key={player.playerId}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  player.playerId === playerId
                    ? 'bg-blue-500/30 border-2 border-blue-400 scale-105'
                    : 'glass-dark'
                }`}
              >
                {/* Rank */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getMedalColor(player.rank)} flex items-center justify-center text-2xl font-bold flex-shrink-0`}>
                  {getMedalEmoji(player.rank)}
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold truncate">{player.username}</span>
                    {player.playerId === playerId && (
                      <span className="text-xs px-2 py-1 bg-blue-500/30 rounded">You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-blue-200">
                    <span className={player.hasFinished ? 'text-green-400' : 'text-gray-400'}>
                      {player.hasFinished ? '✓ Finished' : '✗ Did not finish'}
                    </span>
                    <span>Progress: {player.progressPercentage}%</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="glass-dark px-4 py-2 rounded-lg">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                    <div className="text-sm font-mono">
                      {player.hasFinished ? formatTime(player.completionTime) : 'N/A'}
                    </div>
                  </div>
                  <div className="glass-dark px-4 py-2 rounded-lg">
                    <Target className="w-4 h-4 mx-auto mb-1 text-green-400" />
                    <div className="text-sm font-mono">
                      {player.distanceToEnd === 0 ? '0' : player.distanceToEnd}
                    </div>
                  </div>
                  <div className="glass-dark px-4 py-2 rounded-lg">
                    <Footprints className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                    <div className="text-sm font-mono">{player.moves}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Statistics */}
        <div className="glass p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold mb-4 text-center">Game Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {gameResults.statistics.totalPlayers}
              </div>
              <div className="text-sm text-blue-200">Total Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {gameResults.statistics.finishers}
              </div>
              <div className="text-sm text-blue-200">Finished</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {formatTime(gameResults.statistics.averageTime)}
              </div>
              <div className="text-sm text-blue-200">Avg. Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {gameResults.statistics.averageMoves}
              </div>
              <div className="text-sm text-blue-200">Avg. Moves</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={leaveRoom}
            className="flex-1 px-6 py-4 rounded-xl glass hover:bg-white/20 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return Home
          </button>
          {isHost ? (
            <button
              onClick={restartRoom}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again (Return to Lobby)
            </button>
          ) : (
            <div className="flex-1 px-6 py-4 rounded-xl glass text-center">
              <p className="text-blue-200">Waiting for host to restart...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

