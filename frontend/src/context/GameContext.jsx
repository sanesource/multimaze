import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState('home'); // home, lobby, playing, results
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [maze, setMaze] = useState(null);
  const [timer, setTimer] = useState({ elapsed: 0, remaining: 0 });
  const [gameResults, setGameResults] = useState(null);
  const [error, setError] = useState(null);
  const [playerPositions, setPlayerPositions] = useState({});
  const [lightningCharges, setLightningCharges] = useState(3);
  const [lightningActive, setLightningActive] = useState(false);

  useEffect(() => {
    socketService.connect();

    // Room events
    socketService.on('room-updated', handleRoomUpdated);
    socketService.on('player-joined', handlePlayerJoined);
    socketService.on('player-left', handlePlayerLeft);
    socketService.on('room-closed', handleRoomClosed);
    socketService.on('room-restarted', handleRoomRestarted);

    // Game events
    socketService.on('game-started', handleGameStarted);
    socketService.on('player-moved', handlePlayerMoved);
    socketService.on('checkpoint-reached', handleCheckpointReached);
    socketService.on('player-finished', handlePlayerFinished);
    socketService.on('winner-announced', handleWinnerAnnounced);
    socketService.on('timer-update', handleTimerUpdate);
    socketService.on('timer-warning', handleTimerWarning);
    socketService.on('game-ended', handleGameEnded);
    socketService.on('player-disconnected', handlePlayerDisconnected);
    socketService.on('error', handleError);
    socketService.on('lightning-activated', handleLightningActivated);
    socketService.on('lightning-deactivated', handleLightningDeactivated);

    return () => {
      socketService.off('room-updated', handleRoomUpdated);
      socketService.off('player-joined', handlePlayerJoined);
      socketService.off('player-left', handlePlayerLeft);
      socketService.off('room-closed', handleRoomClosed);
      socketService.off('room-restarted', handleRoomRestarted);
      socketService.off('game-started', handleGameStarted);
      socketService.off('player-moved', handlePlayerMoved);
      socketService.off('checkpoint-reached', handleCheckpointReached);
      socketService.off('player-finished', handlePlayerFinished);
      socketService.off('winner-announced', handleWinnerAnnounced);
      socketService.off('timer-update', handleTimerUpdate);
      socketService.off('timer-warning', handleTimerWarning);
      socketService.off('game-ended', handleGameEnded);
      socketService.off('player-disconnected', handlePlayerDisconnected);
      socketService.off('error', handleError);
      socketService.off('lightning-activated', handleLightningActivated);
      socketService.off('lightning-deactivated', handleLightningDeactivated);
    };
  }, []);

  const handleRoomUpdated = useCallback((roomData) => {
    setRoom(roomData);
    setPlayers(roomData.players);
  }, []);

  const handlePlayerJoined = useCallback((data) => {
    console.log(data.message);
  }, []);

  const handlePlayerLeft = useCallback((data) => {
    console.log(data.message);
  }, []);

  const handleRoomClosed = useCallback((data) => {
    setError(data.message);
    setGameState('home');
    setRoom(null);
  }, []);

  const handleRoomRestarted = useCallback((roomData) => {
    setRoom(roomData);
    setPlayers(roomData.players);
    setGameState('lobby');
    setMaze(null);
    setGameResults(null);
    setTimer({ elapsed: 0, remaining: 0 });
    setPlayerPositions({});
  }, []);

  const handleGameStarted = useCallback((roomData) => {
    setRoom(roomData);
    setMaze(roomData.maze);
    setPlayers(roomData.players);
    setGameState('playing');
    
    // Initialize player positions
    const positions = {};
    roomData.players.forEach(player => {
      positions[player.playerId] = player.position;
    });
    setPlayerPositions(positions);
    
    // Reset lightning state for tunnel mode
    if (roomData.settings.tunnelMode) {
      setLightningCharges(3);
      setLightningActive(false);
    }
  }, []);

  const handlePlayerMoved = useCallback((data) => {
    setPlayerPositions(prev => ({
      ...prev,
      [data.playerId]: data.position
    }));
  }, []);

  const handleCheckpointReached = useCallback((data) => {
    console.log(`${data.username} reached checkpoint ${data.checkpointOrder}!`);
    
    // Update the player's checkpoint progress
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.playerId === data.playerId 
          ? { 
              ...player, 
              checkpointsReached: player.checkpointsReached ? 
                [...player.checkpointsReached, data.checkpointOrder] : 
                [data.checkpointOrder],
              nextCheckpoint: data.nextCheckpoint
            }
          : player
      )
    );
  }, []);

  const handlePlayerFinished = useCallback((data) => {
    console.log(`${data.username} finished in ${data.completionTime}s!`);
    
    // Update the player's hasFinished status
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.playerId === data.playerId 
          ? { ...player, hasFinished: true, completionTime: data.completionTime }
          : player
      )
    );
  }, []);

  const handleWinnerAnnounced = useCallback((data) => {
    console.log(`🏆 ${data.username} wins!`);
  }, []);

  const handleTimerUpdate = useCallback((data) => {
    setTimer(data);
  }, []);

  const handleTimerWarning = useCallback((data) => {
    console.log(`⚠️ ${data.remaining} seconds remaining!`);
  }, []);

  const handleGameEnded = useCallback((results) => {
    setGameResults(results);
    setGameState('results');
  }, []);

  const handlePlayerDisconnected = useCallback((data) => {
    console.log(`${data.username} disconnected`);
  }, []);

  const handleError = useCallback((data) => {
    setError(data.message);
  }, []);

  const handleLightningActivated = useCallback((data) => {
    setLightningCharges(data.lightningCharges);
    setLightningActive(true);
    console.log(`⚡ Lightning activated! ${data.lightningCharges} charges remaining`);
  }, []);

  const handleLightningDeactivated = useCallback(() => {
    setLightningActive(false);
    console.log('Lightning deactivated');
  }, []);

  const createRoom = useCallback((username, settings) => {
    socketService.createRoom(username, settings, (response) => {
      if (response.success) {
        setPlayerId(response.data.playerId);
        setRoom(response.data.room);
        setPlayers(response.data.room.players);
        setGameState('lobby');
        setError(null);
      } else {
        setError(response.error);
      }
    });
  }, []);

  const joinRoom = useCallback((roomCode, username) => {
    socketService.joinRoom(roomCode, username, (response) => {
      if (response.success) {
        setPlayerId(response.data.playerId);
        setRoom(response.data.room);
        setPlayers(response.data.room.players);
        setGameState('lobby');
        setError(null);
      } else {
        setError(response.error);
      }
    });
  }, []);

  const leaveRoom = useCallback(() => {
    socketService.leaveRoom();
    setGameState('home');
    setRoom(null);
    setPlayers([]);
    setMaze(null);
    setGameResults(null);
  }, []);

  const toggleReady = useCallback((isReady) => {
    socketService.setReady(isReady);
  }, []);

  const startGame = useCallback(() => {
    socketService.startGame();
  }, []);

  const restartRoom = useCallback(() => {
    socketService.restartRoom();
  }, []);

  const movePlayer = useCallback((direction) => {
    socketService.movePlayer(direction);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const useLightning = useCallback(() => {
    socketService.useLightning();
  }, []);

  const value = {
    gameState,
    room,
    playerId,
    players,
    maze,
    timer,
    gameResults,
    error,
    playerPositions,
    lightningCharges,
    lightningActive,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    startGame,
    restartRoom,
    movePlayer,
    useLightning,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

