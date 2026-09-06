import { NextResponse } from "next/server";

type HotItem = { title: string; url: string; source: string };
type HotRow = { target?: { title?: string; url?: string }; title?: string; link?: string; url?: string };

export async function GET() {
	const sources: Array<{ name: string; url: string }> = [
		{ name: "知乎", url: "https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total" },
		{ name: "B站", url: "https://api.bilibili.com/x/web-interface/popular?ps=10" },
	];
	const results = await Promise.all(sources.map(async (source): Promise<HotItem[]> => {
		try {
			const response = await fetch(source.url, { next: { revalidate: 300 }, headers: { Accept: "application/json", "User-Agent": "GoNav/1.0" } });
			if (!response.ok) return [];
			const data = await response.json() as { data?: unknown };
			const rows = Array.isArray(data.data)
				? data.data as HotRow[]
				: ((data.data as { data?: HotRow[] } | undefined)?.data ?? []);
			return rows.slice(0, 10).flatMap((row) => { const title = row.target?.title || row.title; const url = row.target?.url || row.link || row.url; return title && url ? [{ title, url, source: source.name }] : []; });
		} catch { return []; }
	}));
	return NextResponse.json(results.flat().slice(0, 20));
}
