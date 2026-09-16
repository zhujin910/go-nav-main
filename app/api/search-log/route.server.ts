import { NextResponse } from "next/server";
import { appendSearchLog, getClientIp } from "@/lib/server/security-logs";

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as {
			keyword?: string;
			results?: string[];
			resultCount?: number;
			durationMs?: number;
		};
		const keyword = body.keyword?.trim();
		if (!keyword) return NextResponse.json({ error: "关键词不能为空" }, { status: 400 });
		appendSearchLog({
			ip: getClientIp(request),
			keyword,
			results: Array.isArray(body.results) ? body.results : [],
			resultCount: Number(body.resultCount) || 0,
			durationMs: Number(body.durationMs) || 0,
			userAgent: request.headers.get("user-agent") ?? "unknown",
		});
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "搜索日志写入失败" }, { status: 500 });
	}
}
