import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/server/api-auth";
import { createArticle, listArticles } from "@/lib/server/articles";

export async function GET(request: Request) {
	if (!(await requireAdminAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	const query = new URL(request.url).searchParams.get("q") ?? "";
	return NextResponse.json({ items: listArticles(query) });
}

export async function POST(request: Request) {
	if (!(await requireAdminAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	try {
		const body = await request.json();
		const article = createArticle(body);
		return NextResponse.json({ article }, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 400 });
	}
}
