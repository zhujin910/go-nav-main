import fs from "node:fs";

const filePath = "data/website.json";
const website = JSON.parse(fs.readFileSync(filePath, "utf8"));
const [featured, ...parents] = website.categories;

const targetCounts = {
	"AI 模型与助手": 10,
	"AI 办公与生产力": 15,
	"AI 创作与设计": 10,
	"AI 开发与软件": 12,
	"搜索与知识": 18,
	"学习与研究": 10,
	"内容媒体与社区": 15,
	"资源与下载": 12,
	"生活服务与消费": 10,
};

const suffixes = ["精选", "常用", "进阶", "专业", "实用", "发现", "专题", "综合", "推荐", "更多", "扩展", "其他", "新锐", "经典", "收藏", "入口", "参考", "补充"];

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function splitCount(total, parts) {
	const base = Math.floor(total / parts);
	const remainder = total % parts;
	return Array.from({ length: parts }, (_, index) => base + (index < remainder ? 1 : 0));
}

for (const parent of parents) {
	const target = targetCounts[parent.name];
	if (!target) throw new Error(`没有配置目标数量：${parent.name}`);
	const sources = parent.children ?? [];
	const sites = sources.flatMap((source) => clone(source.sites ?? []));
	const counts = splitCount(sites.length, target);
	let offset = 0;
	parent.children = counts.map((count, index) => {
		const source = sources[index % sources.length];
		const partSites = sites.slice(offset, offset + count);
		offset += count;
		return {
			id: `${parent.id}-group-${index + 1}`,
			name: `${source.name} · ${suffixes[index] ?? `分组${index + 1}`}`,
			icon: source.icon ?? "📁",
			description: `${source.name}相关网站集合`,
			sites: partSites,
		};
	});
	parent.sites = [];
}

website.categories = [featured, ...parents];
fs.writeFileSync(filePath, `${JSON.stringify(website, null, 2)}\n`, "utf8");