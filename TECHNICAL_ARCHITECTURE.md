# RETRO★RUSH 技術スタック＆アーキテクチャ仕様書

## 技術スタック一覧

### フロントエンド（MVP段階）
| 技術 | バージョン | 用途 |
|------|----------|------|
| Phaser 3 | 3.70+ | ゲームエンジン |
| Vite | 5.0+ | ビルドツール |
| JavaScript (ES6+) | - | 開発言語 |
| ESLint | 8.0+ | コード品質管理 |

### フロントエンド（拡張段階）
| 技術 | バージョン | 用途 |
|------|----------|------|
| TypeScript | 5.0+ | 型安全性向上 |
| React | 18.0+ | UI管理画面 |
| PWA | - | モバイル対応 |
| Capacitor | 5.0+ | ネイティブアプリ化 |

### バックエンド（フェーズ3以降）
| 技術 | バージョン | 用途 |
|------|----------|------|
| Node.js | 20 LTS | サーバーランタイム |
| Colyseus | 0.15+ | リアルタイム同期 |
| Express | 4.18+ | APIサーバー |
| PostgreSQL | 15+ | データベース |

### インフラ・ホスティング
| サービス | 用途 | 料金プラン |
|---------|------|-----------|
| Vercel | フロントエンドホスティング | Hobby (無料) |
| GitHub | ソースコード管理 | Free |
| Fly.io | バックエンドホスティング | Hobby ($0~) |
| Cloudflare | CDN | Free |

### 開発ツール
| ツール | 用途 |
|--------|------|
| VS Code | コードエディタ |
| Aseprite | ドット絵作成 |
| GitHub Copilot | AIコーディング支援 |
| Chrome DevTools | デバッグ・性能分析 |

## システムアーキテクチャ

### MVP段階アーキテクチャ
```
┌─────────────────┐
│   ブラウザ       │
│  (Chrome/Safari) │
└────────┬────────┘
         │
┌────────▼────────┐
│   Phaser 3      │
│  ゲームエンジン   │
├─────────────────┤
│   ゲームロジック  │
│  - Scene管理     │
│  - Sprite制御    │
│  - 物理演算      │
└────────┬────────┘
         │
┌────────▼────────┐
│  静的ホスティング │
│    (Vercel)     │
└─────────────────┘
```

### マルチプレイヤー対応アーキテクチャ（フェーズ3）
```
┌─────────────┐     ┌─────────────┐
│  Player 1   │     │  Player 2   │
└──────┬──────┘     └──────┬──────┘
       │ WebSocket         │
       └──────┬────────────┘
              │
    ┌─────────▼─────────┐
    │   Colyseus       │
    │  Game Server     │
    ├──────────────────┤
    │ - Room管理        │
    │ - State同期       │
    │ - 入力検証        │
    └──────────────────┘
              │
    ┌─────────▼─────────┐
    │   PostgreSQL     │
    │  - スコア保存     │
    │  - プレイヤー統計  │
    └──────────────────┘
```

## ディレクトリ構造詳細

```
RETRO★RUSH/
├── .github/
│   └── workflows/         # GitHub Actions設定
├── public/
│   └── index.html         # エントリーHTML
├── src/
│   ├── main.js           # アプリケーションエントリー
│   ├── config/
│   │   ├── game.js       # ゲーム設定
│   │   └── phaser.js     # Phaser設定
│   ├── scenes/
│   │   ├── BootScene.js  # 初期化シーン
│   │   ├── MenuScene.js  # メニュー画面
│   │   ├── GameScene.js  # ゲーム本編
│   │   └── GameOverScene.js
│   ├── sprites/
│   │   ├── Player.js     # プレイヤークラス
│   │   ├── Enemy.js      # 敵クラス
│   │   └── Bullet.js     # 弾クラス
│   ├── systems/
│   │   ├── ScoreManager.js
│   │   ├── AudioManager.js
│   │   └── InputManager.js
│   └── utils/
│       ├── constants.js  # 定数定義
│       └── helpers.js    # ヘルパー関数
├── assets/               # ゲームアセット
├── tests/                # テストコード
├── docs/                 # ドキュメント
├── package.json          
├── vite.config.js        # Vite設定
├── .eslintrc.js          # ESLint設定
└── vercel.json           # Vercel設定
```

## データフロー設計

### ゲーム状態管理
```javascript
// グローバル状態構造
GameState = {
  player: {
    health: 3,
    position: { x: 100, y: 200 },
    velocity: { x: 0, y: 0 },
    isJumping: false
  },
  enemies: [
    { id: 1, type: 'basic', position: { x: 400, y: 200 } }
  ],
  score: {
    current: 0,
    combo: 0,
    highScore: 0
  },
  gameTime: 60
}
```

### イベントシステム
```javascript
// イベント定義
Events = {
  PLAYER_JUMP: 'player:jump',
  PLAYER_HIT: 'player:hit',
  ENEMY_SPAWN: 'enemy:spawn',
  ENEMY_KILLED: 'enemy:killed',
  GAME_START: 'game:start',
  GAME_OVER: 'game:over'
}
```

## パフォーマンス設計

### レンダリング最適化
- スプライトバッチング使用
- カメラ外オブジェクトの非アクティブ化
- テクスチャアトラス使用

### メモリ管理
- シーン遷移時の明示的クリーンアップ
- オブジェクトプールパターン採用
- 不要なアセットの遅延解放

### ネットワーク最適化（フェーズ3）
- Delta圧縮による通信量削減
- 予測補間による遅延隠蔽
- 重要度による更新頻度調整

## セキュリティ設計

### クライアントサイド
- 入力検証（範囲チェック）
- 環境変数による設定管理
- XSS対策（innerHTML不使用）

### サーバーサイド（フェーズ3）
- レート制限実装
- 入力の二重検証
- SQLインジェクション対策

## 拡張性設計

### プラグインシステム
```javascript
// 武器プラグイン例
class WeaponPlugin {
  constructor(scene) {
    this.scene = scene;
  }
  
  register(weaponType, config) {
    // 武器タイプ登録
  }
}
```

### データドリブン設計
- ステージデータJSON化
- 敵パターンJSON化
- 武器パラメータJSON化

## モニタリング・分析

### 分析ツール
- Google Analytics 4（基本KPI）
- PostHog（詳細行動分析）
- Sentry（エラー監視）

### 主要KPI
- DAU/MAU
- 平均プレイ時間
- リテンション率
- エラー発生率

## 移行計画

### TypeScript移行（フェーズ2）
1. tsconfig.json設定
2. 段階的な.js → .ts変換
3. 型定義の追加
4. strictモード有効化

### マルチプレイヤー移行（フェーズ3）
1. Colyseusサーバー構築
2. WebSocket通信実装
3. 状態同期ロジック追加
4. 遅延補償実装