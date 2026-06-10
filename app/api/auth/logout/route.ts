import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  // クッキーを削除してログアウト
  response.cookies.delete("auth_session");
  return response;
}