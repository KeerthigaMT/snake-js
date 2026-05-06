import { SNAKE } from '../constants.js';

export default class Snake {
	constructor() {
		this.init();
	}
	init() {
		this.isMoving = false;
		this.snakeCoords = [];
		this.snakeStartCoords = SNAKE.startCoords;
	}
	startMoving() {
		this.isMoving = true;
	}
}
