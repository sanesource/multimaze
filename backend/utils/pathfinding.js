/**
 * A* Pathfinding Algorithm for calculating shortest distance
 */
class Pathfinder {
  /**
   * Calculate shortest path distance using A*
   * @param {Object} start - {x, y}
   * @param {Object} end - {x, y}
   * @param {Array} grid - 2D array (0 = path, 1 = wall)
   * @returns {number} Distance or Infinity if no path
   */
  findShortestDistance(start, end, grid) {
    const openSet = new Set();
    const closedSet = new Set();
    const startKey = `${start.x},${start.y}`;
    const endKey = `${end.x},${end.y}`;

    const gScore = new Map(); // Cost from start
    const fScore = new Map(); // Estimated total cost

    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, end));

    while (openSet.size > 0) {
      // Get node with lowest fScore
      let current = this.getLowestFScore(openSet, fScore);

      if (current === endKey) {
        return gScore.get(current);
      }

      openSet.delete(current);
      closedSet.add(current);

      const [x, y] = current.split(",").map(Number);
      const neighbors = this.getNeighbors(x, y, grid);

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        if (closedSet.has(neighborKey)) continue;

        const tentativeGScore = gScore.get(current) + 1;

        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
          continue;
        }

        gScore.set(neighborKey, tentativeGScore);
        fScore.set(
          neighborKey,
          tentativeGScore + this.heuristic(neighbor, end)
        );
      }
    }

    return Infinity; // No path found
  }

  /**
   * Manhattan distance heuristic
   */
  heuristic(from, to) {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
  }

  /**
   * Get valid neighbors
   */
  getNeighbors(x, y, grid) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 1, dy: 0 }, // Right
      { dx: 0, dy: 1 }, // Down
      { dx: -1, dy: 0 }, // Left
    ];

    for (const { dx, dy } of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (this.isValidPosition(nx, ny, grid)) {
        neighbors.push({ x: nx, y: ny });
      }
    }

    return neighbors;
  }

  /**
   * Check if position is valid
   */
  isValidPosition(x, y, grid) {
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
      return false;
    }
    return grid[y][x] === 0; // 0 = path, 1 = wall
  }

  /**
   * Get node with lowest fScore
   */
  getLowestFScore(openSet, fScore) {
    let lowest = null;
    let lowestScore = Infinity;

    for (const node of openSet) {
      const score = fScore.get(node) || Infinity;
      if (score < lowestScore) {
        lowestScore = score;
        lowest = node;
      }
    }

    return lowest;
  }
}

module.exports = new Pathfinder();
