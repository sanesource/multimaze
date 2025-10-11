class Maze {
  constructor(difficulty, dimensions) {
    this.difficulty = difficulty;
    this.dimensions = dimensions;
    this.grid = [];
    this.startPositions = [];
    this.endpoint = { x: dimensions.width - 2, y: dimensions.height - 2 };
    this.checkpoints = []; // Array of {x, y, order} objects
  }

  setGrid(grid) {
    this.grid = grid;
  }

  setStartPositions(positions) {
    this.startPositions = positions;
  }

  setEndpoint(endpoint) {
    this.endpoint = endpoint;
  }

  setCheckpoints(checkpoints) {
    this.checkpoints = checkpoints;
  }

  isValidPosition(x, y) {
    if (
      x < 0 ||
      y < 0 ||
      x >= this.dimensions.width ||
      y >= this.dimensions.height
    ) {
      return false;
    }
    return this.grid[y][x] === 0; // 0 = path, 1 = wall
  }

  getCell(x, y) {
    if (
      x < 0 ||
      y < 0 ||
      x >= this.dimensions.width ||
      y >= this.dimensions.height
    ) {
      return 1; // Out of bounds = wall
    }
    return this.grid[y][x];
  }

  toJSON() {
    return {
      difficulty: this.difficulty,
      dimensions: this.dimensions,
      grid: this.grid,
      startPositions: this.startPositions,
      endpoint: this.endpoint,
      checkpoints: this.checkpoints,
    };
  }
}

module.exports = Maze;
