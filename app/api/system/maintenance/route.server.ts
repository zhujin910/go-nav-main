import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/server/auth";
import { DATA_DIR, UPLOADS_DIR } from "@/lib/server/paths";
import { readNav, readWebsiteData } from "@/lib/server/store";
import { ARTICLES_FILE } from "@/lib/server/articles";

const LOG_DIRECTORIES = [path.join(process.cwd(), "logs"), path.join(DATA_DIR, "logs")];
const TEMP_DIRECTORIES = [path.join(process.cwd(), ".next", "cache"), path.join(DATA_DIR, ".cache")];
const ARTICLE_UPLOADS_DIR = path.join(DATA_DIR, "article-uploads");
const SCHEDULE_FILE = path.join(DATA_DIR, "maintenance.json");
const DEFAULT_SCHEDULE = { enabled: false, intervalHours: 24, clearCache: true, cleanOrphans: true, lastRunAt: null as string | null };
const CLEANUP_ROOTS = [
	{ id: "next-cache", directory: path.join(process.cwd(), ".next", "cache"), label: "Next 构建缓存" },
	{ id: "project-logs", directory: path.join(process.cwd(), "logs"), label: "项目日志" },
	{ id: "data-logs", directory: path.join(DATA_DIR, "logs"), label: "数据日志" },
];
type CleanupCandidate = { id: string; name: string; label: string; size: number; kind: "directory" | "file" };

async function authorized() {
	const store = await cookies();
	return verifySession(store.get(SESSION_COOKIE)?.value);
}

function collectUsedUploads() {
	let articles = "";
	try {
		articles = fs.readFileSync(ARTICLES_FILE, "utf8");
	} catch {
		// 文章文件不存在时不影响普通上传文件清理。
	}
	const haystack = `${JSON.stringify(readNav())}\n${JSON.stringify(readWebsiteData())}\n${articles}`;
	const used = new Set<string>();
	const pattern = /\/(uploads|article-uploads)\/([A-Za-z0-9._-]+)/g;
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(haystack))) used.add(`${match[1]}/${match[2]}`);
	return used;
}

function listFiles(directory: string, extensions?: Set<string>) {
	if (!fs.existsSync(directory)) return [] as Array<{ name: string; path: string; size: number; modifiedAt: string }>;
	return fs.readdirSync(directory, { withFileTypes: true })
		.filter((entry) => entry.isFile() && (!extensions || extensions.has(path.extname(entry.name).toLowerCase())))
		.map((entry) => {
			const filePath = path.join(directory, entry.name);
			const stat = fs.statSync(filePath);
			return { name: entry.name, path: filePath, size: stat.size, modifiedAt: stat.mtime.toISOString() };
		});
}

function listLogs() {
	const seen = new Set<string>();
	return LOG_DIRECTORIES.flatMap((directory) => listFiles(directory, new Set([".log", ".txt"])))
		.filter((file) => {
			const key = path.resolve(file.path);
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.map(({ path: filePath, ...file }) => ({ ...file, id: filePath }));
}

function clearDirectory(directory: string) {
	if (!fs.existsSync(directory)) return 0;
	let removed = 0;
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const target = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			fs.rmSync(target, { recursive: true, force: true });
			removed += 1;
		} else if (entry.isFile()) {
			fs.rmSync(target, { force: true });
			removed += 1;
		}
	}
	return removed;
}

function getDirectorySize(directory: string): number {
	if (!fs.existsSync(directory)) return 0;
	return fs.readdirSync(directory, { withFileTypes: true }).reduce((total, entry) => {
		const target = path.join(directory, entry.name);
		return total + (entry.isDirectory() ? getDirectorySize(target) : fs.statSync(target).size);
	}, 0);
}

function listCleanupCandidates(): CleanupCandidate[] {
	const candidates: CleanupCandidate[] = CLEANUP_ROOTS
		.filter(({ directory }) => fs.existsSync(directory))
		.map(({ id, directory, label }) => ({
			id,
			name: path.relative(process.cwd(), directory) || directory,
			label,
			size: getDirectorySize(directory),
			kind: "directory" as const,
		}))
		.filter((item) => item.size > 0);

	if (fs.existsSync(DATA_DIR)) {
		for (const entry of fs.readdirSync(DATA_DIR, { withFileTypes: true })) {
			if (!entry.isFile() || !/(?:\.bak|\.tmp-[A-Za-z0-9_-]+)$/.test(entry.name)) continue;
			const filePath = path.join(DATA_DIR, entry.name);
			candidates.push({
				id: `data-file:${entry.name}`,
				name: path.relative(process.cwd(), filePath),
				label: "旧配置/临时文件",
				size: fs.statSync(filePath).size,
				kind: "file" as const,
			});
		}
	}
	return candidates;
}

function deleteCleanupCandidates(ids: string[]) {
	const allowed = new Map(listCleanupCandidates().map((item) => [item.id, item]));
	let deleted = 0;
	let bytes = 0;
	for (const id of ids) {
		const item = allowed.get(id);
		if (!item) continue;
		const root = item.kind === "directory"
			? CLEANUP_ROOTS.find((candidate) => candidate.id === id)?.directory
			: path.join(DATA_DIR, id.slice("data-file:".length));
		if (!root) continue;
		const safeRelative = path.relative(item.kind === "directory" ? root : DATA_DIR, root);
		if (safeRelative.startsWith("..") || path.isAbsolute(safeRelative)) continue;
		if (item.kind === "directory") {
			clearDirectory(root);
		} else {
			fs.rmSync(root, { force: true });
		}
		deleted += 1;
		bytes += item.size;
	}
	return { deleted, bytes };
}

function cleanOrphanUploads() {
	const used = collectUsedUploads();
	const directories = [
		{ directory: UPLOADS_DIR, prefix: "uploads" },
		{ directory: ARTICLE_UPLOADS_DIR, prefix: "article-uploads" },
	];
	let deleted = 0;
	let bytes = 0;
	for (const { directory, prefix } of directories) {
		if (!fs.existsSync(directory)) continue;
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			if (!entry.isFile() || used.has(`${prefix}/${entry.name}`)) continue;
			const target = path.join(directory, entry.name);
			const relative = path.relative(directory, target);
			if (relative.startsWith("..") || path.isAbsolute(relative)) continue;
			const size = fs.statSync(target).size;
			fs.unlinkSync(target);
			deleted += 1;
			bytes += size;
		}
	}
	return { deleted, bytes };
}

function readSchedule() {
	try {
		return { ...DEFAULT_SCHEDULE, ...(JSON.parse(fs.readFileSync(SCHEDULE_FILE, "utf8")) as Partial<typeof DEFAULT_SCHEDULE>) };
	} catch {
		return { ...DEFAULT_SCHEDULE };
	}
}

function writeSchedule(schedule: ReturnType<typeof readSchedule>) {
	fs.mkdirSync(DATA_DIR, { recursive: true });
	fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2), "utf8");
}

function runScheduledMaintenance() {
	const schedule = readSchedule();
	if (!schedule.enabled) return;
	const lastRun = schedule.lastRunAt ? Date.parse(schedule.lastRunAt) : 0;
	if (Date.now() - lastRun < schedule.intervalHours * 60 * 60 * 1000) return;
	if (schedule.clearCache) TEMP_DIRECTORIES.forEach(clearDirectory);
	if (schedule.cleanOrphans) cleanOrphanUploads();
	schedule.lastRunAt = new Date().toISOString();
	writeSchedule(schedule);
}

export async function GET(request: Request) {
	if (!(await authorized())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	const url = new URL(request.url);
	const download = url.searchParams.get("download");
	if (download) {
		const file = listLogs().find((item) => item.id === download);
		if (!file) return NextResponse.json({ error: "日志不存在" }, { status: 404 });
		const content = fs.readFileSync(download, "utf8");
		return new Response(content, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Content-Disposition": `attachment; filename="${file.name}"`,
				"Cache-Control": "no-store",
			},
		});
	}
	runScheduledMaintenance();
	return NextResponse.json({ logs: listLogs(), schedule: readSchedule(), candidates: listCleanupCandidates() });
}

export async function POST(request: Request) {
	if (!(await authorized())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	const body = (await request.json().catch(() => ({}))) as { action?: string; schedule?: Partial<typeof DEFAULT_SCHEDULE>; ids?: string[] };
	try {
		if (body.action === "delete-selected") {
			if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string")) {
				return NextResponse.json({ error: "清理文件列表无效" }, { status: 400 });
			}
			return NextResponse.json({ ok: true, action: body.action, ...deleteCleanupCandidates(body.ids) });
		}
		if (body.action === "set-schedule" && body.schedule) {
			const current = readSchedule();
			const intervalHours = Number(body.schedule.intervalHours);
			if (!Number.isFinite(intervalHours) || intervalHours < 1 || intervalHours > 720) {
				return NextResponse.json({ error: "清理周期必须为 1 到 720 小时" }, { status: 400 });
			}
			const next = { ...current, ...body.schedule, intervalHours, enabled: body.schedule.enabled === true };
			writeSchedule(next);
			return NextResponse.json({ ok: true, schedule: next });
		}
		if (body.action === "clear-cache") {
			const removed = TEMP_DIRECTORIES.reduce((total, directory) => total + clearDirectory(directory), 0);
			return NextResponse.json({ ok: true, action: body.action, removed });
		}
		if (body.action === "clean-orphans") {
			return NextResponse.json({ ok: true, action: body.action, ...cleanOrphanUploads() });
		}
		return NextResponse.json({ error: "不支持的清理操作" }, { status: 400 });
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "清理失败" }, { status: 500 });
	}
}
