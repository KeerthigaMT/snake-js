/**
 * @class GameLoop
 * Manages the game loop using requestAnimationFrame with a fixed-timestep delta-time accumulator.
 * Ensures consistent tick rate regardless of frame rate for frame-rate-independent gameplay.
 */
export default class GameLoop {
	/**
	 * Creates a new GameLoop instance.
	 *
	 * @param {Object} config - Configuration object
	 * @param {Function} config.updateFn - Callback function to invoke on each game tick
	 * @param {number} config.tickInterval - Fixed timestep interval in milliseconds (default: 150)
	 */
	constructor(config = {}) {
		this.updateFn = config.updateFn;
		this.tickInterval = config.tickInterval ?? 150;

		this.running = false;
		this.lastFrameTime = 0;
		this.accumulator = 0;
		this.rafId = null;

		this.boundLoop = this.loop.bind(this);
	}

	/**
	 * Starts the game loop.
	 * If already running, this method has no effect.
	 */
	start() {
		if (this.running) {
			return;
		}

		this.running = true;
		this.lastFrameTime = performance.now();
		this.accumulator = 0;
		this.rafId = requestAnimationFrame(this.boundLoop);
	}

	/**
	 * Stops the game loop.
	 * Cancels the pending animation frame and resets state.
	 */
	stop() {
		if (!this.running) {
			return;
		}

		this.running = false;
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		this.accumulator = 0;
	}

	/**
	 * Checks if the game loop is currently running.
	 *
	 * @returns {boolean} True if running, false otherwise
	 */
	isRunning() {
		return this.running;
	}

	/**
	 * Main game loop function called by requestAnimationFrame.
	 * Implements fixed-timestep delta-time accumulator pattern.
	 *
	 * @param {number} currentTime - Current timestamp from requestAnimationFrame
	 */
	loop(currentTime) {
		if (!this.running) {
			return;
		}

		// Calculate frame delta time
		const deltaTime = currentTime - this.lastFrameTime;
		this.lastFrameTime = currentTime;

		// Accumulate time
		this.accumulator += deltaTime;

		// Process fixed timesteps
		while (this.accumulator >= this.tickInterval) {
			if (this.updateFn) {
				this.updateFn();
			}
			this.accumulator -= this.tickInterval;
		}

		// Schedule next frame
		this.rafId = requestAnimationFrame(this.boundLoop);
	}
}
