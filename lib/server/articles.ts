import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { ArticleRecord, ArticleStatus } from "@/types";
import { DATA_DIR } from "./paths";
import { readJsonOr, writeJsonAtomic } from "./store";

export const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");
const MAX_TITLE = 160;
const MAX_DESC = 500;
const MAX_CONTENT = 2_000_000;

function readArticles(): ArticleRecord[] {
	return readJsonOr<ArticleRecord[]>(ARTICLES_FILE, []);
}

function writeArticles(articles: ArticleRecord[]) {
	writeJsonAtomic(ARTICLES_FILE, articles);
}

export function sanitizeArticleHtml(input: string): string {
	return input
		.slice(0, MAX_CONTENT)
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
		.replace(/javascript\s*:/gi, "")
		.replace(/data\s*:/gi, "");
}

function normalizeArticle(input: Partial<ArticleRecord>, current?: ArticleRecord): ArticleRecord {
	const now = new Date().toISOString();
	const title = String(input.title ?? current?.title ?? "").trim().slice(0, MAX_TITLE);
	if (!title) throw new Error("标题不能为空");
	const content = sanitizeArticleHtml(String(input.content ?? current?.content ?? ""));
	if (!content.trim()) throw new Error("文章内容不能为空");
	const status: ArticleStatus = input.status === "disabled" ? "disabled" : "published";
	return {
		id: current?.id ?? Date.now(),
		unique_key: current?.unique_key ?? crypto.randomBytes(18).toString("base64url"),
		title,
		desc: String(input.desc ?? current?.desc ?? "").trim().slice(0, MAX_DESC),
		cover: String(input.cover ?? current?.cover ?? "").trim().slice(0, 1000),
		cover_visible: input.cover_visible ?? current?.cover_visible ?? true,
		content,
		status,
		is_draft: input.is_draft === true,
		expire_at: input.expire_at ? new Date(input.expire_at).toISOString() : current?.expire_at ?? null,
		created_at: current?.created_at ?? now,
		updated_at: now,
	};
}

export function listArticles(query = ""): ArticleRecord[] {
	const q = query.trim().toLowerCase();
	return readArticles()
		.filter((article) => !q || article.title.toLowerCase().includes(q) || article.desc.toLowerCase().includes(q))
		.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getArticleByKey(key: string): ArticleRecord | null {
	return readArticles().find((article) => article.unique_key === key) ?? null;
}

export function getArticleById(id: number): ArticleRecord | null {
	return readArticles().find((article) => article.id === id) ?? null;
}

export function isArticlePublic(article: ArticleRecord): boolean {
	return article.status === "published" && !article.is_draft && (!article.expire_at || Date.parse(article.expire_at) > Date.now());
}

export function createArticle(input: Partial<ArticleRecord>): ArticleRecord {
	const article = normalizeArticle({ ...input, is_draft: input.is_draft !== false });
	const articles = readArticles();
	articles.push(article);
	writeArticles(articles);
	return article;
}

export function updateArticle(id: number, input: Partial<ArticleRecord>): ArticleRecord {
	const articles = readArticles();
	const index = articles.findIndex((article) => article.id === id);
	if (index < 0) throw new Error("文章不存在");
	const article = normalizeArticle(input, articles[index]);
	articles[index] = article;
	writeArticles(articles);
	return article;
}

export function deleteArticle(id: number): void {
	const next = readArticles().filter((article) => article.id !== id);
	writeArticles(next);
}

export function countPublishedArticles(): number {
	return readArticles().filter((article) => article.is_draft === false).length;
}
