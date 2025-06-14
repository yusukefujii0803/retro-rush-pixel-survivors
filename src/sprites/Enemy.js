import Phaser from 'phaser';
import { ENEMY_CONFIG } from '../config/constants.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy');
    
    console.log('Enemy constructor called at position:', x, y);
    console.log('Enemy texture exists:', scene.textures.exists('enemy'));
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // 物理設定
    this.body.setSize(20, 22);
    this.body.setOffset(2, 2);
    
    // 移動設定（即座に適用）
    console.log('Setting enemy velocity to:', -ENEMY_CONFIG.BASIC_SPEED);
    this.setVelocityX(-ENEMY_CONFIG.BASIC_SPEED);
    console.log('Enemy velocity set. Current velocity:', this.body.velocity.x);
    
    // ダメージ値
    this.damage = ENEMY_CONFIG.DAMAGE;
    
    console.log('Enemy created successfully.');
    console.log('Enemy final position:', this.x, this.y);
    console.log('Enemy visible:', this.visible);
    console.log('Enemy alpha:', this.alpha);
  }
  
  update() {
    // 画面外に出たら削除
    if (this.x < -50) {
      this.destroy();
    }
  }
}