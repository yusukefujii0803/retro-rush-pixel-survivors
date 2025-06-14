import { AUDIO_CONFIG } from '../config/constants.js';

export default class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.bgm = null;
    this.sounds = {};
    this.isMuted = false;
  }

  // BGMを再生
  playBGM(key, config = {}) {
    if (this.bgm) {
      this.bgm.stop();
    }

    this.bgm = this.scene.sound.add(key, {
      volume: AUDIO_CONFIG.BGM_VOLUME,
      loop: true,
      ...config
    });

    if (!this.isMuted) {
      this.bgm.play();
    }
  }

  // BGMを停止
  stopBGM() {
    if (this.bgm) {
      this.bgm.stop();
      this.bgm = null;
    }
  }

  // 効果音を再生
  playSFX(key, config = {}) {
    if (this.isMuted) return;

    const sound = this.scene.sound.add(key, {
      volume: AUDIO_CONFIG.SFX_VOLUME,
      ...config
    });

    sound.play();
    
    // 再生終了後に自動削除
    sound.once('complete', () => {
      sound.destroy();
    });
  }

  // 音声のミュート切り替え
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.scene.sound.mute = true;
    } else {
      this.scene.sound.mute = false;
    }

    return this.isMuted;
  }

  // ボリューム設定
  setMasterVolume(volume) {
    this.scene.sound.volume = volume;
  }

  // クリーンアップ
  destroy() {
    this.stopBGM();
    this.scene.sound.removeAll();
  }
}