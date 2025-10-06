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
    };
  }
}

module.exports = Player;
