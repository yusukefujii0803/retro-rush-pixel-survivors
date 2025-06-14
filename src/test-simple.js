import Phaser from 'phaser';

console.log('Test simple loaded');
console.log('Phaser:', Phaser);
console.log('Phaser VERSION:', Phaser.VERSION);

class SimpleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SimpleScene' });
    console.log('SimpleScene constructor');
  }

  create() {
    console.log('SimpleScene create');
    this.add.text(160, 90, 'Phaser Works!', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 180,
  backgroundColor: '#2d2d2d',
  parent: 'game-container',
  scene: [SimpleScene]
};

console.log('Creating game with config:', config);
const game = new Phaser.Game(config);
console.log('Game created:', game);