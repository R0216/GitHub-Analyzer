import React from "react";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import Image from "next/image";

interface Member {
  profile: {
    login: string;
    name: string;
    followers: number;
    public_repos: number;
    avatar_url: string;
  };
}

interface MemberListProps {
  currentGroup: string;
  validMemberStats: Member[];
  isGuest: boolean;
  addUserAction: (formData: FormData) => Promise<void>;
  deleteUserAction: (formData: FormData) => Promise<void>;
}

export default function MemberList({
  currentGroup,
  validMemberStats,
  addUserAction,
  deleteUserAction,
}: MemberListProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <form action={addUserAction} className="flex gap-2 p-4 bg-gray-100 rounded-2xl border border-gray-200 shadow-sm transition-colors duration-300 dark:bg-gray-900 dark:border-gray-800">
          <input type="hidden" name="targetGroup" value={currentGroup} />
          <input 
            type="text"
            name="username"
            placeholder={`${currentGroup === "未分類" ? "未分類" : currentGroup} に追加する GitHub ユーザー名`}
            required
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:border-gray-800 dark:text-white dark:focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow-sm dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            追加する
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-500 px-1 dark:text-gray-400">所属メンバー 一覧</h3>
        
        {validMemberStats.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-2xl bg-gray-100 text-gray-500 text-sm transition-colors duration-300 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400">
            このグループにはまだメンバーが登録されていません。
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {validMemberStats.map((member) => {
              const user = member.profile;
              return (
                <div 
                  key={user.login}
                  className="relative flex items-center justify-between p-4 bg-gray-100 border border-gray-200 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-200 group dark:bg-gray-950 dark:border-gray-800/60 dark:hover:border-blue-500"
                >
                  <Link
                    href={`/user/${user.login}`}
                    className="flex items-center space-x-4 flex-1 min-w-0 no-underline text-current cursor-pointer"
                  >
                    <Image
                      src={member.profile.avatar_url}
                      alt={member.profile.login}
                      width={40} 
                      height={40}
                      className="rounded-full border border-gray-200 dark:border-gray-800"
                      unoptimized
                    />
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-base font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
                        {user.name || user.login}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ID: <span className="font-mono font-bold text-gray-800 dark:text-gray-300">{user.login}</span>
                      </p>
                      <div className="flex space-x-2 text-xs text-gray-600 pt-1 dark:text-gray-400">
                        <span className="bg-white border border-gray-200/80 px-2 py-0.5 rounded-lg font-medium dark:bg-gray-900 dark:border-gray-800">👤 {user.followers} followers</span>
                        <span className="bg-white border border-gray-200/80 px-2 py-0.5 rounded-lg font-medium dark:bg-gray-900 dark:border-gray-800">📦 {user.public_repos} repos</span>
                      </div>
                    </div>
                  </Link>

                  <DeleteButton
                    action={deleteUserAction}
                    name="username"
                    value={user.login}
                    title="このグループから削除"
                    label="🗑️ 削除"
                    className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-200 transition-colors text-xs font-bold ml-2 flex-shrink-0 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-gray-900"
                    extraHiddenInput={{ name: "targetGroup", value: currentGroup }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}