const { v4: uuidv4 } = require("uuid");

class Room {
  constructor(hostId, settings) {
    this.roomId = this.generateRoomCode();
    this.hostId = hostId;
    this.players = new Map(); // playerId -> Player
    this.settings = {
      difficulty: settings.difficulty || "hard",
      timerDuration: settings.timerDuration || 300, // seconds
      maxPlayers: Math.min(settings.maxPlayers || 8, 16),
    };
    this.status = "waiting"; // 'waiting', 'in-progress', 'finished'
    this.maze = null;
    this.startTime = null;
    this.endTime = null;
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.gameTimer = null;
    this.winner = null;
  }

  generateRoomCode() {
    // Generate a 6-character room code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  addPlayer(player) {
    if (this.players.size >= this.settings.maxPlayers) {
      throw new Error("Room is full");
    }
    if (this.status !== "waiting") {
      throw new Error("Game has already started");
    }
    this.players.set(player.playerId, player);
    this.updateActivity();
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.updateActivity();

    // If host leaves, transfer to another player or close room
    if (playerId === this.hostId && this.players.size > 0) {
      this.hostId = Array.from(this.players.keys())[0];
      const newHost = this.players.get(this.hostId);
      if (newHost) {
        newHost.setReady(true);
      }
    }
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  getAllPlayers() {
    return Array.from(this.players.values());
  }

  getPlayerCount() {
    return this.players.size;
  }

  areAllPlayersReady() {
    if (this.players.size === 0) return false;
    return this.getAllPlayers().every((player) => player.isReady);
  }

  setMaze(maze) {
    this.maze = maze;
  }

  startGame() {
    if (this.status !== "waiting") {
      throw new Error("Game already started or finished");
    }
    if (this.players.size === 0) {
      throw new Error("No players in room");
    }

    this.status = "in-progress";
    this.startTime = Date.now();
    this.updateActivity();
  }

  endGame() {
    this.status = "finished";
    this.endTime = Date.now();
    this.updateActivity();
  }

  isGameActive() {
    return this.status === "in-progress";
  }

  isGameFinished() {
    return this.status === "finished";
  }

  getElapsedTime() {
    if (!this.startTime) return 0;
    const endTime = this.endTime || Date.now();
    return Math.floor((endTime - this.startTime) / 1000);
  }

  getRemainingTime() {
    const elapsed = this.getElapsedTime();
    return Math.max(0, this.settings.timerDuration - elapsed);
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  isInactive(timeout) {
    return Date.now() - this.lastActivity > timeout;
  }

  setWinner(playerId) {
    this.winner = playerId;
  }

  resetToLobby() {
    // Reset room state to waiting (lobby)
    this.status = "waiting";
    this.maze = null;
    this.startTime = null;
    this.endTime = null;
    this.winner = null;

    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    // Reset all players to lobby state
    this.getAllPlayers().forEach((player) => {
      player.reset();
      // Keep host ready, others not ready
      if (player.playerId === this.hostId) {
        player.setReady(true);
      }
    });

    this.updateActivity();
  }

  toJSON() {
    return {
      roomId: this.roomId,
      hostId: this.hostId,
      playerCount: this.players.size,
      players: this.getAllPlayers().map((p) => p.toJSON()),
      settings: this.settings,
      status: this.status,
      maze: this.maze ? this.maze.toJSON() : null,
      startTime: this.startTime,
      endTime: this.endTime,
      elapsedTime: this.getElapsedTime(),
      remainingTime: this.getRemainingTime(),
      winner: this.winner,
    };
  }

  toLobbyJSON() {
    // Lighter version for lobby list
    return {
      roomId: this.roomId,
      playerCount: this.players.size,
      maxPlayers: this.settings.maxPlayers,
      difficulty: this.settings.difficulty,
      timerDuration: this.settings.timerDuration,
      status: this.status,
    };
  }
}

module.exports = Room;
