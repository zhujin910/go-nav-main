"use client";

import { Card } from "@heroui/react";
import { useEffect, useState } from "react";

interface Status { hostname: string; platform: string; cpus: number; loadPercent: number; memory: { used: number; total: number; percent: number }; disk: { used: number; total: number; percent: number }; uptime: number; }
const formatBytes = (bytes: number) => `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
const formatUptime = (seconds: number) => `${Math.floor(seconds / 86400)} 天 ${String(Math.floor(seconds / 3600) % 24).padStart(2, "0")} 小时`;

export function SystemStatus() {
	const [status, setStatus] = useState<Status | null>(null);
	const [error, setError] = useState("");
	useEffect(() => { let cancelled = false; const load = () => fetch("/api/system/status", { cache: "no-store" }).then((response) => { if (!response.ok) throw new Error("无法读取系统状态"); return response.json() as Promise<Status>; }).then((data) => { if (!cancelled) setStatus(data); }).catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "读取失败"); }); load(); const timer = window.setInterval(load, 10000); return () => { cancelled = true; window.clearInterval(timer); }; }, []);
	return <div className="mx-auto w-full max-w-5xl space-y-6"><div><h1 className="text-2xl font-semibold">系统状态</h1><p className="mt-1 text-sm text-muted-foreground">后端主机资源状态，每 10 秒自动刷新。</p></div>{error ? <p className="text-sm text-danger">{error}</p> : null}{status ? <div className="grid gap-4 md:grid-cols-3"><Metric title="CPU 负载" value={`${status.loadPercent}%`} detail={`${status.cpus} 核`} percent={status.loadPercent} /><Metric title="内存占用" value={`${status.memory.percent}%`} detail={`${formatBytes(status.memory.used)} / ${formatBytes(status.memory.total)}`} percent={status.memory.percent} /><Metric title="磁盘占用" value={`${status.disk.percent}%`} detail={`${formatBytes(status.disk.used)} / ${formatBytes(status.disk.total)}`} percent={status.disk.percent} /><Card className="border border-divider p-5"><p className="text-sm text-muted-foreground">主机信息</p><p className="mt-2 font-medium">{status.hostname}</p><p className="mt-1 text-xs text-muted-foreground">{status.platform} · 运行 {formatUptime(status.uptime)}</p></Card></div> : <p className="text-sm text-muted-foreground">正在读取状态...</p>}<div className="rounded-xl border border-dashed border-divider p-5 text-sm text-muted-foreground">Docker 容器状态、网络测速和日志查看需要对应部署环境权限，后续可在此页按 Docker socket、测速目标和日志来源分别接入。</div></div>;
}

function Metric({ title, value, detail, percent }: { title: string; value: string; detail: string; percent: number }) { return <Card className="border border-divider p-5"><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-3xl font-semibold text-primary">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-default-200"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div></Card>; }
