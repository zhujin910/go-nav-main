import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const websitePath = path.resolve("data/website.json");
const uploadsDir = path.resolve("data/uploads");
const importedCategories = new Map([
  ["生活资讯", "📰"],
  ["资源搜索", "🔎"],
  ["影视视频", "🎬"],
  ["AI工具🤖", "🤖"],
  ["实用工具", "🧰"],
  ["图书音乐", "📚"],
  ["软件应用", "💻"],
  ["学习教育", "🎓"],
  ["设计素材", "🎨"],
  ["媒体运营", "📣"],
]);
const maxBytes = 2 * 1024 * 1024;
const timeoutMs = 12_000;

function decodeHtml(value) {
  return value.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
}

function findIconUrls(html, pageUrl) {
  const urls = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = tag.match(/\brel\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    if (!rel.toLowerCase().split(/\s+/).some((part) => part.includes("icon"))) continue;
    const href = tag.match(/\bhref\s*=\s*["']([^"']*)["']/i)?.[1];
    if (!href) continue;
    try {
      const resolved = new URL(decodeHtml(href), pageUrl);
      if (resolved.protocol === "http:" || resolved.protocol === "https:") urls.push(resolved.href);
    } catch {}
  }
  const fallback = new URL("/favicon.ico", pageUrl).href;
  return [...new Set([...urls, fallback])].slice(0, 6);
}

function extension(contentType, url) {
  const type = contentType.split(";")[0].toLowerCase();
  if (type.includes("svg")) return ".svg";
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  if (type.includes("jpeg")) return ".jpg";
  if (type.includes("gif")) return ".gif";
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  return [".ico", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(ext) ? ext : ".ico";
}

async function downloadIcon(site) {
  const pageUrl = /^https?:\/\//i.test(site.url) ? site.url : `https://${site.url}`;
  let html = "";
  try {
    const pageResponse = await fetch(pageUrl, { headers: { "User-Agent": "GoNav Icon Enricher/1.0" }, signal: AbortSignal.timeout(timeoutMs) });
    if (pageResponse.ok) html = (await pageResponse.text()).slice(0, 1_500_000);
  } catch {}
  const candidates = findIconUrls(html, pageUrl);
  for (const iconUrl of candidates) {
    try {
      const response = await fetch(iconUrl, { headers: { "User-Agent": "GoNav Icon Enricher/1.0" }, signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) continue;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length || bytes.length > maxBytes) continue;
      const ext = extension(response.headers.get("content-type") ?? "", iconUrl);
      const hash = createHash("sha1").update(bytes).digest("hex").slice(0, 12);
      const host = new URL(pageUrl).hostname.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
      const fileName = `favicon-${host || "site"}-${hash}${ext}`;
      await fs.writeFile(path.join(uploadsDir, fileName), bytes);
      return `/uploads/${fileName}`;
    } catch {}
  }
  try {
    const hostname = new URL(pageUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return null;
  }
}

const website = JSON.parse(await fs.readFile(websitePath, "utf8"));
await fs.mkdir(uploadsDir, { recursive: true });
let total = 0;
let updated = 0;
let failed = 0;
for (const category of website.categories) {
  if (importedCategories.has(category.name)) category.icon = importedCategories.get(category.name);
  for (const site of category.sites ?? []) {
    total += 1;
    if (site.icon) continue;
    const icon = await downloadIcon(site);
    if (icon) {
      site.icon = icon;
      updated += 1;
      console.log(`icon ${updated}: ${site.title}`);
    } else {
      failed += 1;
      console.warn(`failed: ${site.title} ${site.url}`);
    }
  }
}
await fs.writeFile(websitePath, `${JSON.stringify(website, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ total, updated, failed, categories: importedCategories.size }, null, 2));
