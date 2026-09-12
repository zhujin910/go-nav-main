"use client";

import { Button, Card, toast } from "@heroui/react";
import { useEffect, useState } from "react";

interface Status { hostname: string; platform: string; cpus: number; loadPercent: number; memory: { used: number; total: number; percent: number }; disk: { used: number; total: number; percent: number }; uptime: number; nodeVersion: string; pid: number; processMemory: { rss: number; heapUsed: number; heapTotal: number }; dataDirectory: string; dataFiles: number; }
interface LogFile { id: string; name: string; size: number; modifiedAt: string; }
interface MaintenanceSchedule { enabled: boolean; intervalHours: number; clearCache: boolean; cleanOrphans: boolean; lastRunAt: string | null; }
const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
const formatUptime = (seconds: number) => `${Math.floor(seconds / 86400)} 天 ${String(Math.floor(seconds / 3600) % 24).padStart(2, "0")} 小时`;

export function SystemStatus() {
	const [status, setStatus] = useState<Status | null>(null);
	const [error, setError] = useState("");
	const [logs, setLogs] = useState<LogFile[]>([]);
	const [schedule, setSchedule] = useState<MaintenanceSchedule>({ enabled: false, intervalHours: 24, clearCache: true, cleanOrphans: true, lastRunAt: null });
	const [busy, setBusy] = useState(false);
	useEffect(() => { let cancelled = false; const load = () => fetch("/api/system/status", { cache: "no-store" }).then((response) => { if (!response.ok) throw new Error("无法读取系统状态"); return response.json() as Promise<Status>; }).then((data) => { if (!cancelled) setStatus(data); }).catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "读取失败"); }); load(); const timer = window.setInterval(load, 10000); return () => { cancelled = true; window.clearInterval(timer); }; }, []);
	const loadLogs = async () => {
		const response = await fetch("/api/system/maintenance", { cache: "no-store" });
		const data = (await response.json()) as { logs?: LogFile[]; schedule?: MaintenanceSchedule; error?: string };
		if (!response.ok) throw new Error(data.error || "日志读取失败");
		setLogs(data.logs ?? []);
		if (data.schedule) setSchedule(data.schedule);
	};
	const saveSchedule = async (next: MaintenanceSchedule) => {
		setSchedule(next);
		const response = await fetch("/api/system/maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "set-schedule", schedule: next }) });
		if (!response.ok) throw new Error(((await response.json()) as { error?: string }).error || "定时设置保存失败");
		toast.success(next.enabled ? "定时清理已启用" : "定时清理已关闭");
	};
	const runMaintenance = async (action: "clear-cache" | "clean-orphans") => {
		setBusy(true);
		try {
			const response = await fetch("/api/system/maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
			const data = (await response.json()) as { error?: string; deleted?: number; bytes?: number; removed?: number };
			if (!response.ok) throw new Error(data.error || "操作失败");
			toast.success(action === "clear-cache" ? `已清理 ${data.removed ?? 0} 项缓存` : `已删除 ${data.deleted ?? 0} 个无用文件，释放 ${formatBytes(data.bytes ?? 0)}`);
		} catch (reason) {
			toast.danger(reason instanceof Error ? reason.message : "操作失败");
		} finally { setBusy(false); }
	};
	return <div className="mx-auto w-full max-w-5xl space-y-6"><div><h1 className="text-2xl font-semibold">系统状态</h1><p className="mt-1 text-sm text-muted-foreground">后端主机资源状态，每 10 秒自动刷新。</p></div>{error ? <p className="text-sm text-danger">{error}</p> : null}{status ? <div className="grid gap-4 md:grid-cols-3"><Metric title="CPU 负载" value={`${status.loadPercent}%`} detail={`${status.cpus} 核`} percent={status.loadPercent} /><Metric title="内存占用" value={`${status.memory.percent}%`} detail={`${formatBytes(status.memory.used)} / ${formatBytes(status.memory.total)}`} percent={status.memory.percent} /><Metric title="磁盘占用" value={`${status.disk.percent}%`} detail={`${formatBytes(status.disk.used)} / ${formatBytes(status.disk.total)}`} percent={status.disk.percent} /><Card className="border border-divider p-5"><p className="text-sm text-muted-foreground">主机信息</p><p className="mt-2 font-medium">{status.hostname}</p><p className="mt-1 text-xs text-muted-foreground">{status.platform} · Node {status.nodeVersion} · PID {status.pid} · 运行 {formatUptime(status.uptime)}</p><p className="mt-1 text-xs text-muted-foreground">进程 RSS {formatBytes(status.processMemory.rss)} · 堆 {formatBytes(status.processMemory.heapUsed)} / {formatBytes(status.processMemory.heapTotal)}</p><p className="mt-1 text-xs text-muted-foreground">{status.dataDirectory} 中有 {status.dataFiles} 个数据文件</p></Card></div> : <p className="text-sm text-muted-foreground">正在读取状态...</p>}<Card className="border border-divider p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">服务器维护</h2><p className="mt-1 text-xs text-muted-foreground">只清理项目缓存和未引用上传文件，不删除配置与文章数据。</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" isDisabled={busy} onPress={() => void runMaintenance("clear-cache")}>清理缓存</Button><Button size="sm" variant="secondary" isDisabled={busy} onPress={() => void runMaintenance("clean-orphans")}>清理无用文件</Button></div></div><div className="mt-4 flex flex-wrap items-center gap-4 border-t border-divider pt-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={schedule.enabled} onChange={(event) => void saveSchedule({ ...schedule, enabled: event.target.checked })} />按周期检查清理</label><label className="flex items-center gap-2">每 <input className="w-20 rounded border border-divider bg-transparent px-2 py-1" type="number" min="1" max="720" value={schedule.intervalHours} onChange={(event) => setSchedule({ ...schedule, intervalHours: Number(event.target.value) || 1 })} onBlur={() => void saveSchedule(schedule)} /> 小时</label><span className="text-xs text-muted-foreground">后台访问维护功能时执行检查</span></div></Card><Card className="border border-divider p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">日志文件</h2><p className="mt-1 text-xs text-muted-foreground">仅显示项目 logs 目录中的 .log 和 .txt 文件。</p></div><Button size="sm" variant="outline" onPress={() => void loadLogs()}>刷新日志</Button></div>{logs.length > 0 ? <div className="mt-4 divide-y divide-divider">{logs.map((log) => <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm"><span>{log.name} <span className="text-xs text-muted-foreground">({formatBytes(log.size)})</span></span><a className="text-primary hover:underline" href={`/api/system/maintenance?download=${encodeURIComponent(log.id)}`}>下载</a></div>)}</div> : <p className="mt-4 text-sm text-muted-foreground">点击“刷新日志”查看可用日志。</p>}</Card></div>;
}

function Metric({ title, value, detail, percent }: { title: string; value: string; detail: string; percent: number }) { return <Card className="border border-divider p-5"><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-3xl font-semibold text-primary">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-default-200"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div></Card>; }
