"use client";

import { Button, Card, Input, TextArea } from "@heroui/react";
import { useMemo, useState } from "react";
import { FiCheck, FiDownload, FiImage, FiLoader, FiMaximize2, FiTrash2, FiX } from "react-icons/fi";
import { useAtom } from "jotai";
import type { NavCategory, NavSite, SiteImportCandidate } from "@/types";
import { categoriesAtom } from "@/lib/store/admin";

interface WebsiteInfoResponse { title?: string; description?: string; keywords?: string[]; iconUrl?: string | null; previewImage?: string | null; }

function flattenCategories(categories: NavCategory[]): NavCategory[] {
	const result: NavCategory[] = [];
	const walk = (items: NavCategory[]) => { for (const item of items) { result.push(item); walk(item.children ?? []); } };
	walk(categories);
	return result;
}

function categoryOptions(categories: NavCategory[]) {
	const result: Array<{ category: NavCategory; level: number; parentName?: string }> = [];
	const walk = (items: NavCategory[], level: number, parentName?: string) => { for (const category of items) { result.push({ category, level, parentName }); walk(category.children ?? [], level + 1, category.name); } };
	walk(categories, 0);
	return result;
}

function normalizeUrl(value: string) { const trimmed = value.trim(); return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`; }
function parseInput(value: string) {
	return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
		const parts = line.split(/\s*[|,\t]\s*/);
		const rawUrl = parts.find((part) => /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(part)) ?? parts.at(-1) ?? "";
		const url = normalizeUrl(rawUrl);
		return { title: parts.length > 1 ? parts.filter((part) => part !== rawUrl).join(" ").trim() : new URL(url).hostname, url };
	});
}
function guessCategory(candidate: SiteImportCandidate, categories: NavCategory[]) {
	const text = `${candidate.title} ${candidate.description ?? ""} ${(candidate.tags ?? []).join(" ")}`.toLowerCase();
	return flattenCategories(categories).find((category) => text.includes(category.name.toLowerCase()));
}
function updateCandidate(items: SiteImportCandidate[], index: number, patch: Partial<SiteImportCandidate>) { return items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item); }
function appendToCategory(categories: NavCategory[], categoryId: string, sites: SiteImportCandidate[]): NavCategory[] {
	return categories.map((category) => {
		if (category.id === categoryId) {
			const existing = new Set((category.sites ?? []).map((site) => site.url));
			const additions: NavSite[] = sites.filter((site) => !existing.has(site.url)).map(({ categoryId: _id, categoryName: _name, selected: _selected, importError: _error, ...site }) => site);
			return { ...category, sites: [...(category.sites ?? []), ...additions] };
		}
		return { ...category, children: category.children ? appendToCategory(category.children, categoryId, sites) : category.children };
	});
}
function ensureCategory(categories: NavCategory[]) {
	return categories.length > 0 ? categories : [{ id: `import-${Date.now()}`, name: "批量导入", sites: [] }];
}

export function SiteImportReview() {
	const [categories, setCategories] = useAtom(categoriesAtom);
	const [sourceText, setSourceText] = useState("");
	const [candidates, setCandidates] = useState<SiteImportCandidate[]>([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const options = useMemo(() => categoryOptions(categories), [categories]);

	const importSites = async () => {
		const parsed = parseInput(sourceText);
		if (!parsed.length) { setMessage("请先输入网站名称和 URL"); return; }
		setLoading(true); setMessage("");
		const imported: SiteImportCandidate[] = [];
		for (const item of parsed) {
			let candidate: SiteImportCandidate = { title: item.title, url: item.url, description: "", selected: true };
			try {
				const response = await fetch("/api/fetch-website/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: item.url, fetchIcon: true }) });
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const data = (await response.json()) as WebsiteInfoResponse;
				candidate = { ...candidate, title: data.title || item.title, description: data.description || "", icon: data.iconUrl || undefined, previewImage: data.previewImage || undefined, tags: data.keywords ?? [] };
			} catch (error) {
				candidate.importError = error instanceof Error ? error.message : "抓取失败";
			}
			if (!candidate.previewImage) {
				try {
					const response = await fetch("/api/tools/capturePreview/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: item.url }) });
					if (response.ok) { const data = (await response.json()) as { url?: string }; candidate.previewImage = data.url; }
				} catch { /* 预览图失败不阻断审核 */ }
			}
			const category = guessCategory(candidate, categories) ?? flattenCategories(categories)[0];
			imported.push({ ...candidate, categoryId: category?.id, categoryName: category?.name });
		}
		setCandidates(imported); setLoading(false);
	};

	const approve = () => {
		const nextCategories = ensureCategory(categories);
		const fallback = flattenCategories(nextCategories)[0];
		const selected = candidates.filter((item) => item.selected).map((item) => ({ ...item, categoryId: item.categoryId ?? fallback?.id })).filter((item) => item.categoryId);
		const grouped = new Map<string, SiteImportCandidate[]>();
		for (const item of selected) grouped.set(item.categoryId!, [...(grouped.get(item.categoryId!) ?? []), item]);
		let updated = nextCategories;
		for (const [id, sites] of grouped) updated = appendToCategory(updated, id, sites);
		setCategories(updated); setCandidates((items) => items.filter((item) => !item.selected));
		setMessage(`已添加 ${selected.length} 个网站，请点击后台顶部“保存”。`);
	};

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6">
			<div className="border-b border-divider pb-5"><h1 className="text-2xl font-semibold">批量导入与审核</h1><p className="mt-1 text-sm text-muted-foreground">输入网址后自动抓取标题、描述、图标和网页截图，审核后批量添加到分类。</p></div>
			<Card className="border border-divider p-5 shadow-sm"><label className="text-sm font-medium">批量输入</label><p className="mt-1 text-xs text-muted-foreground">每行一条：网站名称 | https://example.com，也支持只填写网址。</p><TextArea className="mt-3" value={sourceText} onChange={(event) => setSourceText(event.target.value)} placeholder="OpenAI | https://openai.com" rows={8} /><div className="mt-4 flex items-center gap-3"><Button variant="primary" isDisabled={loading} onPress={importSites}>{loading ? <FiLoader className="size-4 animate-spin" /> : <FiDownload className="size-4" />}{loading ? "抓取中..." : "抓取并预审"}</Button>{message ? <span className="text-sm text-success">{message}</span> : null}</div></Card>
			{candidates.length > 0 ? <Card className="border border-divider shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider p-5"><div><h2 className="text-lg font-semibold">待审核网站（{candidates.length}）</h2><p className="mt-1 text-xs text-muted-foreground">确认资料、预览图和分类后再批量添加。</p></div><Button variant="primary" onPress={approve}><FiCheck className="size-4" />审核通过并添加</Button></div><div className="divide-y divide-divider">{candidates.map((candidate, index) => <div key={`${candidate.url}-${index}`} className="flex flex-col gap-4 p-5 lg:flex-row"><label className="flex items-start lg:w-8"><input type="checkbox" checked={candidate.selected !== false} onChange={(event) => setCandidates((items) => updateCandidate(items, index, { selected: event.target.checked }))} className="mt-1 size-4 accent-blue-600" /></label><div className="flex w-full gap-3 lg:w-80"><div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-default-100">{candidate.previewImage ? <button type="button" className="group size-full" onClick={() => setPreviewUrl(candidate.previewImage ?? null)} aria-label="放大预览图"><img src={candidate.previewImage} alt={candidate.title} className="size-full object-cover transition group-hover:scale-105" /><span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white opacity-0 transition group-hover:opacity-100"><FiMaximize2 /></span></button> : candidate.icon ? <img src={candidate.icon} alt="" className="size-10 object-contain" /> : <FiImage className="m-auto size-8 text-default-400" />}</div><div className="min-w-0"><p className="truncate font-medium">{candidate.title}</p><p className="truncate text-xs text-muted-foreground">{candidate.url}</p><p className="mt-2 text-xs text-muted-foreground">{candidate.previewImage ? "点击图片放大" : "未获取到预览图"}</p></div></div><div className="min-w-0 flex-1 space-y-3"><Input value={candidate.title} onChange={(event) => setCandidates((items) => updateCandidate(items, index, { title: event.target.value }))} placeholder="网站名称" /><Input value={candidate.description ?? ""} onChange={(event) => setCandidates((items) => updateCandidate(items, index, { description: event.target.value }))} placeholder="网站描述" /><div className="flex flex-col gap-2 sm:flex-row"><select value={candidate.categoryId ?? ""} onChange={(event) => { const option = options.find((item) => item.category.id === event.target.value); setCandidates((items) => updateCandidate(items, index, { categoryId: option?.category.id, categoryName: option?.category.name })); }} className="h-9 min-w-56 rounded-lg border border-default-200 bg-background px-3 text-sm"><option value="">请选择分类</option>{options.map(({ category, level, parentName }) => <option key={category.id} value={category.id}>{level === 0 ? `主类目：${category.name}` : `　└ 子类目：${category.name}${parentName ? `（${parentName}）` : ""}`}</option>)}</select><Input value={candidate.previewImage ?? ""} onChange={(event) => setCandidates((items) => updateCandidate(items, index, { previewImage: event.target.value }))} placeholder="预览图地址" /></div>{candidate.importError ? <p className="text-xs text-danger">抓取提示：{candidate.importError}</p> : null}</div><Button variant="danger-soft" isIconOnly aria-label="删除候选项" onPress={() => setCandidates((items) => items.filter((_, itemIndex) => itemIndex !== index))}><FiTrash2 className="size-4" /></Button></div>)}</div></Card> : null}
			{previewUrl ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-5" role="dialog" aria-modal="true" onClick={() => setPreviewUrl(null)}><div className="relative max-h-[90vh] max-w-[90vw]" onClick={(event) => event.stopPropagation()}><img src={previewUrl} alt="预览图大图" className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl" /><button type="button" aria-label="关闭预览" className="absolute -right-3 -top-3 flex size-9 items-center justify-center rounded-full bg-white text-zinc-800 shadow" onClick={() => setPreviewUrl(null)}><FiX /></button></div></div> : null}
		</div>
	);
}
