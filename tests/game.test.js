import { describe, it, expect, beforeEach, vi } from 'vitest';
import Game from '../js/game.js';
import BoardController from '../js/controllers/boardController.js';
import SnakeController from '../js/controllers/snakeController.js';
import { createMockCanvasContext } from './helpers/createMockCanvasContext.js';

describe('Game - Characterization Tests', () => {
	let mockCanvas;
	let mockContext;

	beforeEach(() => {
		// Mock canvas and context
		mockContext = createMockCanvasContext();
		mockCanvas = {
			getContext: vi.fn(() => mockContext),
			style: {},
		};

		// Mock document.querySelector
		global.document = {
			querySelector: vi.fn(() => mockCanvas),
		};

		// Mock requestAnimationFrame
		global.requestAnimationFrame = vi.fn((cb) => cb());

		// Mock window
		global.window = {
			addEventListener: vi.fn(),
			innerWidth: 800,
			innerHeight: 600,
			location: { reload: vi.fn() },
			requestAnimationFrame: vi.fn((cb) => cb()),
		};

		// Mock setInterval and clearInterval
		global.setInterval = vi.fn(() => 12345);
		global.clearInterval = vi.fn();

		// Mock alert
		global.alert = vi.fn();

		// Mock Image and Audio to prevent async loading issues
		global.Image = vi.fn(function () {
			return { width: 10, height: 10, src: '', addEventListener: vi.fn() };
		});
		global.Audio = vi.fn(function () {
			return { src: '', loop: false, volume: 1, load: vi.fn(), play: vi.fn(), pause: vi.fn(), addEventListener: vi.fn() };
		});
	});

	describe('Constructor and init()', () => {
		it('should call init() during construction', () => {
			const initSpy = vi.spyOn(Game.prototype, 'init');
			new Game();
			expect(initSpy).toHaveBeenCalled();
			initSpy.mockRestore();
		});

		it('should set up canvas from document.querySelector in init()', () => {
			const game = new Game();
			expect(document.querySelector).toHaveBeenCalledWith('canvas');
			expect(game.canvas).toBe(mockCanvas);
		});

		it('should get 2d context from canvas', () => {
			const game = new Game();
			expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
			expect(game.context).toBe(mockContext);
		});

		it('should initialize maxWidth to 640', () => {
			const game = new Game();
			expect(game.maxWidth).toBe(640);
		});

		it('should initialize maxHeight to 360', () => {
			const game = new Game();
			expect(game.maxHeight).toBe(360);
		});

		it('should initialize score to 0', () => {
			const game = new Game();
			expect(game.score).toBe(0);
		});

		it('should initialize width and height to 0', () => {
			const game = new Game();
			expect(game.width).toBe(0);
			expect(game.height).toBe(0);
		});

		it('should calculate centerX and centerY from canvas dimensions', () => {
			const game = new Game();
			expect(game.centerX).toBe(mockContext.canvas.width / 2);
			expect(game.centerY).toBe(mockContext.canvas.height / 2);
		});
	});

	describe('Scoring - increment behavior', () => {
		it('should increment score when playFood flag is set', () => {
			const game = new Game();
			// Manually set up game state
			game.boardController = new BoardController();
			game.snakeController = {
				move: vi.fn(),
				render: vi.fn(),
				playFood: true,
				playBomb: false,
				gameOver: false,
			};
			game.foodSound = { play: vi.fn() };
			game.bombSound = { play: vi.fn() };
			game.background = { width: 10, height: 10 };
			game.cell = { width: 10, height: 10 };
			game.food = {};
			game.bomb = {};
			game.snakeBody = {};
			game.snakeHead = {};

			expect(game.score).toBe(0);
			game.update();
			expect(game.score).toBe(1);
		});

		it('should reset playFood flag after incrementing', () => {
			const game = new Game();
			game.boardController = new BoardController();
			game.snakeController = {
				move: vi.fn(),
				render: vi.fn(),
				playFood: true,
				playBomb: false,
				gameOver: false,
			};
			game.foodSound = { play: vi.fn() };
			game.bombSound = { play: vi.fn() };
			game.background = { width: 10, height: 10 };
			game.cell = { width: 10, height: 10 };
			game.food = {};
			game.bomb = {};
			game.snakeBody = {};
			game.snakeHead = {};

			game.update();
			expect(game.snakeController.playFood).toBe(false);
		});
	});

	describe('Game intervals - start()', () => {
		it('should set up update interval with 150ms delay', () => {
			const game = new Game();
			game.snakeSound = { play: vi.fn() };

			global.setInterval.mockClear();
			game.start();

			expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 150);
		});

		it('should set up bomb interval with 5000ms delay', () => {
			const game = new Game();
			game.snakeSound = { play: vi.fn() };

			global.setInterval.mockClear();
			game.start();

			expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 5000);
		});

		it('should store updateInterval and bombInterval IDs', () => {
			const game = new Game();
			game.snakeSound = { play: vi.fn() };

			game.start();

			expect(game.updateInterval).toBeDefined();
			expect(game.bombInterval).toBeDefined();
		});
	});

	describe('Game over - gameOver() method', () => {
		it('should clear both update and bomb intervals', () => {
			const game = new Game();
			game.snakeSound = { pause: vi.fn() };
			game.gameOverSound = { play: vi.fn() };
			game.updateInterval = 123;
			game.bombInterval = 456;

			global.clearInterval.mockClear();
			game.gameOver();

			expect(global.clearInterval).toHaveBeenCalledWith(123);
			expect(global.clearInterval).toHaveBeenCalledWith(456);
		});

		it('should show alert with "Game Over" message', () => {
			const game = new Game();
			game.snakeSound = { pause: vi.fn() };
			game.gameOverSound = { play: vi.fn() };

			game.gameOver();

			expect(global.alert).toHaveBeenCalledWith('Game Over');
		});

		it('should reload window location', () => {
			const game = new Game();
			game.snakeSound = { pause: vi.fn() };
			game.gameOverSound = { play: vi.fn() };

			game.gameOver();

			expect(window.location.reload).toHaveBeenCalled();
		});
	});

	describe('Sound playback in update()', () => {
		it('should play bombSound when playBomb flag is true', () => {
			const game = new Game();
			game.boardController = new BoardController();
			game.snakeController = {
				move: vi.fn(),
				render: vi.fn(),
				playFood: false,
				playBomb: true,
				gameOver: false,
			};
			game.foodSound = { play: vi.fn() };
			game.bombSound = { play: vi.fn() };
			game.background = { width: 10, height: 10 };
			game.cell = { width: 10, height: 10 };
			game.food = {};
			game.bomb = {};
			game.snakeBody = {};
			game.snakeHead = {};

			game.update();

			expect(game.bombSound.play).toHaveBeenCalled();
			expect(game.snakeController.playBomb).toBe(false);
		});

		it('should play foodSound when playFood flag is true', () => {
			const game = new Game();
			game.boardController = new BoardController();
			game.snakeController = {
				move: vi.fn(),
				render: vi.fn(),
				playFood: true,
				playBomb: false,
				gameOver: false,
			};
			game.foodSound = { play: vi.fn() };
			game.bombSound = { play: vi.fn() };
			game.background = { width: 10, height: 10 };
			game.cell = { width: 10, height: 10 };
			game.food = {};
			game.bomb = {};
			game.snakeBody = {};
			game.snakeHead = {};

			game.update();

			expect(game.foodSound.play).toHaveBeenCalled();
		});
	});

	describe('Game over triggering from update()', () => {
		it('should call gameOver() when snakeController.gameOver is true', () => {
			const game = new Game();
			game.boardController = new BoardController();
			game.snakeController = {
				move: vi.fn(),
				render: vi.fn(),
				playFood: false,
				playBomb: false,
				gameOver: true,
			};
			game.foodSound = { play: vi.fn() };
			game.bombSound = { play: vi.fn() };
			game.background = { width: 10, height: 10 };
			game.cell = { width: 10, height: 10 };
			game.food = {};
			game.bomb = {};
			game.snakeBody = {};
			game.snakeHead = {};
			game.snakeSound = { pause: vi.fn() };
			game.gameOverSound = { play: vi.fn() };

			const gameOverSpy = vi.spyOn(game, 'gameOver');
			game.update();

			expect(gameOverSpy).toHaveBeenCalled();
		});
	});

	describe('Canvas operations in update()', () => {
		it('should call clearRect on context', () => {
			const game = new Game();
			game.boardController = new BoardController();
			game.snakeController = {
				move: vi.fn(),
				render: vi.fn(),
				playFood: false,
				playBomb: false,
				gameOver: false,
			};
			game.foodSound = { play: vi.fn() };
			game.bombSound = { play: vi.fn() };
			game.background = { width: 10, height: 10 };
			game.cell = { width: 10, height: 10 };
			game.food = {};
			game.bomb = {};
			game.snakeBody = {};
			game.snakeHead = {};

			mockContext.clearRect.mockClear();
			game.update();

			expect(mockContext.clearRect).toHaveBeenCalledWith(
				0,
				0,
				mockContext.canvas.width,
				mockContext.canvas.height
			);
		});

		it('should call snakeController.move() during update', () => {
			const game = new Game();
			game.boardController = new BoardController();
			game.snakeController = {
				move: vi.fn(),
				render: vi.fn(),
				playFood: false,
				playBomb: false,
				gameOver: false,
			};
			game.foodSound = { play: vi.fn() };
			game.bombSound = { play: vi.fn() };
			game.background = { width: 10, height: 10 };
			game.cell = { width: 10, height: 10 };
			game.food = {};
			game.bomb = {};
			game.snakeBody = {};
			game.snakeHead = {};

			game.update();

			expect(game.snakeController.move).toHaveBeenCalled();
		});

		it('should call render methods on controllers during update', () => {
			const game = new Game();
			game.boardController = new BoardController();
			game.snakeController = {
				move: vi.fn(),
				render: vi.fn(),
				playFood: false,
				playBomb: false,
				gameOver: false,
			};
			game.foodSound = { play: vi.fn() };
			game.bombSound = { play: vi.fn() };
			game.background = { width: 10, height: 10 };
			game.cell = { width: 10, height: 10 };
			game.food = {};
			game.bomb = {};
			game.snakeBody = {};
			game.snakeHead = {};

			const boardRenderSpy = vi.spyOn(game.boardController, 'render');
			const snakeRenderSpy = vi.spyOn(game.snakeController, 'render');

			game.update();

			expect(boardRenderSpy).toHaveBeenCalled();
			expect(snakeRenderSpy).toHaveBeenCalled();
		});
	});
});
