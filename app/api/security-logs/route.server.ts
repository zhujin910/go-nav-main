import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/server/auth";
import { clearSecurityLogs, readSecurityLogs } from "@/lib/server/security-logs";

async function isAdmin() {
	const store = await cookies();
	return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function GET() {
	if (!(await isAdmin())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	return NextResponse.json(readSecurityLogs(), { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE() {
	if (!(await isAdmin())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	clearSecurityLogs();
	return NextResponse.json({ ok: true });
}
