import Phaser from 'phaser';

export default class GameClearedScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameClearedScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
  }

  create() {
    // 背景
    this.add.image(160, 90, 'background');

    // ゲームクリアテキスト
    const clearText = this.add.text(160, 40, 'GAME CLEARED!', {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3
    });
    clearText.setOrigin(0.5);

    // 祝福メッセージ
    const congratsText = this.add.text(160, 70, 'You defeated the boss!', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    congratsText.setOrigin(0.5);

    // スコア表示
    const scoreText = this.add.text(160, 100, `FINAL SCORE: ${this.finalScore}`, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffff00'
    });
    scoreText.setOrigin(0.5);

    // ハイスコア表示
    const highScore = localStorage.getItem('retroRushHighScore') || 0;
    let highScoreText;
    if (this.finalScore > highScore) {
      localStorage.setItem('retroRushHighScore', this.finalScore);
      highScoreText = this.add.text(160, 125, `NEW HIGH SCORE!`, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#ff00ff'
      });
    } else {
      highScoreText = this.add.text(160, 125, `HIGH SCORE: ${highScore}`, {
        fontSize: '14px',
        fontFamily: 'monospace',
        color: '#ffffff'
      });
    }
    highScoreText.setOrigin(0.5);

    // プレイアゲインボタン
    const playAgainText = this.add.text(160, 155, 'TAP TO PLAY AGAIN', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#00ff00'
    });
    playAgainText.setOrigin(0.5);

    // 点滅アニメーション
    this.tweens.add({
      targets: playAgainText,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: -1
    });

    // メニューに戻るボタン
    const menuText = this.add.text(160, 175, 'PRESS M FOR MENU', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    });
    menuText.setOrigin(0.5);

    // 入力処理
    this.input.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // キーボード入力
    this.input.keyboard.on('keydown-M', () => {
      this.scene.start('MenuScene');
    });
  }
}