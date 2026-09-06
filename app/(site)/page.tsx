/** 首页内容由 (site)/layout 中的 SiteShell 输出。 */
import type { Metadata } from "next";
import { getNav } from "@/lib/config";
import { buildSeoMetadata, resolveSiteOrigin } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
	const nav = getNav();
	return buildSeoMetadata(nav, resolveSiteOrigin());
}

export default function HomePage() {
	return null;
}