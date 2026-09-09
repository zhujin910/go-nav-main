"use client";

import type { AdConfig, LayoutConfig } from "@/types";
import { AdBanner } from "../ad-banner";
import { HeroBanner } from "../hero-banner";
import { CategorySection } from "../category-section";
import { RecentVisits } from "../recent-visits";
import { PageEmptyState } from "../ui/empty-state-blocks";
import { NewsSection } from "../news-section";
import { SiteWidgets } from "../site-widgets";
import type { AppLayoutViewModel } from "./app-layout.types";
import {
	heroBannerAtom,
	newsAggregationAtom,
} from "@/lib/store/site";
import { useAtomValue } from "jotai";

export function AppLayoutHomeContent({
	displayCategories,
	layout,
	recentVisitsMax,
	showRecentVisits,
	disableRecentVisitsEntrance,
	cardGrid,
	categorySectionView,
	sectionsStyle,
	ads,
	adsAspectRatio,
	adsGap,
	adsVisibleCount,
	autoplayInterval,
	showHomeAds,
}: Pick<
	AppLayoutViewModel,
	"displayCategories" | "cardGrid" | "categorySectionView" | "sectionsStyle"
> & {
	layout: Required<LayoutConfig>;
	recentVisitsMax: number;
	showRecentVisits: boolean;
	disableRecentVisitsEntrance: boolean;
	ads: AdConfig[];
	adsAspectRatio?: string;
	adsGap: number;
	adsVisibleCount: number;
	autoplayInterval: number;
	showHomeAds: boolean;
}) {
	const heroBanner = useAtomValue(heroBannerAtom);
	const newsConfig = useAtomValue(newsAggregationAtom);
	const homeTheme = layout.homeTheme ?? "classic";
	const hero = heroBanner.enabled && heroBanner.slides.length > 0 ? (
		<HeroBanner
			slides={heroBanner.slides}
			height={heroBanner.height}
			autoplayInterval={heroBanner.autoplayInterval}
		/>
	) : null;
	const homeAds =
		showHomeAds && ads.length > 0 ? (
			<section
				aria-label="推荐广告"
				className="mb-2 w-full"
				style={{ paddingBottom: "8px" }}
			>
				<AdBanner
					ads={ads}
					aspectRatio={adsAspectRatio ?? "16/9"}
					gap={adsGap}
					visibleCount={adsVisibleCount}
					autoplayInterval={autoplayInterval}
					cardStyle={layout.cardStyle}
					placement="home-top"
				/>
			</section>
		) : null;
	const heroShellClass =
		homeTheme === "portal" || homeTheme === "resource"
			? "site-home-hero-grid"
			: homeTheme === "editorial" ||
				homeTheme === "showcase" ||
				homeTheme === "spotlight" ||
				homeTheme === "glass" ||
				homeTheme === "glass-aurora" ||
				homeTheme === "glass-ice" ||
				homeTheme === "glass-frost" ||
				homeTheme === "glass-tech" ||
				homeTheme === "glass-luxury" ||
				homeTheme === "glass-minimal"
				? "site-home-hero-stack site-home-hero-stack--editorial"
				: "site-home-hero-stack";
	const news = newsConfig.enabled && newsConfig.showOnHome && newsConfig.sources.length > 0 ? (
		<NewsSection
			sources={newsConfig.sources}
			title={newsConfig.title}
			count={newsConfig.homeCount}
			refreshInterval={newsConfig.refreshInterval}
			layout={newsConfig.layout}
		/>
	) : null;

	if (displayCategories.length === 0) {
		return (
			<>
				<div className="w-full space-y-3">
					{hero}
					{homeAds}
				</div>
				<SiteWidgets />
				{news}
				<PageEmptyState
					title="开始使用 Go Nav"
					description="还没有添加任何网站分类和内容，请先在后台管理中添加分类与网站。"
				/>
			</>
		);
	}

	const categorySectionClass =
		homeTheme === "portal" || homeTheme === "resource"
			? "site-layout-sections grid gap-4 xl:grid-cols-2"
			: "site-layout-sections";

	const beforeCategories =
		homeTheme === "editorial" ||
		homeTheme === "showcase" ||
		homeTheme === "spotlight" ||
		homeTheme === "glass" ||
		homeTheme === "glass-aurora" ||
		homeTheme === "glass-ice" ||
		homeTheme === "glass-frost" ||
		homeTheme === "glass-tech" ||
		homeTheme === "glass-luxury" ||
		homeTheme === "glass-minimal"
			? (
				<>
					{news}
				</>
			)
			: homeTheme === "portal" || homeTheme === "resource"
				? (
					<div className="grid gap-4 md:grid-cols-2">
						{news}
					</div>
				)
				: (
					<>
						{news}
					</>
				);

	return (
		<>
			<div className={`w-full ${heroShellClass}`}>
				{hero}
				{homeAds}
			</div>
			<SiteWidgets />
			{homeTheme === "compact" ? null : beforeCategories}
			{showRecentVisits ? (
				<RecentVisits
					maxItems={recentVisitsMax}
					cards={cardGrid}
					disableEntranceAnimation={disableRecentVisitsEntrance}
					layout={layout}
				/>
			) : null}
			{homeTheme === "compact" ? beforeCategories : null}

			<div className={categorySectionClass} style={sectionsStyle}>
				{displayCategories.map((item) => (
					<CategorySection
						key={item.category.id}
						category={item.category}
						isChild={item.isChild}
						view={categorySectionView}
					/>
				))}
			</div>
			<SiteWidgets placement="bottom" />
		</>
	);
}
