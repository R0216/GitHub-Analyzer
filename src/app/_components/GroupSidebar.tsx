import React from "react";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

interface GroupSidebarProps {
  groups: { [key: string]: string[] };
  currentGroup: string;
  createGroupAction: (formData: FormData) => Promise<void>;
  deleteGroupAction: (formData: FormData) => Promise<void>;
}

export default function GroupSidebar({
  groups,
  currentGroup,
  createGroupAction,
  deleteGroupAction,
}: GroupSidebarProps) {
  return (
    <div className="space-y-6 md:border-r md:pr-6 border-gray-200 transition-colors duration-300 dark:border-gray-800">
      <div className="space-y-2">
        <h2 className="text-xl font-black text-gray-900 tracking-tight dark:text-white">📂 グループ管理</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">それぞれのグループを分析します</p>
      </div>

      <form action={createGroupAction} className="flex flex-col gap-2 p-4 bg-gray-100 rounded-2xl border border-gray-200 shadow-sm transition-colors duration-300 dark:bg-gray-900 dark:border-gray-800">
        <input 
          type="text"
          name="groupName"
          placeholder="新しいグループ名（例：A班）"
          required
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:border-gray-800 dark:text-white dark:focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl text-sm transition-all shadow-sm dark:bg-green-600 dark:hover:bg-green-500"
        >
          ＋ グループを作成
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-500 px-1 dark:text-gray-400">作成グループ一覧</h3>
        <div className="space-y-1">
          {Object.keys(groups)
            .filter((name) => name !== "未分類")
            .map((name) => {
              const isSelected = currentGroup === name;
              return (
                <div 
                  key={name}
                  className={`group/item flex items-center justify-between p-1 rounded-xl border transition-all ${
                    isSelected 
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100 dark:border-blue-500 dark:bg-blue-950/40 dark:ring-0" 
                      : "border-gray-200 bg-gray-100 hover:border-blue-400 hover:bg-gray-200 dark:border-transparent dark:bg-gray-950 dark:hover:bg-gray-900"
                  }`}
                >
                  <Link 
                    href={`/?group=${encodeURIComponent(name)}`}
                    className={`flex-1 p-2 text-sm font-bold no-underline flex items-center justify-between min-w-0 ${
                      isSelected 
                        ? "text-blue-700 dark:text-blue-400" 
                        : "text-gray-950 dark:text-gray-300"
                    }`}
                  >
                    <span className="truncate mr-2">📁 {name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold shrink-0 shadow-xs border ${
                      isSelected 
                        ? "bg-white border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-200" 
                        : "bg-white border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400"
                    }`}>
                      {groups[name].length}人
                    </span>
                  </Link>
                  <DeleteButton
                    action={deleteGroupAction}
                    name="groupName"
                    value={name}
                    title={`${name} グループを削除`}
                    className={`p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-bold shrink-0 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-950/50 ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover/item:opacity-100 focus:opacity-100"
                    }`}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}