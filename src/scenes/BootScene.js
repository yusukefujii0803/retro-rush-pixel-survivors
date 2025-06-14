import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
    console.log('BootScene constructor called');
  }

  preload() {
    console.log('BootScene preload started');
    // プレースホルダー画像を作成
    this.createPlaceholderAssets();
    console.log('BootScene preload completed');
  }

  create() {
    console.log('BootScene create started');
    // メニューシーンへ遷移
    this.scene.start('MenuScene');
    console.log('Starting MenuScene');
  }

  createPlaceholderAssets() {
    console.log('Creating modern visual assets');
    
    // モダンなプレイヤースプライト
    this.createPlayerTexture();
    
    // 複数の敵タイプ
    this.createEnemyTextures();
    
    // モダンな弾スプライト
    this.createBulletTexture();
    
    // 地面とエフェクト
    this.createEnvironmentTextures();
    
    console.log('Modern visual assets created');
  }

  createRectTexture(key, width, height, color) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  // 人型プレイヤーテクスチャ
  createPlayerTexture() {
    const graphics = this.add.graphics();
    const size = 32;
    
    // 頭部（肌色）
    graphics.fillStyle(0xffdbac);
    graphics.fillCircle(16, 8, 6);
    
    // 髪（茶色）
    graphics.fillStyle(0x8b4513);
    graphics.fillEllipse(16, 6, 10, 6);
    
    // 目
    graphics.fillStyle(0x000000);
    graphics.fillCircle(14, 7, 1);
    graphics.fillCircle(18, 7, 1);
    
    // 体（青いシャツ）
    graphics.fillGradientStyle(0x4169e1, 0x1e90ff, 0x0066cc, 0x003d7a);
    graphics.fillRoundedRect(10, 14, 12, 14, 2);
    
    // 腕（肌色）
    graphics.fillStyle(0xffdbac);
    graphics.fillEllipse(8, 18, 3, 8);
    graphics.fillEllipse(24, 18, 3, 8);
    
    // 足（茶色のズボン）
    graphics.fillStyle(0x654321);
    graphics.fillRoundedRect(12, 28, 3, 8, 1);
    graphics.fillRoundedRect(17, 28, 3, 8, 1);
    
    // 靴（黒）
    graphics.fillStyle(0x000000);
    graphics.fillEllipse(13, 32, 4, 2);
    graphics.fillEllipse(18, 32, 4, 2);
    
    // 手（肌色）
    graphics.fillStyle(0xffdbac);
    graphics.fillCircle(7, 20, 2);
    graphics.fillCircle(25, 20, 2);
    
    graphics.generateTexture('player', size, size);
    graphics.destroy();
  }

  // 複数の敵テクスチャ
  createEnemyTextures() {
    // 基本お化け（白）
    this.createGhostTexture('enemy_basic', 0xffffff, 0xdddddd, 24);
    
    // 強いお化け（赤）
    this.createGhostTexture('enemy_strong', 0xff4444, 0xcc2222, 28);
    
    // 高速お化け（青）
    this.createGhostTexture('enemy_fast', 0x4444ff, 0x2222cc, 20);
    
    // ボス
    this.createBossTexture();
  }

  // お化けテクスチャ作成
  createGhostTexture(key, primaryColor, secondaryColor, size) {
    const graphics = this.add.graphics();
    const centerX = size / 2;
    const centerY = size / 2;
    
    // お化けの本体（上部は丸、下部は波状）
    graphics.fillGradientStyle(primaryColor, secondaryColor, primaryColor, secondaryColor);
    
    // 上部の丸い部分
    graphics.fillCircle(centerX, centerY - 2, size * 0.35);
    
    // 下部の波状部分
    graphics.beginPath();
    graphics.moveTo(centerX - size * 0.35, centerY + 2);
    
    // 波状の底部を描画
    for (let i = 0; i <= 6; i++) {
      const x = centerX - size * 0.35 + (i * size * 0.7 / 6);
      const y = centerY + 6 + (i % 2 === 0 ? 0 : 4);
      graphics.lineTo(x, y);
    }
    
    graphics.lineTo(centerX + size * 0.35, centerY + 2);
    graphics.arc(centerX, centerY - 2, size * 0.35, 0, Math.PI, true);
    graphics.closePath();
    graphics.fillPath();
    
    // 目（怖い赤い目）
    graphics.fillStyle(0xff0000);
    graphics.fillCircle(centerX - 4, centerY - 4, 2);
    graphics.fillCircle(centerX + 4, centerY - 4, 2);
    
    // 目の光
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(centerX - 3, centerY - 5, 1);
    graphics.fillCircle(centerX + 5, centerY - 5, 1);
    
    // 口（暗い穴）
    graphics.fillStyle(0x000000);
    graphics.fillEllipse(centerX, centerY + 2, 4, 6);
    
    // オーラ効果
    graphics.lineStyle(1, primaryColor, 0.3);
    graphics.strokeCircle(centerX, centerY, size * 0.45);
    
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  createEnemyTexture(key, primaryColor, secondaryColor, size) {
    const graphics = this.add.graphics();
    
    // メインボディ（六角形）
    graphics.fillGradientStyle(primaryColor, secondaryColor, primaryColor, secondaryColor);
    graphics.beginPath();
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();
    
    // コア（中央の光る部分）
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(centerX, centerY, radius * 0.3);
    
    // エネルギーリング
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(centerX, centerY, radius * 0.6);
    
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  // モダンな弾テクスチャ
  createBulletTexture() {
    const graphics = this.add.graphics();
    const size = 12;
    
    // エネルギーコア
    graphics.fillGradientStyle(0x00ffff, 0x0088ff, 0x0044ff, 0x002288);
    graphics.fillCircle(6, 6, 4);
    
    // 外側のオーラ
    graphics.fillStyle(0x88ddff, 0.3);
    graphics.fillCircle(6, 6, 5);
    
    // 軌跡効果
    graphics.fillGradientStyle(0x00ffff, 0x00ffff, 0x0088ff, 0x004499, 0.8);
    graphics.fillEllipse(6, 6, 8, 4);
    
    graphics.generateTexture('bullet', size, size);
    graphics.destroy();
  }

  // 環境テクスチャ
  createEnvironmentTextures() {
    // 地面
    const groundGraphics = this.add.graphics();
    groundGraphics.fillGradientStyle(0x2d5a2d, 0x1a4a1a, 0x0d3d0d, 0x002200);
    groundGraphics.fillRect(0, 0, 320, 20);
    
    // 地面の詳細
    groundGraphics.fillStyle(0x44aa44);
    for (let i = 0; i < 320; i += 8) {
      groundGraphics.fillRect(i, 0, 2, 3);
    }
    
    groundGraphics.generateTexture('ground', 320, 20);
    groundGraphics.destroy();
    
    // 背景（グラデーション空）
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x001133, 0x002244, 0x003355, 0x004466);
    bgGraphics.fillRect(0, 0, 320, 180);
    
    // 星
    bgGraphics.fillStyle(0xffffff);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 320;
      const y = Math.random() * 120;
      const size = Math.random() * 2;
      bgGraphics.fillCircle(x, y, size);
    }
    
    bgGraphics.generateTexture('background', 320, 180);
    bgGraphics.destroy();
  }

  // ボステクスチャ
  createBossTexture() {
    const graphics = this.add.graphics();
    const size = 64;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // メインボディ（大きな八角形）
    graphics.fillGradientStyle(0x990000, 0x660000, 0x330000, 0x110000);
    graphics.beginPath();
    const radius = size * 0.45;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();
    
    // 内側のコア
    graphics.fillGradientStyle(0xff0000, 0xff4444, 0xff0000, 0xcc0000);
    graphics.fillCircle(centerX, centerY, radius * 0.6);
    
    // 中央のエネルギーコア
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(centerX, centerY, radius * 0.3);
    
    // 外側のエネルギーリング
    graphics.lineStyle(3, 0xff6666, 0.8);
    graphics.strokeCircle(centerX, centerY, radius * 0.8);
    
    // 内側のエネルギーリング
    graphics.lineStyle(2, 0xffaaaa, 0.6);
    graphics.strokeCircle(centerX, centerY, radius * 0.5);
    
    // 攻撃用の突起
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const startX = centerX + Math.cos(angle) * radius * 0.7;
      const startY = centerY + Math.sin(angle) * radius * 0.7;
      const endX = centerX + Math.cos(angle) * radius * 1.1;
      const endY = centerY + Math.sin(angle) * radius * 1.1;
      
      graphics.fillStyle(0xff8888);
      graphics.fillTriangle(
        startX, startY,
        endX, endY,
        startX + Math.cos(angle + Math.PI/2) * 3, startY + Math.sin(angle + Math.PI/2) * 3
      );
    }
    
    graphics.generateTexture('boss', size, size);
    graphics.destroy();
    
    // ボスの攻撃弾テクスチャ
    const projGraphics = this.add.graphics();
    projGraphics.fillGradientStyle(0xff0000, 0xff4444, 0xaa0000, 0x660000);
    projGraphics.fillCircle(4, 4, 3);
    projGraphics.fillStyle(0xffffff, 0.8);
    projGraphics.fillCircle(4, 4, 1);
    projGraphics.generateTexture('boss_projectile', 8, 8);
    projGraphics.destroy();
  }
}