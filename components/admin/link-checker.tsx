"use client";

import { Button, Card, Chip, Input, toast } from "@heroui/react";
import { useEffect, useState } from "react";
import {
	FiAlertTriangle,
	FiCheckCircle,
	FiClock,
	FiGlobe,
	FiRefreshCw,
	FiTrash2,
	FiXCircle,
} from "react-icons/fi";
import { useAtom, useAtomValue } from "jotai";
import type { LinkCheckResult, NavCategory } from "@/types";
import { linkCheckAtom } from "@/lib/store/site";
import {
	checkAllLinks,
	checkSingleLink,
	clearCheckResults,
	flattenSites,
	getBrokenLinks,
	loadCheckResults,
	saveCheckResults,
} from "@/lib/client/link-checker";
import { categoriesAtom as adminCategoriesAtom } from "@/lib/store/admin";

function removeSitesByUrl(
	categories: NavCategory[],
	urls: Set<string>,
): NavCategory[] {
	return categories.map((category) => ({
		...category,
		sites: (category.sites ?? []).filter((site) => !urls.has(site.url.trim().toLowerCase())),
		children: category.children ? removeSitesByUrl(category.children, urls) : category.children,
	}));
}

function updateSiteUrl(
	categories: NavCategory[],
	oldUrl: string,
	newUrl: string,
): NavCategory[] {
	const target = oldUrl.trim().toLowerCase();
	return categories.map((category) => ({
		...category,
		sites: (category.sites ?? []).map((site) =>
			site.url.trim().toLowerCase() === target ? { ...site, url: newUrl } : site,
		),
		children: category.children
			? updateSiteUrl(category.children, oldUrl, newUrl)
			: category.children,
	}));
}

const statusMeta = {
	ok: { label: "正常", color: "success", icon: FiCheckCircle },
	failed: { label: "失效", color: "danger", icon: FiXCircle },
	timeout: { label: "超时", color: "warning", icon: FiClock },
	unknown: { label: "未知", color: "default", icon: FiAlertTriangle },
} as const;

function StatusBadge({ status }: { status: LinkCheckResult["status"] }) {
	const meta = statusMeta[status];
	const Icon = meta.icon;
	return (
		<Chip size="sm" color={meta.color} variant="soft">
			<Icon className="mr-1 size-3" />
			{meta.label}
		</Chip>
	);
}

export function LinkChecker() {
	const [categories, setCategories] = useAtom(adminCategoriesAtom);
	const config = useAtomValue(linkCheckAtom);
	const [results, setResults] = useState<LinkCheckResult[]>([]);
	const [isChecking, setIsChecking] = useState(false);
	const [progress, setProgress] = useState({ checked: 0, total: 0 });
	const [selectedBrokenUrls, setSelectedBrokenUrls] = useState<Set<string>>(new Set());
	const [editingUrls, setEditingUrls] = useState<Record<string, string>>({});
	const [repairingUrl, setRepairingUrl] = useState<string | null>(null);

	useEffect(() => setResults(loadCheckResults()), []);

	const sites = flattenSites(categories);
	const brokenLinks = getBrokenLinks(results);
	const okCount = results.filter((result) => result.status === "ok").length;

	const handleStartCheck = async () => {
		setIsChecking(true);
		setProgress({ checked: 0, total: sites.length });
		try {
			const checked = await checkAllLinks(sites, {
				timeout: config.timeout,
				concurrency: config.concurrency,
				onProgress: (checkedCount, total) =>
					setProgress({ checked: checkedCount, total }),
			});
			setResults(checked);
			setSelectedBrokenUrls(new Set());
		} finally {
			setIsChecking(false);
		}
	};

	const toggleBrokenUrl = (url: string, checked: boolean) => {
		setSelectedBrokenUrls((current) => {
			const next = new Set(current);
			if (checked) next.add(url.trim().toLowerCase());
			else next.delete(url.trim().toLowerCase());
			return next;
		});
	};

	const deleteSelectedBroken = () => {
		if (selectedBrokenUrls.size === 0) return;
		if (!window.confirm(`确定从网址管理中删除选中的 ${selectedBrokenUrls.size} 个失效链接吗？`)) return;
		setCategories(removeSitesByUrl(categories, selectedBrokenUrls));
		const remaining = results.filter(
			(result) => !selectedBrokenUrls.has(result.url.trim().toLowerCase()),
		);
		saveCheckResults(remaining);
		setResults(remaining);
		setSelectedBrokenUrls(new Set());
	};

	const repairLink = async (link: LinkCheckResult, suggestedUrl?: string) => {
		const oldUrl = link.url.trim().toLowerCase();
		let candidate = suggestedUrl?.trim() || editingUrls[oldUrl]?.trim();
		setRepairingUrl(oldUrl);
		try {
			if (!candidate) {
				const response = await fetch("/api/link-check/repair", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(link),
				});
				const data = (await response.json()) as { url?: string; error?: string };
				if (!response.ok || !data.url) throw new Error(data.error || "AI 未返回可用地址");
				candidate = data.url;
			}
			const checked = await checkSingleLink(candidate, config.timeout);
			if (checked.status !== "ok") {
				throw new Error(`新地址验证失败：${checked.error || checked.status}`);
			}
			setCategories(updateSiteUrl(categories, link.url, candidate));
			const nextResults = results.map((result) =>
				result.url.trim().toLowerCase() === oldUrl
					? { ...result, url: candidate!, ...checked, checkedAt: new Date().toISOString() }
					: result,
			);
			saveCheckResults(nextResults);
			setResults(nextResults);
			setEditingUrls((current) => ({ ...current, [oldUrl]: candidate! }));
			toast.success(`“${link.title}”已验证并更新到网址管理`);
		} catch (error) {
			toast.warning(error instanceof Error ? error.message : "链接修复失败");
		} finally {
			setRepairingUrl(null);
		}
	};

	const handleClear = () => {
		if (!window.confirm("确定要清空检测结果吗？")) return;
		clearCheckResults();
		setResults([]);
	};

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6">
			<div className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div className="mb-2 flex items-center gap-2 text-primary">
						<FiGlobe className="size-5" />
						<span className="text-sm font-semibold">站点维护</span>
					</div>
					<h1 className="text-2xl font-semibold tracking-tight">链接有效性检测</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						批量检查网站地址是否可访问，共 {sites.length} 个网站。
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="primary"
						isDisabled={isChecking || sites.length === 0}
						onPress={handleStartCheck}
					>
						<FiRefreshCw className={isChecking ? "size-4 animate-spin" : "size-4"} />
						{isChecking ? "检测中..." : "开始检测"}
					</Button>
					{results.length > 0 ? (
						<Button variant="danger-soft" onPress={handleClear}>
							<FiTrash2 className="size-4" />清空结果
						</Button>
					) : null}
				</div>
			</div>

			{isChecking ? (
				<Card className="border border-divider p-5 shadow-sm">
					<div className="mb-2 flex justify-between text-sm"><span>正在检测...</span><span>{progress.checked} / {progress.total}</span></div>
					<div className="h-2 overflow-hidden rounded-full bg-default-200"><div className="h-full bg-primary transition-all" style={{ width: `${progress.total ? (progress.checked / progress.total) * 100 : 0}%` }} /></div>
				</Card>
			) : null}

			{results.length > 0 ? (
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{[
						["已检测", results.length, ""],
						["正常", okCount, "text-success"],
						["失效/超时", brokenLinks.length, "text-danger"],
						["正常率", `${Math.round((okCount / results.length) * 100)}%`, "text-primary"],
					].map(([label, value, className]) => (
						<Card key={String(label)} className="border border-divider p-4 text-center shadow-sm"><p className="text-sm text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-bold ${className}`}>{value}</p></Card>
					))}
				</div>
			) : null}

			{brokenLinks.length > 0 ? (
				<Card className="border border-danger/30 bg-danger-soft/30 p-5 shadow-sm">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<h2 className="flex items-center gap-2 text-lg font-semibold text-danger"><FiAlertTriangle />失效链接（{brokenLinks.length}）</h2>
						<div className="flex flex-wrap gap-2">
							<Button variant="secondary" onPress={() => setSelectedBrokenUrls(new Set(brokenLinks.map((link) => link.url.trim().toLowerCase())))}>全选失效链接</Button>
							<Button variant="danger" isDisabled={selectedBrokenUrls.size === 0} onPress={deleteSelectedBroken}><FiTrash2 className="size-4" />删除选中并同步网址管理（{selectedBrokenUrls.size}）</Button>
						</div>
					</div>
					<div className="divide-y divide-danger/10">
						{brokenLinks.map((link) => (
							<div key={`${link.url}-${link.checkedAt}`} className="grid gap-3 py-3 md:grid-cols-[auto_auto_minmax(0,1fr)_auto] md:items-center"><input type="checkbox" checked={selectedBrokenUrls.has(link.url.trim().toLowerCase())} onChange={(event) => toggleBrokenUrl(link.url, event.target.checked)} aria-label={`选择删除${link.title}`} className="size-4 accent-red-600" /><StatusBadge status={link.status} /><div className="min-w-0"><p className="truncate font-medium">{link.title}</p><p className="truncate text-xs text-muted-foreground">{link.url}</p><p className="text-xs text-danger">{link.error}</p><Input value={editingUrls[link.url.trim().toLowerCase()] ?? ""} onChange={(event) => setEditingUrls((current) => ({ ...current, [link.url.trim().toLowerCase()]: event.target.value }))} placeholder="输入正确网址，或使用 AI 修复" /></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" isDisabled={repairingUrl !== null} onPress={() => void repairLink(link)}>AI 修复</Button><Button size="sm" variant="primary" isDisabled={!editingUrls[link.url.trim().toLowerCase()]?.trim() || repairingUrl !== null} onPress={() => void repairLink(link)}>验证并更新</Button><span className="self-center text-xs text-muted-foreground">{link.categoryName}</span></div></div>
						))}
					</div>
				</Card>
			) : null}

			<Card className="border border-divider shadow-sm">
				<div className="border-b border-divider p-5"><h2 className="text-lg font-semibold">全部检测结果</h2></div>
				{results.length === 0 ? (
					<div className="p-12 text-center text-muted-foreground"><FiGlobe className="mx-auto mb-3 size-10" /><p>暂无检测结果，点击“开始检测”开始批量检查。</p></div>
				) : (
					<div className="max-h-[520px] divide-y overflow-y-auto">
						{results.map((link) => (
							<div key={`${link.url}-${link.checkedAt}`} className="flex items-center gap-3 px-5 py-3"><StatusBadge status={link.status} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{link.title}</p><p className="truncate text-xs text-muted-foreground">{link.url}</p></div>{link.responseTime !== undefined ? <span className="shrink-0 text-xs text-muted-foreground">{link.responseTime} ms</span> : null}</div>
						))}
					</div>
				)}
			</Card>
			<p className="text-xs text-muted-foreground">提示：检测请求由服务端发起；删除选中的失效链接后，请点击后台顶部“保存”将变更写入网址管理。</p>
		</div>
	);
}
