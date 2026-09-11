import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleByKey, isArticlePublic } from "@/lib/server/articles";
import { getNav } from "@/lib/config";
import { FloatingActions } from "@/components/floating-actions";
import { SiteStoreProvider } from "@/lib/store/hydrate";
import { ThemeRuntime } from "@/components/theme-runtime";
import { ArticleShareActions } from "./article-share-actions";
import { ArticleShareChrome } from "./article-share-chrome";

export async function generateArticleMetadata(key: string): Promise<Metadata> {
	const article = getArticleByKey(key);
	if (!article || !isArticlePublic(article)) {
		return {
			title: "文章不存在",
		};
	}

	return {
		title: article.title,
		description: article.desc || article.title,
		openGraph: {
			title: article.title,
			description: article.desc || article.title,
			images: article.cover ? [article.cover] : undefined,
		},
	};
}

export default async function ArticleShareView({
	params,
}: {
	params: Promise<{ key: string }>;
}) {
	const { key } = await params;
	const article = getArticleByKey(key);
	if (!article || !isArticlePublic(article)) {
		notFound();
	}
	const nav = getNav();

	return (
		<SiteStoreProvider initial={{ websiteData: { categories: [] }, nav }}>
			<ThemeRuntime />
			<main className="article-share-page min-h-screen px-4 pb-12 pt-4 text-[var(--site-text-color)] sm:px-6 lg:px-8">
			<div className="article-share-frame mx-auto max-w-7xl">
				<header className="article-share-nav mb-8 grid min-h-20 gap-4 px-1 py-3 lg:grid-cols-[minmax(12rem,0.8fr)_minmax(20rem,36rem)_minmax(12rem,0.8fr)] lg:items-center">
					<Link href="/" className="article-share-brand flex min-w-0 items-center gap-3 text-[var(--site-title-color)]">
						{nav.logo ? <img src={nav.logo} alt="" className="size-11 rounded-2xl object-cover shadow-lg" /> : <span className="article-share-brand-mark" />}
						<span className="min-w-0"><strong className="block truncate text-base tracking-tight sm:text-lg">{nav.name || nav.title || "Go Nav"}</strong><small className="mt-0.5 block truncate text-[var(--site-muted-color)]">文章分享空间</small></span>
					</Link>
					<ArticleShareChrome />
					<div className="flex items-center justify-start gap-3 lg:justify-self-end">
						<span className="hidden text-xs text-[var(--site-muted-color)] sm:inline">公开文章</span>
						<Link href="/" className="article-share-back">返回首页</Link>
					</div>
				</header>

				<div className="article-share-grid">
					<article className="article-share-shell overflow-hidden">
						{article.cover && article.cover_visible !== false ? <div className="article-share-cover"><img src={article.cover} alt={article.title} /></div> : null}
						<div className="article-share-body">
							<div className="article-share-kicker"><span>文章</span><span>{new Date(article.updated_at).toLocaleDateString("zh-CN")}</span></div>
							<h1>{article.title}</h1>
							{article.desc ? <p className="article-share-lead">{article.desc}</p> : null}
							<article className="article-share-content prose prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: article.content }} />
						</div>
					</article>

					<aside className="article-share-aside">
						<div className="article-share-aside-card">
							<div className="article-share-aside-label">文章信息</div>
							<div className="article-share-meta-row"><span>更新时间</span><strong>{new Date(article.updated_at).toLocaleString("zh-CN")}</strong></div>
							{article.expire_at ? <div className="article-share-meta-row"><span>有效期至</span><strong>{new Date(article.expire_at).toLocaleString("zh-CN")}</strong></div> : null}
						</div>
						<div className="article-share-aside-card article-share-actions-card">
							<div className="article-share-aside-label">分享这篇文章</div>
							<ArticleShareActions article={article} />
						</div>
						<div className="article-share-aside-note">内容来自 {nav.name || nav.title || "本站"}，欢迎收藏与分享。</div>
					</aside>
				</div>
			</div>
				<FloatingActions showActions={true} showQrCode={true} showSubmission={false} />
			</main>
		</SiteStoreProvider>
	);
}
