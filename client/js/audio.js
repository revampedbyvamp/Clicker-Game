// Audio System using Web Audio API
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;

        // Initialize on user interaction (required by browsers)
        document.addEventListener('click', () => this.init(), { once: true });
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        }
    }

    createSounds() {
        // Create click sound (short beep)
        this.sounds.click = this.createBeep(800, 0.05, 'sine');

        // Create purchase sound (success chime)
        this.sounds.purchase = this.createChime([523, 659, 784], 0.15);

        // Create achievement sound (fanfare)
        this.sounds.achievement = this.createChime([523, 659, 784, 1047], 0.2);
    }

    createBeep(frequency, duration, type = 'sine') {
        return () => {
            if (!this.enabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    createChime(frequencies, totalDuration) {
        return () => {
            if (!this.enabled || !this.audioContext) return;

            const noteDuration = totalDuration / frequencies.length;

            frequencies.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';

                const startTime = this.audioContext.currentTime + (index * noteDuration);
                const endTime = startTime + noteDuration;

                gainNode.gain.setValueAtTime(this.volume * 0.2, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

                oscillator.start(startTime);
                oscillator.stop(endTime);
            });
        };
    }

    playClick() {
        this.sounds.click?.();
    }

    playPurchase() {
        this.sounds.purchase?.();
    }

    playAchievement() {
        this.sounds.achievement?.();
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

// Initialize audio system
const audioSystem = new AudioSystem();
