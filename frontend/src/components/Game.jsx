import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Clock, Users, Trophy } from 'lucide-react';

export default function Game() {
  const { maze, playerId, players, playerPositions, timer, movePlayer } = useGame();
  const canvasRef = useRef(null);
  const [cellSize, setCellSize] = useState(50);
  const animationFrameRef = useRef(null);
  const playerAnimationsRef = useRef({});
  const particlesRef = useRef([]);
  const [activeKeys, setActiveKeys] = useState(new Set());
  
  const currentPlayer = players.find(p => p.playerId === playerId);
  const currentPosition = playerPositions[playerId] || currentPlayer?.position || { x: 0, y: 0 };

  // Handle keyboard input with visual feedback
  useEffect(() => {
    const handleKeyDown = (e) => {
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
        setActiveKeys(prev => new Set(prev).add(direction));
        movePlayer(direction);
      }
    };

    const handleKeyUp = (e) => {
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
        setActiveKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(direction);
          return newSet;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [movePlayer]);

  // Initialize player animations when positions change
  useEffect(() => {
    players.forEach(player => {
      const newPos = playerPositions[player.playerId] || player.position;
      if (!newPos) return;

      if (!playerAnimationsRef.current[player.playerId]) {
        // Initialize animation state
        playerAnimationsRef.current[player.playerId] = {
          current: { x: newPos.x, y: newPos.y },
          target: { x: newPos.x, y: newPos.y },
          lastDirection: 'right',
          animationProgress: 1,
          scale: 1,
        };
      } else {
        const anim = playerAnimationsRef.current[player.playerId];
        const oldTarget = anim.target;
        
        // Only update if position actually changed
        if (oldTarget.x !== newPos.x || oldTarget.y !== newPos.y) {
          // Calculate direction
          if (newPos.x > oldTarget.x) anim.lastDirection = 'right';
          else if (newPos.x < oldTarget.x) anim.lastDirection = 'left';
          else if (newPos.y > oldTarget.y) anim.lastDirection = 'down';
          else if (newPos.y < oldTarget.y) anim.lastDirection = 'up';
          
          // Start new animation from current animated position
          anim.current = { ...anim.current };
          anim.target = { x: newPos.x, y: newPos.y };
          anim.animationProgress = 0;
          anim.scale = 1.15; // Slight scale up when moving
          
          // Create particles for movement trail
          const playerIndex = players.findIndex(p => p.playerId === player.playerId);
          const playerColors = ['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];
          const color = playerColors[playerIndex % playerColors.length];
          
          for (let i = 0; i < 3; i++) {
            particlesRef.current.push({
              x: anim.current.x,
              y: anim.current.y,
              vx: (Math.random() - 0.5) * 0.05,
              vy: (Math.random() - 0.5) * 0.05,
              life: 1,
              color: color,
              size: Math.random() * 3 + 2,
            });
          }
        }
      }
    });
  }, [players, playerPositions]);

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

  // Animated rendering with smooth interpolation
  useEffect(() => {
    if (!maze || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    
    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw maze
      for (let y = 0; y < maze.dimensions.height; y++) {
        for (let x = 0; x < maze.dimensions.width; x++) {
          const cell = maze.grid[y][x];
          
          if (cell === 1) {
            // Wall with subtle gradient
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

      // Draw endpoint with pulsing effect
      const endpoint = maze.endpoint;
      const pulseTime = Date.now() / 1000;
      const pulse = Math.sin(pulseTime * 2) * 0.1 + 0.9;
      
      const gradient = ctx.createRadialGradient(
        endpoint.x * cellSize + cellSize / 2,
        endpoint.y * cellSize + cellSize / 2,
        0,
        endpoint.x * cellSize + cellSize / 2,
        endpoint.y * cellSize + cellSize / 2,
        cellSize * pulse
      );
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = gradient;
      ctx.fillRect(endpoint.x * cellSize, endpoint.y * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(endpoint.x * cellSize, endpoint.y * cellSize, cellSize, cellSize);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.life -= 0.02;
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.life <= 0) return false;
        
        const px = particle.x * cellSize + cellSize / 2;
        const py = particle.y * cellSize + cellSize / 2;
        
        ctx.beginPath();
        ctx.arc(px, py, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        return true;
      });

      // Draw all players with smooth animation
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
        const anim = playerAnimationsRef.current[player.playerId];
        if (!anim) return;

        // Update animation progress
        if (anim.animationProgress < 1) {
          anim.animationProgress = Math.min(1, anim.animationProgress + 0.12);
        }

        // Interpolate position with easing
        const t = easeOutCubic(anim.animationProgress);
        const interpolatedX = anim.current.x + (anim.target.x - anim.current.x) * t;
        const interpolatedY = anim.current.y + (anim.target.y - anim.current.y) * t;

        // Update current position
        anim.current.x = interpolatedX;
        anim.current.y = interpolatedY;

        // Scale animation (bounce back to 1)
        if (anim.scale > 1) {
          anim.scale = Math.max(1, anim.scale - 0.02);
        }

        const color = playerColors[index % playerColors.length];
        const centerX = interpolatedX * cellSize + cellSize / 2;
        const centerY = interpolatedY * cellSize + cellSize / 2;
        const radius = cellSize * 0.35 * anim.scale;

        // Draw shadow
        ctx.beginPath();
        ctx.arc(centerX + 2, centerY + 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Draw player circle with gradient
        const playerGradient = ctx.createRadialGradient(
          centerX - radius * 0.3,
          centerY - radius * 0.3,
          0,
          centerX,
          centerY,
          radius
        );
        playerGradient.addColorStop(0, color + 'ff');
        playerGradient.addColorStop(1, color + 'cc');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = playerGradient;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw directional indicator (arrow)
        const arrowSize = radius * 0.4;
        const directions = {
          'up': -Math.PI / 2,
          'down': Math.PI / 2,
          'left': Math.PI,
          'right': 0,
        };
        const angle = directions[anim.lastDirection] || 0;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(arrowSize, 0);
        ctx.lineTo(-arrowSize * 0.5, -arrowSize * 0.5);
        ctx.lineTo(-arrowSize * 0.5, arrowSize * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw player initial on top
        if (player.username) {
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${Math.floor(cellSize * 0.4)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(player.username[0].toUpperCase(), centerX, centerY - radius * 0.1);
        }

        // Highlight current player with animated ring
        if (player.playerId === playerId) {
          const ringPulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + ringPulse * 0.5})`;
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.lineDashOffset = -Date.now() / 50;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius + 5 + ringPulse * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [maze, players, playerId, cellSize]);

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
            Use{' '}
            <kbd className={`px-2 py-1 glass-dark rounded transition-all ${activeKeys.has('up') ? 'bg-blue-500/50 scale-110 shadow-lg' : ''}`}>
              ↑
            </kbd>{' '}
            <kbd className={`px-2 py-1 glass-dark rounded transition-all ${activeKeys.has('down') ? 'bg-blue-500/50 scale-110 shadow-lg' : ''}`}>
              ↓
            </kbd>{' '}
            <kbd className={`px-2 py-1 glass-dark rounded transition-all ${activeKeys.has('left') ? 'bg-blue-500/50 scale-110 shadow-lg' : ''}`}>
              ←
            </kbd>{' '}
            <kbd className={`px-2 py-1 glass-dark rounded transition-all ${activeKeys.has('right') ? 'bg-blue-500/50 scale-110 shadow-lg' : ''}`}>
              →
            </kbd>{' '}
            or WASD to move
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

