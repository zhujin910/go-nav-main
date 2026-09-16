import fs from "node:fs";
import path from "node:path";

export type AccessLog = {
	id: string;
	time: string;
	ip: string;
	path: string;
	method: string;
	status: number;
	userAgent: string;
	blocked?: boolean;
};

export type SearchLog = {
	id: string;
	time: string;
	ip: string;
	keyword: string;
	results: string[];
	resultCount: number;
	durationMs: number;
	userAgent: string;
};

export type SecurityLogs = {
	access: AccessLog[];
	search: SearchLog[];
};

const MAX_RECORDS = 5000;
const getFile = () => path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "security-logs.json");

export function getClientIp(request: Request) {
	const headers = [
		"cf-connecting-ip",
		"x-forwarded-for",
		"x-real-ip",
		"x-client-ip",
		"true-client-ip",
	];
	for (const name of headers) {
		const value = request.headers.get(name);
		const ip = value?.split(",")[0]?.trim().replace(/^\[|\]$/g, "");
		if (ip) return ip;
	}
	return "unknown";
}

function emptyLogs(): SecurityLogs {
	return { access: [], search: [] };
}

export function readSecurityLogs(): SecurityLogs {
	try {
		const value = JSON.parse(fs.readFileSync(getFile(), "utf8")) as Partial<SecurityLogs>;
		return {
			access: Array.isArray(value.access) ? value.access : [],
			search: Array.isArray(value.search) ? value.search : [],
		};
	} catch {
		return emptyLogs();
	}
}

function writeLogs(logs: SecurityLogs) {
	const file = getFile();
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const temp = `${file}.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	fs.writeFileSync(temp, JSON.stringify(logs, null, 2), "utf8");
	fs.renameSync(temp, file);
}

const trimText = (value: string, max: number) => value.slice(0, max);

export function appendAccessLog(input: Omit<AccessLog, "id" | "time">) {
	const logs = readSecurityLogs();
	logs.access.push({
		...input,
		id: crypto.randomUUID(),
		time: new Date().toISOString(),
		path: trimText(input.path, 300),
		userAgent: trimText(input.userAgent, 4096),
	});
	logs.access = logs.access.slice(-MAX_RECORDS);
	writeLogs(logs);
}

export function appendSearchLog(input: Omit<SearchLog, "id" | "time">) {
	const logs = readSecurityLogs();
	logs.search.push({
		...input,
		id: crypto.randomUUID(),
		time: new Date().toISOString(),
		keyword: trimText(input.keyword, 200),
		results: input.results.slice(0, 20).map((item) => trimText(item, 160)),
		resultCount: Math.max(0, Math.min(input.resultCount, 100000)),
		durationMs: Math.max(0, Math.min(input.durationMs, 600000)),
		userAgent: trimText(input.userAgent, 4096),
	});
	logs.search = logs.search.slice(-MAX_RECORDS);
	writeLogs(logs);
}

export function clearSecurityLogs() {
	writeLogs(emptyLogs());
}
