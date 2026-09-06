import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/server/api-auth";
import { deleteArticle, getArticleById, updateArticle } from "@/lib/server/articles";

async function authorized() {
	return requireAdminAuth();
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
	if (!(await authorized())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	const article = getArticleById(Number((await context.params).id));
	return article ? NextResponse.json({ article }) : NextResponse.json({ error: "文章不存在" }, { status: 404 });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
	if (!(await authorized())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	try {
		const article = updateArticle(Number((await context.params).id), await request.json());
		return NextResponse.json({ article });
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 400 });
	}
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
	if (!(await authorized())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	deleteArticle(Number((await context.params).id));
	return NextResponse.json({ ok: true });
}
