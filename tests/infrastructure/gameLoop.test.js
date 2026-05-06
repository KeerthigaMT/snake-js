import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GameLoop from '../../js/infrastructure/gameLoop.js';

describe('GameLoop - Unit Tests', () => {
	let gameLoop;
	let mockUpdateFn;
	let rafCallbacks = [];
	let rafId = 0;

	beforeEach(() => {
		mockUpdateFn = vi.fn();
		rafCallbacks = [];
		rafId = 0;

		// Mock requestAnimationFrame
		global.requestAnimationFrame = vi.fn((callback) => {
			rafId++;
			rafCallbacks.push({ id: rafId, callback });
			return rafId;
		});

		// Mock cancelAnimationFrame
		global.cancelAnimationFrame = vi.fn((id) => {
			const index = rafCallbacks.findIndex((item) => item.id === id);
			if (index !== -1) {
				rafCallbacks.splice(index, 1);
			}
		});

		// Mock performance.now()
		let currentTime = 0;
		global.performance = {
			now: vi.fn(() => currentTime),
		};
		// Helper to advance time
		global.advanceTime = (ms) => {
			currentTime += ms;
		};
	});

	afterEach(() => {
		if (gameLoop) {
			gameLoop.stop();
		}
	});

	describe('Constructor and Configuration', () => {
		it('should initialize with default configuration', () => {
			gameLoop = new GameLoop();

			expect(gameLoop.tickInterval).toBe(150);
			expect(gameLoop.running).toBe(false);
			expect(gameLoop.lastFrameTime).toBe(0);
			expect(gameLoop.accumulator).toBe(0);
			expect(gameLoop.rafId).toBeNull();
		});

		it('should accept custom updateFn via constructor', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });

			expect(gameLoop.updateFn).toBe(mockUpdateFn);
		});

		it('should accept custom tickInterval via constructor', () => {
			gameLoop = new GameLoop({ tickInterval: 100 });

			expect(gameLoop.tickInterval).toBe(100);
		});

		it('should accept both updateFn and tickInterval', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 200 });

			expect(gameLoop.updateFn).toBe(mockUpdateFn);
			expect(gameLoop.tickInterval).toBe(200);
		});
	});

	describe('start()', () => {
		it('should set running to true', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });

			gameLoop.start();

			expect(gameLoop.running).toBe(true);
		});

		it('should initialize lastFrameTime with current time', () => {
			global.advanceTime(1000);
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });

			gameLoop.start();

			expect(gameLoop.lastFrameTime).toBe(1000);
		});

		it('should reset accumulator to 0', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });
			gameLoop.accumulator = 100;

			gameLoop.start();

			expect(gameLoop.accumulator).toBe(0);
		});

		it('should schedule a requestAnimationFrame', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });

			gameLoop.start();

			expect(requestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));
			expect(gameLoop.rafId).toBe(1);
		});

		it('should not start if already running', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });
			gameLoop.start();

			const firstRafId = gameLoop.rafId;
			requestAnimationFrame.mockClear();

			gameLoop.start();

			expect(requestAnimationFrame).not.toHaveBeenCalled();
			expect(gameLoop.rafId).toBe(firstRafId);
		});
	});

	describe('stop()', () => {
		it('should set running to false', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });
			gameLoop.start();

			gameLoop.stop();

			expect(gameLoop.running).toBe(false);
		});

		it('should cancel pending animation frame', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });
			gameLoop.start();
			const rafId = gameLoop.rafId;

			gameLoop.stop();

			expect(cancelAnimationFrame).toHaveBeenCalledWith(rafId);
		});

		it('should set rafId to null', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });
			gameLoop.start();

			gameLoop.stop();

			expect(gameLoop.rafId).toBeNull();
		});

		it('should reset accumulator to 0', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });
			gameLoop.start();
			gameLoop.accumulator = 50;

			gameLoop.stop();

			expect(gameLoop.accumulator).toBe(0);
		});

		it('should not cancel if not running', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });

			cancelAnimationFrame.mockClear();
			gameLoop.stop();

			expect(cancelAnimationFrame).not.toHaveBeenCalled();
		});
	});

	describe('isRunning()', () => {
		it('should return false when not started', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });

			expect(gameLoop.isRunning()).toBe(false);
		});

		it('should return true after start()', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });

			gameLoop.start();

			expect(gameLoop.isRunning()).toBe(true);
		});

		it('should return false after stop()', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn });
			gameLoop.start();

			gameLoop.stop();

			expect(gameLoop.isRunning()).toBe(false);
		});
	});

	describe('Fixed-Timestep Delta-Time Accumulator', () => {
		it('should not call updateFn if delta time is less than tickInterval', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 100 });
			gameLoop.start();

			// Advance time by 50ms (less than 100ms tick interval)
			global.advanceTime(50);
			const callback = rafCallbacks[0].callback;
			callback(performance.now());

			expect(mockUpdateFn).not.toHaveBeenCalled();
		});

		it('should call updateFn once when delta time equals tickInterval', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 100 });
			gameLoop.start();

			// Advance time by exactly 100ms
			global.advanceTime(100);
			const callback = rafCallbacks[0].callback;
			callback(performance.now());

			expect(mockUpdateFn).toHaveBeenCalledTimes(1);
		});

		it('should call updateFn twice when delta time is 2x tickInterval', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 100 });
			gameLoop.start();

			// Advance time by 200ms (2x tick interval)
			global.advanceTime(200);
			const callback = rafCallbacks[0].callback;
			callback(performance.now());

			expect(mockUpdateFn).toHaveBeenCalledTimes(2);
		});

		it('should call updateFn multiple times for large delta', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 50 });
			gameLoop.start();

			// Advance time by 300ms (6x tick interval)
			global.advanceTime(300);
			const callback = rafCallbacks[0].callback;
			callback(performance.now());

			expect(mockUpdateFn).toHaveBeenCalledTimes(6);
		});

		it('should carry over remaining accumulator time', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 100 });
			gameLoop.start();

			// First frame: advance 150ms (1 tick + 50ms remainder)
			global.advanceTime(150);
			const callback1 = rafCallbacks[0].callback;
			callback1(performance.now());

			expect(mockUpdateFn).toHaveBeenCalledTimes(1);
			expect(gameLoop.accumulator).toBe(50);

			mockUpdateFn.mockClear();

			// Second frame: advance another 60ms (total 110ms from remainder)
			global.advanceTime(60);
			const callback2 = rafCallbacks[1].callback;
			callback2(performance.now());

			expect(mockUpdateFn).toHaveBeenCalledTimes(1);
			expect(gameLoop.accumulator).toBe(10);
		});

		it('should handle custom tickInterval correctly', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 150 });
			gameLoop.start();

			// Advance time by 300ms (2x tick interval of 150ms)
			global.advanceTime(300);
			const callback = rafCallbacks[0].callback;
			callback(performance.now());

			expect(mockUpdateFn).toHaveBeenCalledTimes(2);
		});
	});

	describe('Continuous Loop Scheduling', () => {
		it('should schedule next frame after loop execution', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 100 });
			gameLoop.start();

			expect(rafCallbacks).toHaveLength(1);

			// Execute first frame
			global.advanceTime(100);
			const callback = rafCallbacks[0].callback;
			callback(performance.now());

			// Should have scheduled next frame
			expect(rafCallbacks).toHaveLength(2);
		});

		it('should not schedule next frame if stopped during loop', () => {
			gameLoop = new GameLoop({
				updateFn: () => {
					mockUpdateFn();
					gameLoop.stop();
				},
				tickInterval: 100,
			});
			gameLoop.start();

			// Execute first frame
			global.advanceTime(100);
			const callback = rafCallbacks[0].callback;
			callback(performance.now());

			// Should not schedule next frame after stop
			expect(rafCallbacks).toHaveLength(1);
		});

		it('should not execute loop if stopped before callback', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 100 });
			gameLoop.start();

			const callback = rafCallbacks[0].callback;
			gameLoop.stop();

			// Try to execute the scheduled callback after stopping
			global.advanceTime(100);
			callback(performance.now());

			// updateFn should not be called because running is false
			expect(mockUpdateFn).not.toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle missing updateFn gracefully', () => {
			gameLoop = new GameLoop({ tickInterval: 100 });
			gameLoop.start();

			// Advance time and execute frame
			global.advanceTime(100);
			const callback = rafCallbacks[0].callback;

			expect(() => callback(performance.now())).not.toThrow();
		});

		it('should handle zero delta time', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 100 });
			gameLoop.start();

			// Same time (0 delta)
			const callback = rafCallbacks[0].callback;
			callback(performance.now());

			expect(mockUpdateFn).not.toHaveBeenCalled();
		});

		it('should update lastFrameTime after each loop iteration', () => {
			gameLoop = new GameLoop({ updateFn: mockUpdateFn, tickInterval: 100 });
			gameLoop.start();

			const initialTime = gameLoop.lastFrameTime;

			// Advance time and execute frame
			global.advanceTime(100);
			const callback = rafCallbacks[0].callback;
			callback(performance.now());

			expect(gameLoop.lastFrameTime).toBe(initialTime + 100);
		});
	});
});
