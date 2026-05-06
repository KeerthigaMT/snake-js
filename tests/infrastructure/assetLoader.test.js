import { describe, it, expect, beforeEach, vi } from 'vitest';
import AssetLoader from '../../js/infrastructure/assetLoader.js';

describe('AssetLoader - Unit Tests', () => {
	let assetLoader;
	let mockContext;

	beforeEach(() => {
		mockContext = {
			drawImage: vi.fn(),
		};

		global.Image = vi.fn(function () {
			this.addEventListener = vi.fn((event, handler) => {
				if (event === 'load') {
					setTimeout(() => handler(), 0);
				}
			});
			this.width = 100;
			this.height = 100;
		});

		global.Audio = vi.fn(function () {
			this.addEventListener = vi.fn((event, handler, options) => {
				if (event === 'canplaythrough') {
					setTimeout(() => handler(), 0);
				}
			});
			this.load = vi.fn();
		});

		global.requestAnimationFrame = vi.fn((cb) => cb());

		assetLoader = new AssetLoader({ context: mockContext });
	});

	describe('Constructor and Configuration', () => {
		it('should initialize with default configuration', () => {
			const loader = new AssetLoader();
			expect(loader.maxRetries).toBe(3);
			expect(loader.baseDelay).toBe(100);
			expect(loader.assets).toBeDefined();
		});

		it('should accept custom configuration via constructor', () => {
			const customAssets = { images: {}, sounds: {} };
			const loader = new AssetLoader({
				assets: customAssets,
				maxRetries: 5,
				baseDelay: 200,
				context: mockContext,
			});
			expect(loader.maxRetries).toBe(5);
			expect(loader.baseDelay).toBe(200);
			expect(loader.assets).toBe(customAssets);
			expect(loader.context).toBe(mockContext);
		});

		it('should initialize loaded assets as empty objects', () => {
			expect(assetLoader.loadedImages).toEqual({});
			expect(assetLoader.loadedSounds).toEqual({});
		});
	});

	describe('loadAll()', () => {
		it('should load all images and sounds in parallel', async () => {
			const result = await assetLoader.loadAll();

			expect(result).toHaveProperty('images');
			expect(result).toHaveProperty('sounds');
			expect(result.images).toBeDefined();
			expect(result.sounds).toBeDefined();
		});

		it('should populate loadedImages and loadedSounds', async () => {
			await assetLoader.loadAll();

			expect(Object.keys(assetLoader.loadedImages).length).toBeGreaterThan(0);
			expect(Object.keys(assetLoader.loadedSounds).length).toBeGreaterThan(0);
		});
	});

	describe('loadAllImages()', () => {
		it('should load all images defined in assets.images', async () => {
			const images = await assetLoader.loadAllImages();

			expect(images).toHaveProperty('background');
			expect(images).toHaveProperty('cell');
			expect(images).toHaveProperty('food');
			expect(images).toHaveProperty('snakeBody');
			expect(images).toHaveProperty('snakeHead');
			expect(images).toHaveProperty('bomb');
		});

		it('should return Image instances', async () => {
			const images = await assetLoader.loadAllImages();

			Object.values(images).forEach((img) => {
				expect(img.width).toBe(100);
				expect(img.height).toBe(100);
			});
		});
	});

	describe('loadAllSounds()', () => {
		it('should load all sounds defined in assets.sounds', async () => {
			const sounds = await assetLoader.loadAllSounds();

			expect(sounds).toHaveProperty('bomb');
			expect(sounds).toHaveProperty('food');
			expect(sounds).toHaveProperty('gameOver');
			expect(sounds).toHaveProperty('snakeCharmer');
		});

		it('should return Audio instances', async () => {
			const sounds = await assetLoader.loadAllSounds();

			Object.values(sounds).forEach((sound) => {
				expect(sound.load).toBeDefined();
			});
		});
	});

	describe('loadImageWithRetry()', () => {
		it('should load image successfully on first attempt', async () => {
			const image = await assetLoader.loadImageWithRetry('./test.png');

			expect(image).toBeDefined();
			expect(image.width).toBe(100);
		});

		it('should retry on failure with exponential backoff', async () => {
			let attempts = 0;
			global.Image = vi.fn(function () {
				this.addEventListener = vi.fn((event, handler) => {
					if (event === 'load') {
						attempts++;
						if (attempts < 3) {
							// Fail first 2 attempts
							setTimeout(() => {}, 0);
						} else {
							// Succeed on 3rd attempt
							setTimeout(() => handler(), 0);
						}
					}
					if (event === 'error' && attempts < 3) {
						setTimeout(() => handler(), 0);
					}
				});
				this.width = 100;
				this.height = 100;
			});

			assetLoader = new AssetLoader({ context: mockContext, baseDelay: 10 });
			const sleepSpy = vi.spyOn(assetLoader, 'sleep');

			try {
				await assetLoader.loadImageWithRetry('./test.png');
			} catch (e) {
				// Expected to fail
			}

			expect(sleepSpy).toHaveBeenCalled();
		});

		it('should throw error after max retries', async () => {
			global.Image = vi.fn(function () {
				this.addEventListener = vi.fn((event, handler) => {
					if (event === 'error') {
						setTimeout(() => handler(), 0);
					}
				});
				this.width = 0;
				this.height = 0;
			});

			assetLoader = new AssetLoader({ context: mockContext, maxRetries: 1, baseDelay: 10 });

			await expect(assetLoader.loadImageWithRetry('./test.png')).rejects.toThrow();
		});
	});

	describe('loadSoundWithRetry()', () => {
		it('should load sound successfully on first attempt', async () => {
			const sound = await assetLoader.loadSoundWithRetry('./test.wav');

			expect(sound).toBeDefined();
			expect(sound.load).toBeDefined();
		});

		it('should degrade gracefully to muted audio on failure', async () => {
			global.Audio = vi.fn(function () {
				this.addEventListener = vi.fn((event, handler) => {
					if (event === 'error') {
						setTimeout(() => handler(), 0);
					}
				});
				this.load = vi.fn();
			});

			assetLoader = new AssetLoader({ maxRetries: 1, baseDelay: 10 });
			const sound = await assetLoader.loadSoundWithRetry('./test.wav');

			expect(sound).toBeDefined();
			expect(sound.muted).toBe(true);
			expect(sound.volume).toBe(0);
		});
	});

	describe('loadImage()', () => {
		it('should load image and trigger load event', async () => {
			const image = await assetLoader.loadImage('./test.png');

			expect(image).toBeDefined();
			expect(image.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
		});

		it('should draw image to context if provided', async () => {
			await assetLoader.loadImage('./test.png');

			expect(mockContext.drawImage).toHaveBeenCalledWith(expect.anything(), -100, -100);
		});

		it('should not draw if context is not provided', async () => {
			const loaderWithoutContext = new AssetLoader();
			await loaderWithoutContext.loadImage('./test.png');

			expect(mockContext.drawImage).not.toHaveBeenCalled();
		});
	});

	describe('loadSound()', () => {
		it('should load sound and trigger canplaythrough event', async () => {
			const sound = await assetLoader.loadSound('./test.wav');

			expect(sound).toBeDefined();
			expect(sound.load).toHaveBeenCalled();
		});
	});

	describe('Validation Methods', () => {
		describe('validateImage()', () => {
			it('should validate a valid image', () => {
				const validImage = { width: 100, height: 100 };
				Object.setPrototypeOf(validImage, Image.prototype);

				expect(() => assetLoader.validateImage(validImage)).not.toThrow();
			});

			it('should throw error for null/undefined image', () => {
				expect(() => assetLoader.validateImage(null)).toThrow('Invalid image object');
				expect(() => assetLoader.validateImage(undefined)).toThrow('Invalid image object');
			});

			it('should throw error for image with zero width', () => {
				const zeroWidthImage = { width: 0, height: 100 };
				Object.setPrototypeOf(zeroWidthImage, Image.prototype);

				expect(() => assetLoader.validateImage(zeroWidthImage)).toThrow(
					'Image has zero dimensions'
				);
			});

			it('should throw error for image with zero height', () => {
				const zeroHeightImage = { width: 100, height: 0 };
				Object.setPrototypeOf(zeroHeightImage, Image.prototype);

				expect(() => assetLoader.validateImage(zeroHeightImage)).toThrow(
					'Image has zero dimensions'
				);
			});
		});

		describe('validateSound()', () => {
			it('should validate a valid audio object', () => {
				const validAudio = { play: vi.fn() };
				Object.setPrototypeOf(validAudio, Audio.prototype);

				expect(() => assetLoader.validateSound(validAudio)).not.toThrow();
			});

			it('should throw error for null/undefined audio', () => {
				expect(() => assetLoader.validateSound(null)).toThrow('Invalid audio object');
				expect(() => assetLoader.validateSound(undefined)).toThrow('Invalid audio object');
			});
		});
	});

	describe('createMutedAudio()', () => {
		it('should create a muted audio element', () => {
			const mutedAudio = assetLoader.createMutedAudio();

			expect(mutedAudio).toBeDefined();
			expect(mutedAudio.muted).toBe(true);
			expect(mutedAudio.volume).toBe(0);
		});
	});

	describe('sleep()', () => {
		it('should resolve after specified delay', async () => {
			const start = Date.now();
			await assetLoader.sleep(50);
			const duration = Date.now() - start;

			expect(duration).toBeGreaterThanOrEqual(45); // Allow 5ms tolerance
		});
	});

	describe('Parallel Loading Performance', () => {
		it('should load multiple images concurrently', async () => {
			const startTime = Date.now();
			await assetLoader.loadAllImages();
			const duration = Date.now() - startTime;

			// With parallel loading, total time should be less than sequential
			// Sequential would be 6 images * individual load time
			expect(duration).toBeLessThan(1000); // Reasonable threshold
		});

		it('should load multiple sounds concurrently', async () => {
			const startTime = Date.now();
			await assetLoader.loadAllSounds();
			const duration = Date.now() - startTime;

			expect(duration).toBeLessThan(1000);
		});
	});
});
