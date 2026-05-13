export default class AudioManager {
	constructor({ sounds = {} } = {}) {
		this.sounds = sounds;
		this.isMuted = false;
		this.masterVolume = 1.0;
		this.backgroundMusic = null;
		this.isBackgroundMusicPlaying = false;
	}

	playEffect(name) {
		const sound = this.sounds[name];
		
		if (!sound || this.isMuted) {
			return;
		}

		try {
			const effectClone = sound.cloneNode();
			effectClone.volume = this.masterVolume;
			effectClone.play().catch(() => {});
		} catch (error) {
			console.warn(`Failed to play sound effect: ${name}`, error);
		}
	}

	playMusic(name = 'background') {
		if (this.isBackgroundMusicPlaying || this.isMuted) {
			return;
		}

		const music = this.sounds[name];
		
		if (!music) {
			return;
		}

		try {
			this.backgroundMusic = music;
			this.backgroundMusic.loop = true;
			this.backgroundMusic.volume = this.masterVolume * 0.1;
			this.backgroundMusic.play().catch(() => {});
			this.isBackgroundMusicPlaying = true;
		} catch (error) {
			console.warn(`Failed to play background music: ${name}`, error);
			this.isBackgroundMusicPlaying = false;
		}
	}

	stopMusic() {
		if (!this.backgroundMusic) {
			return;
		}

		try {
			this.backgroundMusic.pause();
			this.backgroundMusic.currentTime = 0;
			this.isBackgroundMusicPlaying = false;
		} catch (error) {
			console.warn('Failed to stop background music', error);
		}
	}

	setMuted(muted) {
		this.isMuted = Boolean(muted);
		
		if (this.isMuted && this.backgroundMusic && this.isBackgroundMusicPlaying) {
			try {
				this.backgroundMusic.pause();
			} catch (error) {
				console.warn('Failed to pause music when muting', error);
			}
		} else if (!this.isMuted && this.backgroundMusic && !this.isBackgroundMusicPlaying) {
			try {
				this.backgroundMusic.play().catch(() => {});
				this.isBackgroundMusicPlaying = true;
			} catch (error) {
				console.warn('Failed to resume music when unmuting', error);
			}
		}
	}

	setVolume(volume) {
		if (typeof volume !== 'number' || volume < 0 || volume > 1) {
			console.warn('Volume must be a number between 0 and 1');
			return;
		}

		this.masterVolume = volume;

		if (this.backgroundMusic && this.isBackgroundMusicPlaying) {
			try {
				this.backgroundMusic.volume = this.masterVolume * 0.1;
			} catch (error) {
				console.warn('Failed to update background music volume', error);
			}
		}
	}
}
