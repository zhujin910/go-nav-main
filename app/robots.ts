import type { MetadataRoute } from "next";
import { getNav } from "@/lib/config";
import { resolveSiteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
	const origin = resolveSiteOrigin();
	const nav = getNav();

	if ((process.env.BUILD_MODE || "server").toLowerCase() === "html") {
		return {
			rules: {
				userAgent: "*",
				allow: "/",
			},
			sitemap: `${origin}/sitemap.xml`,
			host: origin,
		};
	}

	if (nav.accessProtection?.enabled === true) {
		return {
			rules: {
				userAgent: "*",
				disallow: "/",
			},
			sitemap: `${origin}/sitemap.xml`,
			host: origin,
		};
	}

	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: `${origin}/sitemap.xml`,
		host: origin,
	};
}
