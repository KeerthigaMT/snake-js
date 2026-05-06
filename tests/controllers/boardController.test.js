import { describe, it, expect, beforeEach, vi } from 'vitest';
import BoardController from '../../js/controllers/boardController.js';
import { createMockCanvasContext } from '../helpers/createMockCanvasContext.js';

describe('BoardController - Characterization Tests', () => {
	let boardController;

	beforeEach(() => {
		boardController = new BoardController();
	});

	describe('Constructor and Initialization', () => {
		it('should initialize with a Board instance', () => {
			expect(boardController.board).toBeDefined();
			expect(boardController.board.cells).toBeDefined();
			expect(boardController.board.cells).toHaveLength(225);
		});

		it('should create a new Board when init() is called', () => {
			const originalBoard = boardController.board;
			boardController.init();
			expect(boardController.board).toBeDefined();
			expect(boardController.board).not.toBe(originalBoard);
		});
	});

	describe('getCell() method', () => {
		it('should return the correct cell object for getCell(0,0)', () => {
			const cell = boardController.getCell(0, 0);
			expect(cell).toBeDefined();
			expect(cell.x).toBe(0);
			expect(cell.y).toBe(0);
		});

		it('should return the correct cell object for getCell(14,14)', () => {
			const cell = boardController.getCell(14, 14);
			expect(cell).toBeDefined();
			expect(cell.x).toBe(14);
			expect(cell.y).toBe(14);
		});

		it('should return undefined for getCell(99,99)', () => {
			const cell = boardController.getCell(99, 99);
			expect(cell).toBeUndefined();
		});

		it('should return undefined for out-of-bounds coordinates', () => {
			expect(boardController.getCell(-1, 0)).toBeUndefined();
			expect(boardController.getCell(0, -1)).toBeUndefined();
			expect(boardController.getCell(15, 0)).toBeUndefined();
			expect(boardController.getCell(0, 15)).toBeUndefined();
		});

		it('should return the same object reference for repeated calls', () => {
			const cell1 = boardController.getCell(5, 5);
			const cell2 = boardController.getCell(5, 5);
			expect(cell1).toBe(cell2);
		});
	});

	describe('getRandomCell() method', () => {
		it('should return a number within the specified range [min, max]', () => {
			for (let i = 0; i < 50; i++) {
				const result = boardController.getRandomCell(0, 10);
				expect(result).toBeGreaterThanOrEqual(0);
				expect(result).toBeLessThanOrEqual(10);
				expect(Number.isInteger(result)).toBe(true);
			}
		});

		it('should return min when min === max', () => {
			const result = boardController.getRandomCell(5, 5);
			expect(result).toBe(5);
		});
	});

	describe('addFood() method', () => {
		it('should set hasFood=true on an available cell', () => {
			const mockSnakeController = {
				snake: { snakeCoords: [] },
			};

			const beforeFoodCount = boardController.board.cells.filter(
				(c) => c.hasFood
			).length;
			expect(beforeFoodCount).toBe(0);

			boardController.addFood(mockSnakeController);

			const afterFoodCount = boardController.board.cells.filter(
				(c) => c.hasFood
			).length;
			expect(afterFoodCount).toBe(1);
		});

		it('should place food on a cell not occupied by snake', () => {
			const snakeCell = boardController.getCell(3, 3);
			const mockSnakeController = {
				snake: { snakeCoords: [snakeCell] },
			};

			boardController.addFood(mockSnakeController);

			const foodCell = boardController.board.cells.find((c) => c.hasFood);
			expect(foodCell).not.toBe(snakeCell);
			expect(foodCell.hasFood).toBe(true);
		});
	});

	describe('addBomb() method', () => {
		it('should set hasBomb=true on an available cell', () => {
			const mockSnakeController = {
				snake: { snakeCoords: [] },
			};

			const beforeBombCount = boardController.board.cells.filter(
				(c) => c.hasBomb
			).length;
			expect(beforeBombCount).toBe(0);

			boardController.addBomb(mockSnakeController);

			const afterBombCount = boardController.board.cells.filter(
				(c) => c.hasBomb
			).length;
			expect(afterBombCount).toBe(1);
		});
	});

	describe('addObject() method', () => {
		it('should set hasFood=true when type is "food"', () => {
			const mockSnakeController = {
				snake: { snakeCoords: [] },
			};

			boardController.addObject(mockSnakeController, 'food');

			const foodCell = boardController.board.cells.find((c) => c.hasFood);
			expect(foodCell).toBeDefined();
			expect(foodCell.hasFood).toBe(true);
		});

		it('should call removeBombs() before placing new bomb when type is "bomb"', () => {
			const mockSnakeController = {
				snake: { snakeCoords: [] },
			};

			// Place a bomb first
			const cell1 = boardController.getCell(0, 0);
			cell1.hasBomb = true;

			// Spy on removeBombs
			const removeBombsSpy = vi.spyOn(boardController, 'removeBombs');

			// Add a new bomb
			boardController.addObject(mockSnakeController, 'bomb');

			// Verify removeBombs was called
			expect(removeBombsSpy).toHaveBeenCalled();

			// Verify only one bomb exists
			const bombCount = boardController.board.cells.filter(
				(c) => c.hasBomb
			).length;
			expect(bombCount).toBe(1);
		});

		it('should set hasBomb=true when type is "bomb"', () => {
			const mockSnakeController = {
				snake: { snakeCoords: [] },
			};

			boardController.addObject(mockSnakeController, 'bomb');

			const bombCell = boardController.board.cells.find((c) => c.hasBomb);
			expect(bombCell).toBeDefined();
			expect(bombCell.hasBomb).toBe(true);
		});
	});

	describe('getAvailableCell() method', () => {
		it('should exclude cells with hasFood=true', () => {
			const mockSnakeController = {
				snake: { snakeCoords: [] },
			};

			// Mark all cells except one with hasFood
			boardController.board.cells.forEach((cell, idx) => {
				if (idx < 224) {
					cell.hasFood = true;
				}
			});

			const availableCell = boardController.getAvailableCell(
				mockSnakeController
			);
			expect(availableCell).toBeDefined();
			expect(availableCell.hasFood).not.toBe(true);
		});

		it('should exclude cells with hasBomb=true', () => {
			const mockSnakeController = {
				snake: { snakeCoords: [] },
			};

			// Mark all cells except one with hasBomb
			boardController.board.cells.forEach((cell, idx) => {
				if (idx < 224) {
					cell.hasBomb = true;
				}
			});

			const availableCell = boardController.getAvailableCell(
				mockSnakeController
			);
			expect(availableCell).toBeDefined();
			expect(availableCell.hasBomb).not.toBe(true);
		});

		it('should exclude cells in snake coordinates', () => {
			const snakeCell1 = boardController.getCell(5, 5);
			const snakeCell2 = boardController.getCell(5, 6);
			const mockSnakeController = {
				snake: { snakeCoords: [snakeCell1, snakeCell2] },
			};

			const availableCell = boardController.getAvailableCell(
				mockSnakeController
			);
			expect(availableCell).toBeDefined();
			expect(availableCell).not.toBe(snakeCell1);
			expect(availableCell).not.toBe(snakeCell2);
		});

		it('should exclude cells with food, bombs, AND snake coordinates simultaneously', () => {
			const snakeCell = boardController.getCell(0, 0);
			const foodCell = boardController.getCell(1, 1);
			const bombCell = boardController.getCell(2, 2);

			foodCell.hasFood = true;
			bombCell.hasBomb = true;

			const mockSnakeController = {
				snake: { snakeCoords: [snakeCell] },
			};

			const availableCell = boardController.getAvailableCell(
				mockSnakeController
			);
			expect(availableCell).toBeDefined();
			expect(availableCell).not.toBe(snakeCell);
			expect(availableCell).not.toBe(foodCell);
			expect(availableCell).not.toBe(bombCell);
			expect(availableCell.hasFood).not.toBe(true);
			expect(availableCell.hasBomb).not.toBe(true);
		});
	});

	describe('removeObject() method', () => {
		it('should clear hasFood flag when type is "food"', () => {
			const cell = boardController.getCell(5, 5);
			cell.hasFood = true;

			boardController.removeObject(cell, 'food');

			expect(cell.hasFood).toBe(false);
		});

		it('should clear hasBomb flag when type is "bomb"', () => {
			const cell = boardController.getCell(5, 5);
			cell.hasBomb = true;

			boardController.removeObject(cell, 'bomb');

			expect(cell.hasBomb).toBe(false);
		});

		it('should not affect other flags', () => {
			const cell = boardController.getCell(5, 5);
			cell.hasFood = true;
			cell.hasBomb = true;

			boardController.removeObject(cell, 'food');

			expect(cell.hasFood).toBe(false);
			expect(cell.hasBomb).toBe(true);
		});
	});

	describe('removeBombs() method', () => {
		it('should clear hasBomb from all cells', () => {
			// Set hasBomb on multiple cells
			boardController.getCell(0, 0).hasBomb = true;
			boardController.getCell(5, 5).hasBomb = true;
			boardController.getCell(14, 14).hasBomb = true;

			const beforeCount = boardController.board.cells.filter(
				(c) => c.hasBomb
			).length;
			expect(beforeCount).toBe(3);

			boardController.removeBombs();

			const afterCount = boardController.board.cells.filter(
				(c) => c.hasBomb
			).length;
			expect(afterCount).toBe(0);
		});

		it('should work correctly when no bombs exist', () => {
			const beforeCount = boardController.board.cells.filter(
				(c) => c.hasBomb
			).length;
			expect(beforeCount).toBe(0);

			boardController.removeBombs();

			const afterCount = boardController.board.cells.filter(
				(c) => c.hasBomb
			).length;
			expect(afterCount).toBe(0);
		});
	});

	describe('Identity-based collision detection', () => {
		it('should verify snake coords reference same cell objects as board', () => {
			const cell1 = boardController.getCell(3, 12);
			const cell2 = boardController.getCell(3, 13);

			const mockSnakeController = {
				snake: { snakeCoords: [cell1, cell2] },
			};

			// Verify identity-based collision detection
			expect(
				mockSnakeController.snake.snakeCoords.includes(cell1)
			).toBe(true);
			expect(
				mockSnakeController.snake.snakeCoords.includes(cell2)
			).toBe(true);

			// Verify a different cell with same coordinates is NOT included
			const differentCell = { x: 3, y: 12 };
			expect(
				mockSnakeController.snake.snakeCoords.includes(differentCell)
			).toBe(false);
		});

		it('should use object reference equality, not value equality', () => {
			const boardCell = boardController.getCell(5, 5);
			const duplicateValueCell = { x: 5, y: 5 };

			const mockSnakeController = {
				snake: { snakeCoords: [boardCell] },
			};

			// Same reference should be included
			expect(
				mockSnakeController.snake.snakeCoords.includes(boardCell)
			).toBe(true);

			// Different object with same values should NOT be included
			expect(
				mockSnakeController.snake.snakeCoords.includes(
					duplicateValueCell
				)
			).toBe(false);
		});
	});

	describe('render() method - Canvas API call sequences', () => {
		it('should call drawImage for each cell in the board', () => {
			const mockContext = createMockCanvasContext();
			const mockCell = { width: 10, height: 10 };
			const mockFood = {};
			const mockBomb = {};

			// Mock requestAnimationFrame to execute immediately
			global.requestAnimationFrame = vi.fn((cb) => cb());

			boardController.render(mockContext, mockCell, mockFood, mockBomb);

			// Should call drawImage 225 times (one for each cell)
			expect(mockContext.drawImage).toHaveBeenCalledTimes(225);
		});

		it('should calculate cellWidth and cellheight from cell dimensions', () => {
			const mockContext = createMockCanvasContext();
			const mockCell = { width: 10, height: 10 };
			const mockFood = {};
			const mockBomb = {};

			global.requestAnimationFrame = vi.fn((cb) => cb());

			boardController.render(mockContext, mockCell, mockFood, mockBomb);

			expect(boardController.cellWidth).toBe(11);
			expect(boardController.cellheight).toBe(11);
		});

		it('should draw food when cell has hasFood=true', () => {
			const mockContext = createMockCanvasContext();
			const mockCell = { width: 10, height: 10 };
			const mockFood = {};
			const mockBomb = {};

			global.requestAnimationFrame = vi.fn((cb) => cb());

			// Mark one cell with food
			boardController.getCell(5, 5).hasFood = true;

			boardController.render(mockContext, mockCell, mockFood, mockBomb);

			// Should have 225 cell draws + 1 food draw = 226 total
			expect(mockContext.drawImage).toHaveBeenCalledTimes(226);

			// Verify food was drawn with correct arguments
			const foodCalls = mockContext.drawImage.mock.calls.filter(
				(call) => call[0] === mockFood
			);
			expect(foodCalls).toHaveLength(1);
		});

		it('should draw bomb when cell has hasBomb=true', () => {
			const mockContext = createMockCanvasContext();
			const mockCell = { width: 10, height: 10 };
			const mockFood = {};
			const mockBomb = {};

			global.requestAnimationFrame = vi.fn((cb) => cb());

			// Mark one cell with bomb
			boardController.getCell(7, 7).hasBomb = true;

			boardController.render(mockContext, mockCell, mockFood, mockBomb);

			// Should have 225 cell draws + 1 bomb draw = 226 total
			expect(mockContext.drawImage).toHaveBeenCalledTimes(226);

			// Verify bomb was drawn with correct arguments
			const bombCalls = mockContext.drawImage.mock.calls.filter(
				(call) => call[0] === mockBomb
			);
			expect(bombCalls).toHaveLength(1);
		});

		it('should draw both food and bomb when both flags are true', () => {
			const mockContext = createMockCanvasContext();
			const mockCell = { width: 10, height: 10 };
			const mockFood = {};
			const mockBomb = {};

			global.requestAnimationFrame = vi.fn((cb) => cb());

			// Mark cells with food and bomb
			boardController.getCell(2, 2).hasFood = true;
			boardController.getCell(8, 8).hasBomb = true;

			boardController.render(mockContext, mockCell, mockFood, mockBomb);

			// Should have 225 cell draws + 1 food + 1 bomb = 227 total
			expect(mockContext.drawImage).toHaveBeenCalledTimes(227);
		});

		it('should calculate offsetX and offsetY for centering', () => {
			const mockContext = createMockCanvasContext();
			mockContext.canvas.width = 800;
			mockContext.canvas.height = 600;
			const mockCell = { width: 10, height: 10 };
			const mockFood = {};
			const mockBomb = {};

			global.requestAnimationFrame = vi.fn((cb) => cb());

			boardController.render(mockContext, mockCell, mockFood, mockBomb);

			// cellWidth = 11, boadWidth = 15
			// offsetX = (800 - 11 * 15) / 2 = (800 - 165) / 2 = 317.5
			expect(boardController.offsetX).toBe(317.5);

			// cellheight = 11, boadHeight = 15
			// offsetY = (600 - 11 * 15) / 2 = (600 - 165) / 2 = 217.5
			expect(boardController.offsetY).toBe(217.5);
		});

		it('should use typo property "cellheight" not "cellHeight"', () => {
			const mockContext = createMockCanvasContext();
			const mockCell = { width: 10, height: 10 };
			const mockFood = {};
			const mockBomb = {};

			global.requestAnimationFrame = vi.fn((cb) => cb());

			boardController.render(mockContext, mockCell, mockFood, mockBomb);

			// Verify the typo'd property exists
			expect(boardController.cellheight).toBe(11);
			expect(boardController.cellHeight).toBeUndefined();
		});
	});
});
