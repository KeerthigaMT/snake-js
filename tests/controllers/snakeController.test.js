import { describe, it, expect, beforeEach, vi } from 'vitest';
import SnakeController from '../../js/controllers/snakeController.js';
import BoardController from '../../js/controllers/boardController.js';
import { createMockCanvasContext } from '../helpers/createMockCanvasContext.js';

describe('SnakeController - Characterization Tests', () => {
	let snakeController;
	let boardController;
	let mockContext;

	beforeEach(() => {
		boardController = new BoardController();
		mockContext = createMockCanvasContext();

		// Mock requestAnimationFrame to execute immediately
		global.requestAnimationFrame = vi.fn((cb) => cb());

		// Mock assets
		const mockSnakeBody = { width: 10, height: 10 };
		const mockSnakeHead = { width: 10, height: 10 };

		// Initialize cellWidth/cellHeight and offsets for render to work
		boardController.cellWidth = 11;
		boardController.cellHeight = 11;
		boardController.offsetX = 0;
		boardController.offsetY = 0;

		snakeController = new SnakeController(
			mockContext,
			boardController,
			mockSnakeBody,
			mockSnakeHead
		);
	});

	describe('Constructor and Initialization', () => {
		it('should initialize with a Snake instance', () => {
			expect(snakeController.snake).toBeDefined();
			expect(snakeController.snake.snakeCoords).toBeDefined();
		});

		it('should initialize snake coords from snakeStartCoords', () => {
			expect(snakeController.snake.snakeCoords).toHaveLength(2);
			// Verify coords reference board cells
			const firstCell = snakeController.snake.snakeCoords[0];
			expect(firstCell.x).toBe(3);
			expect(firstCell.y).toBe(12);
		});

		it('should initialize deltaX to 0', () => {
			expect(snakeController.deltaX).toBe(0);
		});

		it('should initialize deltaY to -1 (upward direction)', () => {
			expect(snakeController.deltaY).toBe(-1);
		});

		it('should initialize degree to 180', () => {
			expect(snakeController.degree).toBe(180);
		});

		it('should store boardController reference', () => {
			expect(snakeController.boardController).toBe(boardController);
		});
	});

	describe('move() - Basic Behavior', () => {
		it('should do nothing when snake.isMoving is false', () => {
			expect(snakeController.snake.isMoving).toBe(false);

			const initialLength = snakeController.snake.snakeCoords.length;
			snakeController.move();

			expect(snakeController.snake.snakeCoords).toHaveLength(
				initialLength
			);
		});

		it('should move snake forward when isMoving is true', () => {
			snakeController.snake.startMoving();
			const initialLength = snakeController.snake.snakeCoords.length;

			snakeController.move();

			// Should still have same length (tail popped, head added)
			expect(snakeController.snake.snakeCoords).toHaveLength(
				initialLength
			);
		});
	});

	describe('move() - Off-Grid Collision', () => {
		it('should set gameOver=true when snake moves off-grid (getNextCell returns undefined)', () => {
			snakeController.snake.startMoving();

			// Move snake to top edge (y=0)
			const topCell = boardController.getCell(3, 0);
			snakeController.snake.snakeCoords = [topCell];

			// deltaY=-1 will move off-grid
			snakeController.deltaY = -1;
			snakeController.deltaX = 0;

			snakeController.move();

			expect(snakeController.gameOver).toBe(true);
		});

		it('should set gameOver=true when moving left off-grid', () => {
			snakeController.snake.startMoving();

			// Move snake to left edge (x=0)
			const leftCell = boardController.getCell(0, 5);
			snakeController.snake.snakeCoords = [leftCell];

			// deltaX=-1 will move off-grid
			snakeController.deltaX = -1;
			snakeController.deltaY = 0;

			snakeController.move();

			expect(snakeController.gameOver).toBe(true);
		});

		it('should set gameOver=true when moving right off-grid', () => {
			snakeController.snake.startMoving();

			// Move snake to right edge (x=14)
			const rightCell = boardController.getCell(14, 5);
			snakeController.snake.snakeCoords = [rightCell];

			// deltaX=1 will move off-grid
			snakeController.deltaX = 1;
			snakeController.deltaY = 0;

			snakeController.move();

			expect(snakeController.gameOver).toBe(true);
		});

		it('should set gameOver=true when moving down off-grid', () => {
			snakeController.snake.startMoving();

			// Move snake to bottom edge (y=14)
			const bottomCell = boardController.getCell(5, 14);
			snakeController.snake.snakeCoords = [bottomCell];

			// deltaY=1 will move off-grid
			snakeController.deltaX = 0;
			snakeController.deltaY = 1;

			snakeController.move();

			expect(snakeController.gameOver).toBe(true);
		});
	});

	describe('move() - Self-Collision', () => {
		it('should set gameOver=true when snake collides with itself', () => {
			snakeController.snake.startMoving();

			// Create a snake that will collide with itself
			const cell1 = boardController.getCell(5, 5);
			const cell2 = boardController.getCell(5, 6);
			const cell3 = boardController.getCell(6, 6);

			snakeController.snake.snakeCoords = [cell1, cell2, cell3];

			// Move back to cell2 (self-collision)
			snakeController.deltaX = 0;
			snakeController.deltaY = 1;

			snakeController.move();

			expect(snakeController.gameOver).toBe(true);
		});

		it('should detect self-collision using identity-based comparison', () => {
			snakeController.snake.startMoving();

			const cell1 = boardController.getCell(5, 5);
			const cell2 = boardController.getCell(5, 6);

			snakeController.snake.snakeCoords = [cell1, cell2];

			// Move to cell2 (which is already in snake)
			snakeController.deltaX = 0;
			snakeController.deltaY = 1;

			snakeController.move();

			expect(snakeController.gameOver).toBe(true);
		});
	});

	describe('move() - Bomb Collision', () => {
		it('should set gameOver=true and playBomb=true when snake hits a bomb cell', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const nextCell = boardController.getCell(5, 4);
			nextCell.hasBomb = true;

			snakeController.snake.snakeCoords = [head];
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			snakeController.move();

			expect(snakeController.gameOver).toBe(true);
			expect(snakeController.playBomb).toBe(true);
		});

		it('should still pop tail after bomb collision', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const tail = boardController.getCell(5, 6);
			const nextCell = boardController.getCell(5, 4);
			nextCell.hasBomb = true;

			snakeController.snake.snakeCoords = [head, tail];
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			snakeController.move();

			// Should have added nextCell and popped tail
			expect(snakeController.snake.snakeCoords).toContain(nextCell);
			expect(snakeController.snake.snakeCoords).not.toContain(tail);
		});
	});

	describe('move() - Food Consumption', () => {
		it('should set playFood=true when snake eats food', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const nextCell = boardController.getCell(5, 4);
			nextCell.hasFood = true;

			snakeController.snake.snakeCoords = [head];
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			snakeController.move();

			expect(snakeController.playFood).toBe(true);
		});

		it('should NOT pop tail when snake eats food (growth)', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const tail = boardController.getCell(5, 6);
			const nextCell = boardController.getCell(5, 4);
			nextCell.hasFood = true;

			snakeController.snake.snakeCoords = [head, tail];
			const initialLength = snakeController.snake.snakeCoords.length;

			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			snakeController.move();

			// Length should increase by 1 (no tail pop)
			expect(snakeController.snake.snakeCoords).toHaveLength(
				initialLength + 1
			);
			expect(snakeController.snake.snakeCoords).toContain(tail);
			expect(snakeController.snake.snakeCoords).toContain(nextCell);
		});

		it('should remove food flag from cell after eating', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const nextCell = boardController.getCell(5, 4);
			nextCell.hasFood = true;

			snakeController.snake.snakeCoords = [head];
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			snakeController.move();

			expect(nextCell.hasFood).toBe(false);
		});

		it('should add new food to board after eating', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const nextCell = boardController.getCell(5, 4);
			nextCell.hasFood = true;

			snakeController.snake.snakeCoords = [head];
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			snakeController.move();

			// Check that some cell has food (new food added)
			const foodExists = boardController.board.cells.some(
				(c) => c.hasFood
			);
			expect(foodExists).toBe(true);
		});
	});

	describe('move() - Normal Movement', () => {
		it('should pop tail on normal movement (no food)', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const tail = boardController.getCell(5, 6);
			const nextCell = boardController.getCell(5, 4);

			snakeController.snake.snakeCoords = [head, tail];
			const initialLength = snakeController.snake.snakeCoords.length;

			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			snakeController.move();

			// Length should remain same (tail popped, head added)
			expect(snakeController.snake.snakeCoords).toHaveLength(
				initialLength
			);
			expect(snakeController.snake.snakeCoords).toContain(nextCell);
			expect(snakeController.snake.snakeCoords).not.toContain(tail);
		});

		it('should add new head to front of snakeCoords array', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const nextCell = boardController.getCell(5, 4);

			snakeController.snake.snakeCoords = [head];
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			snakeController.move();

			expect(snakeController.snake.snakeCoords[0]).toBe(nextCell);
		});
	});

	describe('getNextCell() method', () => {
		it('should return correct cell based on deltaX/deltaY from head position', () => {
			const head = boardController.getCell(5, 5);
			snakeController.snake.snakeCoords = [head];

			// Move up
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;
			let nextCell = snakeController.getNextCell();
			expect(nextCell.x).toBe(5);
			expect(nextCell.y).toBe(4);

			// Move down
			snakeController.deltaY = 1;
			nextCell = snakeController.getNextCell();
			expect(nextCell.x).toBe(5);
			expect(nextCell.y).toBe(6);

			// Move left
			snakeController.deltaX = -1;
			snakeController.deltaY = 0;
			nextCell = snakeController.getNextCell();
			expect(nextCell.x).toBe(4);
			expect(nextCell.y).toBe(5);

			// Move right
			snakeController.deltaX = 1;
			nextCell = snakeController.getNextCell();
			expect(nextCell.x).toBe(6);
			expect(nextCell.y).toBe(5);
		});

		it('should return undefined for off-grid coordinates', () => {
			const head = boardController.getCell(0, 0);
			snakeController.snake.snakeCoords = [head];

			// Move up (off-grid)
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;
			const nextCell = snakeController.getNextCell();
			expect(nextCell).toBeUndefined();
		});
	});

	describe('render() method - Canvas API call sequences', () => {
		it('should call save, translate, rotate, drawImage, restore for snake head', () => {
			const mockContext = createMockCanvasContext();
			global.requestAnimationFrame = vi.fn((cb) => cb());

			const mockSnakeBody = { width: 10, height: 10 };
			const mockSnakeHead = { width: 10, height: 10 };

			boardController.cellWidth = 11;
			boardController.cellHeight = 11;
			boardController.offsetX = 0;
			boardController.offsetY = 0;

			const head = boardController.getCell(5, 5);
			snakeController.snake.snakeCoords = [head];

			snakeController.render(
				mockContext,
				boardController,
				mockSnakeBody,
				mockSnakeHead
			);

			// Head should trigger: save, translate (2x), rotate, drawImage, restore
			expect(mockContext.save).toHaveBeenCalled();
			expect(mockContext.translate).toHaveBeenCalled();
			expect(mockContext.rotate).toHaveBeenCalled();
			expect(mockContext.drawImage).toHaveBeenCalled();
			expect(mockContext.restore).toHaveBeenCalled();
		});

		it('should call drawImage for snake body segments without rotation', () => {
			const mockContext = createMockCanvasContext();
			global.requestAnimationFrame = vi.fn((cb) => cb());

			const mockSnakeBody = { width: 10, height: 10 };
			const mockSnakeHead = { width: 10, height: 10 };

			boardController.cellWidth = 11;
			boardController.cellHeight = 11;
			boardController.offsetX = 0;
			boardController.offsetY = 0;

			const head = boardController.getCell(5, 5);
			const body1 = boardController.getCell(5, 6);
			const body2 = boardController.getCell(5, 7);
			snakeController.snake.snakeCoords = [head, body1, body2];

			snakeController.render(
				mockContext,
				boardController,
				mockSnakeBody,
				mockSnakeHead
			);

			// Should call drawImage 3 times (1 head + 2 body)
			expect(mockContext.drawImage).toHaveBeenCalledTimes(3);
		});

		it('should calculate rotation angle from degree property', () => {
			const mockContext = createMockCanvasContext();
			global.requestAnimationFrame = vi.fn((cb) => cb());

			const mockSnakeBody = { width: 10, height: 10 };
			const mockSnakeHead = { width: 10, height: 10 };

			boardController.cellWidth = 11;
			boardController.cellHeight = 11;
			boardController.offsetX = 0;
			boardController.offsetY = 0;

			const head = boardController.getCell(5, 5);
			snakeController.snake.snakeCoords = [head];
			snakeController.degree = 180;

			snakeController.render(
				mockContext,
				boardController,
				mockSnakeBody,
				mockSnakeHead
			);

			// Should rotate by (180 * Math.PI) / 180 = Math.PI
			expect(mockContext.rotate).toHaveBeenCalledWith(Math.PI);
		});

		it('should translate by half head size for rotation pivot', () => {
			const mockContext = createMockCanvasContext();
			global.requestAnimationFrame = vi.fn((cb) => cb());

			const mockSnakeBody = { width: 10, height: 10 };
			const mockSnakeHead = { width: 20, height: 20 };

			boardController.cellWidth = 11;
			boardController.cellHeight = 11;
			boardController.offsetX = 0;
			boardController.offsetY = 0;

			const head = boardController.getCell(5, 5);
			snakeController.snake.snakeCoords = [head];

			snakeController.render(
				mockContext,
				boardController,
				mockSnakeBody,
				mockSnakeHead
			);

			// Should translate by halfHeadSize (20/2 = 10) for pivot
			expect(mockContext.translate).toHaveBeenCalledWith(10, 10);
		});

		it('should use cellHeight property (typo fixed in WO-012)', () => {
			const mockContext = createMockCanvasContext();
			global.requestAnimationFrame = vi.fn((cb) => cb());

			const mockSnakeBody = { width: 10, height: 10 };
			const mockSnakeHead = { width: 10, height: 10 };

			// Set typo'd property
			boardController.cellWidth = 11;
			boardController.cellHeight = 15;
			boardController.offsetX = 0;
			boardController.offsetY = 0;

			const head = boardController.getCell(0, 1);
			snakeController.snake.snakeCoords = [head];

			snakeController.render(
				mockContext,
				boardController,
				mockSnakeBody,
				mockSnakeHead
			);

			// Verify translate uses cellHeight value
			// First translate: cell.x * cellWidth + offsetX, cell.y * cellHeight + offsetY
			// 0 * 11 + 0 = 0, 1 * 15 + 0 = 15
			expect(mockContext.translate).toHaveBeenCalledWith(0, 15);
		});
	});

	describe('Flag-Based Communication', () => {
		it('should initialize without gameOver, playFood, or playBomb flags', () => {
			expect(snakeController.gameOver).toBeUndefined();
			expect(snakeController.playFood).toBeUndefined();
			expect(snakeController.playBomb).toBeUndefined();
		});

		it('should set playFood flag to true when food is eaten', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const nextCell = boardController.getCell(5, 4);
			nextCell.hasFood = true;

			snakeController.snake.snakeCoords = [head];
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			expect(snakeController.playFood).toBeUndefined();
			snakeController.move();
			expect(snakeController.playFood).toBe(true);
		});

		it('should set both playBomb and gameOver flags when bomb is hit', () => {
			snakeController.snake.startMoving();

			const head = boardController.getCell(5, 5);
			const nextCell = boardController.getCell(5, 4);
			nextCell.hasBomb = true;

			snakeController.snake.snakeCoords = [head];
			snakeController.deltaX = 0;
			snakeController.deltaY = -1;

			expect(snakeController.playBomb).toBeUndefined();
			expect(snakeController.gameOver).toBeUndefined();

			snakeController.move();

			expect(snakeController.playBomb).toBe(true);
			expect(snakeController.gameOver).toBe(true);
		});
	});
});
