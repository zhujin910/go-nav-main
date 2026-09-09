"use client";

import type { AdConfig, HomeNoticeConfig, LayoutConfig, WidgetStyle } from "@/types";
import { AdBanner } from "../ad-banner";
import { HeroBanner } from "../hero-banner";
import { CategorySection } from "../category-section";
import { PageEmptyState } from "../ui/empty-state-blocks";
import { NewsSection } from "../news-section";
import { SiteWidgets } from "../site-widgets";
import type { AppLayoutViewModel } from "./app-layout.types";
import {
	heroBannerAtom,
	newsAggregationAtom,
} from "@/lib/store/site";
import { useAtomValue } from "jotai";
import { siteNavAtom } from "@/lib/store/site";

function HomeNotice({
	notice,
	style,
}: {
	notice?: HomeNoticeConfig;
	style: WidgetStyle;
}) {
	if (notice?.enabled !== true || !notice.content?.trim()) return null;
	const styleClass = style === "outline" ? "border" : style === "soft" ? "soft" : style;
	return (
		<section className={`home-notice home-notice--${styleClass} flex items-start gap-3`} aria-label={notice.title || "网站通知"}>
			<div className="home-notice__mark mt-0.5 shrink-0" aria-hidden="true" />
			<div className="min-w-0">
				{notice.title?.trim() ? <h2 className="text-sm font-semibold">{notice.title}</h2> : null}
				<p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted">{notice.content.trim()}</p>
			</div>
		</section>
	);
}

export function AppLayoutHomeContent({
	displayCategories,
	layout,
	categorySectionView,
	sectionsStyle,
	ads,
	adsAspectRatio,
	adsGap,
	adsVisibleCount,
	adsMobileAutoplayInterval,
	adsMobileGap,
	adsMobileVisibleCount,
	autoplayInterval,
	showHomeAds,
}: Pick<
		AppLayoutViewModel,
		"displayCategories" | "categorySectionView" | "sectionsStyle"
> & {
	layout: Required<LayoutConfig>;
	ads: AdConfig[];
	adsAspectRatio?: string;
	adsGap: number;
	adsVisibleCount: number;
	autoplayInterval: number;
	adsMobileAutoplayInterval: number;
	adsMobileGap: number;
	adsMobileVisibleCount: number;
	showHomeAds: boolean;
}) {
	const heroBanner = useAtomValue(heroBannerAtom);
	const homeNotice = useAtomValue(siteNavAtom).homeNotice;
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
					mobileAutoplayInterval={adsMobileAutoplayInterval}
					mobileGap={adsMobileGap}
					mobileVisibleCount={adsMobileVisibleCount}
					cardStyle={layout.cardStyle}
					placement="home-top"
				/>
			</section>
		) : null;
	const notice = <HomeNotice notice={homeNotice} style={layout.widgetStyle} />;
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
					{notice}
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
				{notice}
			</div>
			<SiteWidgets />
			{homeTheme === "compact" ? null : beforeCategories}
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
