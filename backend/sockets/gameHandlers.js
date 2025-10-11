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
    socket.on("select-team", (data) => this.onSelectTeam(socket, data));
    socket.on("start-game", () => this.onStartGame(socket));
    socket.on("restart-room", () => this.onRestartRoom(socket));
    socket.on("player-move", (data) => this.onPlayerMove(socket, data));
    socket.on("use-lightning", () => this.onUseLightning(socket));
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
      // Host is always ready
      player.setReady(true);
      roomManager.addPlayerToRoom(playerId, room.roomId);

      // Join socket room
      socket.join(room.roomId);
      socket.data.playerId = playerId;
      socket.data.roomId = room.roomId;

      console.log(`Room created: ${room.roomId} by ${player.username} (Tunnel Mode: ${room.settings.tunnelMode})`);

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

      // Force host to remain ready
      const isHost = playerId === room.hostId;
      player.setReady(isHost ? true : isReady);
      room.updateActivity();

      console.log(`${player.username} ready status: ${isReady}`);

      // Notify room
      this.io.to(roomId).emit("room-updated", room.toJSON());
    } catch (error) {
      console.error("Error setting ready:", error);
    }
  }

  /**
   * Select team (team mode only)
   */
  onSelectTeam(socket, data) {
    try {
      const { playerId, roomId } = socket.data;
      const { team } = data;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      // Validate team mode is enabled
      if (!room.settings.teamMode) {
        return socket.emit("error", {
          message: "Team selection is only available in team mode",
        });
      }

      // Validate game is in waiting state
      if (room.status !== "waiting") {
        return socket.emit("error", {
          message: "Cannot change team after game has started",
        });
      }

      // Validate team value
      if (team !== "A" && team !== "B") {
        return socket.emit("error", {
          message: "Invalid team selection",
        });
      }

      const player = room.getPlayer(playerId);
      if (!player) return;

      player.setTeam(team);
      room.updateActivity();

      console.log(`${player.username} joined Team ${team}`);

      // Notify room
      this.io.to(roomId).emit("room-updated", room.toJSON());
    } catch (error) {
      console.error("Error selecting team:", error);
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

      // Require all players to be ready
      if (!room.areAllPlayersReady()) {
        return socket.emit("error", {
          message: "All players must be ready before starting the game",
        });
      }

      if (room.getPlayerCount() === 0) {
        return socket.emit("error", {
          message: "Need at least one player to start",
        });
      }

      // In team mode, validate all players have selected a team
      if (room.settings.teamMode) {
        if (!room.allPlayersHaveTeam()) {
          return socket.emit("error", {
            message: "All players must select a team before starting",
          });
        }

        // Validate both teams have at least one player
        const teamACount = room.getTeamCount("A");
        const teamBCount = room.getTeamCount("B");
        
        if (teamACount === 0 || teamBCount === 0) {
          return socket.emit("error", {
            message: "Both Team A and Team B must have at least one player",
          });
        }
      }

      // Calculate checkpoint count for team mode
      let checkpointCount = 3; // Default
      let enableCheckpoints = room.settings.enableCheckpoints;
      
      if (room.settings.teamMode) {
        // Team mode always enables checkpoints
        enableCheckpoints = true;
        // Checkpoint count = max team size
        const teamACount = room.getTeamCount("A");
        const teamBCount = room.getTeamCount("B");
        checkpointCount = Math.max(teamACount, teamBCount);
      }

      // Generate maze
      const maze = mazeGenerator.generate(
        room.settings.difficulty,
        room.settings.maxPlayers,
        enableCheckpoints,
        checkpointCount
      );
      room.setMaze(maze);

      // Initialize team checkpoints
      room.teamCheckpoints = { A: [], B: [] };

      // Assign start positions to players
      const players = room.getAllPlayers();
      players.forEach((player, index) => {
        const startPos =
          maze.startPositions[index % maze.startPositions.length];
        player.setPosition(startPos.x, startPos.y);
      });

      // Start game
      room.startGame();

      console.log(`Game started in room: ${roomId} (Team mode: ${room.settings.teamMode}, Checkpoints: ${checkpointCount})`);

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
   * Restart room - return to lobby after game ends
   */
  onRestartRoom(socket) {
    try {
      const { playerId, roomId } = socket.data;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      // Only host can restart
      if (playerId !== room.hostId) {
        return socket.emit("error", {
          message: "Only the host can restart the room",
        });
      }

      // Can only restart from finished state
      if (!room.isGameFinished()) {
        return socket.emit("error", {
          message: "Game must be finished to restart",
        });
      }

      // Reset room to lobby state
      room.resetToLobby();

      console.log(`Room restarted: ${roomId}`);

      // Notify all players to return to lobby
      this.io.to(roomId).emit("room-restarted", room.toJSON());
    } catch (error) {
      console.error("Error restarting room:", error);
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

      // Check if reached a checkpoint
      if ((room.settings.enableCheckpoints || room.settings.teamMode) && room.maze.checkpoints.length > 0) {
        const checkpoint = room.maze.checkpoints.find(
          (cp) => cp.x === newX && cp.y === newY
        );

        if (checkpoint) {
          // Team mode: shared checkpoints
          if (room.settings.teamMode && player.team) {
            // Check if team hasn't reached this checkpoint yet
            if (!room.hasTeamReachedCheckpoint(player.team, checkpoint.order)) {
              room.addTeamCheckpoint(player.team, checkpoint.order);
              console.log(
                `${player.username} (Team ${player.team}) reached checkpoint ${checkpoint.order} for their team`
              );

              // Notify the room about team checkpoint
              this.io.to(roomId).emit("team-checkpoint-reached", {
                team: player.team,
                checkpointOrder: checkpoint.order,
                playerId: player.playerId,
                username: player.username,
              });
            }
          } else {
            // Individual mode: each player tracks their own
            if (checkpoint.order === player.nextCheckpoint) {
              player.reachCheckpoint(checkpoint.order);
              console.log(
                `${player.username} reached checkpoint ${checkpoint.order}`
              );

              // Notify the room
              this.io.to(roomId).emit("checkpoint-reached", {
                playerId: player.playerId,
                username: player.username,
                checkpointOrder: checkpoint.order,
                nextCheckpoint: player.nextCheckpoint,
              });
            }
          }
        }
      }

      // Check if reached endpoint
      if (newX === room.maze.endpoint.x && newY === room.maze.endpoint.y) {
        // Validate finish conditions
        let canFinish = true;
        let errorMessage = "";

        if (room.settings.teamMode && player.team) {
          // Team mode: check if team has all checkpoints
          canFinish = room.canTeamFinish(player.team);
          if (!canFinish) {
            const teamCheckpoints = room.getTeamCheckpoints(player.team).length;
            const totalCheckpoints = room.maze?.checkpoints?.length || 0;
            errorMessage = `Your team must reach all checkpoints first! (${teamCheckpoints}/${totalCheckpoints})`;
          }
        } else if (room.settings.enableCheckpoints) {
          // Individual mode: check if player has all checkpoints
          canFinish = player.canFinish();
          if (!canFinish) {
            errorMessage = `You must reach all checkpoints first! (${player.checkpointsReached.length}/3)`;
          }
        }

        if (canFinish) {
          const completionTime = room.getElapsedTime();
          player.finish(completionTime);

          console.log(`${player.username} finished in ${completionTime}s`);

          // Notify room
          this.io.to(roomId).emit("player-finished", {
            playerId: player.playerId,
            username: player.username,
            completionTime,
            team: player.team,
          });

          // Team mode: check for team victory
          if (room.settings.teamMode && player.team) {
            if (room.hasTeamFinished(player.team)) {
              // This team has won!
              room.winningTeam = player.team;
              console.log(`Team ${player.team} wins!`);
              
              this.io.to(roomId).emit("team-victory", {
                winningTeam: player.team,
              });

              // End the game
              this.endGame(room);
            }
          } else {
            // Individual mode
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
          }
        } else {
          // Player tried to finish without meeting requirements
          socket.emit("error", {
            message: errorMessage,
          });
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
   * Use lightning charge
   */
  onUseLightning(socket) {
    try {
      const { playerId, roomId } = socket.data;

      const room = roomManager.getRoom(roomId);
      if (!room || !room.isGameActive()) return;

      const player = room.getPlayer(playerId);
      if (!player) return;

      // Check if tunnel mode is enabled
      if (!room.settings.tunnelMode) {
        return socket.emit("error", {
          message: "Lightning is only available in Tunnel Mode",
        });
      }

      // Try to use lightning
      const success = player.useLightning();
      if (!success) {
        return socket.emit("error", {
          message: "No lightning charges remaining",
        });
      }

      console.log(`${player.username} used lightning (${player.lightningCharges} charges remaining)`);

      // Emit to player that lightning is activated
      socket.emit("lightning-activated", {
        lightningCharges: player.lightningCharges,
        duration: 2000,
      });

      // Set timer to deactivate lightning after 2 seconds
      setTimeout(() => {
        player.deactivateLightning();
        socket.emit("lightning-deactivated");
        console.log(`${player.username} lightning deactivated`);
      }, 2000);

    } catch (error) {
      console.error("Error using lightning:", error);
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
