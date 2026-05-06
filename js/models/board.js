import { GRID } from '../constants.js';

export default class Board {
	constructor() {
		this.init();
		this.create();
	}
	init() {
		this.cells = [];
		this.boadWidth = GRID.width;
		this.boadHeight = GRID.height;
	}
	create() {
		for (let x = 0; x < this.boadWidth; x++) {
			for (let y = 0; y < this.boadHeight; y++) {
				this.cells.push({ x, y });
			}
		}
	}
}
