const Maze = require("../models/Maze");

/**
 * Maze Generator using Randomized Depth-First Search (DFS) algorithm
 */
class MazeGenerator {
  constructor() {
    this.directions = [
      { dx: 0, dy: -2 }, // Up
      { dx: 2, dy: 0 }, // Right
      { dx: 0, dy: 2 }, // Down
      { dx: -2, dy: 0 }, // Left
    ];
  }

  /**
   * Generate a maze based on difficulty
   * @param {string} difficulty - 'easy', 'medium', or 'hard'
   * @param {number} maxPlayers - Maximum number of players
   * @returns {Maze}
   */
  generate(difficulty, maxPlayers) {
    const sizeMap = {
      easy: 15,
      medium: 25,
      hard: 35,
    };

    const size = sizeMap[difficulty] || 25;
    const dimensions = { width: size, height: size };

    const maze = new Maze(difficulty, dimensions);

    // Initialize grid with walls (1)
    const grid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(1));

    // Generate maze using DFS (perfect maze: single path between any two cells)
    this.generateMazeDFS(grid, 1, 1);

    // Add extra connections to create loops (multiple paths)
    this.addLoops(grid, difficulty);

    // Ensure borders are walls (never carve borders)
    this.ensureBorders(grid, size);

    // Set the grid
    maze.setGrid(grid);

    // Generate start positions
    const startPositions = this.generateStartPositions(grid, maxPlayers);
    maze.setStartPositions(startPositions);

    // Set endpoint (bottom-right area)
    const endpoint = this.findEndpoint(grid, size);
    maze.setEndpoint(endpoint);

    return maze;
  }

  /**
   * Generate maze using Depth-First Search
   */
  generateMazeDFS(grid, startX, startY) {
    const stack = [[startX, startY]];
    grid[startY][startX] = 0; // Mark as path

    while (stack.length > 0) {
      const [x, y] = stack[stack.length - 1];

      // Get unvisited neighbors
      const neighbors = this.getUnvisitedNeighbors(grid, x, y);

      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }

      // Choose random neighbor
      const [nx, ny, wx, wy] =
        neighbors[Math.floor(Math.random() * neighbors.length)];

      // Remove wall between current cell and chosen neighbor
      grid[wy][wx] = 0;
      grid[ny][nx] = 0;

      stack.push([nx, ny]);
    }
  }

  /**
   * Add loops by removing some interior walls between adjacent path cells
   * The density of loops depends on difficulty
   */
  addLoops(grid, difficulty) {
    const size = grid.length;

    // Loop density by difficulty: higher means more extra openings
    const densityMap = {
      easy: 0.04,
      medium: 0.08,
      hard: 0.12,
    };
    const density = densityMap[difficulty] || densityMap.medium;
    const minLoopsMap = {
      easy: 1,
      medium: 2,
      hard: 3,
    };
    const minLoops = minLoopsMap[difficulty] || minLoopsMap.medium;

    let loopsAdded = 0;

    // Iterate only interior coordinates, skip borders entirely
    for (let y = 2; y < size - 2; y++) {
      for (let x = 2; x < size - 2; x++) {
        // Consider only wall positions that sit between two cells:
        // - Vertical walls have (x odd, y even)
        // - Horizontal walls have (x even, y odd)
        const isVerticalWall = x % 2 === 1 && y % 2 === 0;
        const isHorizontalWall = x % 2 === 0 && y % 2 === 1;
        if (!isVerticalWall && !isHorizontalWall) continue;

        if (grid[y][x] !== 1) continue; // Only carve existing walls

        // Check the two sides are both paths (cells)
        let canCarve = false;
        if (isVerticalWall) {
          // Above and below must be paths
          if (grid[y - 1][x] === 0 && grid[y + 1][x] === 0) {
            canCarve = true;
          }
        } else if (isHorizontalWall) {
          // Left and right must be paths
          if (grid[y][x - 1] === 0 && grid[y][x + 1] === 0) {
            canCarve = true;
          }
        }

        if (!canCarve) continue;

        // Randomly carve based on density
        if (Math.random() < density) {
          grid[y][x] = 0;
          loopsAdded++;
        }
      }
    }

    // Guarantee at least a minimum number of loops by targeting near endpoint
    if (loopsAdded < minLoops) {
      const endX = size - 2;
      const endY = size - 2;
      const tryCarve = (x, y) => {
        const isVerticalWall = x % 2 === 1 && y % 2 === 0;
        const isHorizontalWall = x % 2 === 0 && y % 2 === 1;
        if (!isVerticalWall && !isHorizontalWall) return false;
        if (grid[y][x] !== 1) return false;
        if (isVerticalWall) {
          if (grid[y - 1][x] === 0 && grid[y + 1][x] === 0) {
            grid[y][x] = 0;
            return true;
          }
        } else if (isHorizontalWall) {
          if (grid[y][x - 1] === 0 && grid[y][x + 1] === 0) {
            grid[y][x] = 0;
            return true;
          }
        }
        return false;
      };

      // Expand search square around the endpoint until enough loops are carved
      for (let radius = 2; radius <= 6 && loopsAdded < minLoops; radius++) {
        const minX = Math.max(2, endX - radius);
        const maxX = Math.min(size - 3, endX + radius);
        const minY = Math.max(2, endY - radius);
        const maxY = Math.min(size - 3, endY + radius);

        for (let y = minY; y <= maxY && loopsAdded < minLoops; y++) {
          for (let x = minX; x <= maxX && loopsAdded < minLoops; x++) {
            if (tryCarve(x, y)) {
              loopsAdded++;
            }
          }
        }
      }
    }
  }

  /**
   * Get unvisited neighbors
   */
  getUnvisitedNeighbors(grid, x, y) {
    const neighbors = [];
    const size = grid.length;

    for (const { dx, dy } of this.directions) {
      const nx = x + dx;
      const ny = y + dy;
      const wx = x + dx / 2; // Wall between cells
      const wy = y + dy / 2;

      if (
        nx > 0 &&
        nx < size - 1 &&
        ny > 0 &&
        ny < size - 1 &&
        grid[ny][nx] === 1
      ) {
        neighbors.push([nx, ny, wx, wy]);
      }
    }

    return neighbors;
  }

  /**
   * Ensure borders are all walls
   */
  ensureBorders(grid, size) {
    for (let i = 0; i < size; i++) {
      grid[0][i] = 1;
      grid[size - 1][i] = 1;
      grid[i][0] = 1;
      grid[i][size - 1] = 1;
    }
  }

  /**
   * Generate start positions for players
   * All players start at the same position (top-left)
   */
  generateStartPositions(grid, maxPlayers) {
    const positions = [];
    const size = grid.length;

    // All players start at top-left corner (1, 1)
    // Ensure the position is a valid path
    const startX = 1;
    const startY = 1;

    // Make sure the starting position is a path
    if (grid[startY] && grid[startY][startX] !== undefined) {
      grid[startY][startX] = 0; // Ensure it's a path
    }

    // Return the same position for all players
    for (let i = 0; i < maxPlayers; i++) {
      positions.push({ x: startX, y: startY });
    }

    return positions;
  }

  /**
   * Find endpoint in the bottom-right corner
   * Always place at bottom-right (size-2, size-2)
   */
  findEndpoint(grid, size) {
    // Always use bottom-right corner
    const endX = size - 2;
    const endY = size - 2;

    // Ensure the endpoint is a valid path
    if (grid[endY] && grid[endY][endX] !== undefined) {
      grid[endY][endX] = 0; // Ensure it's a path
    }

    return { x: endX, y: endY };
  }
}

module.exports = new MazeGenerator();
