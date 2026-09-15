import fs from "node:fs";

const filePath = "data/website.json";
const website = JSON.parse(fs.readFileSync(filePath, "utf8"));
const [featured, ...parents] = website.categories;

const rules = {
	"AI 模型与助手": [
		["ai-models-main", "主流模型与助手", "🧠", ["AI 工具综合", "国产 AI", "国际工具"]],
	],
	"AI 办公与生产力": [
		["ai-office-cloud", "云存储与在线文档", "☁️", ["个人网盘", "在线文档"]],
		["ai-life-services", "生活服务", "🏠", ["生活资讯综合", "便民", "投诉", "公益"]],
		["ai-health", "健康与休闲", "❤️", ["美食", "健康", "交友"]],
		["ai-travel-home", "出行与居住", "🚗", ["快递", "酒店", "租车", "租房", "搬家", "家装", "地图", "汽车", "维修"]],
		["ai-finance-shopping", "消费与金融", "💳", ["回收", "购物", "货源", "银行", "支付", "证券", "保险"]],
	],
	"AI 创作与设计": [
		["ai-design-creation", "设计与内容创作", "🎨", ["设计素材", "媒体运营"]],
	],
	"AI 开发与软件": [
		["ai-software-resources", "软件资源与系统", "💻", ["软件应用综合", "软件驿站", "软件博客", "软件论坛", "Win软件", "Mac软件", "系统镜像", "主流软件站"]],
		["ai-mobile-apps", "移动应用", "📱", ["IOS应用", "安卓应用"]],
	],
	"搜索与知识": [
		["search-engines", "搜索引擎与发现", "🔎", ["资源搜索综合", "搜索引擎", "综合搜索", "聚合搜索", "浏览器大全", "浏览器插件"]],
		["resource-search", "网盘与资源检索", "📦", ["网盘搜索", "办公资源", "资源社区", "资源驿站", "精选网站", "永硕E盘资源", "网盘资源小站", "线报"]],
		["media-search", "书影音搜索", "🎬", ["书籍搜索", "图片搜索", "电影搜索", "动漫搜索"]],
		["knowledge-tools", "知识工具", "📚", ["问答", "百科", "学术", "文库", "词典", "翻译"]],
		["culture-thinking", "文化与兴趣", "🧩", ["国学", "玄学", "句子", "古诗", "标语", "科普", "传承", "推理", "探索", "社区"]],
	],
	"学习与研究": [
		["learning-research-all", "学习与研究资源", "📚", ["图书音乐", "学习教育"]],
	],
	"内容媒体与社区": [
		["content-video", "影视与视频", "🎬", ["影视追剧综合", "长视频", "短视频与社区"]],
		["content-news", "新闻与资讯", "📰", ["国内权威", "门户资讯", "国际中文", "热搜榜", "综合新闻", "聚合热榜", "地方知名媒体"]],
		["content-vertical-news", "科技与行业资讯", "📈", ["科技新闻", "财经新闻", "体育新闻", "军事新闻", "娱乐新闻", "汽车资讯", "时事评论"]],
	],
	"资源与下载": [
		["resource-download", "下载与传输", "⬇️", ["实用工具综合", "下载工具", "临时邮箱", "接码工具"]],
		["resource-media-tools", "音视频工具", "🎧", ["音频工具", "视频工具", "GIF动图工具"]],
		["resource-web-tools", "在线处理工具", "🛠️", ["解析工具", "二维码工具", "短链接工具"]],
	],
	"生活服务与消费": [
		["life-shopping", "电商与本地生活", "🛍️", ["综合电商", "导购与本地"]],
	],
};

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function makeChild(id, name, icon, sourceCategories) {
	return {
		id,
		name,
		icon,
		description: `${name}相关网站集合`,
		sites: sourceCategories.flatMap((category) => clone(category.sites ?? [])),
	};
}

for (const parent of parents) {
	const parentRules = rules[parent.name];
	if (!parentRules) throw new Error(`没有为母分类配置归并规则：${parent.name}`);
	const sourceByName = new Map((parent.children ?? []).map((child) => [child.name, child]));
	const used = new Set();
	parent.children = parentRules.map(([id, name, icon, sourceNames]) => {
		const sources = sourceNames.map((sourceName) => {
			const source = sourceByName.get(sourceName);
			if (!source) throw new Error(`找不到子分类：${parent.name} / ${sourceName}`);
			used.add(sourceName);
			return source;
		});
		return makeChild(id, name, icon, sources);
	});
	const unused = [...sourceByName.keys()].filter((name) => !used.has(name));
	if (unused.length > 0) throw new Error(`存在未归并子分类：${parent.name} / ${unused.join(", ")}`);
}

website.categories = [featured, ...parents];
fs.writeFileSync(filePath, `${JSON.stringify(website, null, 2)}\n`, "utf8");
