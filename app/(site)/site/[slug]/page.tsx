import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getNav, getWebsiteData } from "@/lib/config";
import {
	buildDetailPageJsonLd,
	buildDetailPageMetadata,
	resolveSiteOrigin,
} from "@/lib/seo";
import {
	collectSiteDetailEntries,
	findSiteDetailEntryBySlug,
} from "@/lib/site-detail";
import { readSiteAccessStatus } from "@/lib/server/site-access-request";

interface SiteDetailRouteProps {
	params: Promise<{ slug: string }>;
}

const STATIC_PLACEHOLDER_SLUG = "__placeholder__";
const isHtmlDeployment =
	(process.env.BUILD_MODE || "server").toLowerCase() === "html";
const isServerDeployment =
	(process.env.BUILD_MODE || "server").toLowerCase() === "server";

export function generateStaticParams() {
	if (isHtmlDeployment) {
		return [{ slug: STATIC_PLACEHOLDER_SLUG }];
	}

	const nav = getNav();
	const websiteData = getWebsiteData();
	const entries = collectSiteDetailEntries(websiteData.categories);

	// Next.js static export requires at least one prerendered param for dynamic routes.
	// When detail pages are disabled or there is no site data, keep a placeholder route.
	if (nav.layout?.enableSiteDetailPage !== true || entries.length === 0) {
		return [{ slug: STATIC_PLACEHOLDER_SLUG }];
	}

	return entries.map((item) => ({
		slug: item.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	if (isHtmlDeployment) {
		return { title: "详情页" };
	}

	const { slug } = await params;
	const nav = getNav();
	const websiteData = getWebsiteData();
	const entries = collectSiteDetailEntries(websiteData.categories);
	const entry = findSiteDetailEntryBySlug(entries, slug);
	if (!entry) {
		return buildDetailPageMetadata(nav, "/", "站点详情", nav.description || "");
	}

	const origin = resolveSiteOrigin();
	const image = entry.site.icon || entry.site.previewImage || nav.logo;
	return buildDetailPageMetadata(
		nav,
		`${origin}${entry.path}`,
		entry.site.title,
		siteDescription(entry.site),
		image,
	);
}

export default async function SiteDetailRoute(props: SiteDetailRouteProps) {
	const { slug } = await props.params;
	if (isHtmlDeployment) {
		notFound();
	}
	if (isServerDeployment && !(await readSiteAccessStatus()).allowed) {
		return null;
	}

	const nav = getNav();
	const detailEnabled = nav.layout?.enableSiteDetailPage === true;
	if (!detailEnabled || slug === STATIC_PLACEHOLDER_SLUG) {
		notFound();
	}

	const websiteData = getWebsiteData();
	const entries = collectSiteDetailEntries(websiteData.categories);
	const matched = findSiteDetailEntryBySlug(entries, slug);
	if (!matched) notFound();
	if (matched.slug !== slug) {
		redirect(matched.path);
	}

	const jsonLd = buildDetailPageJsonLd(
		{
			title: matched.site.title,
			url: matched.path,
			description: siteDescription(matched.site),
			categoryPath: matched.categoryPath,
		},
		nav,
		resolveSiteOrigin(),
	);

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
		</>
	);
}

function siteDescription(site: { description?: string; title?: string }) {
	return site.description?.trim() || `${site.title || "网站"} 的详细信息与预览内容`;
}

