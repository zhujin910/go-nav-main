"use client";

import { memo } from "react";
import { useSiteLinkMode } from "@/lib/client/site-link";
import type { SiteGridProps } from "./site-card.types";
import { SiteCard } from "./site-card-item";
import { useSiteGridBatch } from "./use-site-grid-batch";

export const SiteGrid = memo(function SiteGrid({
	sites,
	cards,
	trackVisit = true,
	categoryId,
	layout,
	isSubcategory = false,
}: SiteGridProps) {
	const siteLinkMode = useSiteLinkMode();
	const { containerRef, total, visibleKeys, visibleSites } = useSiteGridBatch(sites);
	if (total === 0) return null;

	const effectiveCardHeight =
		layout?.cardStyle === "preview" ? `calc(${cards.height} * 2)` : cards.height;
	const columns =
		isSubcategory && layout?.subcategoryColumns && layout.subcategoryColumns > 0
			? layout.subcategoryColumns
			: null;
	const maxRows =
		isSubcategory && layout?.subcategoryMaxRows && layout.subcategoryMaxRows > 0
			? layout.subcategoryMaxRows
			: null;
	const maxItems =
		maxRows && columns ? maxRows * columns : null;
	const displayedSites = maxItems ? visibleSites.slice(0, maxItems) : visibleSites;
	const displayedKeys = maxItems ? visibleKeys.slice(0, maxItems) : visibleKeys;

	return (
		<div
			ref={containerRef}
			className="site-card-grid-shell"
			style={{ padding: `8px ${cards.padding}` }}
		>
			<div
				className={`site-card-grid grid gap-3 ${isSubcategory ? "site-card-grid--subcategory" : ""}`}
				style={{
					gridTemplateColumns: columns
						? `repeat(${columns}, minmax(0, 1fr))`
						: `repeat(auto-fill, minmax(${cards.minWidth}, 1fr))`,
					gridAutoRows: `minmax(${effectiveCardHeight}, auto)`,
				}}
			>
				{displayedSites.map((site, index) => (
					<SiteCard
						key={displayedKeys[index]}
						site={site}
						trackVisit={trackVisit}
						categoryId={categoryId}
						layout={layout}
						siteLinkMode={siteLinkMode}
					/>
				))}
			</div>
		</div>
	);
});
