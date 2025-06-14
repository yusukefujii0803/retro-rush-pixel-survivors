import Phaser from 'phaser';
import { phaserConfig } from './config/phaser.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import GameClearedScene from './scenes/GameClearedScene.js';

console.log('Main.js loaded');
console.log('Phaser version:', Phaser.VERSION);

// シーンを設定に追加
phaserConfig.scene = [BootScene, MenuScene, GameScene, GameOverScene, GameClearedScene];

console.log('Game config:', phaserConfig);

// ゲームを開始
try {
  const game = new Phaser.Game(phaserConfig);
  console.log('Game instance created successfully');
  
  // デバッグ用
  window.game = game;
  window.Phaser = Phaser;
} catch (error) {
  console.error('Error creating game:', error);
}