import { describe, it, expect, beforeEach, vi } from 'vitest';
import Game from '../../js/game.js';
import BoardController from '../../js/controllers/boardController.js';
import SnakeController from '../../js/controllers/snakeController.js';
import Board from '../../js/models/board.js';
import Snake from '../../js/models/snake.js';
import { createMockCanvasContext } from '../helpers/createMockCanvasContext.js';

describe('Game Flow - Integration Tests', () => {
	let mockCanvas;
	let mockContext;

	beforeEach(() => {
		// Mock canvas and context
		mockContext = createMockCanvasContext();
		mockCanvas = {
			getContext: vi.fn(() => mockContext),
			style: {},
		};

		// Mock document
		global.document = {
			querySelector: vi.fn(() => mockCanvas),
		};

		// Mock window
		global.window = {
			addEventListener: vi.fn(),
			innerWidth: 800,
			innerHeight: 600,
			location: { reload: vi.fn() },
			requestAnimationFrame: vi.fn((cb) => cb()),
		};

		// Mock intervals
		global.setInterval = vi.fn(() => 12345);
		global.clearInterval = vi.fn();
		global.alert = vi.fn();

		// Mock Image and Audio
		global.Image = vi.fn(function () {
			return { width: 10, height: 10, src: '', addEventListener: vi.fn() };
		});
		global.Audio = vi.fn(function () {
			return {
				src: '',
				loop: false,
				volume: 1,
				load: vi.fn(),
				play: vi.fn(),
				pause: vi.fn(),
				addEventListener: vi.fn(),
			};
		});
	});

	describe('Complete game initialization', () => {
		it('should create Board, Snake, BoardController, and SnakeController', () => {
			// Create BoardController
			const boardController = new BoardController();

			// Verify Board was created
			expect(boardController.board).toBeDefined();
			expect(boardController.board).toBeInstanceOf(Board);
			expect(boardController.board.cells).toHaveLength(225);

			// Create SnakeController
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Verify Snake was created
			expect(snakeController.snake).toBeDefined();
			expect(snakeController.snake).toBeInstanceOf(Snake);
			expect(snakeController.snake.snakeCoords).toHaveLength(2);

			// Verify modules are wired together
			expect(snakeController.boardController).toBe(boardController);
		});

		it('should initialize snake with board cell references (not copies)', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Verify snake coords reference actual board cells
			const snakeHead = snakeController.snake.snakeCoords[0];
			const boardCell = boardController.getCell(snakeHead.x, snakeHead.y);

			expect(snakeHead).toBe(boardCell);
		});

		it('should place initial food and bomb on board', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Add food and bomb
			boardController.addObject(snakeController, 'food');
			boardController.addObject(snakeController, 'bomb');

			// Verify food exists
			const foodExists = boardController.board.cells.some((c) => c.hasFood);
			expect(foodExists).toBe(true);

			// Verify bomb exists
			const bombExists = boardController.board.cells.some((c) => c.hasBomb);
			expect(bombExists).toBe(true);
		});
	});

	describe('Normal movement game tick', () => {
		it('should update snake position correctly on move', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Start with snake at (3,12) and (3,13)
			const initialHead = snakeController.snake.snakeCoords[0];
			expect(initialHead.x).toBe(3);
			expect(initialHead.y).toBe(12);

			// Set direction upward and start moving
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;
			snakeController.snake.startMoving();

			// Move once
			snakeController.move();

			// Verify new head position
			const newHead = snakeController.snake.snakeCoords[0];
			expect(newHead.x).toBe(3);
			expect(newHead.y).toBe(11);

			// Verify tail was popped (length stays same)
			expect(snakeController.snake.snakeCoords).toHaveLength(2);
		});

		it('should not move when isMoving is false', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			const initialLength = snakeController.snake.snakeCoords.length;
			const initialHead = snakeController.snake.snakeCoords[0];

			// Don't start moving
			snakeController.move();

			// Verify nothing changed
			expect(snakeController.snake.snakeCoords).toHaveLength(initialLength);
			expect(snakeController.snake.snakeCoords[0]).toBe(initialHead);
		});
	});

	describe('Food consumption flow', () => {
		it('should grow snake and set playFood flag when eating food', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Place food directly in front of snake
			const foodCell = boardController.getCell(3, 11);
			foodCell.hasFood = true;

			// Start moving upward toward food
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;
			snakeController.snake.startMoving();

			const initialLength = snakeController.snake.snakeCoords.length;

			// Move to food
			snakeController.move();

			// Verify snake grew (length increased)
			expect(snakeController.snake.snakeCoords).toHaveLength(initialLength + 1);

			// Verify playFood flag was set
			expect(snakeController.playFood).toBe(true);

			// Verify food was removed from cell
			expect(foodCell.hasFood).toBe(false);
		});

		it('should add new food to board after consumption', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Place food
			const foodCell = boardController.getCell(3, 11);
			foodCell.hasFood = true;

			// Move to food
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;
			snakeController.snake.startMoving();
			snakeController.move();

			// Verify food still exists somewhere on board
			const foodExists = boardController.board.cells.some((c) => c.hasFood);
			expect(foodExists).toBe(true);
		});

		it('should integrate with Game to increment score', () => {
			const game = new Game();

			// Set up game state
			game.boardController = new BoardController();
			game.snakeController = new SnakeController(
				mockContext,
				game.boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);
			game.foodSound = { play: vi.fn() };
			game.bombSound = { play: vi.fn() };
			game.background = { width: 10, height: 10 };
			game.cell = { width: 10, height: 10 };
			game.food = {};
			game.bomb = {};
			game.snakeBody = {};
			game.snakeHead = {};

			const initialScore = game.score;

			// Simulate food consumption
			game.snakeController.playFood = true;
			game.update();

			// Verify score incremented
			expect(game.score).toBe(initialScore + 1);
		});
	});

	describe('Bomb collision flow', () => {
		it('should set gameOver and playBomb flags when hitting bomb', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Place bomb directly in front of snake
			const bombCell = boardController.getCell(3, 11);
			bombCell.hasBomb = true;

			// Start moving upward toward bomb
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;
			snakeController.snake.startMoving();

			// Move to bomb
			snakeController.move();

			// Verify game over flags
			expect(snakeController.gameOver).toBe(true);
			expect(snakeController.playBomb).toBe(true);
		});

		it('should still pop tail after bomb collision', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Place bomb
			const bombCell = boardController.getCell(3, 11);
			bombCell.hasBomb = true;

			// Move to bomb
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;
			snakeController.snake.startMoving();

			const initialLength = snakeController.snake.snakeCoords.length;
			snakeController.move();

			// Tail should still pop (length stays same)
			expect(snakeController.snake.snakeCoords).toHaveLength(initialLength);
		});
	});

	describe('Wall collision flow', () => {
		it('should set gameOver when moving off top edge', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Move snake to top edge
			const topCell = boardController.getCell(3, 0);
			snakeController.snake.snakeCoords = [topCell];

			// Move upward (off-grid)
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;
			snakeController.snake.startMoving();

			snakeController.move();

			// Verify game over
			expect(snakeController.gameOver).toBe(true);
		});

		it('should set gameOver when moving off bottom edge', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Move snake to bottom edge
			const bottomCell = boardController.getCell(3, 14);
			snakeController.snake.snakeCoords = [bottomCell];

			// Move downward (off-grid)
			snakeController.deltaX = 0;
			snakeController.deltaY = 1;
			snakeController.snake.startMoving();

			snakeController.move();

			// Verify game over
			expect(snakeController.gameOver).toBe(true);
		});

		it('should set gameOver when moving off left edge', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Move snake to left edge
			const leftCell = boardController.getCell(0, 5);
			snakeController.snake.snakeCoords = [leftCell];

			// Move left (off-grid)
			snakeController.deltaX = -1;
			snakeController.deltaY = 0;
			snakeController.snake.startMoving();

			snakeController.move();

			// Verify game over
			expect(snakeController.gameOver).toBe(true);
		});

		it('should set gameOver when moving off right edge', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Move snake to right edge
			const rightCell = boardController.getCell(14, 5);
			snakeController.snake.snakeCoords = [rightCell];

			// Move right (off-grid)
			snakeController.deltaX = 1;
			snakeController.deltaY = 0;
			snakeController.snake.startMoving();

			snakeController.move();

			// Verify game over
			expect(snakeController.gameOver).toBe(true);
		});
	});

	describe('Self-collision flow', () => {
		it('should set gameOver when snake collides with itself', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Create a snake that will collide with itself
			const cell1 = boardController.getCell(5, 5);
			const cell2 = boardController.getCell(5, 6);
			const cell3 = boardController.getCell(6, 6);
			const cell4 = boardController.getCell(6, 5);

			snakeController.snake.snakeCoords = [cell1, cell2, cell3, cell4];

			// Move back to cell2 (self-collision)
			snakeController.deltaX = 0;
			snakeController.deltaY = 1;
			snakeController.snake.startMoving();

			snakeController.move();

			// Verify game over
			expect(snakeController.gameOver).toBe(true);
		});

		it('should detect collision using object reference equality', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			const head = boardController.getCell(5, 5);
			const body = boardController.getCell(5, 6);

			snakeController.snake.snakeCoords = [head, body];

			// Verify snake uses actual board cell references
			const boardCellAtHead = boardController.getCell(5, 5);
			expect(snakeController.snake.snakeCoords[0]).toBe(boardCellAtHead);

			// Move to body position (self-collision)
			snakeController.deltaX = 0;
			snakeController.deltaY = 1;
			snakeController.snake.startMoving();

			snakeController.move();

			expect(snakeController.gameOver).toBe(true);
		});
	});

	describe('Game restart flow', () => {
		it('should call gameOver methods and reload window', () => {
			const game = new Game();
			game.snakeSound = { pause: vi.fn() };
			game.gameOverSound = { play: vi.fn() };
			game.updateInterval = 123;
			game.bombInterval = 456;

			game.gameOver();

			// Verify cleanup
			expect(game.snakeSound.pause).toHaveBeenCalled();
			expect(game.gameOverSound.play).toHaveBeenCalled();
			expect(global.clearInterval).toHaveBeenCalledWith(123);
			expect(global.clearInterval).toHaveBeenCalledWith(456);
			expect(global.alert).toHaveBeenCalledWith('Game Over');
			expect(window.location.reload).toHaveBeenCalled();
		});
	});

	describe('Complete game tick integration', () => {
		it('should execute a full move -> check -> render cycle', () => {
			const boardController = new BoardController();
			const snakeController = new SnakeController(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Spy on methods
			const moveSpy = vi.spyOn(snakeController, 'move');
			const boardRenderSpy = vi.spyOn(boardController, 'render');
			const snakeRenderSpy = vi.spyOn(snakeController, 'render');

			// Start moving
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;
			snakeController.snake.startMoving();

			// Execute tick
			snakeController.move();
			boardController.render(mockContext, { width: 10, height: 10 }, {}, {});
			snakeController.render(
				mockContext,
				boardController,
				{ width: 10, height: 10 },
				{ width: 10, height: 10 }
			);

			// Verify all methods were called
			expect(moveSpy).toHaveBeenCalled();
			expect(boardRenderSpy).toHaveBeenCalled();
			expect(snakeRenderSpy).toHaveBeenCalled();
		});
	});
});
