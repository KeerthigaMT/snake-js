import { GRID } from '../constants.js';

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
		this.boadWidth = GRID.width;
		this.boadHeight = GRID.height;
	}

	/**
	 * Populates the cells array with coordinate objects for each grid position.
	 * Creates a 2D grid represented as a flat array of {x, y} coordinate objects.
	 */
	create() {
		for (let x = 0; x < this.boardWidth; x++) {
			for (let y = 0; y < this.boardHeight; y++) {
				this.cells.push({ x, y });
			}
		}
	}
}
