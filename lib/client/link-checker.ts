"use client";

import type { LinkCheckResult, NavCategory, NavSite } from "@/types";

const STORAGE_KEY = "go-nav-link-check-results";

type CategorizedSite = NavSite & { categoryId: string; categoryName: string };

function resolveUrl(rawUrl: string): string {
	const value = rawUrl.trim();
	if (/^(https?:|\/)/i.test(value)) return value;
	return `https://${value}`;
}

export function flattenSites(categories: NavCategory[]): CategorizedSite[] {
	const result: CategorizedSite[] = [];
	const walk = (items: NavCategory[]) => {
		for (const category of items) {
			for (const site of category.sites ?? []) {
				result.push({
					...site,
					categoryId: category.id,
					categoryName: category.name,
				});
			}
			walk(category.children ?? []);
		}
	};
	walk(categories);
	return result;
}

export async function checkSingleLink(
	url: string,
	timeout = 8000,
): Promise<Pick<LinkCheckResult, "status" | "statusCode" | "responseTime" | "error">> {
	const startedAt = Date.now();

	try {
		const response = await fetch("/api/link-check", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ url: resolveUrl(url), timeout }),
		});
		const data = (await response.json()) as Pick<
			LinkCheckResult,
			"status" | "statusCode" | "responseTime" | "error"
		>;
		if (!response.ok) throw new Error(data.error || "检测请求失败");
		return {
			...data,
			responseTime: data.responseTime ?? Date.now() - startedAt,
		};
	} catch (error) {
		return {
			status: "failed",
			responseTime: Date.now() - startedAt,
			error: error instanceof Error ? error.message : "网络请求失败",
		};
	}
}

export async function checkAllLinks(
	sites: CategorizedSite[],
	options: {
		timeout?: number;
		concurrency?: number;
		onProgress?: (checked: number, total: number) => void;
	} = {},
): Promise<LinkCheckResult[]> {
	const timeout = options.timeout ?? 8000;
	const concurrency = Math.max(1, Math.min(Math.floor(options.concurrency ?? 3), 10));
	const results: LinkCheckResult[] = [];
	let nextIndex = 0;
	let checked = 0;

	const worker = async () => {
		while (nextIndex < sites.length) {
			const site = sites[nextIndex++];
			if (!site) return;
			const result = await checkSingleLink(site.url, timeout);
			results.push({
				url: site.url,
				title: site.title,
				...result,
				checkedAt: new Date().toISOString(),
				categoryId: site.categoryId,
				categoryName: site.categoryName,
			});
			options.onProgress?.(++checked, sites.length);
		}
	};

	await Promise.all(Array.from({ length: Math.min(concurrency, sites.length) }, worker));
	saveCheckResults(results);
	return results;
}

export function saveCheckResults(results: LinkCheckResult[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
	} catch {
		// localStorage 不可用时不影响当前检测结果展示。
	}
}

export function loadCheckResults(): LinkCheckResult[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as LinkCheckResult[]) : [];
	} catch {
		return [];
	}
}

export function getBrokenLinks(results: LinkCheckResult[]): LinkCheckResult[] {
	return results.filter((result) => result.status === "failed" || result.status === "timeout");
}

export function clearCheckResults(): void {
	if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}
