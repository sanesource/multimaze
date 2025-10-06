const config = require("../config/config");

/**
 * Input validation utilities
 */
class Validator {
  /**
   * Validate room settings
   */
  validateRoomSettings(settings) {
    const errors = [];

    // Validate difficulty
    const validDifficulties = ["easy", "medium", "hard"];
    if (
      settings.difficulty &&
      !validDifficulties.includes(settings.difficulty)
    ) {
      errors.push(`Difficulty must be one of: ${validDifficulties.join(", ")}`);
    }

    // Validate timer duration
    if (settings.timerDuration) {
      const duration = parseInt(settings.timerDuration);
      if (
        isNaN(duration) ||
        duration < config.timerSettings.min ||
        duration > config.timerSettings.max
      ) {
        errors.push(
          `Timer duration must be between ${config.timerSettings.min} and ${config.timerSettings.max} seconds`
        );
      }
    }

    // Validate max players
    if (settings.maxPlayers) {
      const maxPlayers = parseInt(settings.maxPlayers);
      if (
        isNaN(maxPlayers) ||
        maxPlayers < 2 ||
        maxPlayers > config.maxPlayersPerRoom
      ) {
        errors.push(
          `Max players must be between 2 and ${config.maxPlayersPerRoom}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate username
   */
  validateUsername(username) {
    if (!username) {
      return { isValid: false, error: "Username is required" };
    }

    if (typeof username !== "string") {
      return { isValid: false, error: "Username must be a string" };
    }

    const trimmed = username.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      return {
        isValid: false,
        error: "Username must be between 2 and 20 characters",
      };
    }

    // Basic sanitization check
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(trimmed)) {
      return {
        isValid: false,
        error:
          "Username can only contain letters, numbers, underscores, and hyphens",
      };
    }

    return { isValid: true, username: trimmed };
  }

  /**
   * Validate room code
   */
  validateRoomCode(roomCode) {
    if (!roomCode) {
      return { isValid: false, error: "Room code is required" };
    }

    if (typeof roomCode !== "string") {
      return { isValid: false, error: "Room code must be a string" };
    }

    const trimmed = roomCode.trim().toUpperCase();
    if (trimmed.length !== 6) {
      return { isValid: false, error: "Room code must be 6 characters" };
    }

    return { isValid: true, roomCode: trimmed };
  }

  /**
   * Validate player movement
   */
  validateMovement(direction) {
    const validDirections = ["up", "down", "left", "right"];
    if (!validDirections.includes(direction)) {
      return { isValid: false, error: "Invalid direction" };
    }
    return { isValid: true };
  }

  /**
   * Sanitize input string
   */
  sanitize(input) {
    if (typeof input !== "string") return "";
    return input.trim().slice(0, 100); // Limit length
  }
}

module.exports = new Validator();
