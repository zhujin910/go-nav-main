"use client";

import type { NewsItem, NewsSource } from "@/types";

const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";
const STORAGE_KEY = "go-nav-news-cache";
const CACHE_DURATION = 30 * 60 * 1000;

interface CachedNews {
	items: NewsItem[];
	fetchedAt: number;
}

function stripHtml(value: unknown): string {
	return typeof value === "string"
		? value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
		: "";
}

async function fetchSingleSource(source: NewsSource): Promise<NewsItem[]> {
	if (source.enabled === false || !source.url.trim()) return [];
	try {
		const response = await fetch(`${RSS_PROXY}${encodeURIComponent(source.url)}`, {
			headers: { Accept: "application/json" },
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const data = (await response.json()) as {
			status?: string;
			items?: Array<Record<string, unknown>>;
		};
		if (data.status !== "ok" || !Array.isArray(data.items)) return [];
		return data.items.slice(0, 20).map((item, index) => ({
			id: `${source.id}-${index}-${String(item.pubDate ?? item.title ?? "")}`,
			title: stripHtml(item.title) || "未命名资讯",
			url: typeof item.link === "string" ? item.link : source.url,
			summary: stripHtml(item.description).slice(0, 200) || undefined,
			publishedAt: typeof item.pubDate === "string" ? item.pubDate : undefined,
			sourceName: source.name,
			sourceId: source.id,
			image:
				typeof item.thumbnail === "string"
					? item.thumbnail
					: typeof (item.enclosure as { link?: unknown } | undefined)?.link === "string"
						? (item.enclosure as { link: string }).link
						: undefined,
			tags: Array.isArray(item.categories)
				? item.categories.filter((tag): tag is string => typeof tag === "string")
				: undefined,
		}));
	} catch (error) {
		console.warn(`[news] 获取 ${source.name} 失败`, error);
		return [];
	}
}

export async function fetchAllNews(sources: NewsSource[]): Promise<NewsItem[]> {
	const enabledSources = sources.filter((source) => source.enabled !== false);
	if (enabledSources.length === 0) return [];
	const cached = getCachedNews();
	if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) return cached.items;
	const results = await Promise.all(enabledSources.map(fetchSingleSource));
	const items = results.flat().sort((a, b) => {
		const first = a.publishedAt ? Date.parse(a.publishedAt) : 0;
		const second = b.publishedAt ? Date.parse(b.publishedAt) : 0;
		return second - first;
	});
	saveCachedNews(items);
	return items;
}

function getCachedNews(): CachedNews | null {
	if (typeof window === "undefined") return null;
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		if (!value) return null;
		const cache = JSON.parse(value) as CachedNews;
		return Array.isArray(cache.items) && typeof cache.fetchedAt === "number" ? cache : null;
	} catch {
		return null;
	}
}

function saveCachedNews(items: NewsItem[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: items.slice(0, 100), fetchedAt: Date.now() } satisfies CachedNews));
	} catch {
		// 缓存不可用时不影响资讯展示。
	}
}

export function clearNewsCache(): void {
	if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}

export function formatRelativeTime(dateString?: string): string {
	if (!dateString) return "";
	const timestamp = Date.parse(dateString);
	if (Number.isNaN(timestamp)) return "";
	const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
	if (minutes < 1) return "刚刚";
	if (minutes < 60) return `${minutes} 分钟前`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} 小时前`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days} 天前`;
	return new Date(timestamp).toLocaleDateString("zh-CN");
}
