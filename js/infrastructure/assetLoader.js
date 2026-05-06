import { ASSETS } from '../constants.js';

/**
 * @class AssetLoader
 * Handles parallel loading of game assets (images and sounds) with retry logic and validation.
 * Uses Promise.all() for parallel loading and exponential backoff for retries.
 */
export default class AssetLoader {
	/**
	 * Creates a new AssetLoader instance.
	 *
	 * @param {Object} config - Configuration object
	 * @param {Object} config.assets - Asset paths object from constants (default: ASSETS)
	 * @param {number} config.maxRetries - Maximum retry attempts for failed loads (default: 3)
	 * @param {number} config.baseDelay - Base delay in ms for exponential backoff (default: 100)
	 * @param {CanvasRenderingContext2D} config.context - Canvas context for image preloading (optional)
	 */
	constructor(config = {}) {
		this.assets = config.assets || ASSETS;
		this.maxRetries = config.maxRetries ?? 3;
		this.baseDelay = config.baseDelay ?? 100;
		this.context = config.context;

		this.loadedImages = {};
		this.loadedSounds = {};
	}

	/**
	 * Loads all game assets (images and sounds) in parallel.
	 *
	 * @async
	 * @returns {Promise<Object>} Object containing {images: {}, sounds: {}} with loaded assets
	 */
	async loadAll() {
		const [images, sounds] = await Promise.all([this.loadAllImages(), this.loadAllSounds()]);

		this.loadedImages = images;
		this.loadedSounds = sounds;

		return { images, sounds };
	}

	/**
	 * Loads all image assets in parallel.
	 *
	 * @async
	 * @returns {Promise<Object>} Object with image keys mapped to loaded Image elements
	 */
	async loadAllImages() {
		const imagePromises = Object.entries(this.assets.images).map(async ([key, path]) => {
			const image = await this.loadImageWithRetry(path);
			return [key, image];
		});

		const imageEntries = await Promise.all(imagePromises);
		return Object.fromEntries(imageEntries);
	}

	/**
	 * Loads all sound assets in parallel with graceful degradation.
	 *
	 * @async
	 * @returns {Promise<Object>} Object with sound keys mapped to loaded Audio elements (muted on failure)
	 */
	async loadAllSounds() {
		const soundPromises = Object.entries(this.assets.sounds).map(async ([key, path]) => {
			const sound = await this.loadSoundWithRetry(path);
			return [key, sound];
		});

		const soundEntries = await Promise.all(soundPromises);
		return Object.fromEntries(soundEntries);
	}

	/**
	 * Loads a single image with retry logic and validation.
	 *
	 * @async
	 * @param {string} path - The image file path
	 * @param {number} [attempt=0] - Current retry attempt number
	 * @returns {Promise<HTMLImageElement>} The loaded and validated image element
	 * @throws {Error} If image fails to load after all retry attempts
	 */
	async loadImageWithRetry(path, attempt = 0) {
		try {
			const image = await this.loadImage(path);
			this.validateImage(image);
			return image;
		} catch (error) {
			if (attempt < this.maxRetries) {
				const delay = this.baseDelay * Math.pow(2, attempt);
				await this.sleep(delay);
				return this.loadImageWithRetry(path, attempt + 1);
			}
			throw new Error(
				`Failed to load image ${path} after ${this.maxRetries} attempts: ${error.message}`,
				{ cause: error }
			);
		}
	}

	/**
	 * Loads a single sound with retry logic and graceful degradation.
	 *
	 * @async
	 * @param {string} path - The audio file path
	 * @param {number} [attempt=0] - Current retry attempt number
	 * @returns {Promise<HTMLAudioElement>} The loaded audio element (muted on failure)
	 */
	async loadSoundWithRetry(path, attempt = 0) {
		try {
			const sound = await this.loadSound(path);
			this.validateSound(sound);
			return sound;
		} catch {
			if (attempt < this.maxRetries) {
				const delay = this.baseDelay * Math.pow(2, attempt);
				await this.sleep(delay);
				return this.loadSoundWithRetry(path, attempt + 1);
			}
			// Graceful degradation: return muted audio on failure
			console.warn(
				`Failed to load sound ${path} after ${this.maxRetries} attempts. Degrading to muted.`
			);
			return this.createMutedAudio();
		}
	}

	/**
	 * Loads a single image asynchronously.
	 *
	 * @async
	 * @param {string} path - The image file path
	 * @returns {Promise<HTMLImageElement>} The loaded image element
	 */
	async loadImage(path) {
		const image = new Image();
		await new Promise((resolve, reject) => {
			image.addEventListener('load', () => {
				if (this.context) {
					window.requestAnimationFrame(() => {
						this.context.drawImage(image, -100, -100);
					});
				}
				resolve();
			});
			image.addEventListener('error', () => {
				reject(new Error(`Image load error: ${path}`));
			});
			image.src = path;
		});
		return image;
	}

	/**
	 * Loads a single audio file asynchronously.
	 *
	 * @async
	 * @param {string} path - The audio file path
	 * @returns {Promise<HTMLAudioElement>} The loaded audio element
	 */
	async loadSound(path) {
		const sound = new Audio();
		await new Promise((resolve, reject) => {
			sound.addEventListener(
				'canplaythrough',
				() => {
					resolve();
				},
				{ once: true }
			);
			sound.addEventListener('error', () => {
				reject(new Error(`Audio load error: ${path}`));
			});
			sound.src = path;
			sound.loop = false;
			sound.load();
		});
		return sound;
	}

	/**
	 * Validates that an image is valid and has non-zero dimensions.
	 *
	 * @param {HTMLImageElement} image - The image to validate
	 * @throws {Error} If image is invalid or has zero dimensions
	 */
	validateImage(image) {
		if (!image || !(image instanceof Image)) {
			throw new Error('Invalid image object');
		}
		if (image.width === 0 || image.height === 0) {
			throw new Error('Image has zero dimensions');
		}
	}

	/**
	 * Validates that an audio element is valid.
	 *
	 * @param {HTMLAudioElement} sound - The audio element to validate
	 * @throws {Error} If audio is invalid
	 */
	validateSound(sound) {
		if (!sound || !(sound instanceof Audio)) {
			throw new Error('Invalid audio object');
		}
	}

	/**
	 * Creates a muted audio element for graceful degradation.
	 *
	 * @returns {HTMLAudioElement} A muted audio element
	 */
	createMutedAudio() {
		const audio = new Audio();
		audio.muted = true;
		audio.volume = 0;
		return audio;
	}

	/**
	 * Sleeps for the specified duration.
	 *
	 * @async
	 * @param {number} ms - Duration in milliseconds
	 * @returns {Promise<void>}
	 */
	async sleep(ms) {
		return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
	}
}
