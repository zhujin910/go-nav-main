import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/server/api-auth";
import { DATA_DIR } from "@/lib/server/paths";

const ARTICLE_UPLOADS_DIR = path.join(DATA_DIR, "article-uploads");
const IMAGE_TYPES = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/gif", ".gif"]]);
const VIDEO_TYPES = new Map([["video/mp4", ".mp4"]]);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
	if (!(await requireAdminAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
	const form = await request.formData();
	const file = form.get("file");
	if (!(file instanceof File)) return NextResponse.json({ error: "缺少文件" }, { status: 400 });
	const extension = IMAGE_TYPES.get(file.type) ?? VIDEO_TYPES.get(file.type);
	if (!extension) return NextResponse.json({ error: "仅支持 jpg/png/gif 图片或 mp4 视频" }, { status: 415 });
	const bytes = await file.arrayBuffer();
	const max = IMAGE_TYPES.has(file.type) ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
	if (bytes.byteLength > max) return NextResponse.json({ error: `文件不能超过 ${IMAGE_TYPES.has(file.type) ? "2MB" : "50MB"}` }, { status: 413 });
	fs.mkdirSync(ARTICLE_UPLOADS_DIR, { recursive: true });
	const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
	fs.writeFileSync(path.join(ARTICLE_UPLOADS_DIR, name), Buffer.from(bytes));
	return NextResponse.json({ url: `/article-uploads/${name}`, type: file.type });
}
