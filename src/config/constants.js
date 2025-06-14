// ゲーム設定定数
export const GAME_CONFIG = {
  WIDTH: 320,
  HEIGHT: 180,
  SCALE: 3,
  GRAVITY: 980,
  FPS: 60
};

// プレイヤー設定
export const PLAYER_CONFIG = {
  MAX_HEALTH: 5,
  JUMP_VELOCITY: -400,
  MOVE_SPEED: 100,
  INVINCIBLE_TIME: 1000,
  SHOOT_INTERVAL: 300
};

// 敵設定
export const ENEMY_CONFIG = {
  BASIC_SPEED: 80,
  SPAWN_INTERVAL: 2000,
  DAMAGE: 1,
  MAX_ENEMIES: 4,
  TYPES: {
    BASIC: {
      health: 2,
      speed: 70,
      score: 15,
      texture: 'enemy_basic',
      altitude: 'ground'
    },
    STRONG: {
      health: 5,
      speed: 50,
      score: 35,
      texture: 'enemy_strong',
      altitude: 'ground'
    },
    FAST: {
      health: 1,
      speed: 100,
      score: 20,
      texture: 'enemy_fast',
      altitude: 'ground'
    },
    FLYING: {
      health: 2,
      speed: 80,
      score: 25,
      texture: 'enemy_basic',
      altitude: 'air'
    }
  }
};

// ゲームプレイ設定
export const GAMEPLAY_CONFIG = {
  GAME_TIME: 60,
  SCORE_PER_ENEMY: 10,
  SCORE_PER_SECOND: 1,
  ENEMIES_TO_BOSS: 15, // ボス出現に必要な撃破数
  BOSS_HEALTH: 20
};

// オーディオ設定
export const AUDIO_CONFIG = {
  MASTER_VOLUME: 0.7,
  BGM_VOLUME: 0.5,
  SFX_VOLUME: 0.8
};