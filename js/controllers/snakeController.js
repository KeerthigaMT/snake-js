import Snake from '../models/snake.js';

/**
 * @class SnakeController
 * Controls snake movement, rendering, collision detection, and game state.
 * Handles user input direction changes, food/bomb interactions, and game over conditions.
 */
export default class SnakeController {
	/**
	 * Creates a new SnakeController instance, initializes snake state, and performs initial render.
	 *
	 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
	 * @param {BoardController} boardController - The board controller instance for cell lookups
	 * @param {HTMLImageElement} snakeBody - The snake body segment image
	 * @param {HTMLImageElement} snakeHead - The snake head image
	 */
	constructor(context, boardController, snakeBody, snakeHead) {
		this.init(boardController);
		this.render(context, boardController, snakeBody, snakeHead);
	}

	/**
	 * Initializes snake state with starting position, direction, and board references.
	 * Populates snake coordinates with actual board cell object references.
	 *
	 * @param {BoardController} boardController - The board controller instance for cell lookups
	 */
	init(boardController) {
		this.deltaX = 0;
		this.deltaY = -1;
		this.snake = new Snake();
		this.degree = 180;

		for (let coord of this.snake.snakeStartCoords) {
			let cell = boardController.getCell(coord.x, coord.y);
			this.snake.snakeCoords.push(cell);
		}
	}
	/**
	 * Renders the snake to the canvas with rotated head and body segments.
	 * The head is rotated based on the current direction (degree property).
	 *
	 * @param {CanvasRenderingContext2D} context - The canvas 2D rendering context
	 * @param {BoardController} boardController - The board controller for position calculations
	 * @param {HTMLImageElement} snakeBody - The snake body segment image
	 * @param {HTMLImageElement} snakeHead - The snake head image
	 */
	render(context, boardController, snakeBody, snakeHead) {
		this.boardController = boardController;
		const halfHeadSize = snakeHead.width / 2;
		this.snake.snakeCoords.forEach((cell, i) => {
			window.requestAnimationFrame(() => {
				if (i === 0) {
					context.save();
					context.translate(
						cell.x * boardController.cellWidth + boardController.offsetX,
						cell.y * boardController.cellheight + boardController.offsetY
					);
					context.translate(halfHeadSize, halfHeadSize);
					context.rotate((this.degree * Math.PI) / 180);
					context.drawImage(snakeHead, -halfHeadSize, -halfHeadSize);
					context.restore();
				} else {
					context.drawImage(
						snakeBody,
						cell.x * boardController.cellWidth + boardController.offsetX,
						cell.y * boardController.cellheight + boardController.offsetY
					);
				}
			});
		});
	}
	/**
	 * Moves the snake one step in the current direction.
	 * Handles collision detection (walls, self, food, bombs) and updates game state flags.
	 * Sets gameOver flag on collision. Sets playFood or playBomb flags for sound effects.
	 */
	move() {
		if (!this.snake.isMoving) {
			return;
		}
		let cell = this.getNextCell();
		if (!cell || this.snake.snakeCoords.includes(cell)) {
			this.gameOver = true;
			return;
		}

		if (cell) {
			this.snake.snakeCoords.unshift(cell);
			if (cell.hasFood) {
				this.playFood = true;
				this.boardController.removeObject(cell, 'food');
				this.boardController.addFood(this);
				return;
			}
			if (cell.hasBomb) {
				this.playBomb = true;
				this.gameOver = true;
			}
			this.snake.snakeCoords.pop();
		}
	}
	/**
	 * Calculates the next cell position based on current direction (deltaX, deltaY).
	 *
	 * @returns {Object|undefined} The next cell object {x, y} if valid, undefined if off-grid
	 */
	getNextCell() {
		let head = this.snake.snakeCoords[0];
		return this.boardController.getCell(head.x + this.deltaX, head.y + this.deltaY);
	}
}
