import fs from "node:fs";

const file = "data/website.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const iconRules = [
  ["下载", "⬇️"], ["音频", "🎧"], ["视频", "🎥"], ["解析", "🔧"], ["邮箱", "✉️"],
  ["接码", "📱"], ["二维码", "▣"], ["短链接", "🔗"], ["GIF", "🎞️"], ["新闻", "📰"],
  ["热榜", "🔥"], ["搜索", "🔎"], ["浏览器", "🌐"], ["书籍", "📚"], ["图片", "🖼️"],
  ["电影", "🎬"], ["动漫", "🎞️"], ["插件", "🧩"], ["办公", "🗃️"], ["资源", "📦"],
  ["软件", "💻"], ["系统", "🖥️"], ["安卓", "📱"], ["IOS", "📱"], ["问答", "❓"],
  ["百科", "📖"], ["学术", "🎓"], ["词典", "📕"], ["翻译", "🈯"], ["社区", "👥"],
  ["生活", "🏠"], ["购物", "🛒"], ["汽车", "🚗"], ["财经", "💰"], ["体育", "⚽"],
  ["军事", "🛡️"], ["娱乐", "🎭"], ["酒店", "🏨"], ["地图", "🗺️"], ["银行", "🏦"],
  ["支付", "💳"], ["保险", "🛡️"], ["公益", "💗"], ["健康", "❤️"], ["美食", "🍜"],
];
function categoryIcon(name) {
  for (const [keyword, icon] of iconRules) if (name.toLowerCase().includes(keyword.toLowerCase())) return icon;
  return "📁";
}
function walk(categories) {
  for (const category of categories) {
    if (!category.icon || category.icon === "🔗") category.icon = categoryIcon(category.name);
    for (const site of category.sites ?? []) {
      const value = site.url.trim();
      let host = "site";
      try { host = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).hostname; } catch {}
      if (!site.icon) site.icon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
    }
    walk(category.children ?? []);
  }
}
const seen = new Set();
function removeDuplicates(categories) {
  for (const category of categories) {
    category.sites = (category.sites ?? []).filter((site) => {
      const key = site.url.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    removeDuplicates(category.children ?? []);
  }
}
walk(data.categories);
removeDuplicates(data.categories);
fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ categories: data.categories.length, uniqueUrls: seen.size }, null, 2));
