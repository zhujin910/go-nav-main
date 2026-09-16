"use client";

import { useEffect, useState } from "react";
import { Button, Input, Label, TextField, toast } from "@heroui/react";
import { useAtom } from "jotai";
import { navAtom } from "@/lib/store/admin";
import type { AccessLog, SearchLog } from "@/lib/server/security-logs";

function splitLines(value: string) {
	return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

export function SecurityLogsDashboard() {
	const [nav, setNav] = useAtom(navAtom);
	const [access, setAccess] = useState<AccessLog[]>([]);
	const [search, setSearch] = useState<SearchLog[]>([]);
	const [loading, setLoading] = useState(true);
	const protection = nav.botProtection ?? {};

	const load = () => {
		setLoading(true);
		void fetch("/api/security-logs/", { cache: "no-store" })
			.then((response) => response.json())
			.then((data: { access?: AccessLog[]; search?: SearchLog[] }) => {
				setAccess(data.access ?? []);
				setSearch(data.search ?? []);
			})
			.catch(() => toast.danger("安全日志加载失败"))
			.finally(() => setLoading(false));
	};

	useEffect(load, []);

	const patchProtection = (patch: Partial<NonNullable<typeof nav.botProtection>>) => {
		setNav({ ...nav, botProtection: { ...protection, ...patch } });
	};

	const clear = () => {
		if (!window.confirm("确定清空访问日志和搜索日志吗？")) return;
		void fetch("/api/security-logs/", { method: "DELETE" }).then(() => {
			setAccess([]);
			setSearch([]);
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold">搜索与访问日志</h1>
					<p className="mt-1 text-sm text-muted">记录时间、IP、关键词、结果、耗时和 User-Agent。仅保留最近 5000 条。</p>
				</div>
				<div className="flex gap-2"><Button size="sm" variant="outline" onPress={load}>刷新</Button><Button size="sm" variant="danger-soft" onPress={clear}>清空日志</Button></div>
			</div>

			<section className="rounded-xl border border-divider bg-surface p-5">
				<h2 className="text-lg font-semibold">爬虫与访问防护</h2>
				<p className="mt-1 text-sm text-muted">仅动态 Server 部署生效；修改后点击顶部“保存”。</p>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={protection.enabled === true} onChange={(event) => patchProtection({ enabled: event.target.checked })} />启用防护</label>
					<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={protection.blockKnownBots !== false} onChange={(event) => patchProtection({ blockKnownBots: event.target.checked })} />拦截常见爬虫 UA</label>
					<TextField value={String(protection.maxRequestsPerMinute ?? 120)} onChange={(value) => patchProtection({ maxRequestsPerMinute: Number(value) || 120 })}><Label>单 IP 每分钟最大请求数</Label><Input type="number" min={10} max={10000} /></TextField>
					<TextField value={(protection.blockedUserAgentKeywords ?? []).join(", ")} onChange={(value) => patchProtection({ blockedUserAgentKeywords: splitLines(value) })}><Label>UA 拦截关键词</Label><Input placeholder="scrapy, scanner, crawler" /></TextField>
					<TextField value={(protection.blockedIps ?? []).join(", ")} onChange={(value) => patchProtection({ blockedIps: splitLines(value) })}><Label>拦截 IP / 前缀</Label><Input placeholder="203.0.113.10" /></TextField>
					<TextField value={(protection.allowedIps ?? []).join(", ")} onChange={(value) => patchProtection({ allowedIps: splitLines(value) })}><Label>放行 IP / 前缀</Label><Input placeholder="127.0.0.1" /></TextField>
				</div>
			</section>

			<section className="rounded-xl border border-divider bg-surface p-5">
				<h2 className="mb-3 text-lg font-semibold">搜索日志 {loading ? "（加载中）" : `（${search.length}）`}</h2>
				<div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-divider text-muted"><th className="p-2">时间</th><th className="p-2">关键词</th><th className="p-2">结果</th><th className="p-2">耗时</th><th className="p-2">IP</th><th className="p-2">User-Agent</th></tr></thead><tbody>{search.slice().reverse().slice(0, 100).map((item) => <tr key={item.id} className="border-b border-divider/60"><td className="p-2 whitespace-nowrap">{new Date(item.time).toLocaleString()}</td><td className="p-2 font-medium">{item.keyword}</td><td className="p-2">{item.resultCount} 条</td><td className="p-2">{item.durationMs} ms</td><td className="whitespace-nowrap p-2 font-mono text-xs">{item.ip}</td><td className="max-w-[28rem] whitespace-pre-wrap break-all p-2 align-top font-mono text-[11px]">{item.userAgent}</td></tr>)}</tbody></table></div>
			</section>

			<section className="rounded-xl border border-divider bg-surface p-5">
				<h2 className="mb-3 text-lg font-semibold">访问日志（最近 100 条）</h2>
				<div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-divider text-muted"><th className="p-2">时间</th><th className="p-2">路径</th><th className="p-2">状态</th><th className="p-2">IP</th><th className="p-2">User-Agent</th></tr></thead><tbody>{access.slice().reverse().slice(0, 100).map((item) => <tr key={item.id} className="border-b border-divider/60"><td className="p-2 whitespace-nowrap">{new Date(item.time).toLocaleString()}</td><td className="p-2">{item.path}</td><td className="p-2">{item.status}{item.blocked ? "（拦截）" : ""}</td><td className="whitespace-nowrap p-2 font-mono text-xs">{item.ip}</td><td className="max-w-[28rem] whitespace-pre-wrap break-all p-2 align-top font-mono text-[11px]">{item.userAgent}</td></tr>)}</tbody></table></div>
			</section>
		</div>
	);
}
