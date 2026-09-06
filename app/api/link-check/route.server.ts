import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/server/auth";
import {
	fetchPublicResource,
	normalizeHttpUrl,
} from "@/lib/server/fetch-utils";

const DEFAULT_TIMEOUT = 8_000;
const MAX_TIMEOUT = 30_000;

export async function POST(request: Request) {
	const store = await cookies();
	if (!verifySession(store.get(SESSION_COOKIE)?.value)) {
		return NextResponse.json({ error: "未登录" }, { status: 401 });
	}
	try {
		const body = (await request.json()) as {
			url?: string;
			timeout?: number;
		};
		if (!body.url?.trim()) {
			return NextResponse.json({ error: "缺少 url" }, { status: 400 });
		}

		const target = normalizeHttpUrl(body.url);
		const timeout = Math.min(
			MAX_TIMEOUT,
			Math.max(1_000, Number(body.timeout) || DEFAULT_TIMEOUT),
		);
		const startedAt = Date.now();
		const response = await fetchPublicResource(target, {
			method: "GET",
			timeoutMs: timeout,
			maxBytes: 64 * 1024,
			headers: {
				"User-Agent": "GoNav Link Checker/1.0",
			},
		});
		const responseTime = Date.now() - startedAt;
		return NextResponse.json({
			status: response.ok ? "ok" : "failed",
			statusCode: response.status,
			responseTime,
			error: response.ok ? undefined : `HTTP ${response.status}`,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "网络请求失败";
		const isTimeout =
			error instanceof DOMException && error.name === "TimeoutError";
		return NextResponse.json({
			status: isTimeout ? "timeout" : "failed",
			responseTime: undefined,
			error: message,
		});
	}
}
