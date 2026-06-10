# GitHub Analyzer 📊 
> チーム開発の進捗を可視化するマネジメントダッシュボード ＋ GitHub探索ツール

GitHub Analyzerは、複数エンジニアの活動状況をグループ化して一画面で分析できる、チーム開発向けのマネジメントツールです。
同時に、ログイン不要で世界中のエンジニアの公開アクティビティを瞬時に解析できる「探索エンジン」としての側面も合わせ持っています。

---

## 🚀 主な機能

### 1. 👥 プライベート・チーム管理（要GitHubログイン）
- **GitHub OAuth認証**: わずか1クリックで安全にログイン可能。
- **データプライバシーの完全保護**: 各ユーザーが作成したグループやメンバー情報は、データベース（SQLite）のユーザーID（`owner_id`）に紐づき、他のユーザーからは一切見えないように独立して管理されます。
- **チーム統計サマリー**:
  - グループ全体の今月の総コミット数の自動集計
  - 所属メンバー全員分の「今月のコミット数ランキング」
  - チーム全体のリポジトリデータをマージした「開発言語の比率」の可視化

### 2. 🔍 クイックユーザー探索（ゲストモード両立）
- ログインの有無に関わらず、検索窓に任意のGitHub IDを入力するだけで、そのエンジニアの今月の活動量や言語スタックをリアルタイムに解析表示します（OSS開発者や大学の先輩などの分析が可能）。

---

## 🛠️ 技術スタック

本プロジェクトは、最先端のサーバーサイドレンダリング（SSR）技術と型安全性を重視したモダンな構成を採用しています。

- **Framework**: Next.js (App Router / Turbopack 採用)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (`better-sqlite3`)
- **Authentication**: GitHub OAuth (Cookieによるセッション維持)
- **API**: GitHub REST API

---

## 💡 技術的なこだわり・アーキテクチャ

### 🏎️ 高速な並列データフェッチとサーバーサイド集計
メンバー全員の「プロフィール」「リポジトリ」「アクティビティイベント」という大量のGitHub APIリクエストを、`Promise.all` を用いて非同期で並列処理しています。さらに、データの取得からランキングのソート、言語割合の計算までをすべて **Next.jsのServer Components（サーバー側）** で完結させてからブラウザにHTMLを返しているため、クライアント側の負荷が非常に低く、高速な画面表示を実現しています。

### 🔒 堅牢なリレーショナルデータ構造
データベースは、`users`（ユーザー）、`groups`（グループ）、`group_members`（所属メンバー）の3つのテーブルを外部キーで結合。カスケード削除（`ON DELETE CASCADE`）や複合ユニーク制約を適切に設定し、データの不整合や他人のグループの漏洩を完全に防ぐセキュリティ設計にしています。

---

## 📦 フォルダ構造

Next.js (App Router) のベストプラクティスに基づき、責務ごとにコンポーネントを綺麗に分割して保守性を高めています。

```text
src/
├── app/
│   ├── page.tsx               # メイン画面（ログイン状態を判別する司令塔）
│   ├── api/auth/              # GitHub OAuth認証用API（Login / Callback / Logout）
│   └── _components/           # 役割ごとにカプセル化されたコンポーネント群
│       ├── GuestView.tsx      # ゲストモード（探索エンジン）のUI
│       ├── DashboardView.tsx  # ログインモード（チーム管理）のUIベース
│       ├── GroupSidebar.tsx   # プライベートグループ管理（追加/削除）
│       ├── GroupStats.tsx     # 統計情報サマリー（総コミット/ランキング/言語割合）
│       └── MemberList.tsx     # メンバー一覧および個別詳細リンク
└── db.ts                      # SQLiteデータベースの初期化・接続設定（プロジェクトルート）


🏃‍♂️ ローカルでの起動方法
1. リポジトリのクローン
Bash
git clone <あなたのリポジトリURL>
cd devgrowth

2. 依存関係のインストール
Bash
npm install

3. 環境変数の設定
ルートディレクトリに .env.local ファイルを作成し、以下の項目を設定してください。
（GitHub OAuth Appは、GitHubの Settings -> Developer settings -> OAuth Apps から作成できます。）

コード スニペット
GITHUB_TOKEN=あなたのGitHub個人アクセストークン
GITHUB_CLIENT_ID=あなたのOAuth AppのClient ID
GITHUB_CLIENT_SECRET=あなたのOAuth AppのClient Secret

4. 開発サーバーの起動
Bash
npm run dev
http://localhost:3000 にアクセスして動作を確認してください。