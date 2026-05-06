/**
 * @class Board
 * Represents the game board grid model.
 * Maintains a collection of cell coordinates for rendering and collision detection.
 */
export default class Board {
	/**
	 * Creates a new Board instance and initializes the grid.
	 */
	constructor() {
		this.init();
		this.create();
	}

	/**
	 * Initializes board state with empty cells array and grid dimensions.
	 */
	init() {
		this.cells = [];
		this.boadWidth = 15;
		this.boadHeight = 15;
	}

	/**
	 * Populates the cells array with coordinate objects for each grid position.
	 * Creates a 2D grid represented as a flat array of {x, y} coordinate objects.
	 */
	create() {
		for (let x = 0; x < this.boadWidth; x++) {
			for (let y = 0; y < this.boadHeight; y++) {
				this.cells.push({ x, y });
			}
		}
	}
}
