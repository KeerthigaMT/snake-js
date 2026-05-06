import { describe, it, expect, beforeEach } from 'vitest';
import Board from '../../js/models/board.js';

describe('Board Model - Characterization Tests', () => {
	let board;

	beforeEach(() => {
		board = new Board();
	});

	describe('Grid Dimensions', () => {
		it('should create exactly 225 cells (15×15 grid)', () => {
			expect(board.cells).toHaveLength(225);
		});

		it('should have boadWidth property equal to 15', () => {
			// Note: Testing current typo'd property name 'boadWidth' (not 'boardWidth')
			expect(board.boadWidth).toBe(15);
		});

		it('should have boadHeight property equal to 15', () => {
			// Note: Testing current typo'd property name 'boadHeight' (not 'boardHeight')
			expect(board.boadHeight).toBe(15);
		});
	});

	describe('Cell Structure', () => {
		it('should create cells with numeric x and y properties', () => {
			board.cells.forEach((cell) => {
				expect(typeof cell.x).toBe('number');
				expect(typeof cell.y).toBe('number');
			});
		});

		it('should have all x coordinates in range [0,14]', () => {
			board.cells.forEach((cell) => {
				expect(cell.x).toBeGreaterThanOrEqual(0);
				expect(cell.x).toBeLessThanOrEqual(14);
			});
		});

		it('should have all y coordinates in range [0,14]', () => {
			board.cells.forEach((cell) => {
				expect(cell.y).toBeGreaterThanOrEqual(0);
				expect(cell.y).toBeLessThanOrEqual(14);
			});
		});
	});

	describe('Cell Uniqueness', () => {
		it('should contain unique coordinate pairs (no duplicates)', () => {
			const coordStrings = board.cells.map((cell) => `${cell.x},${cell.y}`);
			const uniqueCoordStrings = new Set(coordStrings);

			expect(uniqueCoordStrings.size).toBe(coordStrings.length);
			expect(uniqueCoordStrings.size).toBe(225);
		});

		it('should have exactly one cell for each coordinate in 15×15 grid', () => {
			for (let x = 0; x < 15; x++) {
				for (let y = 0; y < 15; y++) {
					const matchingCells = board.cells.filter(
						(cell) => cell.x === x && cell.y === y
					);
					expect(matchingCells).toHaveLength(1);
				}
			}
		});
	});

	describe('Initialization', () => {
		it('should initialize cells array via init() method', () => {
			const newBoard = new Board();
			newBoard.cells = ['corrupted'];
			newBoard.init();

			expect(newBoard.cells).toEqual([]);
			expect(newBoard.cells).toHaveLength(0);
		});

		it('should reinitialize dimensions via init() method', () => {
			board.boadWidth = 999;
			board.boadHeight = 888;
			board.init();

			expect(board.boadWidth).toBe(15);
			expect(board.boadHeight).toBe(15);
		});
	});

	describe('Grid Creation', () => {
		it('should populate cells array via create() method', () => {
			const newBoard = new Board();
			newBoard.cells = [];
			expect(newBoard.cells).toHaveLength(0);

			newBoard.create();
			expect(newBoard.cells).toHaveLength(225);
		});

		it('should create cells in correct order (x then y)', () => {
			// Cells should be created by iterating x first, then y for each x
			// First 15 cells should be x=0, y=0..14
			for (let i = 0; i < 15; i++) {
				expect(board.cells[i].x).toBe(0);
				expect(board.cells[i].y).toBe(i);
			}

			// Next 15 cells should be x=1, y=0..14
			for (let i = 0; i < 15; i++) {
				expect(board.cells[15 + i].x).toBe(1);
				expect(board.cells[15 + i].y).toBe(i);
			}

			// Last 15 cells should be x=14, y=0..14
			for (let i = 0; i < 15; i++) {
				expect(board.cells[210 + i].x).toBe(14);
				expect(board.cells[210 + i].y).toBe(i);
			}
		});
	});

	describe('Constructor Behavior', () => {
		it('should call init() and create() on construction', () => {
			const newBoard = new Board();

			// Verify init() was called (cells array exists, dimensions set)
			expect(Array.isArray(newBoard.cells)).toBe(true);
			expect(newBoard.boadWidth).toBe(15);
			expect(newBoard.boadHeight).toBe(15);

			// Verify create() was called (cells array populated)
			expect(newBoard.cells).toHaveLength(225);
		});
	});

	describe('Edge Cases', () => {
		it('should have corner cells at correct coordinates', () => {
			// Top-left corner (0,0)
			const topLeft = board.cells.find((cell) => cell.x === 0 && cell.y === 0);
			expect(topLeft).toBeDefined();

			// Top-right corner (14,0)
			const topRight = board.cells.find((cell) => cell.x === 14 && cell.y === 0);
			expect(topRight).toBeDefined();

			// Bottom-left corner (0,14)
			const bottomLeft = board.cells.find((cell) => cell.x === 0 && cell.y === 14);
			expect(bottomLeft).toBeDefined();

			// Bottom-right corner (14,14)
			const bottomRight = board.cells.find((cell) => cell.x === 14 && cell.y === 14);
			expect(bottomRight).toBeDefined();
		});

		it('should have center cell at coordinates (7,7)', () => {
			const centerCell = board.cells.find((cell) => cell.x === 7 && cell.y === 7);
			expect(centerCell).toBeDefined();
			expect(centerCell.x).toBe(7);
			expect(centerCell.y).toBe(7);
		});
	});
});
