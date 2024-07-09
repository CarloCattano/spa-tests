export function initAudioContext() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();

    oscillator.type = 'sine'; // Type of waveform: 'sine', 'square', 'sawtooth', 'triangle'
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequency in Hz (A4)
    oscillator.connect(audioContext.destination);

    return {
        audioContext,
        oscillator
    };
}

export function startOscillator(oscillator) {
    oscillator.start();
}

export function stopOscillator(oscillator) {
    oscillator.stop();
}

