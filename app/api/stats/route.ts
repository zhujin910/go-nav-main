import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/server/auth";
import { readStats, recordClick, recordVisit, writeStats } from "@/lib/stats.server";

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as { type?: string; websiteId?: string };
		if (body.type === "click" && body.websiteId) await recordClick(body.websiteId);
		else if (body.type === "visit") {
			const cookie = (await cookies()).get("go-nav-visitor-day")?.value;
			const today = new Date().toISOString().slice(0, 10);
			if (cookie !== today) await recordVisit();
			const response = NextResponse.json({ ok: true });
			response.cookies.set("go-nav-visitor-day", today, { httpOnly: true, sameSite: "lax", maxAge: 86400, path: "/" });
			return response;
		}
		else return NextResponse.json({ error: "统计类型无效" }, { status: 400 });
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "统计写入失败" }, { status: 500 });
	}
}

export async function GET() {
	const store = await cookies();
	if (!verifySession(store.get(SESSION_COOKIE)?.value)) return NextResponse.json({ error: "未登录" }, { status: 401 });
	return NextResponse.json(await readStats());
}

export async function DELETE() {
	const store = await cookies();
	if (!verifySession(store.get(SESSION_COOKIE)?.value)) return NextResponse.json({ error: "未登录" }, { status: 401 });
	await writeStats({ clickRecords: [], visitRecords: [] });
	return NextResponse.json({ ok: true });
}
