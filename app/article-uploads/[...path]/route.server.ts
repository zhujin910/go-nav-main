import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { DATA_DIR } from "@/lib/server/paths";

const ARTICLE_UPLOADS_DIR = path.join(DATA_DIR, "article-uploads");
const MIME: Record<string, string> = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".webp": "image/webp",
	".mp4": "video/mp4",
};

function resolveUploadPath(segments: string[]) {
	const target = path.join(ARTICLE_UPLOADS_DIR, ...segments);
	const relative = path.relative(ARTICLE_UPLOADS_DIR, target);
	if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
	return target;
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path: segments } = await params;
	const target = resolveUploadPath(segments);
	if (!target) return NextResponse.json({ error: "forbidden" }, { status: 403 });
	if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
		return NextResponse.json({ error: "not found" }, { status: 404 });
	}

	const stat = fs.statSync(target);
	const ext = path.extname(target).toLowerCase();
	const etag = `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
	if (request.headers.get("if-none-match") === etag) {
		return new Response(null, { status: 304, headers: { ETag: etag } });
	}

	const headers = new Headers({
		"Content-Type": MIME[ext] || "application/octet-stream",
		"Content-Length": String(stat.size),
		"Cache-Control": "public, max-age=31536000, immutable",
		ETag: etag,
		"Last-Modified": stat.mtime.toUTCString(),
		"X-Content-Type-Options": "nosniff",
	});
	const stream = Readable.toWeb(fs.createReadStream(target));
	return new Response(stream as ReadableStream<Uint8Array>, { headers });
}

export async function HEAD(
	request: Request,
	context: { params: Promise<{ path: string[] }> },
) {
	const response = await GET(request, context);
	return new Response(null, { status: response.status, headers: response.headers });
}
