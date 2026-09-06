import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { readNav } from "@/lib/server/store";
import { SESSION_COOKIE, verifySession } from "@/lib/server/auth";

function resolveApiBase(rawBase: string | undefined): string | undefined {
	const value = rawBase?.trim();
	if (!value) return undefined;
	const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
	const parsed = new URL(candidate);
	parsed.pathname = parsed.pathname.replace(/\/chat\/completions\/?$/, "");
	return parsed.toString().replace(/\/$/, "");
}

export async function POST(request: Request) {
	const store = await cookies();
	if (!verifySession(store.get(SESSION_COOKIE)?.value)) {
		return NextResponse.json({ error: "未登录" }, { status: 401 });
	}
	try {
		const body = (await request.json()) as {
			title?: string;
			url?: string;
			error?: string;
			statusCode?: number;
		};
		const title = body.title?.trim();
		const url = body.url?.trim();
		if (!title || !url) {
			return NextResponse.json({ error: "缺少站点名称或网址" }, { status: 400 });
		}

		const nav = readNav();
		const config = nav.aiChat ?? {
			enabled: nav.aiRecommendEnable === true,
			apiKey: nav.aiApiKey,
			apiBase: nav.aiApiBase,
			model: nav.aiModel,
		};
		if (config.enabled !== true || !config.apiKey?.trim()) {
			return NextResponse.json({ error: "请先在后台启用并配置 AI API" }, { status: 400 });
		}

		const client = new OpenAI({
			apiKey: config.apiKey,
			baseURL: resolveApiBase(config.apiBase),
		});
		const completion = await client.chat.completions.create({
			model: config.model || "gpt-4o-mini",
			temperature: 0,
			max_tokens: 160,
			messages: [
				{
					role: "system",
					content:
						"你负责修复网址导航中的失效网址。根据站点名称、原网址和错误信息推断最可能的官方主页地址。只返回一个完整的 http:// 或 https:// URL，不要返回 Markdown、解释、引号或多个候选地址。无法判断时返回 UNKNOWN。",
				},
				{
					role: "user",
					content: JSON.stringify({ title, url, error: body.error, statusCode: body.statusCode }),
				},
			],
		});
		const answer = completion.choices[0]?.message?.content?.trim() ?? "";
		const match = answer.match(/https?:\/\/[^\s<>"'`]+/i);
		if (!match) return NextResponse.json({ error: "AI 无法确定正确网址" }, { status: 422 });
		return NextResponse.json({ url: match[0].replace(/[),.;]+$/, "") });
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? `AI 修复失败：${error.message}` : "AI 修复失败" },
			{ status: 502 },
		);
	}
}
