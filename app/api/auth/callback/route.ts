import { NextRequest, NextResponse } from "next/server";
import db from "../../../../db"; 


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });
    const githubUser = await userRes.json();

    const stmt = db.prepare(`
      INSERT INTO users (github_id, name, avatar_url)
      VALUES (?, ?, ?)
      ON CONFLICT(github_id) DO UPDATE SET name=excluded.name, avatar_url=excluded.avatar_url
    `);
    stmt.run(githubUser.login, githubUser.name || githubUser.login, githubUser.avatar_url);

    const response = NextResponse.redirect(new URL("/", request.url));
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, 
    };

    response.cookies.set("auth_session", githubUser.login, cookieOptions);
    response.cookies.set("auth_github_token", accessToken, cookieOptions);

    return response;
  } catch (error) {
    console.error("認証エラー:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}