export default class Board {
	constructor() {
		this.init();
		this.create();
	}
	init() {
		this.cells = [];
		this.boardWidth = 15;
		this.boardHeight = 15;
	}
	create() {
		for (let x = 0; x < this.boardWidth; x++) {
			for (let y = 0; y < this.boardHeight; y++) {
				this.cells.push({ x, y });
			}
		}
	}
}
