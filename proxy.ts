import { NextResponse, type NextRequest } from "next/server";
import { readNav } from "@/lib/server/store";
import { appendAccessLog, getClientIp } from "@/lib/server/security-logs";
import type { BotProtectionConfig } from "@/types";

const recentRequests = new Map<string, { startedAt: number; count: number }>();
const KNOWN_BOT_KEYWORDS = ["bot", "crawler", "spider", "scrapy", "headless", "curl", "wget", "python-requests"];

function getIp(request: NextRequest) {
	return getClientIp(request);
}

function matchesIp(ip: string, patterns: string[] = []) {
	return patterns.some((pattern) => {
		const value = pattern.trim();
		return value && (ip === value || ip.startsWith(value.replace(/\/$/, "")));
	});
}

function isBlocked(request: NextRequest, config: BotProtectionConfig) {
	if (config.enabled !== true) return false;
	const ip = getIp(request);
	if (matchesIp(ip, config.allowedIps)) return false;
	if (matchesIp(ip, config.blockedIps)) return true;
	const userAgent = request.headers.get("user-agent")?.toLowerCase() ?? "";
	const keywords = config.blockedUserAgentKeywords ?? [];
	if (keywords.some((keyword) => keyword.trim() && userAgent.includes(keyword.trim().toLowerCase()))) return true;
	if (config.blockKnownBots !== false && KNOWN_BOT_KEYWORDS.some((keyword) => userAgent.includes(keyword))) return true;
	const now = Date.now();
	const current = recentRequests.get(ip);
	if (!current || now - current.startedAt >= 60_000) {
		recentRequests.set(ip, { startedAt: now, count: 1 });
		return false;
	}
	current.count += 1;
	return current.count > Math.max(10, Math.min(config.maxRequestsPerMinute ?? 120, 10000));
}

function shouldLog(pathname: string) {
	return pathname === "/" || pathname.startsWith("/site/") || pathname.startsWith("/api/");
}

export function proxy(request: NextRequest) {
	if ((process.env.BUILD_MODE || "server").toLowerCase() !== "server") return NextResponse.next();
	const config = readNav().botProtection ?? {};
	const ip = getIp(request);
	const blocked = isBlocked(request, config);
	if (blocked) {
		try {
			if (shouldLog(request.nextUrl.pathname)) appendAccessLog({ ip, path: request.nextUrl.pathname, method: request.method, status: 403, userAgent: request.headers.get("user-agent") ?? "unknown", blocked: true });
		} catch { /* 日志故障不应阻断防护响应 */ }
		return new NextResponse("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
	}
	try {
		if (shouldLog(request.nextUrl.pathname)) appendAccessLog({ ip, path: request.nextUrl.pathname, method: request.method, status: 200, userAgent: request.headers.get("user-agent") ?? "unknown" });
	} catch { /* 日志故障不应影响正常页面访问 */ }
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|uploads/).*)"],
};
