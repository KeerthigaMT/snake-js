/**
 * Game configuration constants.
 * All constants are frozen to prevent accidental modification.
 */

/**
 * Grid dimensions and cell sizing
 */
export const GRID = Object.freeze({
	width: 15,
	height: 15,
	cellSize: 10,
});

/**
 * Game timing intervals (in milliseconds)
 */
export const TIMING = Object.freeze({
	tickInterval: 150,
	bombInterval: 5000,
});

/**
 * Snake initial configuration
 */
export const SNAKE = Object.freeze({
	startCoords: Object.freeze([Object.freeze({ x: 3, y: 12 }), Object.freeze({ x: 3, y: 13 })]),
	initialDirection: Object.freeze({
		deltaX: 0,
		deltaY: -1,
	}),
	initialDegree: 180,
});

/**
 * Canvas dimensions
 */
export const CANVAS = Object.freeze({
	maxWidth: 640,
	maxHeight: 360,
});

/**
 * Asset paths (relative to project root)
 */
export const ASSETS = Object.freeze({
	images: Object.freeze({
		background: './images/background.png',
		cell: './images/cell.png',
		food: './images/food.png',
		snakeBody: './images/body.png',
		snakeHead: './images/head.png',
		bomb: './images/bomb.png',
	}),
	sounds: Object.freeze({
		bomb: './sounds/bomb.wav',
		food: './sounds/food.wav',
		gameOver: './sounds/game-over.wav',
		snakeCharmer: './sounds/snakecharmer.wav',
	}),
});

/**
 * Audio configuration
 */
export const AUDIO = Object.freeze({
	snakeSoundVolume: 0.1,
	snakeSoundLoop: true,
});

/**
 * Debug flag for verbose logging
 */
export const DEBUG = false;
