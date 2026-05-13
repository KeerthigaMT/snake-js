import { describe, it, expect, beforeEach, vi } from 'vitest';
import AudioManager from '../../js/infrastructure/audioManager.js';

describe('AudioManager', () => {
	let mockSounds;
	let mockBombSound;
	let mockFoodSound;
	let mockBackgroundMusic;

	beforeEach(() => {
		mockBombSound = {
			cloneNode: vi.fn(() => ({
				play: vi.fn().mockResolvedValue(undefined),
				volume: 0,
			})),
			play: vi.fn().mockResolvedValue(undefined),
			pause: vi.fn(),
			loop: false,
			volume: 1,
			currentTime: 0,
		};

		mockFoodSound = {
			cloneNode: vi.fn(() => ({
				play: vi.fn().mockResolvedValue(undefined),
				volume: 0,
			})),
			play: vi.fn().mockResolvedValue(undefined),
			pause: vi.fn(),
			loop: false,
			volume: 1,
			currentTime: 0,
		};

		mockBackgroundMusic = {
			play: vi.fn().mockResolvedValue(undefined),
			pause: vi.fn(),
			loop: false,
			volume: 1,
			currentTime: 0,
		};

		mockSounds = {
			bomb: mockBombSound,
			food: mockFoodSound,
			background: mockBackgroundMusic,
		};
	});

	describe('Constructor and Dependency Injection', () => {
		it('should accept sounds via constructor parameters', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			expect(audioManager.sounds).toBe(mockSounds);
		});

		it('should initialize with empty sounds object if not provided', () => {
			const audioManager = new AudioManager();
			expect(audioManager.sounds).toEqual({});
		});

		it('should initialize with default muted state as false', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			expect(audioManager.isMuted).toBe(false);
		});

		it('should initialize with default master volume as 1.0', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			expect(audioManager.masterVolume).toBe(1.0);
		});

		it('should initialize with no background music playing', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			expect(audioManager.isBackgroundMusicPlaying).toBe(false);
		});
	});

	describe('playEffect()', () => {
		it('should play a sound effect by name', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.playEffect('bomb');
			
			expect(mockBombSound.cloneNode).toHaveBeenCalled();
			const clonedSound = mockBombSound.cloneNode.mock.results[0].value;
			expect(clonedSound.play).toHaveBeenCalled();
		});

		it('should set volume on cloned sound effect', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.setVolume(0.5);
			
			audioManager.playEffect('bomb');
			
			const clonedSound = mockBombSound.cloneNode.mock.results[0].value;
			expect(clonedSound.volume).toBe(0.5);
		});

		it('should not play when muted', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.setMuted(true);
			
			audioManager.playEffect('bomb');
			
			expect(mockBombSound.cloneNode).not.toHaveBeenCalled();
		});

		it('should gracefully handle missing sound (no error thrown)', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			expect(() => {
				audioManager.playEffect('nonexistent');
			}).not.toThrow();
		});

		it('should gracefully handle null sound asset', () => {
			const audioManager = new AudioManager({ sounds: { test: null } });
			
			expect(() => {
				audioManager.playEffect('test');
			}).not.toThrow();
		});

		it('should gracefully handle sound.cloneNode error', () => {
			const brokenSound = {
				cloneNode: vi.fn(() => {
					throw new Error('Clone failed');
				}),
			};
			const audioManager = new AudioManager({ sounds: { broken: brokenSound } });
			
			expect(() => {
				audioManager.playEffect('broken');
			}).not.toThrow();
		});
	});

	describe('playMusic()', () => {
		it('should start background music loop', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.playMusic('background');
			
			expect(mockBackgroundMusic.play).toHaveBeenCalled();
			expect(mockBackgroundMusic.loop).toBe(true);
		});

		it('should set background music volume to masterVolume * 0.1', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.setVolume(0.8);
			
			audioManager.playMusic('background');
			
			expect(mockBackgroundMusic.volume).toBeCloseTo(0.08, 5);
		});

		it('should mark background music as playing', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.playMusic('background');
			
			expect(audioManager.isBackgroundMusicPlaying).toBe(true);
		});

		it('should not start music when already playing', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.playMusic('background');
			mockBackgroundMusic.play.mockClear();
			audioManager.playMusic('background');
			
			expect(mockBackgroundMusic.play).not.toHaveBeenCalled();
		});

		it('should not start music when muted', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.setMuted(true);
			
			audioManager.playMusic('background');
			
			expect(mockBackgroundMusic.play).not.toHaveBeenCalled();
		});

		it('should use default name "background" if no name provided', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.playMusic();
			
			expect(mockBackgroundMusic.play).toHaveBeenCalled();
		});

		it('should gracefully handle missing music asset', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			expect(() => {
				audioManager.playMusic('nonexistent');
			}).not.toThrow();
			
			expect(audioManager.isBackgroundMusicPlaying).toBe(false);
		});
	});

	describe('stopMusic()', () => {
		it('should stop background music', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.playMusic('background');
			
			audioManager.stopMusic();
			
			expect(mockBackgroundMusic.pause).toHaveBeenCalled();
		});

		it('should reset music currentTime to 0', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.playMusic('background');
			mockBackgroundMusic.currentTime = 10;
			
			audioManager.stopMusic();
			
			expect(mockBackgroundMusic.currentTime).toBe(0);
		});

		it('should mark background music as not playing', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.playMusic('background');
			
			audioManager.stopMusic();
			
			expect(audioManager.isBackgroundMusicPlaying).toBe(false);
		});

		it('should gracefully handle no background music loaded', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			expect(() => {
				audioManager.stopMusic();
			}).not.toThrow();
		});

		it('should gracefully handle pause error', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.playMusic('background');
			mockBackgroundMusic.pause.mockImplementation(() => {
				throw new Error('Pause failed');
			});
			
			expect(() => {
				audioManager.stopMusic();
			}).not.toThrow();
		});
	});

	describe('setMuted()', () => {
		it('should toggle mute state to true', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.setMuted(true);
			
			expect(audioManager.isMuted).toBe(true);
		});

		it('should toggle mute state to false', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.setMuted(true);
			
			audioManager.setMuted(false);
			
			expect(audioManager.isMuted).toBe(false);
		});

		it('should coerce non-boolean values to boolean', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.setMuted(1);
			expect(audioManager.isMuted).toBe(true);
			
			audioManager.setMuted(0);
			expect(audioManager.isMuted).toBe(false);
		});

		it('should pause background music when muted', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.playMusic('background');
			mockBackgroundMusic.pause.mockClear();
			
			audioManager.setMuted(true);
			
			expect(mockBackgroundMusic.pause).toHaveBeenCalled();
		});

		it('should resume background music when unmuted', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.playMusic('background');
			audioManager.setMuted(true);
			audioManager.isBackgroundMusicPlaying = false;
			mockBackgroundMusic.play.mockClear();
			
			audioManager.setMuted(false);
			
			expect(mockBackgroundMusic.play).toHaveBeenCalled();
			expect(audioManager.isBackgroundMusicPlaying).toBe(true);
		});

		it('should not pause if no background music is playing', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.setMuted(true);
			
			expect(mockBackgroundMusic.pause).not.toHaveBeenCalled();
		});
	});

	describe('setVolume()', () => {
		it('should set master volume to valid value (0-1)', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.setVolume(0.5);
			
			expect(audioManager.masterVolume).toBe(0.5);
		});

		it('should update background music volume when playing', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			audioManager.playMusic('background');
			
			audioManager.setVolume(0.6);
			
			expect(mockBackgroundMusic.volume).toBe(0.06);
		});

		it('should not update volume if value is less than 0', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			const initialVolume = audioManager.masterVolume;
			
			audioManager.setVolume(-0.5);
			
			expect(audioManager.masterVolume).toBe(initialVolume);
		});

		it('should not update volume if value is greater than 1', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			const initialVolume = audioManager.masterVolume;
			
			audioManager.setVolume(1.5);
			
			expect(audioManager.masterVolume).toBe(initialVolume);
		});

		it('should not update volume if value is not a number', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			const initialVolume = audioManager.masterVolume;
			
			audioManager.setVolume('high');
			
			expect(audioManager.masterVolume).toBe(initialVolume);
		});

		it('should handle edge case volume of 0', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.setVolume(0);
			
			expect(audioManager.masterVolume).toBe(0);
		});

		it('should handle edge case volume of 1', () => {
			const audioManager = new AudioManager({ sounds: mockSounds });
			
			audioManager.setVolume(1);
			
			expect(audioManager.masterVolume).toBe(1);
		});
	});

	describe('Graceful Degradation', () => {
		it('should handle completely empty sounds object', () => {
			const audioManager = new AudioManager({ sounds: {} });
			
			expect(() => {
				audioManager.playEffect('any');
				audioManager.playMusic('any');
				audioManager.stopMusic();
			}).not.toThrow();
		});

		it('should handle undefined sounds parameter', () => {
			const audioManager = new AudioManager({ sounds: undefined });
			
			expect(() => {
				audioManager.playEffect('any');
			}).not.toThrow();
		});

		it('should not throw when sound.play() fails', () => {
			const failingSound = {
				cloneNode: vi.fn(() => ({
					play: vi.fn().mockRejectedValue(new Error('Play failed')),
					volume: 0,
				})),
			};
			const audioManager = new AudioManager({ sounds: { failing: failingSound } });
			
			expect(() => {
				audioManager.playEffect('failing');
			}).not.toThrow();
		});
	});
});
