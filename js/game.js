import BoardController from './controllers/boardController.js';
import SnakeController from './controllers/snakeController.js';
import AssetLoader from './infrastructure/assetLoader.js';
import { AUDIO } from './constants.js';

export default class Game {
	constructor() {
		this.init();
		this.preload();
	}
	init() {
		this.canvas = document.querySelector('canvas');
		this.context = this.canvas.getContext('2d');
		this.maxWidth = 640;
		this.maxHeight = 360;
		this.width = 0;
		this.height = 0;
		this.centerX = this.context.canvas.width / 2;
		this.centerY = this.context.canvas.height / 2;
		this.score = 0;
	}
	async preload() {
		const assetLoader = new AssetLoader({ context: this.context });
		const { images, sounds } = await assetLoader.loadAll();

		// Assign loaded images
		this.background = images.background;
		this.cell = images.cell;
		this.food = images.food;
		this.snakeBody = images.snakeBody;
		this.snakeHead = images.snakeHead;
		this.bomb = images.bomb;

		// Assign loaded sounds
		this.bombSound = sounds.bomb;
		this.foodSound = sounds.food;
		this.gameOverSound = sounds.gameOver;
		this.snakeSound = sounds.snakeCharmer;

		// Configure background music
		this.snakeSound.loop = AUDIO.snakeSoundLoop;
		this.snakeSound.volume = AUDIO.snakeSoundVolume;

		this.create();
	}
	create() {
		this.boardController = new BoardController();
		this.resizeCanvas();
		this.snakeController = new SnakeController(
			this.context,
			this.boardController,
			this.snakeBody,
			this.snakeHead
		);
		this.boardController.addObject(this.snakeController, 'food');
		this.boardController.addObject(this.snakeController, 'bomb');
		this.createListeners();
		this.createFont();
	}
	createListeners() {
		let gameisStarted = false;
		window.addEventListener('keydown', (e) => {
			if (!gameisStarted) {
				gameisStarted = true;
				this.start();
			}
			const { key } = e;
			if (key === 'ArrowUp') {
				this.snakeController.deltaX = 0;
				this.snakeController.deltaY = -1;
				this.snakeController.degree = 0;
			} else if (key === 'ArrowDown') {
				this.snakeController.deltaX = 0;
				this.snakeController.deltaY = 1;
				this.snakeController.degree = 180;
			} else if (key === 'ArrowLeft') {
				this.snakeController.deltaX = -1;
				this.snakeController.deltaY = 0;
				this.snakeController.degree = 270;
			} else if (key === 'ArrowRight') {
				this.snakeController.deltaX = 1;
				this.snakeController.deltaY = 0;
				this.snakeController.degree = 90;
			}
			this.snakeController.snake.startMoving();
		});
	}
	createFont() {
		this.context.font = '20px Roboto';
		this.context.fillStyle = '#747474';
	}
	createScore() {
		this.context.fillText(`Score: ${this.score}`, 25, 25);
	}
	drawBackground() {
		this.context.drawImage(
			this.background,
			(this.width - this.background.width) / 2,
			(this.height - this.background.height) / 2
		);
	}
	resizeCanvas() {
		this.minWidth = (this.boardController.board.boadWidth + 1) * (this.cell.width + 1);
		this.minHeight = (this.boardController.board.boadHeight + 1) * (this.cell.height + 1);
		if (window.innerWidth / window.innerHeight > this.maxWidth / this.maxHeight) {
			this.fitWidth();
		} else {
			this.fitHeight();
		}
		this.context.canvas.width = this.width;
		this.context.canvas.height = this.height;
		this.drawBackground();
		this.boardController &&
			this.boardController.render(this.context, this.cell, this.food, this.bomb);
	}
	fitWidth() {
		this.height = Math.round((this.width * window.innerHeight) / window.innerWidth);
		this.height = Math.min(this.height, this.maxHeight);
		this.height = Math.max(this.height, this.minHeight);
		this.width = Math.round((window.innerWidth * this.height) / window.innerHeight);
		this.canvas.style.width = '100%';
	}
	fitHeight() {
		this.width = Math.round((window.innerWidth * this.maxHeight) / window.innerHeight);
		this.width = Math.min(this.width, this.maxWidth);
		this.width = Math.max(this.width, this.minWidth);
		this.height = Math.round((this.width * window.innerHeight) / window.innerWidth);
		this.canvas.style.height = '100%';
	}
	update() {
		this.snakeController.move();
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
		this.drawBackground();
		this.boardController.render(this.context, this.cell, this.food, this.bomb);
		this.snakeController.render(this.context, this.boardController, this.snakeBody, this.snakeHead);
		this.createScore();

		if (this.snakeController.playBomb) {
			this.bombSound.play();
			this.snakeController.playBomb = false;
		}
		if (this.snakeController.playFood) {
			this.score++;
			this.foodSound.play();
			this.snakeController.playFood = false;
		}
		if (this.snakeController.gameOver) {
			this.gameOver();
		}
	}
	start() {
		this.snakeSound.play();
		this.updateInterval = setInterval(() => {
			this.update();
		}, 150);
		this.bombInterval = setInterval(() => {
			this.boardController.addObject(this.snakeController, 'bomb');
		}, 5000);
	}

	gameOver() {
		this.snakeSound.pause();
		this.gameOverSound.play();
		clearInterval(this.updateInterval);
		clearInterval(this.bombInterval);
		alert('Game Over');
		window.location.reload();
	}
}
