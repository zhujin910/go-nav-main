/**
 * 前端访问统计工具（基于 localStorage）
 * 适用于 HTML / Static / Server 所有模式
 */
import type { VisitRecord } from "@/types";

const STORAGE_KEY = "go-nav-analytics";
const MAX_RECORDS = 10000; // 最多保留记录数，防止 localStorage 溢出

/**
 * 获取所有访问记录
 */
export function getVisitRecords(): VisitRecord[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const data = JSON.parse(raw) as VisitRecord[];
		return Array.isArray(data) ? data : [];
	} catch {
		return [];
	}
}

/**
 * 保存访问记录
 */
export function saveVisitRecords(records: VisitRecord[]): void {
	if (typeof window === "undefined") return;
	try {
		// 只保留最近 MAX_RECORDS 条
		const trimmed = records.slice(-MAX_RECORDS);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
	} catch (e) {
		console.warn("[analytics] 保存访问记录失败:", e);
	}
}

/**
 * 记录一次网站访问
 */
export function trackVisit(
	url: string,
	title: string,
	categoryId?: string,
): void {
	const records = getVisitRecords();
	records.push({
		url,
		title,
		timestamp: new Date().toISOString(),
		categoryId,
	});
	// 清理过期记录
	const retentionDays = 90;
	const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
	const filtered = records.filter(
		(r) => new Date(r.timestamp).getTime() >= cutoff,
	);
	saveVisitRecords(filtered);
}

/**
 * 统计概览数据
 */
export interface AnalyticsOverview {
	totalVisits: number;
	todayVisits: number;
	weekVisits: number;
	uniqueSites: number;
	uniqueCategories: number;
}

export function getAnalyticsOverview(records: VisitRecord[]): AnalyticsOverview {
	const now = Date.now();
	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const weekStart = now - 7 * 24 * 60 * 60 * 1000;

	const todayVisits = records.filter(
		(r) => new Date(r.timestamp).getTime() >= todayStart.getTime(),
	).length;
	const weekVisits = records.filter(
		(r) => new Date(r.timestamp).getTime() >= weekStart,
	).length;

	const uniqueSites = new Set(records.map((r) => r.url)).size;
	const uniqueCategories = new Set(
		records.filter((r) => r.categoryId).map((r) => r.categoryId!),
	).size;

	return {
		totalVisits: records.length,
		todayVisits,
		weekVisits,
		uniqueSites,
		uniqueCategories,
	};
}

/**
 * 热门网站排行
 */
export interface TopSite {
	url: string;
	title: string;
	visitCount: number;
	lastVisit: string;
}

export function getTopSites(
	records: VisitRecord[],
	limit = 10,
): TopSite[] {
	const map = new Map<string, { title: string; count: number; last: string }>();
	for (const r of records) {
		const existing = map.get(r.url);
		if (existing) {
			existing.count++;
			if (new Date(r.timestamp) > new Date(existing.last)) {
				existing.last = r.timestamp;
			}
		} else {
			map.set(r.url, {
				title: r.title,
				count: 1,
				last: r.timestamp,
			});
		}
	}
	return Array.from(map.entries())
		.map(([url, data]) => ({
			url,
			title: data.title,
			visitCount: data.count,
			lastVisit: data.last,
		}))
		.sort((a, b) => b.visitCount - a.visitCount)
		.slice(0, limit);
}

/**
 * 按天统计访问量（最近 N 天）
 */
export interface DailyVisit {
	date: string; // YYYY-MM-DD
	count: number;
}

export function getDailyVisits(
	records: VisitRecord[],
	days = 14,
): DailyVisit[] {
	const result: DailyVisit[] = [];
	const now = new Date();
	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(now);
		date.setDate(date.getDate() - i);
		date.setHours(0, 0, 0, 0);
		const dateStr = date.toISOString().slice(0, 10);
		const nextDate = new Date(date);
		nextDate.setDate(nextDate.getDate() + 1);
		const count = records.filter((r) => {
			const t = new Date(r.timestamp).getTime();
			return t >= date.getTime() && t < nextDate.getTime();
		}).length;
		result.push({ date: dateStr, count });
	}
	return result;
}

/**
 * 清空所有统计数据
 */
export function clearAnalytics(): void {
	if (typeof window === "undefined") return;
	localStorage.removeItem(STORAGE_KEY);
}