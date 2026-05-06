/**
 * @class Snake
 * Represents the snake entity model.
 * Tracks the snake's position, movement state, and starting coordinates.
 */
export default class Snake {
	/**
	 * Creates a new Snake instance and initializes its state.
	 */
	constructor() {
		this.init();
	}

	/**
	 * Initializes snake state with starting coordinates and movement status.
	 * Sets isMoving to false, clears current coordinates, and defines start position.
	 */
	init() {
		this.isMoving = false;
		this.snakeCoords = [];
		this.snakeStartCoords = [
			{ x: 3, y: 12 },
			{ x: 3, y: 13 },
		];
	}

	/**
	 * Activates snake movement by setting the isMoving flag to true.
	 */
	startMoving() {
		this.isMoving = true;
	}
}
