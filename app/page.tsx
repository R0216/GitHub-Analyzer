import React from "react";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import db from "../db"; 
import GuestView from "./_components/GuestView";
import DashboardView from "./_components/DashboardView";

interface GitHubProfile {
  login: string;
  name: string;
  followers: number;
  public_repos: number;
  avatar_url: string;
}
interface GitHubRepo { language: string | null; }
interface GitHubEvent {
  type: string;
  created_at: string;
  payload: {
    size?: number;
    distinct_size?: number;
    commits?: { message: string; sha: string }[];
  }; 
}
interface MemberStats {
  profile: GitHubProfile;
  monthlyCommits: number;
  languages: string[];
}

interface GroupDbRow {
  id: number;
  name: string;
  owner_id: number;
}
interface MemberDbRow {
  username: string;
}
interface UserDbRow {
  id: number;
  github_id: string;
  name: string;
  avatar_url: string;
}


interface PageProps {
  searchParams: Promise<{ group?: string; searchUser?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const reqHeaders: HeadersInit = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};

  const cookieStore = await cookies();
  const sessionUser = cookieStore.get("auth_session")?.value || null;

  const resolvedSearchParams = await searchParams;
  const currentGroup = resolvedSearchParams.group || "未分類";
  const searchUser = resolvedSearchParams.searchUser || "";

  let userInDb: UserDbRow | null = null;
  let myGroups: { [key: string]: string[] } = { "未分類": [] };

  if (sessionUser) {
    userInDb = db.prepare("SELECT * FROM users WHERE github_id = ?").get(sessionUser) as UserDbRow;
    
    if (userInDb) {
      const existingGroups = db.prepare("SELECT * FROM groups WHERE owner_id = ?").all(userInDb.id) as GroupDbRow[];
      
      if (!existingGroups.some(g => g.name === "未分類")) {
        db.prepare("INSERT INTO groups (name, owner_id) VALUES ('未分類', ?)").run(userInDb.id);
      }

      const allGroups = db.prepare("SELECT * FROM groups WHERE owner_id = ?").all(userInDb.id) as GroupDbRow[];
      myGroups = {};
      allGroups.forEach((g) => {
        const members = db.prepare("SELECT username FROM group_members WHERE group_id = ?").all(g.id) as MemberDbRow[];
        myGroups[g.name] = members.map(m => m.username);
      });
    }
  }

  async function createGroup(formData: FormData) {
    "use server";
    if (!sessionUser || !userInDb) return;
    const name = (formData.get("groupName") as string)?.trim();
    if (!name) return;
    try {
      db.prepare("INSERT INTO groups (name, owner_id) VALUES (?, ?)").run(name, userInDb.id);
    } catch { /**/ }
    revalidatePath("/");
  }

  async function deleteGroup(formData: FormData) {
    "use server";
    if (!sessionUser || !userInDb) return;
    const name = formData.get("groupName") as string;
    if (!name || name === "未分類") return;
    db.prepare("DELETE FROM groups WHERE name = ? AND owner_id = ?").run(name, userInDb.id);
    revalidatePath("/");
  }

  async function addUser(formData: FormData) {
    "use server";
    if (!sessionUser || !userInDb) return;
    const username = (formData.get("username") as string)?.trim();
    const targetGroupName = formData.get("targetGroup") as string || "未分類";
    if (!username) return;

    const group = db.prepare("SELECT id FROM groups WHERE name = ? AND owner_id = ?").get(targetGroupName, userInDb.id) as GroupDbRow;
    if (group) {
      try {
        db.prepare("INSERT INTO group_members (group_id, username) VALUES (?, ?)").run(group.id, username);
      } catch { /**/ }
    }
    revalidatePath("/");
  }

  async function deleteUser(formData: FormData) {
    "use server";
    if (!sessionUser || !userInDb) return;
    const username = formData.get("username") as string;
    const targetGroupName = formData.get("targetGroup") as string || "未分類";
    
    const group = db.prepare("SELECT id FROM groups WHERE name = ? AND owner_id = ?").get(targetGroupName, userInDb.id) as GroupDbRow;
    if (group) {
      db.prepare("DELETE FROM group_members WHERE group_id = ? AND username = ?").run(group.id, username);
    }
    revalidatePath("/");
  }

  const displayUsernames = searchUser ? [searchUser] : (sessionUser ? (myGroups[currentGroup] || []) : []);

  const memberStatsPromises = displayUsernames.map(async (username) => {
    try {
      const [profileRes, reposRes, eventsRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { cache: "no-store", headers: reqHeaders }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=20`, { cache: "no-store", headers: reqHeaders }),
        fetch(`https://api.github.com/users/${username}/events?per_page=100`, { cache: "no-store", headers: reqHeaders })
      ]);
      if (!profileRes.ok) return null;

      const reposData = (await reposRes.json()) as GitHubRepo[] || [];
      const eventsData = (await eventsRes.json()) as GitHubEvent[] || [];

      let userMonthlyCommits = 0;
      eventsData.forEach((event) => {
        if (event.type === "PushEvent") {
          userMonthlyCommits += event.payload?.commits?.length || event.payload?.distinct_size || event.payload?.size || 1;
        }
      });

      return {
        profile: await profileRes.json() as GitHubProfile,
        languages: reposData.map(r => r.language).filter((l): l is string => l !== null),
        monthlyCommits: userMonthlyCommits
      } as MemberStats;
    } catch { return null; }
  });

  const validMemberStats = (await Promise.all(memberStatsPromises)).filter((m): m is MemberStats => m !== null);
  const groupTotalCommits = validMemberStats.reduce((sum, m) => sum + m.monthlyCommits, 0);
  
  const groupLanguageCounts: { [key: string]: number } = {};
  let groupTotalLanguages = 0;
  validMemberStats.forEach((m) => {
    m.languages.forEach((l) => { groupLanguageCounts[l] = (groupLanguageCounts[l] || 0) + 1; groupTotalLanguages++; });
  });
  const groupLanguageAnalysis = Object.entries(groupLanguageCounts)
    .map(([language, count]) => ({ language, percentage: Math.round((count / groupTotalLanguages) * 100) || 0 }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <main className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="border-b pb-4 flex justify-between items-center bg-white">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">GitHub Analyzer</h1>
          <p className="text-xs text-gray-400 mt-0.5">マルチモード・エンジニアダッシュボード</p>
        </div>
        
        <div>
          {sessionUser ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700 hidden sm:inline">
                👤 {sessionUser} でログイン中
              </span>
              <a
                href="/api/auth/logout"
                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-red-200"
              >
                ログアウト
              </a>
            </div>
          ) : (
            <a
              href="/api/auth/login"
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
            >
              <span>🐈</span> GitHubでログイン（管理モード）
            </a>
          )}
        </div>
      </div>

      {sessionUser ? (
        <DashboardView
          groups={myGroups}
          currentGroup={currentGroup}
          validMemberStats={validMemberStats}
          groupTotalCommits={groupTotalCommits}
          groupLanguageAnalysis={groupLanguageAnalysis}
          createGroup={createGroup}
          deleteGroup={deleteGroup}
          addUser={addUser}
          deleteUser={deleteUser}
          searchParamsUser={searchUser}
        />
      ) : (
        <GuestView
          searchParamsUser={searchUser}
          guestMemberStats={validMemberStats}
          groupTotalCommits={groupTotalCommits}
          groupLanguageAnalysis={groupLanguageAnalysis}
        />
      )}
    </main>
  );
}