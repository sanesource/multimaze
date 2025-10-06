const express = require("express");
const router = express.Router();
const roomManager = require("../services/roomManager");
const { asyncHandler } = require("../middleware/errorHandler");
const validator = require("../utils/validation");

/**
 * GET /api/health - Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/stats - Get server statistics
 */
router.get("/stats", (req, res) => {
  const stats = roomManager.getStats();
  res.json({
    success: true,
    data: stats,
  });
});

/**
 * GET /api/rooms - Get list of public rooms
 */
router.get("/rooms", (req, res) => {
  const rooms = roomManager.getPublicRooms();
  res.json({
    success: true,
    data: rooms,
  });
});

/**
 * GET /api/rooms/:roomId - Get room details
 */
router.get(
  "/rooms/:roomId",
  asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    const validation = validator.validateRoomCode(roomId);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const room = roomManager.getRoom(validation.roomCode);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found",
      });
    }

    res.json({
      success: true,
      data: room.toLobbyJSON(),
    });
  })
);

/**
 * POST /api/rooms/validate - Validate room code
 */
router.post(
  "/rooms/validate",
  asyncHandler(async (req, res) => {
    const { roomCode } = req.body;

    const validation = validator.validateRoomCode(roomCode);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const exists = roomManager.roomExists(validation.roomCode);
    const room = exists ? roomManager.getRoom(validation.roomCode) : null;

    if (!exists) {
      return res.json({
        success: true,
        valid: false,
        message: "Room not found",
      });
    }

    if (room.status !== "waiting") {
      return res.json({
        success: true,
        valid: false,
        message: "Game has already started",
      });
    }

    if (room.getPlayerCount() >= room.settings.maxPlayers) {
      return res.json({
        success: true,
        valid: false,
        message: "Room is full",
      });
    }

    res.json({
      success: true,
      valid: true,
      room: room.toLobbyJSON(),
    });
  })
);

module.exports = router;
