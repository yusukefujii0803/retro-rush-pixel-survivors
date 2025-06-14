import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    // 背景
    this.add.image(160, 90, 'background');

    // ゲームオーバーテキスト
    const gameOverText = this.add.text(160, 50, 'GAME OVER', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 3
    });
    gameOverText.setOrigin(0.5);

    // スコア表示
    const scoreText = this.add.text(160, 90, `SCORE: ${this.finalScore}`, {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    scoreText.setOrigin(0.5);

    // ハイスコア表示
    const highScore = localStorage.getItem('retroRushHighScore') || 0;
    const highScoreText = this.add.text(160, 115, `HIGH SCORE: ${highScore}`, {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffff00'
    });
    highScoreText.setOrigin(0.5);

    // リトライボタン
    const retryText = this.add.text(160, 150, 'TAP TO RETRY', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#00ff00'
    });
    retryText.setOrigin(0.5);

    // 点滅アニメーション
    this.tweens.add({
      targets: retryText,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: -1
    });

    // メニューに戻るボタン
    const menuText = this.add.text(160, 170, 'TAP HERE TO MENU', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    });
    menuText.setOrigin(0.5);

    // クリックでリトライ
    this.input.on('pointerdown', (pointer) => {
      // メニューボタンの範囲をクリックした場合はメニューへ
      if (pointer.y > 160) {
        this.scene.start('MenuScene');
      } else {
        // それ以外はリトライ
        this.scene.start('GameScene');
      }
    });
  }
}