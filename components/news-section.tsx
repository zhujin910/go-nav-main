"use client";

import { useEffect, useState } from "react";
import { FiClock, FiExternalLink, FiRefreshCw } from "react-icons/fi";
import type { NewsItem, NewsSource } from "@/types";
import { clearNewsCache, fetchAllNews, formatRelativeTime } from "@/lib/client/news-fetcher";

function NewsCard({ item }: { item: NewsItem }) {
	return (
		<a href={item.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col overflow-hidden rounded-xl bg-surface shadow-sm transition hover:shadow-md">
			{item.image ? <div className="aspect-video overflow-hidden bg-surface-secondary"><img src={item.image} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" /></div> : null}
			<div className="flex flex-1 flex-col p-4">
				<div className="mb-2 flex items-center gap-2"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{item.sourceName}</span>{item.publishedAt ? <span className="flex items-center gap-1 text-xs text-muted"><FiClock className="size-3" />{formatRelativeTime(item.publishedAt)}</span> : null}</div>
				<h3 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">{item.title}</h3>
				{item.summary ? <p className="mt-2 line-clamp-2 text-xs text-muted">{item.summary}</p> : null}
			</div>
		</a>
	);
}

function NewsListItem({ item }: { item: NewsItem }) {
	return (
		<a href={item.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 border-b border-divider py-3 last:border-0 hover:bg-surface-hover">
			<div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2"><span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{item.sourceName}</span>{item.publishedAt ? <span className="text-[10px] text-muted">{formatRelativeTime(item.publishedAt)}</span> : null}</div><p className="line-clamp-1 text-sm font-medium group-hover:text-primary">{item.title}</p>{item.summary ? <p className="mt-1 line-clamp-1 text-xs text-muted">{item.summary}</p> : null}</div><FiExternalLink className="mt-1 size-4 shrink-0 text-muted opacity-0 transition group-hover:opacity-100" />
	</a>
	);
}

export function NewsSection({
	sources,
	title = "最新资讯",
	count = 6,
	refreshInterval = 30,
	layout = "card",
}: {
	sources: NewsSource[];
	title?: string;
	count?: number;
	refreshInterval?: number;
	layout?: "list" | "grid" | "card";
}) {
	const [news, setNews] = useState<NewsItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		fetchAllNews(sources).then((items) => {
			if (!cancelled) { setNews(items.slice(0, Math.max(1, count))); setLoading(false); }
		}).catch(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
	}, [sources, count, refreshKey]);

	useEffect(() => {
		if (refreshInterval <= 0) return;
		const timer = window.setInterval(() => { clearNewsCache(); setRefreshKey((key) => key + 1); }, refreshInterval * 60 * 1000);
		return () => window.clearInterval(timer);
	}, [refreshInterval]);

	return (
		<section className="mb-4">
			<div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button type="button" className="flex items-center gap-1 text-xs text-muted hover:text-primary" onClick={() => { clearNewsCache(); setRefreshKey((key) => key + 1); }} disabled={loading}><FiRefreshCw className={loading ? "animate-spin" : ""} />刷新</button></div>
			{loading ? <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: Math.min(Math.max(count, 1), 6) }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-xl bg-surface" />)}</div> : news.length === 0 ? <div className="rounded-xl bg-surface p-8 text-center text-sm text-muted">暂无资讯，请检查 RSS 源配置或网络连接</div> : layout === "list" ? <div className="rounded-xl bg-surface px-4">{news.map((item) => <NewsListItem key={item.id} item={item} />)}</div> : <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{news.map((item) => <NewsCard key={item.id} item={item} />)}</div>}
		</section>
	);
}
