import BoardController from './controllers/boardController.js';
import SnakeController from './controllers/snakeController.js';
import { CANVAS, TIMING, ASSETS, AUDIO } from './constants.js';

/**
 * @class Game
 * Main game orchestrator class that manages game initialization, asset loading,
 * rendering, game loop, scoring, input handling, and game over logic.
 * Coordinates interaction between BoardController and SnakeController via dependency injection.
 */
export default class Game {
	/**
	 * Creates a new Game instance, initializes state, and begins asset preloading.
	 */
	constructor() {
		this.init();
		this.preload();
	}

	/**
	 * Initializes canvas context, dimensions, and score state.
	 */
	init() {
		this.canvas = document.querySelector('canvas');
		this.context = this.canvas.getContext('2d');
		this.maxWidth = CANVAS.maxWidth;
		this.maxHeight = CANVAS.maxHeight;
		this.width = 0;
		this.height = 0;
		this.centerX = this.context.canvas.width / 2;
		this.centerY = this.context.canvas.height / 2;
		this.score = 0;
	}
	/**
	 * Asynchronously preloads all game assets (images and sounds) then creates game instances.
	 * @async
	 */
	async preload() {
		await this.preloadImages();
		await this.preloadSounds();
		this.create();
	}

	/**
	 * Asynchronously loads all game images (background, cells, food, snake, bomb).
	 * @async
	 */
	async preloadImages() {
		this.background = await this.preloadImage(ASSETS.images.background, 0, 0);
		this.cell = await this.preloadImage(ASSETS.images.cell);
		this.food = await this.preloadImage(ASSETS.images.food);
		this.snakeBody = await this.preloadImage(ASSETS.images.snakeBody);
		this.snakeHead = await this.preloadImage(ASSETS.images.snakeHead);
		this.bomb = await this.preloadImage(ASSETS.images.bomb);
	}
	/**
	 * Asynchronously loads all game sounds (bomb, food, game over, background music).
	 * @async
	 */
	async preloadSounds() {
		this.bombSound = await this.preloadSound(ASSETS.sounds.bomb);
		this.foodSound = await this.preloadSound(ASSETS.sounds.food);
		this.gameOverSound = await this.preloadSound(ASSETS.sounds.gameOver);
		this.snakeSound = await this.preloadSound(ASSETS.sounds.snakeCharmer);
		this.snakeSound.loop = AUDIO.snakeSoundLoop;
		this.snakeSound.volume = AUDIO.snakeSoundVolume;
	}
	/**
	 * Loads a single image asynchronously and optionally draws it to canvas.
	 *
	 * @async
	 * @param {string} path - The image URL or path
	 * @param {number} [x=-100] - X-coordinate for initial draw (off-screen by default)
	 * @param {number} [y=-100] - Y-coordinate for initial draw (off-screen by default)
	 * @returns {Promise<HTMLImageElement>} The loaded image element
	 */
	async preloadImage(path, x = -100, y = -100) {
		let image = new Image();
		await new Promise((resolve, reject) => {
			image.src = path;
			image.addEventListener('load', () => {
				window.requestAnimationFrame(() => {
					this.context.drawImage(image, x, y);
				});
				resolve(image);
			});
			image.addEventListener('error', () => {
				reject(new Error("Couldn't load image"));
			});
		});
		return image;
	}
	/**
	 * Loads a single audio file asynchronously.
	 *
	 * @async
	 * @param {string} path - The audio file URL or path
	 * @returns {Promise<HTMLAudioElement>} The loaded audio element
	 */
	async preloadSound(path) {
		let sound = new Audio();
		await new Promise((resolve, reject) => {
			sound.src = path;
			sound.loop = false;
			sound.load();
			sound.addEventListener(
				'canplaythrough',
				() => {
					resolve(sound);
				},
				{ once: true }
			);
			sound.addEventListener('error', () => {
				reject(new Error("Couldn't load sound"));
			});
		});
		return sound;
	}
	/**
	 * Creates game controller instances, resizes canvas, spawns initial objects,
	 * and sets up event listeners. Called after all assets are loaded.
	 */
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
	/**
	 * Sets up keyboard event listeners for arrow key input to control snake direction.
	 * Starts the game on first keypress.
	 */
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
	/**
	 * Configures canvas font and color for score rendering.
	 */
	createFont() {
		this.context.font = '20px Roboto';
		this.context.fillStyle = '#747474';
	}

	/**
	 * Renders the current score to the canvas.
	 */
	createScore() {
		this.context.fillText(`Score: ${this.score}`, 25, 25);
	}

	/**
	 * Draws the background image centered on the canvas.
	 */
	drawBackground() {
		this.context.drawImage(
			this.background,
			(this.width - this.background.width) / 2,
			(this.height - this.background.height) / 2
		);
	}
	/**
	 * Resizes canvas to fit window while maintaining aspect ratio and minimum dimensions.
	 * Redraws background and board after resize.
	 */
	resizeCanvas() {
		this.minWidth = (this.boardController.board.boardWidth + 1) * (this.cell.width + 1);
		this.minHeight = (this.boardController.board.boardHeight + 1) * (this.cell.height + 1);
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
	/**
	 * Adjusts canvas dimensions to fit window width while maintaining aspect ratio.
	 */
	fitWidth() {
		this.height = Math.round((this.width * window.innerHeight) / window.innerWidth);
		this.height = Math.min(this.height, this.maxHeight);
		this.height = Math.max(this.height, this.minHeight);
		this.width = Math.round((window.innerWidth * this.height) / window.innerHeight);
		this.canvas.style.width = '100%';
	}

	/**
	 * Adjusts canvas dimensions to fit window height while maintaining aspect ratio.
	 */
	fitHeight() {
		this.width = Math.round((window.innerWidth * this.maxHeight) / window.innerHeight);
		this.width = Math.min(this.width, this.maxWidth);
		this.width = Math.max(this.width, this.minWidth);
		this.height = Math.round((this.width * window.innerHeight) / window.innerWidth);
		this.canvas.style.height = '100%';
	}
	/**
	 * Main game loop update function.
	 * Moves snake, clears canvas, renders all game elements, updates score,
	 * plays sound effects, and checks game over condition.
	 */
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
	/**
	 * Starts the game by playing background music and setting up game loop intervals.
	 * Update interval runs at 150ms (game speed). Bomb spawn interval at 5000ms.
	 */
	start() {
		this.snakeSound.play();
		this.updateInterval = setInterval(() => {
			this.update();
		}, TIMING.tickInterval);
		this.bombInterval = setInterval(() => {
			this.boardController.addObject(this.snakeController, 'bomb');
		}, TIMING.bombInterval);
	}

	/**
	 * Handles game over state by stopping music, clearing intervals,
	 * showing alert, and reloading the page to restart.
	 */
	gameOver() {
		this.snakeSound.pause();
		this.gameOverSound.play();
		clearInterval(this.updateInterval);
		clearInterval(this.bombInterval);
		alert('Game Over');
		window.location.reload();
	}
}
