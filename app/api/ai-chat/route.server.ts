import { NextResponse } from "next/server";
import OpenAI from "openai";
import { load } from "cheerio";
import { readNav } from "@/lib/server/store";
import {
	fetchPublicResource,
	normalizeHttpUrl,
	readResponseBytes,
} from "@/lib/server/fetch-utils";

const MAX_PAGE_TEXT = 12_000;
const MAX_REMOTE_TEXT = 16_000;
const REQUEST_TIMEOUT = 15_000;

type ChatBody = {
	message?: string;
	pageText?: string;
	sourceUrl?: string;
};

function cleanText(value: string, maxLength: number): string {
	return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function resolveApiBase(rawBase: string | undefined): string | undefined {
	const value = rawBase?.trim();
	if (!value) return undefined;
	const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
	let parsed: URL;
	try {
		parsed = new URL(candidate);
	} catch {
		throw new Error("AI API 地址无效，请填写类似 https://api.openai.com/v1 的地址");
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new Error("AI API 地址仅支持 http 或 https");
	}
	parsed.pathname = parsed.pathname.replace(/\/chat\/completions\/?$/, "");
	return parsed.toString().replace(/\/$/, "");
}

function isConfiguredUrl(sourceUrl: string, configuredUrls: string[]): boolean {
	return Boolean(findConfiguredUrl(sourceUrl, configuredUrls));
}

function findConfiguredUrl(
	sourceUrl: string,
	configuredUrls: string[],
): string | null {
	try {
		const target = normalizeHttpUrl(sourceUrl);
		const match = configuredUrls.find((item) => {
			try {
				return normalizeHttpUrl(item).origin === target.origin;
			} catch {
				return false;
			}
		});
		return match ? normalizeHttpUrl(sourceUrl).toString() : null;
	} catch {
		return null;
	}
}

async function fetchConfiguredPage(sourceUrl: string, configuredUrls: string[]) {
	if (!isConfiguredUrl(sourceUrl, configuredUrls)) return "";
	const target = normalizeHttpUrl(sourceUrl);
	const response = await fetchPublicResource(target, {
		method: "GET",
		timeoutMs: REQUEST_TIMEOUT,
		maxBytes: 2 * 1024 * 1024,
		headers: { "User-Agent": "GoNav AI Assistant/1.0" },
	});
	if (!response.ok) throw new Error(`远程网址返回 HTTP ${response.status}`);
	const bytes = await readResponseBytes(response, 2 * 1024 * 1024);
	const html = new TextDecoder().decode(bytes);
	const page = load(html);
	page("script, style, noscript, svg").remove();
	return cleanText(page("body").text(), MAX_REMOTE_TEXT);
}

export async function POST(request: Request) {
	let body: ChatBody;
	try {
		body = (await request.json()) as ChatBody;
	} catch {
		return NextResponse.json({ error: "请求格式无效" }, { status: 400 });
	}

	const message = cleanText(body.message ?? "", 2_000);
	if (!message) return NextResponse.json({ error: "请输入问题" }, { status: 400 });

	const nav = readNav();
	const config = nav.aiChat ?? {
		enabled: nav.aiRecommendEnable === true,
		apiKey: nav.aiApiKey,
		apiBase: nav.aiApiBase,
		model: nav.aiModel,
		webUrls: [],
	};
	if (config?.enabled !== true) {
		return NextResponse.json({ error: "AI 对话功能未启用" }, { status: 403 });
	}

	let remoteText = "";
	let sourceLink: string | undefined;
	if (body.sourceUrl) {
		try {
			sourceLink = findConfiguredUrl(body.sourceUrl, config.webUrls ?? []) ?? undefined;
			remoteText = await fetchConfiguredPage(body.sourceUrl, config.webUrls ?? []);
		} catch (error) {
			return NextResponse.json(
				{ error: `读取配置网址失败：${(error as Error).message}` },
				{ status: 400 },
			);
		}
	}

	const context = [
		body.pageText ? `当前页面内容：${cleanText(body.pageText, MAX_PAGE_TEXT)}` : "",
		remoteText ? `指定网址内容：${remoteText}` : "",
	].filter(Boolean).join("\n\n");

	if (!config.apiKey?.trim()) {
		return NextResponse.json({
			answer: context
				? "已读取相关页面内容，但后台还没有配置 AI API Key。请先在后台完成配置。"
				: "后台还没有配置 AI API Key，请先在后台完成配置。",
			sources: sourceLink ? [sourceLink] : [],
		});
	}

	try {
		const apiBase = resolveApiBase(config.apiBase);
		const client = new OpenAI({
			apiKey: config.apiKey,
			baseURL: apiBase,
		});
		const completion = await client.chat.completions.create({
			model: config.model || "gpt-4o-mini",
			temperature: 0.2,
			max_tokens: 900,
			messages: [
				{
					role: "system",
					content:
						"你是网址导航站的页面助手。只根据提供的页面内容回答；内容不足时明确说明，不要编造。回答使用简洁的中文，并在适合时用 Markdown。",
				},
				{
					role: "user",
					content: `${message}\n\n${context || "没有可用页面内容，请直接说明无法基于页面回答。"}`,
				},
			],
		});
		return NextResponse.json({
			answer: completion.choices[0]?.message?.content || "AI 没有返回内容。",
			sources: sourceLink ? [sourceLink] : [],
		});
	} catch (error) {
		return NextResponse.json(
			{ error: `AI 请求失败：${(error as Error).message || "请检查 API 地址和模型配置"}` },
			{ status: 502 },
		);
	}
}
