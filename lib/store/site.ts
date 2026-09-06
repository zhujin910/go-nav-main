/**
 * 前台 Jotai 原子定义。
 *
 * 服务端获取的 nav / websiteData 通过 SiteStoreProvider 水合进只读根原子；
 * 组件按需订阅衍生 atom，配合 Provider 隔离保证每次请求独立。
 */
import { atom } from "jotai";
import type { Key } from "@heroui/react";
import type { LayoutConfig, NavCategory, NavConfig, NavSite, WebsiteData } from "@/types";
import { pluginHasRenderablePayload } from "@/lib/plugin-config";
import { resolveSubmissionConfig } from "@/lib/submission";
import {
	resolveAdPlacement,
	resolveHomeAdsAspectRatio,
	resolveHomeAdsAutoplayInterval,
	resolveHomeAdsEnabled,
	resolveHomeAdsGap,
	resolveHomeAdsVisibleCount,
	resolveSidebarAdsAspectRatio,
	resolveSidebarAdsAutoplayInterval,
	resolveSidebarAdsEnabled,
} from "@/lib/ad-display";

/** 站点默认布局配置，和原 AppLayout 中保持一致 */
export const DEFAULT_LAYOUT: Required<LayoutConfig> = {
	maxWidth: "1400px",
	contentPaddingLeft: "8px",
	contentPaddingRight: "16px",
	sectionGap: "16px",
	showSidebar: true,
	sidebarWidth: "224px",
	showFloatingActions: true,
	showFloatingQrCode: true,
	showFooterQrCode: true,
	showFooter: true,
	showSearch: true,
	showCategoryTitle: true,
	showCategoryDescription: true,
	cardMinWidth: "160px",
	cardHeight: "64px",
	showCardDescription: true,
	cardStyle: "glass-tech",
	subcategoryMaxRows: 0,
	subcategoryColumns: 0,
	cardGridPadding: "8px",
	iconBorderRadius: "full",
	defaultIconPadding: "",
	linkTarget: "new",
	autoUseIntranet: false,
	enableSiteDetailPage: false,
	showSiteDetailUrl: true,
	showSubcategoryTabs: true,
	showCategorySearch: false,
	categoryListStyle: "glass-accent",
	searchBarStyle: "pill",
	floatingActionStyle: "glass-tech",
	floatingActionLayout: "stack",
	widgetStyle: "glass-tech",
	brandStyle: "glass-accent",
	pageLayoutStyle: "airy",
	homeTheme: "glass-tech",
};

const EMPTY_WEBSITE: WebsiteData = { categories: [] };
const EMPTY_FOOTER_LINKS: NavConfig["footerLinks"] = [];
const EMPTY_NAV: NavConfig = {
	title: "",
	name: "",
	description: "",
	keywords: [],
	logo: "",
	favicon: "",
	author: "",
	copyright: "",
	icp: "",
	beian: "",
	qrCode: "",
	qrCodeText: "",
	footerLinks: [],
	search: {
		defaultEngine: "",
		enableLocalSearch: false,
		rememberLastEngine: false,
		placeholder: "",
		engines: [],
	},
	ads: [],
	imageUpload: {
		compress: false,
		convertToWebp: false,
	},
	seo: {
		title: "",
		description: "",
		keywords: "",
		canonical: "",
		locale: "zh-CN",
	},
	geo: {
		country: "CN",
		region: "",
		city: "",
		placename: "",
		postalCode: "",
		latitude: "",
		longitude: "",
	},
	city: "",
	carousel: [],
	customColors: {} as NavConfig["customColors"],
	customThemes: [],
	rssSources: [],
	aiRecommendEnable: false,
	aiApiKey: "",
	aiApiBase: "",
	aiModel: ""
};

// ─── 根原子（只读） ──────────────────────────────────────────────────────

export const siteNavAtom = atom<NavConfig>(EMPTY_NAV);
export const siteWebsiteDataAtom = atom<WebsiteData>(EMPTY_WEBSITE);

// ─── 派生原子 ────────────────────────────────────────────────────────────

export const layoutAtom = atom<Required<LayoutConfig>>((get) => ({
	...DEFAULT_LAYOUT,
	...(get(siteNavAtom).layout ?? {}),
}));

export const categoriesAtom = atom((get) => get(siteWebsiteDataAtom).categories ?? []);

export const enabledAdsAtom = atom((get) =>
	(get(siteNavAtom).ads ?? [])
		.filter((a) => a.enabled)
		.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0)),
);

export const homeAdsAtom = atom((get) => {
	const nav = get(siteNavAtom);
	return get(enabledAdsAtom).filter(
		(ad) => resolveAdPlacement(ad, nav.adsDisplayPosition) === "home-top",
	);
});

export const sidebarAdsAtom = atom((get) => {
	const nav = get(siteNavAtom);
	return get(enabledAdsAtom).filter(
		(ad) => resolveAdPlacement(ad, nav.adsDisplayPosition) === "sidebar",
	);
});

export const flatSitesAtom = atom((get) => {
	const result: Array<NavSite & { categoryId: string; categoryName: string }> =
		[];
	const walk = (cats: NavCategory[]) => {
		for (const cat of cats) {
			if (cat.sites) {
				for (const s of cat.sites) {
					result.push({
						...s,
						categoryId: cat.id,
						categoryName: cat.name,
					});
				}
			}
			if (cat.children) walk(cat.children);
		}
	};
	walk(get(siteWebsiteDataAtom).categories);
	return result;
});

export const aiRecommendSitesAtom = atom((get) =>
	get(aiRecommendAtom).enabled ? get(flatSitesAtom) : [],
);

export const aiChatSitesAtom = atom((get) =>
	get(aiChatAtom).enabled ? get(flatSitesAtom) : [],
);

/** 是否存在至少一个配置了内网地址的网址 */
export const hasIntranetSitesAtom = atom((get) =>
	get(flatSitesAtom).some(
		(site) => typeof site.intranetUrl === "string" && site.intranetUrl.trim().length > 0,
	),
);

// 一些常用的细粒度派生，避免组件订阅整个 nav
export const navNameAtom = atom((get) => get(siteNavAtom).name);
export const navLogoAtom = atom((get) => get(siteNavAtom).logo);
export const navCopyrightAtom = atom((get) => get(siteNavAtom).copyright);
export const navIcpAtom = atom((get) => get(siteNavAtom).icp);
export const navBeianAtom = atom((get) => get(siteNavAtom).beian);
export const navQrCodeAtom = atom((get) => get(siteNavAtom).qrCode);
export const navQrCodeTextAtom = atom((get) => get(siteNavAtom).qrCodeText);
export const footerLinksAtom = atom(
	(get) => get(siteNavAtom).footerLinks ?? EMPTY_FOOTER_LINKS,
);
export const searchConfigAtom = atom((get) => get(siteNavAtom).search ?? EMPTY_NAV.search);
export const homeAdsAspectRatioAtom = atom((get) =>
	resolveHomeAdsAspectRatio(get(siteNavAtom)),
);
export const sidebarAdsAspectRatioAtom = atom((get) =>
	resolveSidebarAdsAspectRatio(get(siteNavAtom)),
);
export const homeAdsEnabledAtom = atom((get) =>
	resolveHomeAdsEnabled(get(siteNavAtom)),
);
export const sidebarAdsEnabledAtom = atom((get) =>
	resolveSidebarAdsEnabled(get(siteNavAtom)),
);
export const homeAdsAutoplayIntervalAtom = atom((get) =>
	resolveHomeAdsAutoplayInterval(get(siteNavAtom)),
);
export const sidebarAdsAutoplayIntervalAtom = atom((get) =>
	resolveSidebarAdsAutoplayInterval(get(siteNavAtom)),
);
export const homeAdsVisibleCountAtom = atom((get) =>
	resolveHomeAdsVisibleCount(get(siteNavAtom)),
);
export const homeAdsGapAtom = atom((get) =>
	resolveHomeAdsGap(get(siteNavAtom).homeAdsGap),
);
export const showRecentVisitsAtom = atom(
	(get) => get(siteNavAtom).showRecentVisits !== false,
);
export const recentVisitsMaxAtom = atom(
	(get) => get(siteNavAtom).recentVisitsMax ?? 20,
);

export const widgetsAtom = atom((get) => get(siteNavAtom).widgets ?? {});

export const showSubcategoryTabsAtom = atom(
	(get) => get(layoutAtom).showSubcategoryTabs !== false,
);

export const showCategorySearchAtom = atom(
	(get) => get(layoutAtom).showCategorySearch === true,
);

export const submissionConfigAtom = atom((get) =>
	resolveSubmissionConfig(get(siteNavAtom).submission),
);

/** AI 智能推荐配置 */
export const aiRecommendAtom = atom((get) => {
	const config = get(siteNavAtom).aiRecommend;
	return {
		enabled: config?.enabled ?? false,
		title: config?.title ?? "为你推荐",
		count: config?.count ?? 6,
		algorithm: config?.algorithm ?? "hybrid",
		showOnHome: config?.showOnHome ?? true,
		coldStartUrls: config?.coldStartUrls ?? [],
	};
});

export const aiChatAtom = atom((get) => {
	const config = get(siteNavAtom).aiChat;
	return {
		enabled: config?.enabled === true,
		webUrls: config?.webUrls ?? [],
		width: Math.min(720, Math.max(320, config?.width ?? 420)),
		height: Math.min(820, Math.max(420, config?.height ?? 620)),
		position: config?.position === "left" ? "left" : "right",
	};
});

/** 链接检测配置 */
export const linkCheckAtom = atom((get) => {
	const config = get(siteNavAtom).linkCheck;
	return {
		enabled: config?.enabled ?? false,
		timeout: config?.timeout ?? 8000,
		concurrency: config?.concurrency ?? 3,
		showBrokenBadge: config?.showBrokenBadge ?? true,
	};
});

/** 预设主题配置 */
export const customThemeAtom = atom((get) => get(siteNavAtom).customTheme);

/** 资讯聚合配置 */
export const newsAggregationAtom = atom((get) => {
	const config = get(siteNavAtom).newsAggregation;
	return {
		enabled: config?.enabled ?? false,
		sources: config?.sources ?? [],
		homeCount: config?.homeCount ?? 6,
		showOnHome: config?.showOnHome ?? true,
		title: config?.title ?? "最新资讯",
		refreshInterval: config?.refreshInterval ?? 30,
		layout: config?.layout ?? "card",
	};
});

/** 启用的插件列表（按 sort 排序），供 layout 注入使用 */
export const enabledPluginsAtom = atom((get) => {
	const plugins = get(siteNavAtom).plugins ?? [];
	return plugins
		.filter(pluginHasRenderablePayload)
		.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
});

// ─── 交互状态 ────────────────────────────────────────────────────────────

/** 当前滚动位置对应的活跃分类 id，由 useActiveSection 写入 */
export const activeIdAtom = atom<string | undefined>(undefined);

/** 移动端导航抽屉开关 */
export const navDrawerOpenAtom = atom(false);
/** 搜索引擎抽屉开关 */
export const engineDrawerOpenAtom = atom(false);
/** 当前选中的搜索引擎 id */
export const engineIdAtom = atom<Key | null>(null);

/** 投稿弹窗由侧栏入口和悬浮入口共同控制 */
export const submissionDialogOpenAtom = atom(false);
/** 首页轮播图配置 */
export const heroBannerAtom = atom((get) => {
	const nav = get(siteNavAtom);
	const carousel = nav.carousel;
	if (Array.isArray(carousel)) {
		return {
			enabled: carousel.some((item) => item.enable),
			height: "320px",
			autoplayInterval: 5000,
			slides: carousel
				.filter((item) => item.enable)
				.map((item, index) => ({
					id: item.id,
					title: item.title,
					description: item.desc,
					image: item.image,
					url: item.link,
					dynamicEffect: item.dynamicEffect === true,
					enabled: true,
					sort: index,
				})),
		};
	}

	const config = nav.heroBanner;
	if (!config || config.enabled === false) {
		return { enabled: false, height: "320px", autoplayInterval: 5000, slides: [] };
	}
	const slides = (config.slides ?? [])
		.filter((s) => s.enabled !== false)
		.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
	return {
		enabled: true,
		height: config.height ?? "320px",
		autoplayInterval: config.autoplayInterval ?? 5000,
		slides,
	};
});