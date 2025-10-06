import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Clock, Users, Trophy } from 'lucide-react';

export default function Game() {
  const { maze, playerId, players, playerPositions, timer, movePlayer } = useGame();
  const canvasRef = useRef(null);
  const [cellSize, setCellSize] = useState(50);
  
  const currentPlayer = players.find(p => p.playerId === playerId);
  const currentPosition = playerPositions[playerId] || currentPlayer?.position || { x: 0, y: 0 };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();
      const keyMap = {
        'arrowup': 'up',
        'w': 'up',
        'arrowdown': 'down',
        's': 'down',
        'arrowleft': 'left',
        'a': 'left',
        'arrowright': 'right',
        'd': 'right',
      };

      const direction = keyMap[key];
      if (direction) {
        e.preventDefault();
        movePlayer(direction);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  // Calculate cell size based on canvas size
  useEffect(() => {
    if (!maze || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    
    // Use available space more efficiently
    const availableWidth = window.innerWidth * 0.95;
    const availableHeight = window.innerHeight * 0.75;

    const cellWidth = Math.floor(availableWidth / maze.dimensions.width);
    const cellHeight = Math.floor(availableHeight / maze.dimensions.height);
    // Use larger cells with good minimum
    const size = Math.max(Math.min(cellWidth, cellHeight), 25);

    setCellSize(size);
    canvas.width = maze.dimensions.width * size;
    canvas.height = maze.dimensions.height * size;
  }, [maze]);

  // Render maze
  useEffect(() => {
    if (!maze || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    for (let y = 0; y < maze.dimensions.height; y++) {
      for (let x = 0; x < maze.dimensions.width; x++) {
        const cell = maze.grid[y][x];
        
        if (cell === 1) {
          // Wall
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        } else {
          // Path
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw endpoint
    const endpoint = maze.endpoint;
    const gradient = ctx.createRadialGradient(
      endpoint.x * cellSize + cellSize / 2,
      endpoint.y * cellSize + cellSize / 2,
      0,
      endpoint.x * cellSize + cellSize / 2,
      endpoint.y * cellSize + cellSize / 2,
      cellSize
    );
    gradient.addColorStop(0, '#fbbf24');
    gradient.addColorStop(1, '#f59e0b');
    ctx.fillStyle = gradient;
    ctx.fillRect(endpoint.x * cellSize, endpoint.y * cellSize, cellSize, cellSize);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(endpoint.x * cellSize, endpoint.y * cellSize, cellSize, cellSize);

    // Draw all players
    const playerColors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#a855f7', // purple
      '#f59e0b', // orange
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
    ];

    players.forEach((player, index) => {
      const pos = playerPositions[player.playerId] || player.position;
      if (!pos) return;

      const color = playerColors[index % playerColors.length];
      const centerX = pos.x * cellSize + cellSize / 2;
      const centerY = pos.y * cellSize + cellSize / 2;
      const radius = cellSize * 0.35;

      // Draw player circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw player initial
      if (player.username) {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.floor(cellSize * 0.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.username[0].toUpperCase(), centerX, centerY);
      }

      // Highlight current player
      if (player.playerId === playerId) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

  }, [maze, players, playerPositions, playerId, cellSize]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timer.remaining <= 10) return 'text-red-400';
    if (timer.remaining <= 30) return 'text-orange-400';
    if (timer.remaining <= 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  const finishedPlayers = players.filter(p => p.hasFinished);
  const activePlayers = players.filter(p => !p.hasFinished && p.isConnected);

  return (
    <div className="min-h-screen flex flex-col p-2">
      {/* Header */}
      <div className="glass mb-2 p-3 rounded-xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Timer */}
          <div className="flex items-center gap-3">
            <Clock className={`w-8 h-8 ${getTimerColor()}`} />
            <div>
              <div className={`text-3xl font-bold font-mono ${getTimerColor()}`}>
                {formatTime(timer.remaining)}
              </div>
              <div className="text-xs text-blue-200">Time Remaining</div>
            </div>
          </div>

          {/* Players Info */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <div className="text-xl font-bold">{activePlayers.length}</div>
                <div className="text-xs text-blue-200">Active</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="text-xl font-bold">{finishedPlayers.length}</div>
                <div className="text-xs text-blue-200">Finished</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center">
        <div className="glass p-3 rounded-xl flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            className="mx-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="mt-2 text-center text-sm text-blue-200">
            Use <kbd className="px-2 py-1 glass-dark rounded">↑</kbd>{' '}
            <kbd className="px-2 py-1 glass-dark rounded">↓</kbd>{' '}
            <kbd className="px-2 py-1 glass-dark rounded">←</kbd>{' '}
            <kbd className="px-2 py-1 glass-dark rounded">→</kbd> or WASD to move
          </div>
        </div>
      </div>

      {/* Players Status */}
      <div className="glass mt-2 p-2 rounded-xl">
        <div className="flex gap-4 max-w-7xl mx-auto overflow-x-auto">
          {players.map((player, index) => {
            const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-lime-500'];
            const color = colors[index % colors.length];
            
            return (
              <div
                key={player.playerId}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg glass-dark min-w-fit ${
                  player.playerId === playerId ? 'ring-2 ring-white' : ''
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="font-medium">{player.username}</span>
                {player.hasFinished && (
                  <span className="text-xs px-2 py-1 bg-yellow-500/30 text-yellow-300 rounded">
                    ✓ Finished
                  </span>
                )}
                {!player.isConnected && (
                  <span className="text-xs px-2 py-1 bg-gray-500/30 text-gray-400 rounded">
                    Disconnected
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

