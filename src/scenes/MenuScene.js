import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
    console.log('MenuScene constructor called');
  }

  create() {
    console.log('MenuScene create started');
    
    // 背景
    this.add.image(160, 90, 'background');
    console.log('Background added');

    // タイトル
    const titleText = this.add.text(160, 60, 'RETRO★RUSH', {
      fontSize: '24px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    titleText.setOrigin(0.5);

    // サブタイトル
    const subtitleText = this.add.text(160, 85, 'Pixel Survivors', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    });
    subtitleText.setOrigin(0.5);

    // スタートボタン
    const startText = this.add.text(160, 120, 'TAP TO START', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffff00'
    });
    startText.setOrigin(0.5);

    // 点滅アニメーション
    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: -1
    });

    // ハイスコア表示
    const highScore = localStorage.getItem('retroRushHighScore') || 0;
    const highScoreText = this.add.text(160, 150, `HIGH SCORE: ${highScore}`, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    highScoreText.setOrigin(0.5);

    // サウンドボタン（ミュート切り替え）
    const soundButton = this.add.text(10, 10, 'SOUND: ON', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 5, y: 2 }
    });
    soundButton.setInteractive();
    
    // サウンドボタンのクリック処理
    soundButton.on('pointerdown', () => {
      const isMuted = this.sound.mute;
      this.sound.mute = !isMuted;
      soundButton.setText(isMuted ? 'SOUND: ON' : 'SOUND: OFF');
    });
    
    // メイン画面クリックでゲーム開始
    this.input.on('pointerdown', (pointer) => {
      // サウンドボタンの範囲外をクリックした場合のみゲーム開始
      if (pointer.x > 100 || pointer.y > 30) {
        this.scene.start('GameScene');
      }
    });
  }
}