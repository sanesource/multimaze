require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  maxRooms: parseInt(process.env.MAX_ROOMS) || 50,
  maxPlayersPerRoom: parseInt(process.env.MAX_PLAYERS_PER_ROOM) || 8,
  roomInactivityTimeout:
    parseInt(process.env.ROOM_INACTIVITY_TIMEOUT) || 600000, // 10 minutes
  positionUpdateInterval: parseInt(process.env.POSITION_UPDATE_INTERVAL) || 100, // 100ms

  // Maze difficulty settings
  mazeDifficulty: {
    easy: { size: 15, complexity: 0.3 },
    medium: { size: 25, complexity: 0.5 },
    hard: { size: 35, complexity: 0.7 },
  },

  // Timer settings
  timerSettings: {
    min: 120, // 2 minutes
    max: 600, // 10 minutes
    default: 300, // 5 minutes
  },
};
