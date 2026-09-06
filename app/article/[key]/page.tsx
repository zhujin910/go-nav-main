import type { Metadata } from "next";
import ArticleShareView, { generateArticleMetadata } from "@/components/article/article-share-view";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ key: string }>;
}): Promise<Metadata> {
	const { key } = await params;
	return generateArticleMetadata(key);
}

export default function ArticleRoute({
	params,
}: {
	params: Promise<{ key: string }>;
}) {
	return <ArticleShareView params={params} />;
}
