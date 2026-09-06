import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const csvPath = path.resolve(root, "../zjnav全部分类网址整理.csv");
const websitePath = path.resolve(root, "data/website.json");
const uploadsDir = path.resolve(root, "data/uploads");
const timeoutMs = 3_000;
const maxIconBytes = 2 * 1024 * 1024;

const mainAliases = new Map([
  ["推荐专区", "精品推荐"],
  ["新闻热榜", "新闻时事"],
]);
const mainIcons = new Map([
  ["精选工具", "🧰"],
  ["知识驿站", "📚"],
  ["资源汇总", "🗂️"],
  ["软件下载", "💾"],
]);
const subIcons = [
  ["下载", "⬇️"], ["音频", "🎧"], ["视频", "🎥"], ["解析", "🔧"],
  ["邮箱", "✉️"], ["接码", "📱"], ["二维码", "▣"], ["短链接", "🔗"],
  ["GIF", "🎞️"], ["新闻", "📰"], ["热榜", "🔥"], ["搜索", "🔎"],
  ["浏览器", "🌐"], ["书籍", "📚"], ["图片", "🖼️"], ["电影", "🎬"],
  ["动漫", "🎞️"], ["插件", "🧩"], ["办公", "🗃️"], ["资源", "📦"],
  ["软件", "💻"], ["系统", "🖥️"], ["安卓", "📱"], ["IOS", "📱"],
  ["问答", "❓"], ["百科", "📖"], ["学术", "🎓"], ["词典", "📕"],
  ["翻译", "🈯"], ["社区", "👥"], ["生活", "🏠"], ["购物", "🛒"],
];

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(field); field = ""; }
    else if ((char === "\r" || char === "\n") && !quoted) {
      if (field || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
      if (char === "\r" && text[index + 1] === "\n") index += 1;
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function decode(value) {
  return value.trim().replaceAll("&amp;", "&").replaceAll("&#8211;", "-").replaceAll("&#160;", " ");
}
function normalizeUrl(value) {
  const raw = decode(value);
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    url.hash = "";
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/$/, "");
    return url.toString();
  } catch { return withProtocol; }
}
function keyUrl(value) { return normalizeUrl(value).toLowerCase(); }
function iconFor(name, fallback = "🔗") {
  for (const [keyword, icon] of subIcons) if (name.toLowerCase().includes(keyword.toLowerCase())) return icon;
  return fallback;
}
function categoryId(name) { return `zjnav-${createHash("sha1").update(name).digest("hex").slice(0, 10)}`; }
function siteId(category, url) { return `zjnav-${createHash("sha1").update(`${category}|${url}`).digest("hex").slice(0, 12)}`; }

async function findIcon(pageUrl) {
  try {
    const target = new URL(pageUrl);
    const iconUrl = new URL("/favicon.ico", target).href;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(iconUrl, { headers: { "User-Agent": "GoNav Icon Importer/1.0" }, signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) {
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 0 && bytes.length <= maxIconBytes) {
        const contentType = response.headers.get("content-type")?.split(";")[0].toLowerCase() ?? "";
        const ext = contentType.includes("svg") ? ".svg" : contentType.includes("png") ? ".png" : contentType.includes("webp") ? ".webp" : contentType.includes("jpeg") ? ".jpg" : ".ico";
        const host = target.hostname.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "site";
        const hash = createHash("sha1").update(bytes).digest("hex").slice(0, 12);
        const fileName = `favicon-${host}-${hash}${ext}`;
        await fs.writeFile(path.join(uploadsDir, fileName), bytes);
        return `/uploads/${fileName}`;
      }
    }
    const host = new URL(pageUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    try {
      const host = new URL(pageUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
    } catch { return null; }
  }
}

const content = await fs.readFile(csvPath, "utf8");
const rows = parseCsv(content.replace(/^\uFEFF/, "")).slice(1).map((values) => ({
  main: decode(values[0] || ""),
  sub: decode(values[1] || ""),
  title: decode(values[3] || ""),
  url: normalizeUrl(values.slice(4).join(",")),
})).filter((row) => row.main && row.title && row.url);
const website = JSON.parse(await fs.readFile(websitePath, "utf8"));
await fs.mkdir(uploadsDir, { recursive: true });

const allCategories = [];
const walk = (categories) => { for (const category of categories) { allCategories.push(category); walk(category.children || []); } };
walk(website.categories);
const mainByName = new Map(allCategories.filter((category) => website.categories.includes(category)).map((category) => [category.name, category]));
const usedUrls = new Map();
for (const category of allCategories) for (const site of category.sites || []) usedUrls.set(keyUrl(site.url), { category, site });
let addedMains = 0, addedSubs = 0, addedSites = 0, mergedSites = 0, iconCount = 0;
const mainCache = new Map();

for (const row of rows) {
  const targetMainName = mainAliases.get(row.main) || row.main;
  let main = mainByName.get(targetMainName);
  if (!main) {
    main = { id: categoryId(targetMainName), name: targetMainName, icon: mainIcons.get(targetMainName) || iconFor(targetMainName, "📁"), description: `${targetMainName}相关网站集合`, children: [] };
    website.categories.push(main);
    mainByName.set(targetMainName, main);
    addedMains += 1;
  } else if (!main.icon) main.icon = mainIcons.get(targetMainName) || iconFor(targetMainName, "📁");
  if (!mainCache.has(targetMainName)) mainCache.set(targetMainName, main);
  const subName = row.sub === "-" ? "" : row.sub;
  let target;
  if (!subName) target = main;
  else {
    main.children ??= [];
    target = main.children.find((category) => category.name === subName);
    if (!target) {
      target = { id: categoryId(`${targetMainName}/${subName}`), name: subName, icon: iconFor(subName), description: `${subName}相关网站集合`, sites: [] };
      main.children.push(target);
      addedSubs += 1;
    } else if (!target.icon) target.icon = iconFor(subName);
  }
  target.sites ??= [];
  const existing = usedUrls.get(keyUrl(row.url));
  if (existing) {
    existing.site.title = row.title;
    existing.site.url = row.url;
    existing.site.description ||= "";
    existing.site.tags ??= [];
    mergedSites += 1;
    continue;
  }
  const site = { id: siteId(target.name, row.url), title: row.title, description: "", url: row.url, tags: [] };
  target.sites.push(site);
  usedUrls.set(keyUrl(row.url), { category: target, site });
  addedSites += 1;
}

for (const category of allCategories) {
  if (mainIcons.has(category.name)) category.icon = mainIcons.get(category.name);
  if (!category.icon) category.icon = iconFor(category.name, "📁");
}
const sitesWithoutIcons = [...usedUrls.values()].filter(({ site }) =>
  !site.icon || site.icon.startsWith("https://www.google.com/s2/favicons?"),
);
let nextIconIndex = 0;
const iconWorker = async () => {
  while (nextIconIndex < sitesWithoutIcons.length) {
    const entry = sitesWithoutIcons[nextIconIndex++];
    if (!entry) return;
    entry.site.icon = await findIcon(entry.site.url);
    if (entry.site.icon) iconCount += 1;
  }
};
if (process.env.SKIP_ICONS !== "1") {
  await Promise.all(Array.from({ length: 6 }, iconWorker));
}
await fs.writeFile(websitePath, `${JSON.stringify(website, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ rows: rows.length, addedMains, addedSubs, addedSites, mergedSites, iconsAdded: iconCount }, null, 2));
