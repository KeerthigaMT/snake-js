import { describe, it, expect, beforeEach } from 'vitest';
import Snake from '../../js/models/snake.js';

describe('Snake Model - Characterization Tests', () => {
	let snake;

	beforeEach(() => {
		snake = new Snake();
	});

	describe('Initial State', () => {
		it('should initialize with isMoving === false', () => {
			expect(snake.isMoving).toBe(false);
		});

		it('should initialize with empty snakeCoords array', () => {
			expect(snake.snakeCoords).toEqual([]);
			expect(Array.isArray(snake.snakeCoords)).toBe(true);
			expect(snake.snakeCoords).toHaveLength(0);
		});

		it('should initialize snakeStartCoords with exactly [{x:3, y:12}, {x:3, y:13}]', () => {
			expect(snake.snakeStartCoords).toEqual([
				{ x: 3, y: 12 },
				{ x: 3, y: 13 },
			]);
		});

		it('should have snakeStartCoords with correct structure', () => {
			expect(snake.snakeStartCoords).toHaveLength(2);
			expect(snake.snakeStartCoords[0]).toEqual({ x: 3, y: 12 });
			expect(snake.snakeStartCoords[1]).toEqual({ x: 3, y: 13 });
		});
	});

	describe('startMoving() method', () => {
		it('should set isMoving to true when startMoving() is called', () => {
			expect(snake.isMoving).toBe(false);
			snake.startMoving();
			expect(snake.isMoving).toBe(true);
		});

		it('should keep isMoving true after multiple startMoving() calls', () => {
			snake.startMoving();
			expect(snake.isMoving).toBe(true);
			snake.startMoving();
			expect(snake.isMoving).toBe(true);
		});
	});

	describe('init() method - Reset Behavior', () => {
		it('should reset isMoving to false after it has been modified', () => {
			snake.startMoving();
			expect(snake.isMoving).toBe(true);

			snake.init();
			expect(snake.isMoving).toBe(false);
		});

		it('should reset snakeCoords to empty array after it has been modified', () => {
			// Modify snakeCoords
			snake.snakeCoords.push({ x: 5, y: 5 });
			snake.snakeCoords.push({ x: 6, y: 6 });
			expect(snake.snakeCoords).toHaveLength(2);

			// Reset via init()
			snake.init();
			expect(snake.snakeCoords).toEqual([]);
			expect(snake.snakeCoords).toHaveLength(0);
		});

		it('should reset both snakeCoords and isMoving when both have been modified', () => {
			// Modify both properties
			snake.startMoving();
			snake.snakeCoords.push({ x: 1, y: 1 });
			expect(snake.isMoving).toBe(true);
			expect(snake.snakeCoords).toHaveLength(1);

			// Reset via init()
			snake.init();
			expect(snake.isMoving).toBe(false);
			expect(snake.snakeCoords).toEqual([]);
		});

		it('should reinitialize snakeStartCoords to original values', () => {
			// Verify snakeStartCoords is set correctly after init()
			snake.init();
			expect(snake.snakeStartCoords).toEqual([
				{ x: 3, y: 12 },
				{ x: 3, y: 13 },
			]);
		});
	});

	describe('Constructor Behavior', () => {
		it('should call init() on construction', () => {
			const newSnake = new Snake();

			// Verify init() was called (all properties initialized)
			expect(newSnake.isMoving).toBe(false);
			expect(newSnake.snakeCoords).toEqual([]);
			expect(newSnake.snakeStartCoords).toEqual([
				{ x: 3, y: 12 },
				{ x: 3, y: 13 },
			]);
		});
	});

	describe('Property Types', () => {
		it('should have isMoving as a boolean', () => {
			expect(typeof snake.isMoving).toBe('boolean');
		});

		it('should have snakeCoords as an array', () => {
			expect(Array.isArray(snake.snakeCoords)).toBe(true);
		});

		it('should have snakeStartCoords as an array', () => {
			expect(Array.isArray(snake.snakeStartCoords)).toBe(true);
		});

		it('should have snakeStartCoords with objects containing x and y numbers', () => {
			snake.snakeStartCoords.forEach((coord) => {
				expect(typeof coord.x).toBe('number');
				expect(typeof coord.y).toBe('number');
			});
		});
	});

	describe('snakeStartCoords Immutability', () => {
		it('should have snakeStartCoords that can be modified without affecting next init()', () => {
			// Modify snakeStartCoords
			const originalCoords = [
				{ x: 3, y: 12 },
				{ x: 3, y: 13 },
			];
			snake.snakeStartCoords[0].x = 999;

			// Call init() should reset to original hardcoded values
			snake.init();
			expect(snake.snakeStartCoords).toEqual(originalCoords);
		});
	});

	describe('State Independence', () => {
		it('should allow snakeCoords to be populated without affecting isMoving', () => {
			snake.snakeCoords.push({ x: 10, y: 10 });
			expect(snake.snakeCoords).toHaveLength(1);
			expect(snake.isMoving).toBe(false);
		});

		it('should allow isMoving to be true with empty snakeCoords', () => {
			snake.startMoving();
			expect(snake.isMoving).toBe(true);
			expect(snake.snakeCoords).toHaveLength(0);
		});
	});

	describe('Multiple Instances', () => {
		it('should create independent instances', () => {
			const snake1 = new Snake();
			const snake2 = new Snake();

			snake1.startMoving();
			snake1.snakeCoords.push({ x: 1, y: 1 });

			expect(snake1.isMoving).toBe(true);
			expect(snake2.isMoving).toBe(false);
			expect(snake1.snakeCoords).toHaveLength(1);
			expect(snake2.snakeCoords).toHaveLength(0);
		});
	});
});
