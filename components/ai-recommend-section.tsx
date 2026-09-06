"use client";

import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import type { LayoutConfig, NavSite } from "@/types";
import { getRecommendations } from "@/lib/client/ai-recommend";
import { SiteGrid } from "./site-card";
import type { CardGridModel } from "./layout.types";

interface AIRecommendSectionProps {
	allSites: NavSite[];
	title?: string;
	count?: number;
	algorithm?: "hybrid" | "tags" | "popular";
	coldStartUrls?: string[];
	cardGrid: CardGridModel;
	layout: Required<LayoutConfig>;
}

export function AIRecommendSection({
	allSites,
	title = "为你推荐",
	count = 6,
	algorithm = "hybrid",
	coldStartUrls = [],
	cardGrid,
	layout,
}: AIRecommendSectionProps) {
	const [recommendations, setRecommendations] = useState<NavSite[]>([]);

	useEffect(() => {
		setRecommendations(
			getRecommendations(allSites, algorithm, count, coldStartUrls),
		);
	}, [allSites, algorithm, count, coldStartUrls]);

	if (recommendations.length === 0) return null;

	return (
		<section className="mb-4" aria-labelledby="ai-recommend-title">
			<div className="mb-3 flex items-center gap-2">
				<div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<FiStar className="size-4" />
				</div>
				<h2 id="ai-recommend-title" className="text-lg font-bold">
					{title}
				</h2>
				<span className="text-xs text-muted">基于你的访问偏好</span>
			</div>
			<SiteGrid
				sites={recommendations}
				cards={cardGrid}
				layout={layout}
			/>
		</section>
	);
}
