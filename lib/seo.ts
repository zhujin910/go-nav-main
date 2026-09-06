import type { Metadata } from "next";
import type { NavConfig } from "@/types";

export function resolveSiteOrigin(raw?: string): string {
	const value = raw || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
	if (!value) return "http://localhost:3000";
	try {
		return new URL(value).origin;
	} catch {
		return value.startsWith("http") ? value.replace(/\/$/, "") : `https://${value.replace(/^https?:\/\//, "")}`;
	}
}

export function normalizeKeywords(value?: string | string[]): string[] {
	if (!value) return [];
	if (Array.isArray(value)) {
		return value.map((item) => item.trim()).filter(Boolean);
	}
	return value
		.split(/[，,|；;\n]+/)
		.map((item) => item.trim())
		.filter(Boolean);
}

export function resolveAbsoluteUrl(value: string | undefined, origin: string): string | undefined {
	if (!value) return undefined;
	if (/^https?:\/\//i.test(value)) return value;
	if (value.startsWith("//")) return `https:${value}`;
	return `${origin}${value.startsWith("/") ? value : `/${value}`}`;
}

export function buildSeoMetadata(nav: NavConfig, origin = resolveSiteOrigin()): Metadata {
	const title = nav.seo?.title?.trim() || nav.title || nav.name || "Go Nav";
	const description = nav.seo?.description?.trim() || nav.description || "";
	const keywords = normalizeKeywords(nav.seo?.keywords ?? nav.keywords);
	const canonical = nav.seo?.canonical ? resolveAbsoluteUrl(nav.seo.canonical, origin) : origin;
	const favicon = resolveAbsoluteUrl(nav.favicon, origin);
	const logo = resolveAbsoluteUrl(nav.logo, origin);
	const robots = nav.accessProtection?.enabled === true
		? { index: false, follow: false }
		: {
			index: true,
			follow: true,
			"max-image-preview": "large" as const,
		};

	return {
		metadataBase: new URL(origin),
		title,
		description,
		keywords: keywords.length > 0 ? keywords : undefined,
		authors: nav.author ? [{ name: nav.author }] : undefined,
		alternates: canonical ? { canonical } : undefined,
		icons: favicon ? { icon: favicon } : undefined,
		openGraph: {
			title,
			description,
			type: "website",
			url: canonical,
			siteName: nav.name || nav.title || "Go Nav",
			locale: nav.seo?.locale || "zh-CN",
			images: logo ? [{ url: logo, alt: title }] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: logo ? [logo] : undefined,
		},
		robots,
		other: {
			"geo.region": nav.geo?.region || "CN",
			"geo.placename": nav.geo?.placename || nav.city || nav.name || "Go Nav",
			"geo.position": nav.geo?.latitude && nav.geo?.longitude ? `${nav.geo.latitude};${nav.geo.longitude}` : "",
			"ICBM": nav.geo?.latitude && nav.geo?.longitude ? `${nav.geo.latitude}, ${nav.geo.longitude}` : "",
			"geo.country": nav.geo?.country || "CN",
			"geo.city": nav.geo?.city || "",
		},
	};
}

export function buildSeoJsonLd(nav: NavConfig, origin = resolveSiteOrigin()): Record<string, unknown>[] {
	const siteName = nav.name || nav.title || "Go Nav";
	const description = nav.seo?.description?.trim() || nav.description || "";
	const canonical = nav.seo?.canonical ? resolveAbsoluteUrl(nav.seo.canonical, origin) : origin;
	const logo = resolveAbsoluteUrl(nav.logo, origin);
	const geo = nav.geo;
	const snippets: Record<string, unknown>[] = [
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: siteName,
			url: canonical,
			description,
			inLanguage: nav.seo?.locale || "zh-CN",
			potentialAction: {
				"@type": "SearchAction",
				target: `${origin}/?q={search_term_string}`,
				"query-input": "required name=search_term_string",
			},
		},
		{
			"@context": "https://schema.org",
			"@type": "Organization",
			name: siteName,
			url: canonical,
			logo: logo || undefined,
			description,
			foundingLocation: geo?.city ? geo.city : undefined,
			address: geo?.country || geo?.region || geo?.city
				? {
					"@type": "PostalAddress",
					addressCountry: geo?.country || "CN",
					addressRegion: geo?.region || undefined,
					addressLocality: geo?.city || undefined,
					postalCode: geo?.postalCode || undefined,
					streetAddress: geo?.placename || undefined,
				  }
				: undefined,
			geo: geo?.latitude && geo?.longitude
				? {
					"@type": "GeoCoordinates",
					latitude: Number(geo.latitude),
					longitude: Number(geo.longitude),
				  }
				: undefined,
		},
	];

	if (geo?.latitude && geo?.longitude) {
		snippets.push({
			"@context": "https://schema.org",
			"@type": "Place",
			name: geo.placename || geo.city || siteName,
			address: {
				"@type": "PostalAddress",
				addressCountry: geo.country || "CN",
				addressRegion: geo.region || undefined,
				addressLocality: geo.city || undefined,
				postalCode: geo.postalCode || undefined,
			},
			geo: {
				"@type": "GeoCoordinates",
				latitude: Number(geo.latitude),
				longitude: Number(geo.longitude),
			},
		});
	}

	return snippets.filter((item) => Object.values(item).some((value) => value !== undefined && value !== null && value !== ""));
}

export function buildDetailPageMetadata(
	nav: NavConfig,
	url: string,
	title: string,
	description: string,
	image?: string,
): Metadata {
	const origin = resolveSiteOrigin();
	const canonical = resolveAbsoluteUrl(url, origin) || url;
	const seoTitle = nav.seo?.title?.trim() || title || nav.name || nav.title || "Go Nav";
	const seoDescription = nav.seo?.description?.trim() || description || nav.description || "";
	const siteName = nav.name || nav.title || "Go Nav";
	const robots = nav.accessProtection?.enabled === true
		? { index: false, follow: false }
		: { index: true, follow: true, "max-image-preview": "large" as const };

	return {
		metadataBase: new URL(origin),
		title: seoTitle,
		description: seoDescription,
		alternates: { canonical },
		openGraph: {
			title: seoTitle,
			description: seoDescription,
			type: "website",
			url: canonical,
			siteName,
			locale: nav.seo?.locale || "zh-CN",
			images: image ? [{ url: image, alt: seoTitle }] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title: seoTitle,
			description: seoDescription,
			images: image ? [image] : undefined,
		},
		robots,
	};
}

export function buildDetailPageJsonLd(
	entry: { title: string; url: string; description?: string; categoryPath?: string[] },
	nav: NavConfig,
	origin = resolveSiteOrigin(),
): Record<string, unknown>[] {
	const pageUrl = resolveAbsoluteUrl(entry.url, origin) || entry.url;
	const item: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: nav.name || nav.title || "Go Nav",
				item: origin,
			},
		].concat(
			(entry.categoryPath ?? []).map((name, index) => ({
				"@type": "ListItem",
				position: index + 2,
				name,
				item: `${origin}/`,
			})),
		),
	};

	return [
		item,
		{
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: entry.title,
			description: entry.description || "",
			url: pageUrl,
			isPartOf: { "@type": "WebSite", name: nav.name || nav.title || "Go Nav", url: origin },
		},
	];
}
