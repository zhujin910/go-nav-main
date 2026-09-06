import os from "node:os";
import { statfs } from "node:fs/promises";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/server/auth";

function memoryUsage() {
	const total = os.totalmem();
	const free = os.freemem();
	return { total, used: total - free, percent: Math.round(((total - free) / total) * 100) };
}

export async function GET() {
	const store = await cookies();
	if (!verifySession(store.get(SESSION_COOKIE)?.value)) {
		return NextResponse.json({ error: "未登录" }, { status: 401 });
	}
	const load = os.loadavg();
	const cpuTimes = os.cpus().reduce(
		(total, cpu) => {
			const values = cpu.times;
			return { idle: total.idle + values.idle, total: total.total + values.user + values.nice + values.sys + values.idle + values.irq };
		},
		{ idle: 0, total: 0 },
	);
	const cpuPercent = cpuTimes.total ? Math.round((1 - cpuTimes.idle / cpuTimes.total) * 100) : 0;
	let disk = { total: 0, used: 0, percent: 0 };
	try {
		const filesystem = await statfs(process.cwd());
		const total = Number(filesystem.blocks) * Number(filesystem.bsize);
		const free = Number(filesystem.bavail) * Number(filesystem.bsize);
		disk = { total, used: total - free, percent: total ? Math.round(((total - free) / total) * 100) : 0 };
	} catch {
	}
	return NextResponse.json({
		hostname: os.hostname(),
		platform: `${os.platform()} ${os.arch()}`,
		cpus: os.cpus().length,
		load: load[0] ?? 0,
		loadPercent: process.platform === "win32" ? cpuPercent : Math.min(100, Math.round(((load[0] ?? 0) / Math.max(1, os.cpus().length)) * 100)),
		memory: memoryUsage(),
		disk,
		uptime: os.uptime(),
	});
}
