/**
 * Ranking Service - Calculates player rankings
 */
class RankingService {
  /**
   * Calculate rankings for all players in a room
   * @param {Room} room
   * @returns {Array} Sorted array of players with rankings
   */
  calculateRankings(room) {
    const players = room.getAllPlayers();

    // Sort players by:
    // 1. Players who finished (by completion time)
    // 2. Players who didn't finish (by distance to endpoint)
    const sorted = players.sort((a, b) => {
      // Both finished
      if (a.hasFinished && b.hasFinished) {
        return a.completionTime - b.completionTime;
      }

      // Only a finished
      if (a.hasFinished) return -1;

      // Only b finished
      if (b.hasFinished) return 1;

      // Neither finished - sort by distance (closer = better)
      if (a.distanceToEnd !== b.distanceToEnd) {
        return a.distanceToEnd - b.distanceToEnd;
      }

      // Tie-breaker: fewer moves is better
      return a.moves - b.moves;
    });

    // Assign ranks
    sorted.forEach((player, index) => {
      player.setRank(index + 1);
    });

    return sorted;
  }

  /**
   * Get results summary for end game screen
   * @param {Room} room
   * @returns {Object}
   */
  getGameResults(room) {
    const rankedPlayers = this.calculateRankings(room);

    const results = {
      roomId: room.roomId,
      gameTime: room.getElapsedTime(),
      winner: rankedPlayers[0],
      rankings: rankedPlayers.map((player) => ({
        rank: player.rank,
        playerId: player.playerId,
        username: player.username,
        hasFinished: player.hasFinished,
        completionTime: player.completionTime,
        distanceToEnd: player.distanceToEnd,
        moves: player.moves,
        progressPercentage: this.calculateProgressPercentage(player, room.maze),
      })),
      statistics: {
        totalPlayers: rankedPlayers.length,
        finishers: rankedPlayers.filter((p) => p.hasFinished).length,
        averageTime: this.calculateAverageTime(rankedPlayers),
        averageMoves: this.calculateAverageMoves(rankedPlayers),
      },
    };

    return results;
  }

  /**
   * Calculate progress percentage (simplified)
   */
  calculateProgressPercentage(player, maze) {
    if (player.hasFinished) return 100;

    // Calculate based on distance remaining
    const maxDistance = this.calculateDistance(
      maze.startPositions[0],
      maze.endpoint,
      maze
    );

    if (maxDistance === 0) return 0;

    const progress = ((maxDistance - player.distanceToEnd) / maxDistance) * 100;
    return Math.max(0, Math.min(100, Math.round(progress)));
  }

  /**
   * Calculate average completion time
   */
  calculateAverageTime(players) {
    const finishers = players.filter((p) => p.hasFinished);
    if (finishers.length === 0) return 0;

    const total = finishers.reduce((sum, p) => sum + p.completionTime, 0);
    return Math.round(total / finishers.length);
  }

  /**
   * Calculate average moves
   */
  calculateAverageMoves(players) {
    if (players.length === 0) return 0;

    const total = players.reduce((sum, p) => sum + p.moves, 0);
    return Math.round(total / players.length);
  }

  /**
   * Calculate distance between two points (Manhattan distance)
   */
  calculateDistance(from, to, maze) {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
  }
}

module.exports = new RankingService();
