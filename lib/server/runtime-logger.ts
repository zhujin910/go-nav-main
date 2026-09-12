import fs from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./paths";

const LOG_DIR = path.join(DATA_DIR, "logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");
const ROTATED_LOG_FILE = path.join(LOG_DIR, "app.log.1");
const MAX_LOG_BYTES = 5 * 1024 * 1024;
const INSTALLED = Symbol.for("go-nav.runtime-logger-installed");

type LoggerGlobal = typeof globalThis & { [INSTALLED]?: boolean };

function formatValue(value: unknown): string {
	if (value instanceof Error) return value.stack || value.message;
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

function append(level: string, values: unknown[]) {
	try {
		fs.mkdirSync(LOG_DIR, { recursive: true });
		if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size >= MAX_LOG_BYTES) {
			fs.rmSync(ROTATED_LOG_FILE, { force: true });
			fs.renameSync(LOG_FILE, ROTATED_LOG_FILE);
		}
		const line = `${new Date().toISOString()} [${level}] ${values.map(formatValue).join(" ")}\n`;
		fs.appendFileSync(LOG_FILE, line, "utf8");
	} catch {
		// 日志写入失败不能影响主服务运行。
	}
}

export function installRuntimeLogger() {
	const globalState = globalThis as LoggerGlobal;
	if (globalState[INSTALLED]) return;
	globalState[INSTALLED] = true;

	const originalWarn = console.warn.bind(console);
	const originalError = console.error.bind(console);
	console.warn = (...values: unknown[]) => {
		append("WARN", values);
		originalWarn(...values);
	};
	console.error = (...values: unknown[]) => {
		append("ERROR", values);
		originalError(...values);
	};
	append("INFO", ["server logger started", `pid=${process.pid}`]);
}

export function writeRuntimeError(error: unknown, requestPath?: string) {
	append("ERROR", [requestPath ? `${requestPath}:` : "request error", error]);
}
