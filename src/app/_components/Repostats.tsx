import React from "react";
import Image from "next/image";

interface RepoMeta {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
}

interface Contributor {
  login: string;
  contributions: number;
  avatar_url: string;
}

interface CommitInfo {
  sha: string;
  commit: {
    author: { name: string; date: string };
    message: string;
  };
}

interface RepoStatsProps {
  repoOwner: string;
  repoName: string;
  meta: RepoMeta | null;
  contributors: Contributor[];
  commits: CommitInfo[];
}

export default function RepoStats({ repoOwner, repoName, meta, contributors, commits }: RepoStatsProps) {
  let healthStatus = "⚪ データなし";
  let healthColor = "text-gray-700 bg-gray-100 border-gray-300 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800";
  let healthDesc = "リポジトリデータを解析できませんでした。";

  if (meta) {
    const lastPush = new Date(meta.pushed_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      healthStatus = "🟢 活発（健全）";
      healthColor = "text-green-800 bg-green-100 border-green-300 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/50";
      healthDesc = `直近1週間以内（${diffDays}日前）にコミットがあり、開発は非常にスムーズです！`;
    } else if (diffDays <= 30) {
      healthStatus = "🟡 緩慢";
      healthColor = "text-amber-800 bg-amber-100 border-amber-300 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50";
      healthDesc = `最終更新が ${diffDays}日前 です。少しペースが落ちているか、安定期に入っています。`;
    } else {
      healthStatus = "🔴 停滞";
      healthColor = "text-red-800 bg-red-100 border-red-300 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50";
      healthDesc = `最終更新が ${diffDays}日前 です。開発がストップしている可能性があります。`;
    }
  }

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-md flex justify-between items-center dark:bg-gray-900/50 border dark:border-gray-800">
        <div>
          <span className="text-xs text-gray-400 font-mono font-bold">{repoOwner} /</span>
          <h2 className="text-2xl font-black tracking-tight">{repoName}</h2>
        </div>
        <div className="flex gap-4 text-center text-xs font-mono">
          <div><div className="text-gray-400">⭐ Stars</div><div className="font-bold">{meta?.stargazers_count ?? 0}</div></div>
          <div><div className="text-gray-400">🍴 Forks</div><div className="font-bold">{meta?.forks_count ?? 0}</div></div>
          <div><div className="text-gray-400">🚨 Issues</div><div className="font-bold text-red-400">{meta?.open_issues_count ?? 0}</div></div>
        </div>
      </div>
      <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-2 transition-colors duration-300 dark:bg-gray-900 dark:border-gray-800">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white">🌡️ プロジェクト健康度分析</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
          <div className={`px-4 py-2 rounded-xl font-bold border text-center text-xs whitespace-nowrap ${healthColor}`}>
            {healthStatus}
          </div>
          <p className="text-xs text-gray-600 leading-relaxed dark:text-gray-400">{healthDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-4 transition-colors duration-300 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">👥 開発貢献度（Contributors）</h3>
          {contributors.length === 0 ? (
            <p className="text-xs text-gray-400 italic">データがありません</p>
          ) : (
            <div className="space-y-2">
              {contributors.slice(0, 5).map((c, idx) => (
                <div key={c.login} className="flex items-center justify-between p-2 rounded-xl bg-gray-100 border border-gray-200 transition-colors duration-300 dark:bg-gray-950 dark:border-gray-800/60">
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="w-5 font-bold text-gray-400 text-center">{idx + 1}</span>
                    <Image src={c.avatar_url} alt={c.login} width={24} height={24} className="rounded-full" unoptimized />
                    <span className="font-mono font-semibold text-gray-900 dark:text-gray-300">{c.login}</span>
                  </div>
                  <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400">
                    <strong className="text-gray-900 font-bold dark:text-white">{c.contributions}</strong> commits
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-4 transition-colors duration-300 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">📜 最近の活動履歴</h3>
            <a
              href={`https://github.com/${repoOwner}/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700"
            >
              <span>🔗</span> リポジトリを見る
            </a>
          </div>

          {commits.length === 0 ? (
            <p className="text-xs text-gray-400 italic">直近のコミット履歴がありません</p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {commits.map((c) => {
                const commitDate = new Date(c.commit.author.date);
                const dateString = `${commitDate.getMonth() + 1}/${commitDate.getDate()} ${String(commitDate.getHours()).padStart(2, "0")}:${String(commitDate.getMinutes()).padStart(2, "0")}`;
                return (
                  <div key={c.sha} className="p-2.5 rounded-xl bg-gray-100 border border-gray-200 text-xs space-y-1 transition-colors duration-300 dark:bg-gray-950 dark:border-gray-800/60">
                    <div className="font-semibold text-gray-900 line-clamp-1 break-all dark:text-gray-200">
                      {c.commit.message}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono dark:text-gray-500">
                      <span>👤 {c.commit.author.name}</span>
                      <span>🕒 {dateString}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}