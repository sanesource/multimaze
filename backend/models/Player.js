class Player {
  constructor(playerId, username, socketId) {
    this.playerId = playerId;
    this.username = username || `Player-${playerId.slice(0, 6)}`;
    this.socketId = socketId;
    this.position = { x: 0, y: 0 };
    this.isReady = false;
    this.isConnected = true;
    this.moves = 0;
    this.completionTime = null;
    this.distanceToEnd = Infinity;
    this.rank = null;
    this.hasFinished = false;
    this.joinedAt = Date.now();
    this.checkpointsReached = []; // Array of checkpoint orders reached
    this.nextCheckpoint = 1; // The next checkpoint order to reach
    this.lightningCharges = 3;
    this.lightningActive = false;
    this.lightningEndTime = null;
    this.team = null; // 'A', 'B', or null for team mode
    // Power-ups (single-player only)
    this.timeFreezeCharges = 1;
    this.frozenUntil = null; // Timestamp when freeze ends, or null
  }

  setPosition(x, y) {
    this.position = { x, y };
  }

  incrementMoves() {
    this.moves++;
  }

  setReady(ready) {
    this.isReady = ready;
  }

  setConnected(connected) {
    this.isConnected = connected;
  }

  setTeam(team) {
    this.team = team;
  }

  finish(time) {
    this.hasFinished = true;
    this.completionTime = time;
    this.distanceToEnd = 0;
  }

  updateDistance(distance) {
    this.distanceToEnd = distance;
  }

  setRank(rank) {
    this.rank = rank;
  }

  reachCheckpoint(checkpointOrder) {
    if (!this.checkpointsReached.includes(checkpointOrder)) {
      this.checkpointsReached.push(checkpointOrder);
      this.nextCheckpoint = Math.max(...this.checkpointsReached) + 1;
    }
  }

  hasReachedCheckpoint(checkpointOrder) {
    return this.checkpointsReached.includes(checkpointOrder);
  }

  canFinish() {
    // Player can finish if they've reached all 3 checkpoints
    return this.checkpointsReached.length >= 3;
  }

  useLightning() {
    if (this.lightningCharges > 0) {
      this.lightningCharges--;
      this.lightningActive = true;
      this.lightningEndTime = Date.now() + 2000;
      return true;
    }
    return false;
  }

  deactivateLightning() {
    this.lightningActive = false;
    this.lightningEndTime = null;
  }

  useTimeFreeze() {
    if (this.timeFreezeCharges > 0) {
      this.timeFreezeCharges--;
      return true;
    }
    return false;
  }

  freeze(duration) {
    this.frozenUntil = Date.now() + duration;
  }

  unfreeze() {
    this.frozenUntil = null;
  }

  isFrozen() {
    if (this.frozenUntil === null) return false;
    if (Date.now() >= this.frozenUntil) {
      this.unfreeze();
      return false;
    }
    return true;
  }

  reset() {
    // Reset player to lobby state
    this.position = { x: 0, y: 0 };
    this.isReady = false;
    this.moves = 0;
    this.completionTime = null;
    this.distanceToEnd = Infinity;
    this.rank = null;
    this.hasFinished = false;
    this.checkpointsReached = [];
    this.nextCheckpoint = 1;
    this.lightningCharges = 3;
    this.lightningActive = false;
    this.lightningEndTime = null;
    this.team = null;
    this.timeFreezeCharges = 1;
    this.frozenUntil = null;
  }

  toJSON() {
    return {
      playerId: this.playerId,
      username: this.username,
      position: this.position,
      isReady: this.isReady,
      isConnected: this.isConnected,
      moves: this.moves,
      completionTime: this.completionTime,
      distanceToEnd: this.distanceToEnd,
      rank: this.rank,
      hasFinished: this.hasFinished,
      checkpointsReached: this.checkpointsReached,
      nextCheckpoint: this.nextCheckpoint,
      lightningCharges: this.lightningCharges,
      lightningActive: this.lightningActive,
      team: this.team,
      timeFreezeCharges: this.timeFreezeCharges,
      frozenUntil: this.frozenUntil,
    };
  }
}

module.exports = Player;
