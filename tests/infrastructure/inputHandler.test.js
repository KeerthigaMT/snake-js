import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import InputHandler from '../../js/infrastructure/inputHandler.js';

describe('InputHandler - Unit Tests', () => {
	let inputHandler;
	let mockOnFirstInput;

	beforeEach(() => {
		mockOnFirstInput = vi.fn();
	});

	afterEach(() => {
		if (inputHandler) {
			inputHandler.destroy();
		}
	});

	describe('Constructor and Configuration', () => {
		it('should initialize with default configuration', () => {
			inputHandler = new InputHandler();

			expect(inputHandler.currentDirection).toEqual({ deltaX: 0, deltaY: -1, degree: 180 });
			expect(inputHandler.commandQueue).toEqual([]);
			expect(inputHandler.firstInputReceived).toBe(false);
		});

		it('should accept custom initial direction via constructor', () => {
			const customDirection = { deltaX: 1, deltaY: 0, degree: 90 };
			inputHandler = new InputHandler({ initialDirection: customDirection });

			expect(inputHandler.currentDirection).toEqual(customDirection);
		});

		it('should accept onFirstInput callback via constructor', () => {
			inputHandler = new InputHandler({ onFirstInput: mockOnFirstInput });

			expect(inputHandler.onFirstInput).toBe(mockOnFirstInput);
		});

		it('should set up document keydown listener', () => {
			const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
			inputHandler = new InputHandler();

			expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
			addEventListenerSpy.mockRestore();
		});
	});

	describe('Arrow Key Mapping', () => {
		it('should map ArrowUp to upward direction', () => {
			// Start moving right to avoid reversal
			inputHandler = new InputHandler({ initialDirection: { deltaX: 1, deltaY: 0, degree: 90 } });

			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
			document.dispatchEvent(event);

			const direction = inputHandler.dequeue();
			expect(direction).toEqual({ deltaX: 0, deltaY: -1, degree: 0 });
		});

		it('should map ArrowDown to downward direction', () => {
			// Start moving right to avoid reversal
			inputHandler = new InputHandler({ initialDirection: { deltaX: 1, deltaY: 0, degree: 90 } });

			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
			document.dispatchEvent(event);

			const direction = inputHandler.dequeue();
			expect(direction).toEqual({ deltaX: 0, deltaY: 1, degree: 180 });
		});

		it('should map ArrowLeft to leftward direction', () => {
			// Start moving up to avoid reversal
			inputHandler = new InputHandler({ initialDirection: { deltaX: 0, deltaY: -1, degree: 0 } });

			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
			document.dispatchEvent(event);

			const direction = inputHandler.dequeue();
			expect(direction).toEqual({ deltaX: -1, deltaY: 0, degree: 270 });
		});

		it('should map ArrowRight to rightward direction', () => {
			// Start moving up to avoid reversal
			inputHandler = new InputHandler({ initialDirection: { deltaX: 0, deltaY: -1, degree: 0 } });

			const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
			document.dispatchEvent(event);

			const direction = inputHandler.dequeue();
			expect(direction).toEqual({ deltaX: 1, deltaY: 0, degree: 90 });
		});
	});

	describe('WASD Key Mapping', () => {
		it('should map W key to upward direction', () => {
			// Start moving right to avoid reversal
			inputHandler = new InputHandler({ initialDirection: { deltaX: 1, deltaY: 0, degree: 90 } });

			const event = new KeyboardEvent('keydown', { key: 'w' });
			document.dispatchEvent(event);

			const direction = inputHandler.dequeue();
			expect(direction).toEqual({ deltaX: 0, deltaY: -1, degree: 0 });
		});

		it('should map S key to downward direction', () => {
			// Start moving right to avoid reversal
			inputHandler = new InputHandler({ initialDirection: { deltaX: 1, deltaY: 0, degree: 90 } });

			const event = new KeyboardEvent('keydown', { key: 's' });
			document.dispatchEvent(event);

			const direction = inputHandler.dequeue();
			expect(direction).toEqual({ deltaX: 0, deltaY: 1, degree: 180 });
		});

		it('should map A key to leftward direction', () => {
			// Start moving up to avoid reversal
			inputHandler = new InputHandler({ initialDirection: { deltaX: 0, deltaY: -1, degree: 0 } });

			const event = new KeyboardEvent('keydown', { key: 'a' });
			document.dispatchEvent(event);

			const direction = inputHandler.dequeue();
			expect(direction).toEqual({ deltaX: -1, deltaY: 0, degree: 270 });
		});

		it('should map D key to rightward direction', () => {
			// Start moving up to avoid reversal
			inputHandler = new InputHandler({ initialDirection: { deltaX: 0, deltaY: -1, degree: 0 } });

			const event = new KeyboardEvent('keydown', { key: 'd' });
			document.dispatchEvent(event);

			const direction = inputHandler.dequeue();
			expect(direction).toEqual({ deltaX: 1, deltaY: 0, degree: 90 });
		});

		it('should map uppercase WASD keys', () => {
			// Test with right direction to allow W and S
			inputHandler = new InputHandler({ initialDirection: { deltaX: 1, deltaY: 0, degree: 90 } });

			['W', 'S'].forEach((key) => {
				inputHandler.clearQueue();
				const event = new KeyboardEvent('keydown', { key });
				document.dispatchEvent(event);

				expect(inputHandler.hasPendingCommands()).toBe(true);
			});

			// Test with up direction to allow A and D
			inputHandler.destroy();
			inputHandler = new InputHandler({ initialDirection: { deltaX: 0, deltaY: -1, degree: 0 } });

			['A', 'D'].forEach((key) => {
				inputHandler.clearQueue();
				const event = new KeyboardEvent('keydown', { key });
				document.dispatchEvent(event);

				expect(inputHandler.hasPendingCommands()).toBe(true);
			});
		});
	});

	describe('Direction Reversal Prevention', () => {
		it('should prevent moving down while moving up', () => {
			inputHandler = new InputHandler({ initialDirection: { deltaX: 0, deltaY: -1, degree: 0 } });

			const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
			document.dispatchEvent(downEvent);

			expect(inputHandler.hasPendingCommands()).toBe(false);
		});

		it('should prevent moving up while moving down', () => {
			inputHandler = new InputHandler({ initialDirection: { deltaX: 0, deltaY: 1, degree: 180 } });

			const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
			document.dispatchEvent(upEvent);

			expect(inputHandler.hasPendingCommands()).toBe(false);
		});

		it('should prevent moving left while moving right', () => {
			inputHandler = new InputHandler({ initialDirection: { deltaX: 1, deltaY: 0, degree: 90 } });

			const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
			document.dispatchEvent(leftEvent);

			expect(inputHandler.hasPendingCommands()).toBe(false);
		});

		it('should prevent moving right while moving left', () => {
			inputHandler = new InputHandler({ initialDirection: { deltaX: -1, deltaY: 0, degree: 270 } });

			const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
			document.dispatchEvent(rightEvent);

			expect(inputHandler.hasPendingCommands()).toBe(false);
		});

		it('should check reversal against last queued direction, not current', () => {
			inputHandler = new InputHandler({ initialDirection: { deltaX: 0, deltaY: -1, degree: 0 } });

			// Queue a left turn
			const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
			document.dispatchEvent(leftEvent);

			// Try to go right (opposite of queued left)
			const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
			document.dispatchEvent(rightEvent);

			// Should only have the left turn in queue
			expect(inputHandler.commandQueue).toHaveLength(1);
			expect(inputHandler.commandQueue[0]).toEqual({ deltaX: -1, deltaY: 0, degree: 270 });
		});
	});

	describe('Command Queue Operations', () => {
		beforeEach(() => {
			inputHandler = new InputHandler();
		});

		it('should enqueue direction changes', () => {
			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
			document.dispatchEvent(event);

			expect(inputHandler.hasPendingCommands()).toBe(true);
			expect(inputHandler.commandQueue).toHaveLength(1);
		});

		it('should limit queue size to 2 commands', () => {
			['ArrowLeft', 'ArrowDown', 'ArrowRight'].forEach((key) => {
				const event = new KeyboardEvent('keydown', { key });
				document.dispatchEvent(event);
			});

			expect(inputHandler.commandQueue).toHaveLength(2);
		});

		it('should dequeue and return the next direction', () => {
			const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
			document.dispatchEvent(leftEvent);

			const direction = inputHandler.dequeue();

			expect(direction).toEqual({ deltaX: -1, deltaY: 0, degree: 270 });
			expect(inputHandler.hasPendingCommands()).toBe(false);
		});

		it('should return null when dequeuing from empty queue', () => {
			const direction = inputHandler.dequeue();

			expect(direction).toBeNull();
		});

		it('should update currentDirection when dequeuing', () => {
			const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
			document.dispatchEvent(leftEvent);

			inputHandler.dequeue();

			expect(inputHandler.getCurrentDirection()).toEqual({ deltaX: -1, deltaY: 0, degree: 270 });
		});

		it('should clear all pending commands', () => {
			['ArrowLeft', 'ArrowDown'].forEach((key) => {
				const event = new KeyboardEvent('keydown', { key });
				document.dispatchEvent(event);
			});

			inputHandler.clearQueue();

			expect(inputHandler.hasPendingCommands()).toBe(false);
			expect(inputHandler.commandQueue).toHaveLength(0);
		});
	});

	describe('First Input Callback', () => {
		it('should invoke onFirstInput callback on first key press', () => {
			inputHandler = new InputHandler({ onFirstInput: mockOnFirstInput });

			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
			document.dispatchEvent(event);

			expect(mockOnFirstInput).toHaveBeenCalledOnce();
		});

		it('should not invoke onFirstInput callback on subsequent key presses', () => {
			inputHandler = new InputHandler({ onFirstInput: mockOnFirstInput });

			const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
			const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

			document.dispatchEvent(upEvent);
			document.dispatchEvent(leftEvent);

			expect(mockOnFirstInput).toHaveBeenCalledOnce();
		});

		it('should not invoke callback if onFirstInput not provided', () => {
			inputHandler = new InputHandler();

			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
			expect(() => document.dispatchEvent(event)).not.toThrow();
		});

		it('should not invoke callback for unmapped keys', () => {
			inputHandler = new InputHandler({ onFirstInput: mockOnFirstInput });

			const event = new KeyboardEvent('keydown', { key: 'Space' });
			document.dispatchEvent(event);

			expect(mockOnFirstInput).not.toHaveBeenCalled();
		});
	});

	describe('Ignored Keys', () => {
		beforeEach(() => {
			inputHandler = new InputHandler();
		});

		it('should ignore unmapped keys', () => {
			['Space', 'Enter', 'Escape', 'Tab'].forEach((key) => {
				const event = new KeyboardEvent('keydown', { key });
				document.dispatchEvent(event);
			});

			expect(inputHandler.hasPendingCommands()).toBe(false);
		});
	});

	describe('getCurrentDirection()', () => {
		it('should return current direction without modifying queue', () => {
			inputHandler = new InputHandler({ initialDirection: { deltaX: 1, deltaY: 0, degree: 90 } });

			const direction = inputHandler.getCurrentDirection();

			expect(direction).toEqual({ deltaX: 1, deltaY: 0, degree: 90 });
			expect(inputHandler.hasPendingCommands()).toBe(false);
		});
	});

	describe('hasPendingCommands()', () => {
		beforeEach(() => {
			inputHandler = new InputHandler();
		});

		it('should return false when queue is empty', () => {
			expect(inputHandler.hasPendingCommands()).toBe(false);
		});

		it('should return true when queue has commands', () => {
			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
			document.dispatchEvent(event);

			expect(inputHandler.hasPendingCommands()).toBe(true);
		});
	});

	describe('Cleanup and Destroy', () => {
		it('should remove event listener on destroy', () => {
			const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
			inputHandler = new InputHandler();

			inputHandler.destroy();

			expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
			removeEventListenerSpy.mockRestore();
		});

		it('should clear queue on destroy', () => {
			inputHandler = new InputHandler();

			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
			document.dispatchEvent(event);

			inputHandler.destroy();

			expect(inputHandler.commandQueue).toHaveLength(0);
		});

		it('should not respond to events after destroy', () => {
			inputHandler = new InputHandler();
			inputHandler.destroy();

			const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
			document.dispatchEvent(event);

			expect(inputHandler.hasPendingCommands()).toBe(false);
		});
	});
});
