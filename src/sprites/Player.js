import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../config/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setCollideWorldBounds(true);
    this.setBounce(0);
    
    // プレイヤーの状態
    this.health = PLAYER_CONFIG.MAX_HEALTH;
    this.isInvincible = false;
    this.canJump = true;
    this.lastShootTime = 0;
    
    // 物理設定
    this.body.setSize(28, 30);
    this.body.setOffset(2, 2);
  }
  
  jump() {
    if (this.body.blocked.down && this.canJump) {
      this.setVelocityY(PLAYER_CONFIG.JUMP_VELOCITY);
      this.canJump = false;
      
      // ジャンプ音を再生
      if (this.scene.soundGenerator) {
        this.scene.soundGenerator.playJump();
      }
      
      // ジャンプ後のクールダウン
      this.scene.time.delayedCall(100, () => {
        this.canJump = true;
      });
    }
  }
  
  takeDamage() {
    if (this.isInvincible) return false;
    
    this.health--;
    this.isInvincible = true;
    
    // 点滅エフェクト
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 100,
      ease: 'Power2',
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.alpha = 1;
        this.isInvincible = false;
      }
    });
    
    return true;
  }
  
  update() {
    // 自動射撃は無効化 - 手動射撃のみ
  }
  
  // 手動射撃（クールダウン付き）
  tryShoot() {
    const currentTime = this.scene.time.now;
    if (currentTime - this.lastShootTime > PLAYER_CONFIG.SHOOT_INTERVAL) {
      this.shoot();
      this.lastShootTime = currentTime;
      return true;
    }
    return false;
  }
  
  shoot() {
    // 弾を発射
    this.scene.createBullet(this.x + 15, this.y);
    
    // 攻撃音を再生
    if (this.scene.soundGenerator) {
      this.scene.soundGenerator.playShoot();
    }
  }
}