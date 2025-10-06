const { v4: uuidv4 } = require("uuid");
const roomManager = require("../services/roomManager");
const mazeGenerator = require("../services/mazeGenerator");
const rankingService = require("../services/rankingService");
const pathfinder = require("../utils/pathfinding");
const validator = require("../utils/validation");
const Player = require("../models/Player");

/**
 * Socket.io event handlers for game logic
 */
class GameHandlers {
  constructor(io) {
    this.io = io;
  }

  /**
   * Handle socket connection
   */
  handleConnection(socket) {
    console.log(`Client connected: ${socket.id}`);

    // Register event handlers
    socket.on("create-room", (data, callback) =>
      this.onCreateRoom(socket, data, callback)
    );
    socket.on("join-room", (data, callback) =>
      this.onJoinRoom(socket, data, callback)
    );
    socket.on("leave-room", () => this.onLeaveRoom(socket));
    socket.on("player-ready", (data) => this.onPlayerReady(socket, data));
    socket.on("start-game", () => this.onStartGame(socket));
    socket.on("player-move", (data) => this.onPlayerMove(socket, data));
    socket.on("disconnect", () => this.onDisconnect(socket));
  }

  /**
   * Create a new room
   */
  onCreateRoom(socket, data, callback) {
    try {
      const { username, settings } = data;

      // Validate username
      const usernameValidation = validator.validateUsername(username);
      if (!usernameValidation.isValid) {
        return callback({ success: false, error: usernameValidation.error });
      }

      // Validate room settings
      const settingsValidation = validator.validateRoomSettings(settings || {});
      if (!settingsValidation.isValid) {
        return callback({
          success: false,
          error: settingsValidation.errors.join(", "),
        });
      }

      // Create player
      const playerId = uuidv4();
      const player = new Player(
        playerId,
        usernameValidation.username,
        socket.id
      );

      // Create room
      const room = roomManager.createRoom(playerId, settings || {});
      room.addPlayer(player);
      roomManager.addPlayerToRoom(playerId, room.roomId);

      // Join socket room
      socket.join(room.roomId);
      socket.data.playerId = playerId;
      socket.data.roomId = room.roomId;

      console.log(`Room created: ${room.roomId} by ${player.username}`);

      callback({
        success: true,
        data: {
          roomId: room.roomId,
          playerId: playerId,
          room: room.toJSON(),
        },
      });

      // Notify room
      this.io.to(room.roomId).emit("room-updated", room.toJSON());
    } catch (error) {
      console.error("Error creating room:", error);
      callback({ success: false, error: error.message });
    }
  }

  /**
   * Join an existing room
   */
  onJoinRoom(socket, data, callback) {
    try {
      const { roomCode, username } = data;

      // Validate room code
      const roomValidation = validator.validateRoomCode(roomCode);
      if (!roomValidation.isValid) {
        return callback({ success: false, error: roomValidation.error });
      }

      // Validate username
      const usernameValidation = validator.validateUsername(username);
      if (!usernameValidation.isValid) {
        return callback({ success: false, error: usernameValidation.error });
      }

      // Get room
      const room = roomManager.getRoom(roomValidation.roomCode);
      if (!room) {
        return callback({ success: false, error: "Room not found" });
      }

      if (room.status !== "waiting") {
        return callback({ success: false, error: "Game has already started" });
      }

      if (room.getPlayerCount() >= room.settings.maxPlayers) {
        return callback({ success: false, error: "Room is full" });
      }

      // Create player
      const playerId = uuidv4();
      const player = new Player(
        playerId,
        usernameValidation.username,
        socket.id
      );

      // Add to room
      room.addPlayer(player);
      roomManager.addPlayerToRoom(playerId, room.roomId);

      // Join socket room
      socket.join(room.roomId);
      socket.data.playerId = playerId;
      socket.data.roomId = room.roomId;

      console.log(`${player.username} joined room: ${room.roomId}`);

      callback({
        success: true,
        data: {
          roomId: room.roomId,
          playerId: playerId,
          room: room.toJSON(),
        },
      });

      // Notify all players in room
      this.io.to(room.roomId).emit("room-updated", room.toJSON());
      this.io.to(room.roomId).emit("player-joined", {
        player: player.toJSON(),
        message: `${player.username} joined the room`,
      });
    } catch (error) {
      console.error("Error joining room:", error);
      callback({ success: false, error: error.message });
    }
  }

  /**
   * Leave room
   */
  onLeaveRoom(socket) {
    try {
      const { playerId, roomId } = socket.data;
      if (!playerId || !roomId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const player = room.getPlayer(playerId);
      const username = player ? player.username : "Player";

      room.removePlayer(playerId);
      roomManager.removePlayerFromRoom(playerId);
      socket.leave(roomId);

      console.log(`${username} left room: ${roomId}`);

      // If room is empty or was waiting and host left, delete it
      if (
        room.getPlayerCount() === 0 ||
        (room.status === "waiting" && playerId === room.hostId)
      ) {
        roomManager.deleteRoom(roomId);
        this.io
          .to(roomId)
          .emit("room-closed", { message: "Room has been closed" });
      } else {
        // Notify remaining players
        this.io.to(roomId).emit("room-updated", room.toJSON());
        this.io.to(roomId).emit("player-left", {
          playerId,
          username,
          message: `${username} left the room`,
        });
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }

  /**
   * Player ready
   */
  onPlayerReady(socket, data) {
    try {
      const { playerId, roomId } = socket.data;
      const { isReady } = data;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const player = room.getPlayer(playerId);
      if (!player) return;

      player.setReady(isReady);
      room.updateActivity();

      console.log(`${player.username} ready status: ${isReady}`);

      // Notify room
      this.io.to(roomId).emit("room-updated", room.toJSON());
    } catch (error) {
      console.error("Error setting ready:", error);
    }
  }

  /**
   * Start game
   */
  onStartGame(socket) {
    try {
      const { playerId, roomId } = socket.data;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      // Only host can start
      if (playerId !== room.hostId) {
        return socket.emit("error", {
          message: "Only the host can start the game",
        });
      }

      if (room.getPlayerCount() === 0) {
        return socket.emit("error", {
          message: "Need at least one player to start",
        });
      }

      // Generate maze
      const maze = mazeGenerator.generate(
        room.settings.difficulty,
        room.settings.maxPlayers
      );
      room.setMaze(maze);

      // Assign start positions to players
      const players = room.getAllPlayers();
      players.forEach((player, index) => {
        const startPos =
          maze.startPositions[index % maze.startPositions.length];
        player.setPosition(startPos.x, startPos.y);
      });

      // Start game
      room.startGame();

      console.log(`Game started in room: ${roomId}`);

      // Notify all players
      this.io.to(roomId).emit("game-started", room.toJSON());

      // Start game timer
      this.startGameTimer(room);
    } catch (error) {
      console.error("Error starting game:", error);
      socket.emit("error", { message: error.message });
    }
  }

  /**
   * Handle player movement
   */
  onPlayerMove(socket, data) {
    try {
      const { playerId, roomId } = socket.data;
      const { direction } = data;

      // Validate direction
      const validation = validator.validateMovement(direction);
      if (!validation.isValid) return;

      const room = roomManager.getRoom(roomId);
      if (!room || !room.isGameActive()) return;

      const player = room.getPlayer(playerId);
      if (!player) return;

      // Calculate new position
      const { x, y } = player.position;
      let newX = x;
      let newY = y;

      switch (direction) {
        case "up":
          newY--;
          break;
        case "down":
          newY++;
          break;
        case "left":
          newX--;
          break;
        case "right":
          newX++;
          break;
      }

      // Validate move
      if (!room.maze.isValidPosition(newX, newY)) {
        return; // Invalid move, ignore
      }

      // Update position
      player.setPosition(newX, newY);
      player.incrementMoves();
      room.updateActivity();

      // Check if reached endpoint
      if (newX === room.maze.endpoint.x && newY === room.maze.endpoint.y) {
        const completionTime = room.getElapsedTime();
        player.finish(completionTime);

        console.log(`${player.username} finished in ${completionTime}s`);

        // Notify room
        this.io.to(roomId).emit("player-finished", {
          playerId: player.playerId,
          username: player.username,
          completionTime,
        });

        // Check if this was the first finisher
        if (!room.winner) {
          room.setWinner(player.playerId);
          this.io.to(roomId).emit("winner-announced", {
            playerId: player.playerId,
            username: player.username,
          });
        }

        // Check if all players finished
        const allFinished = room.getAllPlayers().every((p) => p.hasFinished);
        if (allFinished) {
          this.endGame(room);
        }
      } else {
        // Calculate distance to endpoint
        const distance = pathfinder.findShortestDistance(
          player.position,
          room.maze.endpoint,
          room.maze.grid
        );
        player.updateDistance(distance);
      }

      // Broadcast position update
      this.io.to(roomId).emit("player-moved", {
        playerId: player.playerId,
        position: player.position,
        moves: player.moves,
      });
    } catch (error) {
      console.error("Error handling move:", error);
    }
  }

  /**
   * Handle disconnect
   */
  onDisconnect(socket) {
    try {
      const { playerId, roomId } = socket.data;

      console.log(`Client disconnected: ${socket.id}`);

      if (!playerId || !roomId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      const player = room.getPlayer(playerId);
      if (!player) return;

      // Mark as disconnected
      player.setConnected(false);

      // If in waiting status, remove player
      if (room.status === "waiting") {
        this.onLeaveRoom(socket);
      } else {
        // During game, keep player but mark as disconnected
        this.io.to(roomId).emit("player-disconnected", {
          playerId,
          username: player.username,
        });
        this.io.to(roomId).emit("room-updated", room.toJSON());
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  }

  /**
   * Start game timer
   */
  startGameTimer(room) {
    const duration = room.settings.timerDuration;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed++;
      const remaining = duration - elapsed;

      // Broadcast timer update
      this.io.to(room.roomId).emit("timer-update", {
        elapsed,
        remaining,
      });

      // Warnings
      if (remaining === 60 || remaining === 30 || remaining === 10) {
        this.io.to(room.roomId).emit("timer-warning", { remaining });
      }

      // Time's up
      if (remaining <= 0) {
        clearInterval(timer);
        this.endGame(room);
      }
    }, 1000);

    room.gameTimer = timer;
  }

  /**
   * End game
   */
  endGame(room) {
    try {
      if (room.gameTimer) {
        clearInterval(room.gameTimer);
        room.gameTimer = null;
      }

      room.endGame();

      // Calculate final distances for players who didn't finish
      const players = room.getAllPlayers();
      players.forEach((player) => {
        if (!player.hasFinished) {
          const distance = pathfinder.findShortestDistance(
            player.position,
            room.maze.endpoint,
            room.maze.grid
          );
          player.updateDistance(distance);
        }
      });

      // Calculate rankings
      const results = rankingService.getGameResults(room);

      console.log(`Game ended in room: ${room.roomId}`);

      // Notify all players
      this.io.to(room.roomId).emit("game-ended", results);
    } catch (error) {
      console.error("Error ending game:", error);
    }
  }
}

module.exports = GameHandlers;
