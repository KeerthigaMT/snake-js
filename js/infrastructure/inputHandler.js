/**
 * @class InputHandler
 * Handles keyboard input for snake direction control with command queue pattern.
 * Supports arrow keys and WASD keys with direction reversal prevention.
 */
export default class InputHandler {
	/**
	 * Creates a new InputHandler instance.
	 *
	 * @param {Object} config - Configuration object
	 * @param {Object} config.initialDirection - Initial direction vector {deltaX, deltaY, degree}
	 * @param {Function} config.onFirstInput - Callback invoked on first input (optional)
	 */
	constructor(config = {}) {
		this.currentDirection = config.initialDirection || { deltaX: 0, deltaY: -1, degree: 180 };
		this.onFirstInput = config.onFirstInput;
		this.commandQueue = [];
		this.firstInputReceived = false;
		this.boundKeydownHandler = this.handleKeydown.bind(this);

		this.setupListeners();
	}

	/**
	 * Sets up keyboard event listeners on the document.
	 */
	setupListeners() {
		document.addEventListener('keydown', this.boundKeydownHandler);
	}

	/**
	 * Handles keydown events and processes direction changes.
	 *
	 * @param {KeyboardEvent} event - The keyboard event
	 */
	handleKeydown(event) {
		const { key } = event;
		const direction = this.mapKeyToDirection(key);

		if (!direction) {
			return;
		}

		// Trigger first input callback if registered
		if (!this.firstInputReceived && this.onFirstInput) {
			this.firstInputReceived = true;
			this.onFirstInput();
		}

		// Prevent direction reversal
		if (this.isReversal(direction)) {
			return;
		}

		// Add to command queue
		this.enqueue(direction);
	}

	/**
	 * Maps keyboard keys to direction vectors.
	 *
	 * @param {string} key - The keyboard key
	 * @returns {Object|null} Direction object {deltaX, deltaY, degree} or null if key not mapped
	 */
	mapKeyToDirection(key) {
		const keyMap = {
			ArrowUp: { deltaX: 0, deltaY: -1, degree: 0 },
			w: { deltaX: 0, deltaY: -1, degree: 0 },
			W: { deltaX: 0, deltaY: -1, degree: 0 },
			ArrowDown: { deltaX: 0, deltaY: 1, degree: 180 },
			s: { deltaX: 0, deltaY: 1, degree: 180 },
			S: { deltaX: 0, deltaY: 1, degree: 180 },
			ArrowLeft: { deltaX: -1, deltaY: 0, degree: 270 },
			a: { deltaX: -1, deltaY: 0, degree: 270 },
			A: { deltaX: -1, deltaY: 0, degree: 270 },
			ArrowRight: { deltaX: 1, deltaY: 0, degree: 90 },
			d: { deltaX: 1, deltaY: 0, degree: 90 },
			D: { deltaX: 1, deltaY: 0, degree: 90 },
		};

		return keyMap[key] || null;
	}

	/**
	 * Checks if a direction change would cause the snake to reverse into itself.
	 *
	 * @param {Object} newDirection - The proposed direction {deltaX, deltaY, degree}
	 * @returns {boolean} True if the direction is a reversal, false otherwise
	 */
	isReversal(newDirection) {
		// Get the effective current direction (last queued or current)
		const effectiveDirection =
			this.commandQueue.length > 0
				? this.commandQueue[this.commandQueue.length - 1]
				: this.currentDirection;

		// A direction is a reversal if the sum of delta vectors is (0, 0)
		return (
			effectiveDirection.deltaX + newDirection.deltaX === 0 &&
			effectiveDirection.deltaY + newDirection.deltaY === 0
		);
	}

	/**
	 * Adds a direction to the command queue.
	 *
	 * @param {Object} direction - The direction to enqueue {deltaX, deltaY, degree}
	 */
	enqueue(direction) {
		// Limit queue size to prevent excessive buffering
		if (this.commandQueue.length < 2) {
			this.commandQueue.push(direction);
		}
	}

	/**
	 * Removes and returns the next direction from the command queue.
	 *
	 * @returns {Object|null} The next direction {deltaX, deltaY, degree} or null if queue is empty
	 */
	dequeue() {
		if (this.commandQueue.length === 0) {
			return null;
		}

		const direction = this.commandQueue.shift();
		this.currentDirection = direction;
		return direction;
	}

	/**
	 * Gets the current direction without removing it from the queue.
	 *
	 * @returns {Object} The current direction {deltaX, deltaY, degree}
	 */
	getCurrentDirection() {
		return this.currentDirection;
	}

	/**
	 * Checks if the command queue has pending directions.
	 *
	 * @returns {boolean} True if queue has pending directions, false otherwise
	 */
	hasPendingCommands() {
		return this.commandQueue.length > 0;
	}

	/**
	 * Clears all pending commands from the queue.
	 */
	clearQueue() {
		this.commandQueue = [];
	}

	/**
	 * Removes event listeners and cleans up resources.
	 */
	destroy() {
		document.removeEventListener('keydown', this.boundKeydownHandler);
		this.clearQueue();
	}
}
