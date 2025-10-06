const Room = require("../models/Room");
const config = require("../config/config");

/**
 * Room Manager - Handles room creation, deletion, and management
 */
class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
    this.playerRoomMap = new Map(); // playerId -> roomId

    // Periodically clean up inactive rooms
    this.startCleanupTask();
  }

  /**
   * Create a new room
   */
  createRoom(hostId, settings) {
    if (this.rooms.size >= config.maxRooms) {
      throw new Error("Maximum number of rooms reached");
    }

    const room = new Room(hostId, settings);
    this.rooms.set(room.roomId, room);

    return room;
  }

  /**
   * Get room by ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Get room by player ID
   */
  getRoomByPlayerId(playerId) {
    const roomId = this.playerRoomMap.get(playerId);
    return roomId ? this.rooms.get(roomId) : null;
  }

  /**
   * Add player to room mapping
   */
  addPlayerToRoom(playerId, roomId) {
    this.playerRoomMap.set(playerId, roomId);
  }

  /**
   * Remove player from room mapping
   */
  removePlayerFromRoom(playerId) {
    this.playerRoomMap.delete(playerId);
  }

  /**
   * Delete a room
   */
  deleteRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      // Remove all player mappings
      for (const playerId of room.players.keys()) {
        this.playerRoomMap.delete(playerId);
      }
      this.rooms.delete(roomId);
    }
  }

  /**
   * Get all public rooms (for lobby list)
   */
  getPublicRooms() {
    const publicRooms = [];
    for (const room of this.rooms.values()) {
      if (room.status === "waiting") {
        publicRooms.push(room.toLobbyJSON());
      }
    }
    return publicRooms;
  }

  /**
   * Get room count
   */
  getRoomCount() {
    return this.rooms.size;
  }

  /**
   * Check if room code exists
   */
  roomExists(roomId) {
    return this.rooms.has(roomId);
  }

  /**
   * Start cleanup task for inactive rooms
   */
  startCleanupTask() {
    setInterval(() => {
      this.cleanupInactiveRooms();
    }, 60000); // Check every minute
  }

  /**
   * Clean up inactive rooms
   */
  cleanupInactiveRooms() {
    const timeout = config.roomInactivityTimeout;
    const roomsToDelete = [];

    for (const [roomId, room] of this.rooms.entries()) {
      // Delete finished rooms after timeout
      if (room.isGameFinished() && room.isInactive(timeout)) {
        roomsToDelete.push(roomId);
      }
      // Delete waiting rooms with no players after timeout
      else if (
        room.status === "waiting" &&
        room.getPlayerCount() === 0 &&
        room.isInactive(timeout)
      ) {
        roomsToDelete.push(roomId);
      }
    }

    roomsToDelete.forEach((roomId) => {
      console.log(`Cleaning up inactive room: ${roomId}`);
      this.deleteRoom(roomId);
    });
  }

  /**
   * Get statistics
   */
  getStats() {
    let activeGames = 0;
    let waitingRooms = 0;
    let totalPlayers = 0;

    for (const room of this.rooms.values()) {
      if (room.status === "in-progress") activeGames++;
      if (room.status === "waiting") waitingRooms++;
      totalPlayers += room.getPlayerCount();
    }

    return {
      totalRooms: this.rooms.size,
      activeGames,
      waitingRooms,
      totalPlayers,
    };
  }
}

module.exports = new RoomManager();
