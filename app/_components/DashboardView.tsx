import React from "react";
import GroupSidebar from "./GroupSidebar";
import GroupStats from "./GroupStats";
import MemberList from "./MemberList";

interface MemberStats {
  profile: {
    login: string;
    name: string;
    avatar_url: string;
    followers: number;
    public_repos: number;
  };
  monthlyCommits: number;
  languages: string[];
}

interface DashboardViewProps {
  groups: { [key: string]: string[] };
  currentGroup: string;
  validMemberStats: MemberStats[];
  groupTotalCommits: number;
  groupLanguageAnalysis: { language: string; percentage: number }[];
  createGroup: (formData: FormData) => Promise<void>;
  deleteGroup: (formData: FormData) => Promise<void>;
  addUser: (formData: FormData) => Promise<void>;
  deleteUser: (formData: FormData) => Promise<void>;
  // 💡 URLの検索パラメータを受け取るために追加
  searchParamsUser?: string; 
}

export default function DashboardView({
  groups,
  currentGroup,
  validMemberStats,
  groupTotalCommits,
  groupLanguageAnalysis,
  createGroup,
  deleteGroup,
  addUser,
  deleteUser,
  searchParamsUser, // 💡 追加
}: DashboardViewProps) {
  
  // 今見ているのが「グループデータ」か「クイック検索結果」かを判定
  const isSearchingUser = !!searchParamsUser;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* 左側：プライベートグループ管理（他の人からは見えない） */}
      <div className="space-y-6">
        <GroupSidebar
          groups={groups}
          currentGroup={isSearchingUser ? "" : currentGroup} // 検索中はグループの選択を外す
          createGroupAction={createGroup}
          deleteGroupAction={deleteGroup}
        />
      </div>
      
      {/* 右側：ダッシュボードメインエリア */}
      <div className="md:col-span-2 space-y-6">
        
        {/* 🔍 ログイン後でも使えるクイックユーザー検索バー */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
          <form method="GET" action="/" className="flex gap-2">
            {/* 現在のグループ状態を維持するための隠しフィールド */}
            {!isSearchingUser && <input type="hidden" name="group" value={currentGroup} />}
            
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                name="searchUser"
                defaultValue={searchParamsUser || ""}
                placeholder="他のGitHubユーザーをその場で分析... (例: torvalds)"
                className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            
            <button
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shrink-0"
            >
              ユーザー解析
            </button>

            {/* 検索中なら、グループ画面に戻るボタンを表示 */}
            {isSearchingUser && (
              <a
                href={`/?group=${encodeURIComponent(currentGroup || "未分類")}`}
                className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-xl text-xs transition-colors border shrink-0 flex items-center justify-center"
              >
                ❌ 閉じる
              </a>
            )}
          </form>
        </div>

        {/* 📊 統計情報の表示（グループデータ、または検索した個人のデータ） */}
        <GroupStats
          currentGroup={isSearchingUser ? `ユーザー検索: ${searchParamsUser}` : currentGroup}
          validMemberStats={validMemberStats}
          groupTotalCommits={groupTotalCommits}
          groupLanguageAnalysis={groupLanguageAnalysis}
        />

        {/* 👥 メンバー管理一覧（※ユーザー単体検索のときは不要なので非表示にする） */}
        {!isSearchingUser && (
          <MemberList
            currentGroup={currentGroup}
            validMemberStats={validMemberStats}
            addUserAction={addUser}
            deleteUserAction={deleteUser}
          />
        )}
      </div>
    </div>
  );
}