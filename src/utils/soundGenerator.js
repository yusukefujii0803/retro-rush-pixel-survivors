// 8ビット風サウンドジェネレーター

export class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.currentBGM = null;
    this.bgmGainNode = null;
    this.isBGMPlaying = false;
  }

  // AudioContextの初期化
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // 単純な矩形波を生成
  createSquareWave(frequency, duration, volume = 0.3) {
    this.init();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // ジャンプ音
  playJump() {
    this.init();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // 攻撃音
  playShoot() {
    this.init();
    
    // ホワイトノイズ風の音
    const bufferSize = this.audioContext.sampleRate * 0.05; // 0.05秒
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    
    source.start();
  }

  // 敵撃破音
  playHit() {
    this.init();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // ダメージ音
  playDamage() {
    this.init();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // ゲームオーバー音
  playGameOver() {
    this.init();
    
    // 下降する音階
    const notes = [440, 392, 349, 311, 277, 247, 220];
    let time = this.audioContext.currentTime;
    
    notes.forEach((freq, i) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, time);
      
      gainNode.gain.setValueAtTime(0.2, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      
      oscillator.start(time);
      oscillator.stop(time + 0.1);
      
      time += 0.08;
    });
  }

  // BGMを開始
  startBGM() {
    if (this.isBGMPlaying) {
      this.stopBGM();
    }

    this.init();
    this.isBGMPlaying = true;
    this.playBGMLoop();
  }

  // BGMを停止
  stopBGM() {
    if (this.currentBGM) {
      this.currentBGM.stop();
      this.currentBGM = null;
    }
    if (this.bgmGainNode) {
      this.bgmGainNode.disconnect();
      this.bgmGainNode = null;
    }
    this.isBGMPlaying = false;
  }

  // BGMループの実装
  playBGMLoop() {
    if (!this.isBGMPlaying) return;

    // シンプルな8ビット風メロディー（Cメジャー）
    const melody = [
      { freq: 523, duration: 0.3 }, // C5
      { freq: 659, duration: 0.3 }, // E5
      { freq: 784, duration: 0.3 }, // G5
      { freq: 659, duration: 0.3 }, // E5
      { freq: 523, duration: 0.3 }, // C5
      { freq: 587, duration: 0.3 }, // D5
      { freq: 659, duration: 0.6 }, // E5
      { freq: 587, duration: 0.3 }, // D5
      { freq: 523, duration: 0.3 }, // C5
      { freq: 440, duration: 0.3 }, // A4
      { freq: 523, duration: 0.6 }, // C5
    ];

    const bassline = [
      { freq: 131, duration: 1.2 }, // C3
      { freq: 147, duration: 1.2 }, // D3
      { freq: 165, duration: 1.2 }, // E3
      { freq: 131, duration: 1.5 }, // C3
    ];

    let currentTime = this.audioContext.currentTime;
    const totalDuration = 4.8; // 約5秒のループ

    // メロディー
    melody.forEach(note => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(note.freq, currentTime);

      gainNode.gain.setValueAtTime(0.1, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + note.duration);

      currentTime += note.duration;
    });

    // ベースライン
    currentTime = this.audioContext.currentTime;
    bassline.forEach(note => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(note.freq, currentTime);

      gainNode.gain.setValueAtTime(0.05, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + note.duration);

      currentTime += note.duration;
    });

    // 次のループをスケジュール
    setTimeout(() => {
      if (this.isBGMPlaying) {
        this.playBGMLoop();
      }
    }, totalDuration * 1000);
  }
}

// シングルトンインスタンス
export const soundGenerator = new SoundGenerator();