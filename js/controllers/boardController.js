import Board from './../models/board.js';

/**
 * @class BoardController
 * Controls board rendering and game object placement logic.
 * Manages cell rendering, food/bomb placement, and available cell calculations.
 */
export default class BoardController {
	/**
	 * Creates a new BoardController instance and initializes the board model.
	 */
	constructor() {
		this.init();
	}

	/**
	 * Initializes a new Board model instance.
	 */
	init() {
		this.board = new Board();
	}

	/**
	 * Renders the game board and all game objects (cells, food, bombs) to the canvas.
	 * Calculates cell dimensions and canvas offsets for centered rendering.
	 *
	 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
	 * @param {HTMLImageElement} cell - The cell background image
	 * @param {HTMLImageElement} food - The food item image
	 * @param {HTMLImageElement} bomb - The bomb item image
	 */
	render(context, cell, food, bomb) {
		this.cellWidth = cell.width + 1;
		this.cellHeight = cell.height + 1;
		this.offsetX = (context.canvas.width - this.cellWidth * this.board.boardWidth) / 2;
		this.offsetY = (context.canvas.height - this.cellHeight * this.board.boardHeight) / 2;
		this.board.cells.forEach((cellCoords) => {
			window.requestAnimationFrame(() => {
				context.drawImage(
					cell,
					cellCoords.x * this.cellWidth + this.offsetX,
					cellCoords.y * this.cellHeight + this.offsetY
				);
				if (cellCoords.hasFood) {
					context.drawImage(
						food,
						cellCoords.x * this.cellWidth + this.offsetX,
						cellCoords.y * this.cellHeight + this.offsetY
					);
				}
				if (cellCoords.hasBomb) {
					context.drawImage(
						bomb,
						cellCoords.x * this.cellWidth + this.offsetX,
						cellCoords.y * this.cellHeight + this.offsetY
					);
				}
			});
		});
	}

	/**
	 * Retrieves a cell object at the specified grid coordinates.
	 *
	 * @param {number} x - The x-coordinate (column index)
	 * @param {number} y - The y-coordinate (row index)
	 * @returns {Object|undefined} The cell object {x, y} if found, undefined otherwise
	 */
	getCell(x, y) {
		return this.board.cells.find((c) => c.x === x && c.y === y);
	}

	/**
	 * Generates a random integer between min and max (inclusive).
	 *
	 * @param {number} min - The minimum value (inclusive)
	 * @param {number} max - The maximum value (inclusive)
	 * @returns {number} A random integer in the range [min, max]
	 */
	getRandomCell(min, max) {
		return Math.floor(Math.random() * (max + 1 - min) + min);
	}

	/**
	 * Finds a random available cell that is not occupied by food, bomb, or snake.
	 *
	 * @param {SnakeController} snakeController - The snake controller instance to check snake position
	 * @returns {Object} A random available cell object {x, y}
	 */
	getAvailableCell(snakeController) {
		const availableCells = this.board.cells.filter((cell) => {
			if (cell.hasFood || cell.hasBomb) {
				return;
			}
			return !snakeController.snake.snakeCoords.includes(cell);
		});
		let idx = this.getRandomCell(0, availableCells.length - 1);
		return availableCells[idx];
	}
	/**
	 * Adds food to a random available cell on the board.
	 *
	 * @param {SnakeController} snakeController - The snake controller instance to avoid snake position
	 */
	addFood(snakeController) {
		let cell = this.getAvailableCell(snakeController);
		cell.hasFood = true;
	}

	/**
	 * Adds a bomb to a random available cell on the board.
	 *
	 * @param {SnakeController} snakeController - The snake controller instance to avoid snake position
	 */
	addBomb(snakeController) {
		let cell = this.getAvailableCell(snakeController);
		cell.hasBomb = true;
	}

	/**
	 * Adds a game object (food or bomb) to a random available cell.
	 * If adding a bomb, clears all existing bombs first.
	 *
	 * @param {SnakeController} snakeController - The snake controller instance to avoid snake position
	 * @param {string} type - The object type to add ('food' or 'bomb')
	 */
	addObject(snakeController, type) {
		let cell = this.getAvailableCell(snakeController);
		if (type === 'food') {
			cell.hasFood = true;
		}
		if (type === 'bomb') {
			this.removeBombs();
			cell.hasBomb = true;
		}
	}
	/**
	 * Removes a game object (food or bomb) from the specified cell.
	 *
	 * @param {Object} cell - The cell object to remove the object from
	 * @param {string} type - The object type to remove ('food' or 'bomb')
	 */
	removeObject(cell, type) {
		if (type === 'food') {
			cell.hasFood = false;
		}
		if (type === 'bomb') {
			cell.hasBomb = false;
		}
	}

	/**
	 * Clears all bombs from the board by setting hasBomb to false on all cells.
	 */
	removeBombs() {
		this.board.cells.forEach((cell) => (cell.hasBomb = false));
	}
}
