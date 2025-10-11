import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Clock, Users, Trophy, Zap } from 'lucide-react';

export default function Game() {
  const { maze, playerId, players, playerPositions, timer, movePlayer, room, lightningCharges, lightningActive, useLightning } = useGame();
  const canvasRef = useRef(null);
  const [cellSize, setCellSize] = useState(50);
  const animationFrameRef = useRef(null);
  const playerAnimationsRef = useRef({});
  const particlesRef = useRef([]);
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [lightningCountdown, setLightningCountdown] = useState(0);
  const lightningTimerRef = useRef(null);
  
  const currentPlayer = players.find(p => p.playerId === playerId);
  const currentPosition = playerPositions[playerId] || currentPlayer?.position || { x: 0, y: 0 };

  // Lightning countdown timer
  useEffect(() => {
    if (lightningActive) {
      setLightningCountdown(2);
      const interval = setInterval(() => {
        setLightningCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      lightningTimerRef.current = interval;
      return () => clearInterval(interval);
    } else {
      setLightningCountdown(0);
      if (lightningTimerRef.current) {
        clearInterval(lightningTimerRef.current);
      }
    }
  }, [lightningActive]);

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
      
      // Handle spacebar for lightning in tunnel mode
      if (key === ' ' && room?.settings?.tunnelMode) {
        e.preventDefault();
        if (lightningCharges > 0 && !lightningActive) {
          useLightning();
        }
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

  // Calculate cell size based on available viewport
  useEffect(() => {
    if (!maze || !canvasRef.current) return;

    const calculateSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Account for header (~80px) + padding + controls (~40px)
      const headerHeight = 100;
      const controlsHeight = 50;
      const padding = 32;
      
      const availableWidth = window.innerWidth - padding;
      const availableHeight = window.innerHeight - headerHeight - controlsHeight - padding;

      const cellWidth = Math.floor(availableWidth / maze.dimensions.width);
      const cellHeight = Math.floor(availableHeight / maze.dimensions.height);
      
      // Use larger cells with good minimum, but cap at reasonable size
      const size = Math.max(Math.min(cellWidth, cellHeight, 50), 20);

      setCellSize(size);
      canvas.width = maze.dimensions.width * size;
      canvas.height = maze.dimensions.height * size;
    };

    calculateSize();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
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

      // Draw endpoint as animated door
      const endpoint = maze.endpoint;
      const time = Date.now() / 1000;
      const pulse = Math.sin(time * 2) * 0.5 + 0.5; // 0 to 1
      const doorX = endpoint.x * cellSize;
      const doorY = endpoint.y * cellSize;
      const doorWidth = cellSize;
      const doorHeight = cellSize;
      
      // Background glow
      const glowGradient = ctx.createRadialGradient(
        doorX + doorWidth / 2,
        doorY + doorHeight / 2,
        0,
        doorX + doorWidth / 2,
        doorY + doorHeight / 2,
        doorWidth * (1 + pulse * 0.3)
      );
      glowGradient.addColorStop(0, `rgba(251, 191, 36, ${0.3 + pulse * 0.2})`);
      glowGradient.addColorStop(0.5, `rgba(245, 158, 11, ${0.2 + pulse * 0.1})`);
      glowGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(
        doorX - doorWidth * 0.3,
        doorY - doorHeight * 0.3,
        doorWidth * 1.6,
        doorHeight * 1.6
      );
      
      // Door frame (stone/wood)
      const frameThickness = doorWidth * 0.12;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
      
      // Inner door background
      ctx.fillStyle = '#92400e';
      ctx.fillRect(
        doorX + frameThickness,
        doorY + frameThickness,
        doorWidth - frameThickness * 2,
        doorHeight - frameThickness * 2
      );
      
      // Door panels with gradient
      const panelGradient = ctx.createLinearGradient(
        doorX + frameThickness,
        doorY,
        doorX + doorWidth - frameThickness,
        doorY
      );
      panelGradient.addColorStop(0, '#b45309');
      panelGradient.addColorStop(0.5, '#d97706');
      panelGradient.addColorStop(1, '#b45309');
      ctx.fillStyle = panelGradient;
      
      // Left door panel
      const panelMargin = frameThickness * 1.5;
      const panelWidth = (doorWidth - frameThickness * 2 - panelMargin * 3) / 2;
      const panelHeight = doorHeight - frameThickness * 2 - panelMargin * 2;
      
      ctx.fillRect(
        doorX + panelMargin,
        doorY + panelMargin,
        panelWidth,
        panelHeight
      );
      
      // Right door panel
      ctx.fillRect(
        doorX + panelMargin * 2 + panelWidth,
        doorY + panelMargin,
        panelWidth,
        panelHeight
      );
      
      // Door panel borders (carved details)
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        doorX + panelMargin,
        doorY + panelMargin,
        panelWidth,
        panelHeight
      );
      ctx.strokeRect(
        doorX + panelMargin * 2 + panelWidth,
        doorY + panelMargin,
        panelWidth,
        panelHeight
      );
      
      // Door handle/knob
      const knobX = doorX + doorWidth - frameThickness - panelMargin * 2;
      const knobY = doorY + doorHeight / 2;
      const knobRadius = doorWidth * 0.08;
      
      // Knob shadow
      ctx.beginPath();
      ctx.arc(knobX + 1, knobY + 1, knobRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
      
      // Knob
      const knobGradient = ctx.createRadialGradient(
        knobX - knobRadius * 0.3,
        knobY - knobRadius * 0.3,
        0,
        knobX,
        knobY,
        knobRadius
      );
      knobGradient.addColorStop(0, '#fbbf24');
      knobGradient.addColorStop(1, '#f59e0b');
      ctx.beginPath();
      ctx.arc(knobX, knobY, knobRadius, 0, Math.PI * 2);
      ctx.fillStyle = knobGradient;
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Magical sparkles around door
      for (let i = 0; i < 8; i++) {
        const angle = (time + i * Math.PI / 4) * 2;
        const distance = doorWidth * 0.6 + Math.sin(time * 3 + i) * 5;
        const sparkleX = doorX + doorWidth / 2 + Math.cos(angle) * distance;
        const sparkleY = doorY + doorHeight / 2 + Math.sin(angle) * distance;
        const sparkleSize = (Math.sin(time * 4 + i) * 0.5 + 0.5) * 2 + 1;
        
        // Sparkle cross
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.6 + pulse * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sparkleX - sparkleSize, sparkleY);
        ctx.lineTo(sparkleX + sparkleSize, sparkleY);
        ctx.moveTo(sparkleX, sparkleY - sparkleSize);
        ctx.lineTo(sparkleX, sparkleY + sparkleSize);
        ctx.stroke();
      }
      
      // Glowing border frame
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.5 + pulse * 0.5})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10 + pulse * 10;
      ctx.shadowColor = '#fbbf24';
      ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);
      ctx.shadowBlur = 0;
      
      // Door shine/highlight effect
      const shineGradient = ctx.createLinearGradient(
        doorX,
        doorY,
        doorX + doorWidth,
        doorY + doorHeight
      );
      shineGradient.addColorStop(0, `rgba(255, 255, 255, ${0.1 + pulse * 0.05})`);
      shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      shineGradient.addColorStop(1, `rgba(255, 255, 255, ${0.05 + pulse * 0.02})`);
      ctx.fillStyle = shineGradient;
      ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

      // Draw checkpoints with numbers
      if (maze.checkpoints && maze.checkpoints.length > 0) {
        maze.checkpoints.forEach((checkpoint) => {
          const cpX = checkpoint.x * cellSize;
          const cpY = checkpoint.y * cellSize;
          const cpWidth = cellSize;
          const cpHeight = cellSize;
          
          // Check if this checkpoint has been reached by current player
          const currentPlayerData = players.find(p => p.playerId === playerId);
          const isReached = currentPlayerData?.checkpointsReached?.includes(checkpoint.order) || false;
          const isNext = currentPlayerData?.nextCheckpoint === checkpoint.order;
          
          // Pulsing animation for next checkpoint
          const cpPulse = isNext ? Math.sin(time * 3) * 0.5 + 0.5 : 0.3;
          
          // Background glow
          const cpGlowGradient = ctx.createRadialGradient(
            cpX + cpWidth / 2,
            cpY + cpHeight / 2,
            0,
            cpX + cpWidth / 2,
            cpY + cpHeight / 2,
            cpWidth * (0.8 + cpPulse * 0.3)
          );
          
          if (isReached) {
            // Green for reached checkpoints
            cpGlowGradient.addColorStop(0, `rgba(16, 185, 129, ${0.4 + cpPulse * 0.2})`);
            cpGlowGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          } else if (isNext) {
            // Blue for next checkpoint
            cpGlowGradient.addColorStop(0, `rgba(59, 130, 246, ${0.4 + cpPulse * 0.3})`);
            cpGlowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          } else {
            // Gray for future checkpoints
            cpGlowGradient.addColorStop(0, `rgba(148, 163, 184, ${0.2 + cpPulse * 0.1})`);
            cpGlowGradient.addColorStop(1, 'rgba(148, 163, 184, 0)');
          }
          
          ctx.fillStyle = cpGlowGradient;
          ctx.fillRect(cpX - cpWidth * 0.2, cpY - cpHeight * 0.2, cpWidth * 1.4, cpHeight * 1.4);
          
          // Checkpoint as flag marker
          const cpCenterX = cpX + cpWidth / 2;
          const cpCenterY = cpY + cpHeight / 2;
          const flagWidth = cpWidth * 0.5;
          const flagHeight = cpHeight * 0.35;
          const poleHeight = cpHeight * 0.6;
          // Offset pole to the left so flag is centered overall
          const poleX = cpCenterX - flagWidth / 2;
          const poleY = cpCenterY + cpHeight * 0.2;
          
          // Choose colors based on state
          let flagColor1, flagColor2, poleColor;
          if (isReached) {
            flagColor1 = '#10b981';
            flagColor2 = '#059669';
            poleColor = '#065f46';
          } else if (isNext) {
            flagColor1 = '#3b82f6';
            flagColor2 = '#2563eb';
            poleColor = '#1e40af';
          } else {
            flagColor1 = '#94a3b8';
            flagColor2 = '#64748b';
            poleColor = '#475569';
          }
          
          // Draw pole shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(poleX + 2, poleY - poleHeight + 2, 3, poleHeight);
          
          // Draw pole
          ctx.fillStyle = poleColor;
          ctx.fillRect(poleX, poleY - poleHeight, 3, poleHeight);
          
          // Draw flag with wave effect
          const waveOffset = Math.sin(time * 3) * 3;
          ctx.beginPath();
          ctx.moveTo(poleX + 3, poleY - poleHeight);
          
          // Top edge with wave
          for (let i = 0; i <= 10; i++) {
            const x = poleX + 3 + (flagWidth / 10) * i;
            const y = poleY - poleHeight + Math.sin(time * 3 + i * 0.5) * 2;
            ctx.lineTo(x, y);
          }
          
          // Right edge
          ctx.lineTo(poleX + 3 + flagWidth + waveOffset, poleY - poleHeight + flagHeight / 2);
          
          // Bottom edge with wave
          for (let i = 10; i >= 0; i--) {
            const x = poleX + 3 + (flagWidth / 10) * i;
            const y = poleY - poleHeight + flagHeight + Math.sin(time * 3 + i * 0.5) * 2;
            ctx.lineTo(x, y);
          }
          
          ctx.closePath();
          
          // Flag gradient
          const flagGradient = ctx.createLinearGradient(
            poleX,
            poleY - poleHeight,
            poleX + flagWidth,
            poleY - poleHeight
          );
          flagGradient.addColorStop(0, flagColor1);
          flagGradient.addColorStop(1, flagColor2);
          ctx.fillStyle = flagGradient;
          ctx.fill();
          
          // Flag border
          ctx.strokeStyle = isNext ? `rgba(255, 255, 255, ${0.8 + cpPulse * 0.2})` : '#ffffff';
          ctx.lineWidth = isNext ? 2 : 1.5;
          ctx.stroke();
          
          // Content on flag
          if (isReached) {
            // Checkmark for reached checkpoints
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const checkCenterX = poleX + 3 + flagWidth / 2;
            const checkCenterY = poleY - poleHeight + flagHeight / 2;
            ctx.beginPath();
            ctx.moveTo(checkCenterX - flagWidth * 0.15, checkCenterY);
            ctx.lineTo(checkCenterX - flagWidth * 0.05, checkCenterY + flagHeight * 0.15);
            ctx.lineTo(checkCenterX + flagWidth * 0.2, checkCenterY - flagHeight * 0.15);
            ctx.stroke();
          } else {
            // Number for non-reached checkpoints
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.floor(cellSize * 0.45)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.fillText(
              checkpoint.order.toString(),
              poleX + 3 + flagWidth / 2,
              poleY - poleHeight + flagHeight / 2
            );
            ctx.shadowBlur = 0;
          }
          
          // Rotating sparkles for next checkpoint (around flag)
          if (isNext) {
            for (let i = 0; i < 8; i++) {
              const angle = (time * 2 + i * Math.PI / 4);
              const distance = flagWidth * 0.8 + Math.sin(time * 4 + i) * 4;
              const sparkleX = poleX + flagWidth / 2 + Math.cos(angle) * distance;
              const sparkleY = poleY - poleHeight + flagHeight / 2 + Math.sin(angle) * distance;
              const sparkleSize = 2 + Math.sin(time * 5 + i) * 1;
              
              ctx.fillStyle = `rgba(59, 130, 246, ${0.6 + cpPulse * 0.4})`;
              ctx.beginPath();
              ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      }

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

      // Draw fog-of-war for tunnel mode (BEFORE drawing players so players are visible)
      if (room?.settings?.tunnelMode && !lightningActive) {
        // Calculate visible area around current player
        const visionRadius = 10; // cells (increased from 6.5 to show more)
        const centerX = currentPosition.x * cellSize + cellSize / 2;
        const centerY = currentPosition.y * cellSize + cellSize / 2;
        const radiusPixels = visionRadius * cellSize;
        
        ctx.save();
        
        // Create radial gradient for fog (transparent at center, dark at edges)
        const fogGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radiusPixels
        );
        fogGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');      // Fully transparent center
        fogGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');   // Light fog
        fogGradient.addColorStop(0.75, 'rgba(0, 0, 0, 0.6)');   // Medium fog
        fogGradient.addColorStop(0.9, 'rgba(0, 0, 0, 0.85)');  // Heavy fog
        fogGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');    // Nearly black at edge
        
        // Draw the gradient over entire canvas
        ctx.fillStyle = fogGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Fill everything outside the gradient circle with solid black
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        // Left
        if (centerX - radiusPixels > 0) {
          ctx.fillRect(0, 0, centerX - radiusPixels, canvas.height);
        }
        // Right
        if (centerX + radiusPixels < canvas.width) {
          ctx.fillRect(centerX + radiusPixels, 0, canvas.width - (centerX + radiusPixels), canvas.height);
        }
        // Top
        if (centerY - radiusPixels > 0) {
          ctx.fillRect(0, 0, canvas.width, centerY - radiusPixels);
        }
        // Bottom
        if (centerY + radiusPixels < canvas.height) {
          ctx.fillRect(0, centerY + radiusPixels, canvas.width, canvas.height - (centerY + radiusPixels));
        }
        
        // Add warm candle glow overlay
        const candleGlow = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radiusPixels * 0.6
        );
        candleGlow.addColorStop(0, 'rgba(255, 200, 100, 0.35)');
        candleGlow.addColorStop(0.4, 'rgba(255, 200, 100, 0.18)');
        candleGlow.addColorStop(0.7, 'rgba(255, 180, 80, 0.08)');
        candleGlow.addColorStop(1, 'rgba(255, 160, 60, 0)');
        ctx.fillStyle = candleGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radiusPixels * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

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
  }, [maze, players, playerId, cellSize, room, lightningActive, currentPosition]);

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Unified Header */}
      <div className="glass m-2 p-3 rounded-xl shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Timer - Left */}
          <div className="flex items-center gap-3">
            <Clock className={`w-7 h-7 ${getTimerColor()}`} />
            <div>
              <div className={`text-2xl font-bold font-mono ${getTimerColor()}`}>
                {formatTime(timer.remaining)}
              </div>
              <div className="text-xs text-blue-200">Time Left</div>
            </div>
          </div>

          {/* Players Status - Center */}
          <div className="flex-1 flex gap-2 justify-center overflow-x-auto px-4 max-w-3xl scrollbar-hide">
            {players.map((player, index) => {
              const colors = [
                'bg-gradient-to-br from-blue-400 to-blue-600',
                'bg-gradient-to-br from-red-400 to-red-600',
                'bg-gradient-to-br from-green-400 to-green-600',
                'bg-gradient-to-br from-purple-400 to-purple-600',
                'bg-gradient-to-br from-orange-400 to-orange-600',
                'bg-gradient-to-br from-pink-400 to-pink-600',
                'bg-gradient-to-br from-cyan-400 to-cyan-600',
                'bg-gradient-to-br from-lime-400 to-lime-600'
              ];
              const color = colors[index % colors.length];
              const isCurrentPlayer = player.playerId === playerId;
              
              return (
                <div
                  key={player.playerId}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border transition-all duration-200 min-w-fit ${
                    isCurrentPlayer 
                      ? 'bg-white/20 border-white/40 shadow-lg shadow-white/20 scale-105' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  title={player.username}
                >
                  <div className={`w-3 h-3 rounded-full ${color} shadow-md`} />
                  <span className={`text-sm font-medium truncate max-w-[100px] ${
                    isCurrentPlayer ? 'text-white' : 'text-blue-100'
                  }`}>
                    {player.username}
                  </span>
                  {player.hasFinished && (
                    <span className="flex items-center justify-center w-5 h-5 text-xs bg-yellow-500/40 text-yellow-200 rounded-full border border-yellow-400/50">
                      ✓
                    </span>
                  )}
                  {!player.isConnected && (
                    <span className="flex items-center justify-center px-2 py-0.5 text-xs bg-gray-500/40 text-gray-300 rounded-full border border-gray-400/50">
                      ⚠
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stats - Right */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <div className="text-center">
                <div className="text-lg font-bold leading-none">{activePlayers.length}</div>
                <div className="text-xs text-blue-200">Active</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div className="text-center">
                <div className="text-lg font-bold leading-none">{finishedPlayers.length}</div>
                <div className="text-xs text-blue-200">Finished</div>
              </div>
            </div>
            {room?.settings?.tunnelMode && (
              <div className="flex items-center gap-2">
                <Zap className={`w-6 h-6 ${lightningActive ? 'text-white animate-pulse' : 'text-yellow-400'}`} />
                <div>
                  <div className={`text-xl font-bold ${lightningActive ? 'text-white' : ''}`}>
                    {lightningActive ? lightningCountdown : lightningCharges}
                  </div>
                  <div className="text-xs text-blue-200">
                    {lightningActive ? 'Active' : 'Lightning'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Canvas - Full Height */}
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <div className={`glass p-3 rounded-xl flex flex-col items-center justify-center max-h-full transition-all ${
          lightningActive ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50' : ''
        }`}>
          <canvas
            ref={canvasRef}
            className="mx-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="mt-2 text-center text-sm text-blue-200">
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
            <span className="text-xs">or WASD</span>
            {room?.settings?.tunnelMode && (
              <span>
                {' • Press '}
                <kbd className="px-2 py-1 glass-dark rounded bg-yellow-500/30">
                  Space
                </kbd>
                {' for Lightning ⚡'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

