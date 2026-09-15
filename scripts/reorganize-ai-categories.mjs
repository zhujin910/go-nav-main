import fs from "node:fs";

const filePath = "data/website.json";
const website = JSON.parse(fs.readFileSync(filePath, "utf8"));
const [featured, ...sourceCategories] = website.categories;

const targetDefinitions = [
	{ id: "ai-models", name: "AI 模型与助手", icon: "🤖", description: "聚合主流大模型、智能助手与 AI 对话入口，优先覆盖日常使用与 API 能力。", sources: [0] },
	{ id: "ai-productivity", name: "AI 办公与生产力", icon: "⚡", description: "面向办公、效率、文件协作与日常任务的 AI 工具和生产力入口。", sources: [4, 5] },
	{ id: "ai-creation", name: "AI 创作与设计", icon: "🎨", description: "覆盖图像、视频、音频、设计素材与内容运营，服务 AI 创作工作流。", sources: [11, 12] },
	{ id: "ai-development", name: "AI 开发与软件", icon: "💻", description: "面向开发者、软件应用、系统工具与 AI 工程实践的工具资源。", sources: [9] },
	{ id: "search-knowledge", name: "搜索与知识", icon: "🔎", description: "集中搜索引擎、资源检索、知识库、问答与信息发现工具。", sources: [6, 13] },
	{ id: "learning-research", name: "学习与研究", icon: "📚", description: "服务课程学习、学术研究、电子书、语言学习与持续教育。", sources: [8, 10] },
	{ id: "content-community", name: "内容媒体与社区", icon: "📰", description: "汇集新闻、影视、视频、内容平台与兴趣社区，方便获取和交流信息。", sources: [1, 2] },
	{ id: "resources-download", name: "资源与下载", icon: "📦", description: "整理网盘、下载、软件资源和可直接使用的数字内容入口。", sources: [7] },
	{ id: "life-consumption", name: "生活服务与消费", icon: "🏠", description: "覆盖电商购物、出行、健康、便民服务与本地生活场景。", sources: [3] },
];

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function flattenCategory(category, sourceName) {
	const result = [];
	if (Array.isArray(category.sites) && category.sites.length > 0) {
		result.push({
			id: `${category.id}-sites`,
			name: category.children?.length ? `${category.name}综合` : category.name,
			icon: category.icon ?? "📁",
			description: category.description ?? `${sourceName}相关网站集合`,
			sites: clone(category.sites),
		});
	}
	for (const child of category.children ?? []) {
		result.push(...flattenCategory(child, sourceName));
	}
	return result;
}

const reorganized = targetDefinitions.map((target) => {
	const children = target.sources.flatMap((sourceIndex) => {
		const source = sourceCategories[sourceIndex];
		return flattenCategory(source, source.name);
	});
	return {
		id: target.id,
		name: target.name,
		icon: target.icon,
		description: target.description,
		children,
		sites: [],
	};
});

website.categories = [featured, ...reorganized];
fs.writeFileSync(filePath, `${JSON.stringify(website, null, 2)}\n`, "utf8");