import Phaser from 'phaser';
import Player from '../sprites/Player.js';
import Enemy from '../sprites/Enemy.js';
import { GAME_CONFIG, GAMEPLAY_CONFIG, ENEMY_CONFIG } from '../config/constants.js';
import AudioManager from '../systems/AudioManager.js';
import { soundGenerator } from '../utils/soundGenerator.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }
  
  init() {
    // シーン開始時に状態を初期化
    this.score = 0;
    this.gameTime = GAMEPLAY_CONFIG.GAME_TIME;
    this.isGameOver = false;
    this.enemies = [];
    this.bullets = [];
    this.enemySpawnTimer = null;
    this.enemiesKilled = 0; // 撃破数カウント
    this.bossActive = false; // ボス戦フラグ
    this.boss = null; // ボスオブジェクト
    this.projectiles = []; // 敵の攻撃弾
    this.isGameCleared = false; // ゲームクリアフラグ
  }

  create() {
    // オーディオマネージャー初期化
    this.audioManager = new AudioManager(this);
    this.soundGenerator = soundGenerator;
    
    // 背景
    this.add.image(160, 90, 'background');

    // 地面
    this.ground = this.physics.add.staticImage(160, 170, 'ground');

    // プレイヤー
    this.player = new Player(this, 50, 100);
    this.physics.add.collider(this.player, this.ground);

    // 敵と弾の配列は既にinit()で初期化済み

    // 物理エンジンの衝突判定は一時的に無効化
    // this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    // this.physics.add.overlap(this.player, this.enemies, this.hitPlayer, null, this);

    // UI
    this.createUI();

    // タイマー
    this.setupTimers();

    // 入力
    this.setupInput();
    
    // BGMを開始
    this.soundGenerator.startBGM();
    
  }

  createUI() {
    // スコア表示
    this.scoreText = this.add.text(10, 10, `SCORE: ${this.score}`, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });

    // タイマー表示
    this.timerText = this.add.text(160, 10, `TIME: ${this.gameTime}`, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    this.timerText.setOrigin(0.5, 0);

    // 体力表示
    this.healthText = this.add.text(310, 10, `HP: ${this.player.health}`, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    this.healthText.setOrigin(1, 0);

    // 撃破数表示
    this.killCountText = this.add.text(10, 30, `KILLS: ${this.enemiesKilled}/${GAMEPLAY_CONFIG.ENEMIES_TO_BOSS}`, {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffff00'
    });

    // 操作説明
    this.add.text(10, 160, 'CLICK: Jump (dodge explosions!) | SPACE: Shoot', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#aaaaaa'
    });
  }

  setupTimers() {
    
    // ゲームタイマー
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 敵生成タイマー
    this.enemySpawnTimer = this.time.addEvent({
      delay: ENEMY_CONFIG.SPAWN_INTERVAL,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // スコアタイマー
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isGameOver) {
          this.score += GAMEPLAY_CONFIG.SCORE_PER_SECOND;
          this.updateScore();
        }
      },
      callbackScope: this,
      loop: true
    });
    
  }

  setupInput() {
    // タップ/クリックでジャンプ
    this.input.on('pointerdown', () => {
      if (!this.isGameOver) {
        this.player.jump();
      }
    });

    // キーボード入力
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // スペースキーで射撃
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 右クリックでも射撃
    this.input.on('pointerdown', (pointer) => {
      if (!this.isGameOver && pointer.rightButtonDown()) {
        this.player.tryShoot();
      }
    });
  }

  update() {
    if (this.isGameOver) return;

    // プレイヤー更新
    this.player.update();

    // 敵の更新と画面外判定（配列用）
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (enemy && enemy.active) {
        const oldX = enemy.x;
        
        // 移動処理
        if (enemy.moveSpeed) {
          enemy.x += enemy.moveSpeed;
        } else {
          enemy.x -= 1;
        }

        // 空中敵の特別な移動パターン
        if (enemy.altitude === 'air') {
          enemy.wavePhase += 0.05;
          enemy.y = enemy.initialY + Math.sin(enemy.wavePhase) * 15;
        }
        
        // 体力バーの位置を更新
        if (enemy.healthBar && enemy.healthBarBg) {
          enemy.healthBarBg.x = enemy.x;
          enemy.healthBarBg.y = enemy.y - 20;
          enemy.healthBar.x = enemy.x;
          enemy.healthBar.y = enemy.y - 20;
        }
        
        
        // 画面外判定
        if (enemy.x < -100) {
          // 体力バーも削除
          if (enemy.healthBar) {
            enemy.healthBar.destroy();
          }
          if (enemy.healthBarBg) {
            enemy.healthBarBg.destroy();
          }
          
          enemy.destroy();
          this.enemies.splice(i, 1); // 配列から削除
        }
      } else if (enemy) {
        this.enemies.splice(i, 1); // 配列から削除
      }
    }

    // 弾の更新と画面外判定（配列用）
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      if (bullet && bullet.active) {
        // 弾を右方向に移動
        bullet.x += bullet.moveSpeed;
        
        // トレイルエフェクト
        this.updateBulletTrail(bullet);
        
        // 画面外判定
        if (bullet.x > GAME_CONFIG.WIDTH + 50) {
          // トレイルも削除
          this.clearBulletTrail(bullet);
          bullet.destroy();
          this.bullets.splice(i, 1); // 配列から削除
        }
      } else if (bullet) {
        this.bullets.splice(i, 1); // 配列から削除
      }
    }

    // ボスの更新
    if (this.bossActive && this.boss) {
      this.updateBoss();
    }

    // 敵の攻撃弾の更新
    this.updateProjectiles();
    
    // 手動衝突判定
    this.checkCollisions();
    
    // スペースキーで射撃
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.tryShoot();
    }

  }

  spawnEnemy() {
    // ボス戦中は通常敵を生成しない
    if (!this.isGameOver && !this.bossActive && this.enemies.length < ENEMY_CONFIG.MAX_ENEMIES) {
      // ランダムに敵タイプを選択
      const types = Object.keys(ENEMY_CONFIG.TYPES);
      const randomType = types[Math.floor(Math.random() * types.length)];
      const enemyData = ENEMY_CONFIG.TYPES[randomType];
      
      // 画面右端から敵を生成
      const x = GAME_CONFIG.WIDTH + 20; // 画面右端の外側
      const y = enemyData.altitude === 'air' ? 60 + Math.random() * 40 : 150; // 空中または地面上
        
      // 物理エンジンを使わずにシンプルなスプライトとして作成
      const enemy = this.add.sprite(x, y, enemyData.texture);
        
      // 敵にカスタムプロパティを追加
      enemy.moveSpeed = -(enemyData.speed / 60); // 60FPSでのピクセル/フレームに変換
      enemy.maxHealth = enemyData.health;
      enemy.currentHealth = enemyData.health;
      enemy.scoreValue = enemyData.score;
      enemy.enemyType = randomType;
      enemy.altitude = enemyData.altitude;
      enemy.destroyReason = null;
      enemy.isEnemy = true; // 敵であることを示すフラグ
      enemy.initialY = y; // 初期Y座標を記録
      enemy.wavePhase = Math.random() * Math.PI * 2; // 波移動用
      
      // 体力バーを作成
      this.createHealthBar(enemy);
        
      this.enemies.push(enemy);
    }
  }

  spawnBoss() {
    this.bossActive = true;
    this.updateKillCount();
    
    // 既存の敵をすべて削除
    this.enemies.forEach(enemy => {
      if (enemy.healthBar) enemy.healthBar.destroy();
      if (enemy.healthBarBg) enemy.healthBarBg.destroy();
      enemy.destroy();
    });
    this.enemies = [];
    
    // 敵生成タイマーを停止
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
      this.enemySpawnTimer = null;
    }
    
    // ボス生成
    const x = GAME_CONFIG.WIDTH + 50;
    const y = 80; // 空中に配置
    
    this.boss = this.add.sprite(x, y, 'boss');
    this.boss.maxHealth = GAMEPLAY_CONFIG.BOSS_HEALTH;
    this.boss.currentHealth = GAMEPLAY_CONFIG.BOSS_HEALTH;
    this.boss.moveSpeed = -0.5; // ゆっくり移動
    this.boss.lastShootTime = 0;
    this.boss.shootInterval = 1500; // 1.5秒間隔で攻撃
    this.boss.movementPhase = 0;
    this.boss.isMovingUp = true;
    this.boss.attackPattern = 0; // 攻撃パターン管理
    this.boss.lastGroundAttack = 0;
    this.boss.groundAttackInterval = 3000; // 3秒間隔で地面攻撃
    
    // ボス用の大きな体力バー
    this.createBossHealthBar();
    
    // ボス出現音
    this.soundGenerator.playGameOver(); // 一時的にゲームオーバー音を使用
  }

  hitEnemy(bullet, enemy) {
    // 弾を削除（トレイルも削除）
    this.clearBulletTrail(bullet);
    bullet.destroy();
    const bulletIndex = this.bullets.indexOf(bullet);
    if (bulletIndex > -1) {
      this.bullets.splice(bulletIndex, 1);
    }
    
    // 敵にダメージを与える
    enemy.currentHealth -= 1;
    this.updateHealthBar(enemy);
    
    // ダメージエフェクト
    this.createDamageEffect(enemy.x, enemy.y);
    
    if (enemy.currentHealth <= 0) {
      // 撃破エフェクトを作成
      this.createDestroyEffect(enemy.x, enemy.y);
      
      // 敵を削除
      enemy.destroyReason = 'bullet_hit';
      
      // 体力バーも削除
      if (enemy.healthBar) {
        enemy.healthBar.destroy();
      }
      if (enemy.healthBarBg) {
        enemy.healthBarBg.destroy();
      }
      
      enemy.destroy();
      const enemyIndex = this.enemies.indexOf(enemy);
      if (enemyIndex > -1) {
        this.enemies.splice(enemyIndex, 1);
      }
      
      this.score += enemy.scoreValue || GAMEPLAY_CONFIG.SCORE_PER_ENEMY;
      this.updateScore();
      
      // 撃破数をカウント
      this.enemiesKilled++;
      this.updateKillCount();
      
      // ボス出現チェック
      if (this.enemiesKilled >= GAMEPLAY_CONFIG.ENEMIES_TO_BOSS && !this.bossActive) {
        this.spawnBoss();
      }
      
      // 敵撃破音を再生
      this.soundGenerator.playHit();
    } else {
      // ダメージ音を再生（撃破ではない場合）
      this.soundGenerator.playDamage();
    }
  }

  hitPlayer(player, enemy) {
    if (player.takeDamage()) {
      enemy.destroyReason = 'player_hit';
      enemy.destroy();
      
      // 配列からも削除
      const index = this.enemies.indexOf(enemy);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }
      
      this.updateHealth();
      
      // ダメージ音を再生
      this.soundGenerator.playDamage();
      
      if (player.health <= 0) {
        this.gameOver();
      }
    }
  }

  updateTimer() {
    if (!this.isGameOver) {
      this.gameTime--;
      this.timerText.setText(`TIME: ${this.gameTime}`);
      
      if (this.gameTime <= 0) {
        this.gameOver();
      }
    }
  }

  updateScore() {
    this.scoreText.setText(`SCORE: ${this.score}`);
  }

  updateKillCount() {
    if (this.bossActive) {
      this.killCountText.setText(`BOSS BATTLE!`);
      this.killCountText.setColor('#ff0000');
    } else {
      this.killCountText.setText(`KILLS: ${this.enemiesKilled}/${GAMEPLAY_CONFIG.ENEMIES_TO_BOSS}`);
    }
  }

  updateHealth() {
    this.healthText.setText(`HP: ${this.player.health}`);
  }

  gameOver() {
    this.isGameOver = true;
    
    // BGMを停止
    this.soundGenerator.stopBGM();
    
    // ゲームオーバー音を再生
    this.soundGenerator.playGameOver();
    
    // すべてのタイマーを停止
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
      this.enemySpawnTimer = null;
    }
    
    // 全ての敵と弾をクリア
    this.enemies.forEach(enemy => {
      if (enemy && enemy.active) {
        enemy.destroy();
      }
    });
    this.enemies = [];
    
    this.bullets.forEach(bullet => {
      if (bullet && bullet.active) {
        bullet.destroy();
      }
    });
    this.bullets = [];
    
    
    // ハイスコア更新
    const highScore = localStorage.getItem('retroRushHighScore') || 0;
    if (this.score > highScore) {
      localStorage.setItem('retroRushHighScore', this.score);
    }

    // ゲームオーバー画面へ
    this.scene.start('GameOverScene', { score: this.score });
  }

  createBullet(x, y) {
    if (!this.isGameOver) {
      // 物理エンジンを使わずにシンプルなスプライトとして作成
      const bullet = this.add.sprite(x, y, 'bullet');
      
      // 弾にカスタムプロパティを追加
      bullet.moveSpeed = 6; // 右方向への移動速度（少し高速化）
      bullet.isBullet = true; // 弾であることを示すフラグ
      bullet.trail = []; // トレイル用の配列
      
      this.bullets.push(bullet);
      
      // 発射エフェクト
      this.createMuzzleFlash(x, y);
    }
  }

  // 手動衝突判定（配列用）
  checkCollisions() {
    // 弾と敵の衝突判定
    this.bullets.forEach(bullet => {
      this.enemies.forEach(enemy => {
        if (bullet && enemy && this.checkOverlap(bullet, enemy)) {
          this.hitEnemy(bullet, enemy);
        }
      });
    });

    // 弾とボスの衝突判定
    if (this.bossActive && this.boss) {
      this.bullets.forEach(bullet => {
        if (bullet && this.checkOverlap(bullet, this.boss)) {
          this.hitBoss(bullet);
        }
      });
    }

    // プレイヤーと敵の衝突判定
    this.enemies.forEach(enemy => {
      if (enemy && this.checkOverlap(this.player, enemy)) {
        this.hitPlayer(this.player, enemy);
      }
    });

    // プレイヤーとボスの衝突判定
    if (this.bossActive && this.boss && this.checkOverlap(this.player, this.boss)) {
      this.hitPlayerByBoss();
    }

    // プレイヤーと敵の攻撃弾の衝突判定
    this.projectiles.forEach(projectile => {
      if (projectile && this.checkOverlap(this.player, projectile)) {
        this.hitPlayerByProjectile(projectile);
      }
    });
  }

  // 2つのオブジェクトの重なりをチェック
  checkOverlap(obj1, obj2) {
    const distance = Phaser.Math.Distance.Between(obj1.x, obj1.y, obj2.x, obj2.y);
    return distance < 20; // 20ピクセル以内で衝突とみなす
  }

  // 撃破エフェクトを作成
  createDestroyEffect(x, y) {
    // パーティクル風エフェクト
    for (let i = 0; i < 8; i++) {
      const particle = this.add.rectangle(x, y, 2, 2, 0xff0000);
      
      // ランダムな方向に飛ばす
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 50 + Math.random() * 30;
      const velX = Math.cos(angle) * speed;
      const velY = Math.sin(angle) * speed;
      
      // アニメーション
      this.tweens.add({
        targets: particle,
        x: x + velX,
        y: y + velY,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 中央の爆発エフェクト
    const explosion = this.add.circle(x, y, 3, 0xffff00);
    this.tweens.add({
      targets: explosion,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        explosion.destroy();
      }
    });
  }

  // 体力バーを作成
  createHealthBar(enemy) {
    const barWidth = 20;
    const barHeight = 3;
    
    // 背景
    enemy.healthBarBg = this.add.rectangle(enemy.x, enemy.y - 20, barWidth, barHeight, 0x333333);
    
    // 体力バー
    enemy.healthBar = this.add.rectangle(enemy.x, enemy.y - 20, barWidth, barHeight, 0x00ff00);
  }

  // 体力バーを更新
  updateHealthBar(enemy) {
    if (enemy.healthBar && enemy.healthBarBg) {
      const healthRatio = enemy.currentHealth / enemy.maxHealth;
      const barWidth = 20 * healthRatio;
      
      // 体力に応じて色を変更
      let color = 0x00ff00; // 緑
      if (healthRatio < 0.5) {
        color = 0xffff00; // 黄色
      }
      if (healthRatio < 0.25) {
        color = 0xff0000; // 赤
      }
      
      enemy.healthBar.setSize(barWidth, 3);
      enemy.healthBar.setFillStyle(color);
    }
  }

  // ダメージエフェクトを作成
  createDamageEffect(x, y) {
    // 小さな黄色いパーティクル
    for (let i = 0; i < 4; i++) {
      const particle = this.add.rectangle(x, y, 1, 1, 0xffff00);
      
      // ランダムな方向に飛ばす
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 15;
      const velX = Math.cos(angle) * speed;
      const velY = Math.sin(angle) * speed;
      
      // アニメーション
      this.tweens.add({
        targets: particle,
        x: x + velX,
        y: y + velY,
        alpha: 0,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }
  }

  // 弾のトレイルエフェクト
  updateBulletTrail(bullet) {
    // トレイルポイントを追加
    bullet.trail.push({ x: bullet.x, y: bullet.y, alpha: 1.0 });
    
    // トレイルの長さを制限
    if (bullet.trail.length > 5) {
      bullet.trail.shift();
    }
    
    // トレイルを描画
    bullet.trail.forEach((point, index) => {
      const alpha = (index + 1) / bullet.trail.length * 0.6;
      const size = (index + 1) / bullet.trail.length * 6;
      
      const trailParticle = this.add.circle(point.x, point.y, size, 0x00aaff, alpha);
      
      // 短時間で消去
      this.time.delayedCall(50, () => {
        if (trailParticle && trailParticle.active) {
          trailParticle.destroy();
        }
      });
    });
  }

  // 弾のトレイルをクリア
  clearBulletTrail(bullet) {
    if (bullet.trail) {
      bullet.trail = [];
    }
  }

  // 発射エフェクト
  createMuzzleFlash(x, y) {
    // 発射フラッシュ
    const flash = this.add.circle(x, y, 8, 0xffffff, 0.8);
    
    this.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 100,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      }
    });

    // 発射火花
    for (let i = 0; i < 6; i++) {
      const spark = this.add.rectangle(x, y, 1, 1, 0xffaa00);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 15 + Math.random() * 10;
      const velX = Math.cos(angle) * speed;
      const velY = Math.sin(angle) * speed;
      
      this.tweens.add({
        targets: spark,
        x: x + velX,
        y: y + velY,
        alpha: 0,
        duration: 150,
        ease: 'Power2',
        onComplete: () => {
          spark.destroy();
        }
      });
    }
  }

  // ボスの更新処理
  updateBoss() {
    if (!this.boss || !this.boss.active) return;

    // ボスの移動（入場後は上下に移動）
    if (this.boss.x > 240) {
      // 入場中
      this.boss.x += this.boss.moveSpeed;
    } else {
      // 上下移動パターン
      this.boss.movementPhase += 0.02;
      this.boss.y = 80 + Math.sin(this.boss.movementPhase) * 30;
    }

    // ボスの攻撃
    const currentTime = this.time.now;
    if (currentTime - this.boss.lastShootTime > this.boss.shootInterval) {
      this.bossShoot();
      this.boss.lastShootTime = currentTime;
    }

    // 地面攻撃
    if (currentTime - this.boss.lastGroundAttack > this.boss.groundAttackInterval) {
      this.bossGroundAttack();
      this.boss.lastGroundAttack = currentTime;
    }

    // ボス体力バーの位置更新
    if (this.bossHealthBarBg && this.bossHealthBar) {
      this.bossHealthBarBg.x = GAME_CONFIG.WIDTH / 2;
      this.bossHealthBar.x = GAME_CONFIG.WIDTH / 2;
    }
  }

  // ボスの攻撃
  bossShoot() {
    if (!this.boss || !this.boss.active) return;

    // 攻撃パターンを順番に切り替え
    switch (this.boss.attackPattern) {
      case 0:
        this.bossSpreadShot();
        break;
      case 1:
        this.bossTargetedShot();
        break;
      case 2:
        this.bossBurstShot();
        break;
    }

    this.boss.attackPattern = (this.boss.attackPattern + 1) % 3;
    this.soundGenerator.playShoot();
  }

  // パターン1: 拡散攻撃
  bossSpreadShot() {
    const angles = [-0.6, -0.3, 0, 0.3, 0.6]; // 5方向
    
    angles.forEach(angle => {
      const projectile = this.add.sprite(this.boss.x, this.boss.y + 20, 'boss_projectile');
      projectile.velocityX = Math.sin(angle) * 2.5;
      projectile.velocityY = 3.5 + Math.cos(angle) * 1.5;
      this.projectiles.push(projectile);
    });
  }

  // パターン2: プレイヤー狙い撃ち
  bossTargetedShot() {
    const playerX = this.player.x;
    const playerY = this.player.y;
    const bossX = this.boss.x;
    const bossY = this.boss.y;
    
    // プレイヤーへの方向を計算
    const angle = Math.atan2(playerY - bossY, playerX - bossX);
    
    // 3発連続でプレイヤーを狙撃
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 200, () => {
        if (this.boss && this.boss.active) {
          const projectile = this.add.sprite(this.boss.x, this.boss.y + 20, 'boss_projectile');
          const spread = (i - 1) * 0.2; // 少し散らす
          projectile.velocityX = Math.cos(angle + spread) * 4;
          projectile.velocityY = Math.sin(angle + spread) * 4;
          this.projectiles.push(projectile);
        }
      });
    }
  }

  // パターン3: 円形弾幕
  bossBurstShot() {
    const numBullets = 8;
    
    for (let i = 0; i < numBullets; i++) {
      const angle = (i / numBullets) * Math.PI * 2;
      const projectile = this.add.sprite(this.boss.x, this.boss.y + 20, 'boss_projectile');
      projectile.velocityX = Math.cos(angle) * 2;
      projectile.velocityY = Math.sin(angle) * 2;
      this.projectiles.push(projectile);
    }
  }

  // 地面への着弾攻撃
  bossGroundAttack() {
    if (!this.boss || !this.boss.active) return;

    // 地面にランダムな位置で爆発攻撃
    for (let i = 0; i < 4; i++) {
      const x = 50 + Math.random() * (GAME_CONFIG.WIDTH - 100);
      
      // 警告表示
      const warning = this.add.rectangle(x, 155, 20, 10, 0xff0000, 0.5);
      warning.setStrokeStyle(2, 0xff0000);
      
      // 1秒後に爆発
      this.time.delayedCall(1000, () => {
        if (warning && warning.active) {
          warning.destroy();
          
          // 爆発エフェクト
          this.createGroundExplosion(x, 155);
          
          // プレイヤーが範囲内にいるかチェック
          if (Math.abs(this.player.x - x) < 25 && this.player.y > 130) {
            this.hitPlayerByGroundAttack();
          }
        }
      });
    }
  }

  // 敵の攻撃弾更新
  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      if (projectile && projectile.active) {
        projectile.x += projectile.velocityX;
        projectile.y += projectile.velocityY;
        
        // 画面外判定
        if (projectile.y > GAME_CONFIG.HEIGHT + 20 || projectile.x < -20 || projectile.x > GAME_CONFIG.WIDTH + 20) {
          projectile.destroy();
          this.projectiles.splice(i, 1);
        }
      } else if (projectile) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // ボスにダメージ
  hitBoss(bullet) {
    this.clearBulletTrail(bullet);
    bullet.destroy();
    const bulletIndex = this.bullets.indexOf(bullet);
    if (bulletIndex > -1) {
      this.bullets.splice(bulletIndex, 1);
    }

    this.boss.currentHealth -= 1;
    this.updateBossHealthBar();
    this.createDamageEffect(this.boss.x, this.boss.y);

    if (this.boss.currentHealth <= 0) {
      this.defeatBoss();
    } else {
      this.soundGenerator.playDamage();
    }
  }

  // ボス撃破
  defeatBoss() {
    this.createDestroyEffect(this.boss.x, this.boss.y);
    
    // ボス体力バーを削除
    if (this.bossHealthBar) this.bossHealthBar.destroy();
    if (this.bossHealthBarBg) this.bossHealthBarBg.destroy();
    
    this.boss.destroy();
    this.boss = null;
    this.bossActive = false;

    // 全ての攻撃弾を削除
    this.projectiles.forEach(projectile => projectile.destroy());
    this.projectiles = [];

    this.score += 100; // ボス撃破ボーナス
    this.updateScore();

    // ゲームクリア
    this.gameCleared();
  }

  // プレイヤーがボスに接触
  hitPlayerByBoss() {
    if (this.player.takeDamage()) {
      this.updateHealth();
      this.soundGenerator.playDamage();
      
      if (this.player.health <= 0) {
        this.gameOver();
      }
    }
  }

  // プレイヤーが攻撃弾に接触
  hitPlayerByProjectile(projectile) {
    projectile.destroy();
    const projIndex = this.projectiles.indexOf(projectile);
    if (projIndex > -1) {
      this.projectiles.splice(projIndex, 1);
    }

    if (this.player.takeDamage()) {
      this.updateHealth();
      this.soundGenerator.playDamage();
      
      if (this.player.health <= 0) {
        this.gameOver();
      }
    }
  }

  // ボス体力バー作成
  createBossHealthBar() {
    const barWidth = 200;
    const barHeight = 8;
    const x = GAME_CONFIG.WIDTH / 2;
    const y = 20;
    
    this.bossHealthBarBg = this.add.rectangle(x, y, barWidth, barHeight, 0x333333);
    this.bossHealthBar = this.add.rectangle(x, y, barWidth, barHeight, 0xff0000);
    
    // ボス名表示
    this.add.text(x, y - 15, 'BOSS', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ff0000'
    }).setOrigin(0.5);
  }

  // ボス体力バー更新
  updateBossHealthBar() {
    if (this.bossHealthBar && this.boss) {
      const healthRatio = this.boss.currentHealth / this.boss.maxHealth;
      const barWidth = 200 * healthRatio;
      
      this.bossHealthBar.setSize(barWidth, 8);
    }
  }

  // ゲームクリア
  gameCleared() {
    this.isGameCleared = true;
    this.isGameOver = true;
    
    // BGMを停止
    this.soundGenerator.stopBGM();
    
    // クリア音を再生
    this.soundGenerator.playHit();
    
    // ゲームクリア画面へ
    this.scene.start('GameClearedScene', { score: this.score });
  }

  // 地面爆発エフェクト
  createGroundExplosion(x, y) {
    // 大きな爆発エフェクト
    const explosion = this.add.circle(x, y, 15, 0xff8800, 0.8);
    
    this.tweens.add({
      targets: explosion,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        explosion.destroy();
      }
    });

    // 破片エフェクト
    for (let i = 0; i < 12; i++) {
      const particle = this.add.rectangle(x, y, 3, 3, 0xff4400);
      
      const angle = (Math.PI * 2 * i) / 12;
      const speed = 80 + Math.random() * 40;
      const velX = Math.cos(angle) * speed;
      const velY = Math.sin(angle) * speed;
      
      this.tweens.add({
        targets: particle,
        x: x + velX,
        y: y + velY,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        }
      });
    }

    // 爆発音
    this.soundGenerator.playHit();
  }

  // 地面攻撃によるダメージ
  hitPlayerByGroundAttack() {
    if (this.player.takeDamage()) {
      this.updateHealth();
      this.soundGenerator.playDamage();
      
      if (this.player.health <= 0) {
        this.gameOver();
      }
    }
  }
}