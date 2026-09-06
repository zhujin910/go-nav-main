"use client";

import type { NavSite, VisitRecord } from "@/types";
import { getTopSites, getVisitRecords } from "./analytics";

interface ScoredSite {
	site: NavSite;
	score: number;
}

function tagSimilarity(first: NavSite, second: NavSite): number {
	const firstTags = new Set(first.tags ?? []);
	const secondTags = new Set(second.tags ?? []);
	if (firstTags.size === 0 || secondTags.size === 0) return 0;
	let common = 0;
	for (const tag of firstTags) {
		if (secondTags.has(tag)) common++;
	}
	return common / Math.min(firstTags.size, secondTags.size);
}

function scoreByTags(
	allSites: NavSite[],
	records: VisitRecord[],
	visitedUrls: Set<string>,
): ScoredSite[] {
	const tagFrequency = new Map<string, number>();
	for (const site of allSites) {
		if (!visitedUrls.has(site.url)) continue;
		for (const tag of site.tags ?? []) {
			tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
		}
	}
	const preferredTags = new Set(
		Array.from(tagFrequency.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([tag]) => tag),
	);
	if (preferredTags.size === 0) return [];

	return allSites
		.filter((site) => !visitedUrls.has(site.url))
		.map((site) => {
			const matched = (site.tags ?? []).filter((tag) => preferredTags.has(tag));
			return { site, score: matched.length * 5 };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score);
}

function scoreByHistory(
	allSites: NavSite[],
	records: VisitRecord[],
	visitedUrls: Set<string>,
): ScoredSite[] {
	const visitedSites = allSites.filter((site) => visitedUrls.has(site.url));
	const topSites = getTopSites(records, 5);

	return allSites
		.filter((site) => !visitedUrls.has(site.url))
		.map((site) => {
			let score = 0;
			for (const visited of visitedSites) {
				score += tagSimilarity(site, visited) * 10;
			}
			for (const top of topSites) {
				const topSite = visitedSites.find((site) => site.url === top.url);
				if (topSite) score += tagSimilarity(site, topSite) * top.visitCount * 0.5;
			}
			return { site, score };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score);
}

function scoreByPopular(
	allSites: NavSite[],
	records: VisitRecord[],
	visitedUrls: Set<string>,
): ScoredSite[] {
	const counts = new Map(getTopSites(records, 50).map((item) => [item.url, item.visitCount]));
	return allSites
		.filter((site) => !visitedUrls.has(site.url))
		.map((site) => ({ site, score: counts.get(site.url) ?? 0 }))
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score);
}

export function getRecommendations(
	allSites: NavSite[],
	algorithm: "hybrid" | "tags" | "popular" = "hybrid",
	count = 6,
	coldStartUrls: string[] = [],
): NavSite[] {
	const limit = Math.max(1, Math.min(Math.floor(count), 50));
	const records = getVisitRecords();
	const visitedUrls = new Set(records.map((record) => record.url));

	if (records.length < 3) {
		const coldStart = coldStartUrls
			.map((url) => allSites.find((site) => site.url === url))
			.filter((site): site is NavSite => Boolean(site));
			if (coldStart.length > 0) return coldStart.slice(0, limit);
			return [...allSites].sort(() => Math.random() - 0.5).slice(0, limit);
	}

	const scored = new Map<string, ScoredSite>();
	const merge = (items: ScoredSite[], weight: number) => {
		for (const item of items) {
			const current = scored.get(item.site.url);
			if (current) current.score += item.score * weight;
			else scored.set(item.site.url, { ...item, score: item.score * weight });
		}
	};

	if (algorithm === "tags" || algorithm === "hybrid") {
		merge(scoreByTags(allSites, records, visitedUrls), algorithm === "hybrid" ? 0.8 : 1);
	}
	if (algorithm === "popular" || algorithm === "hybrid") {
		merge(scoreByPopular(allSites, records, visitedUrls), algorithm === "hybrid" ? 0.3 : 1);
	}
	if (algorithm === "hybrid") {
		merge(scoreByHistory(allSites, records, visitedUrls), 1);
	}

	const recommendations = Array.from(scored.values())
		.sort((a, b) => b.score - a.score)
		.map((item) => item.site);
	const selected = new Set(recommendations.map((site) => site.url));
	const remaining = allSites.filter(
		(site) => !visitedUrls.has(site.url) && !selected.has(site.url),
	);
	return recommendations
		.concat([...remaining].sort(() => Math.random() - 0.5))
		.slice(0, limit);
}
