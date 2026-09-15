import fs from "node:fs";

const filePath = "data/website.json";
const website = JSON.parse(fs.readFileSync(filePath, "utf8"));
const [featured, ...parents] = website.categories;

const directions = {
	"AI 模型与助手": ["国产大模型", "国际大模型", "对话助手", "AI 搜索", "写作与办公", "图像与视频", "开发与应用"],
	"AI 办公与生产力": ["云存储与文档", "效率工具", "公共服务", "健康与生活", "出行与居住", "消费与购物", "金融与本地服务"],
	"AI 创作与设计": ["设计素材", "图像创作", "视频创作", "音频创作", "动图与特效", "文案写作", "媒体运营"],
	"AI 开发与软件": ["软件资源", "Windows 软件", "Mac 与 Linux", "移动应用", "开发工具", "系统与镜像", "软件社区"],
	"搜索与知识": ["通用搜索", "资源与网盘搜索", "书影音搜索", "图片与素材搜索", "知识问答", "学术与语言", "文化与兴趣"],
	"学习与研究": ["课程学习", "基础教育", "职业技能", "编程学习", "语言学习", "学术研究", "图书与文化"],
	"内容媒体与社区": ["影视内容", "短视频社区", "综合新闻", "科技财经", "体育军事", "娱乐汽车", "行业与兴趣社区"],
	"资源与下载": ["软件下载", "下载与传输", "音频工具", "视频工具", "格式解析", "邮箱与接码", "在线实用工具"],
	"生活服务与消费": ["综合电商", "优惠导购", "本地生活", "出行旅游", "家居维修", "汽车与二手", "金融与企业服务"],
};

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function splitIntoGroups(items, count) {
	const groups = [];
	let offset = 0;
	for (let index = 0; index < count; index += 1) {
		const remaining = items.length - offset;
		const remainingGroups = count - index;
		const size = Math.ceil(remaining / remainingGroups);
		groups.push(items.slice(offset, offset + size));
		offset += size;
	}
	return groups;
}

for (const parent of parents) {
	const labels = directions[parent.name];
	if (!labels) throw new Error(`未配置母分类方向：${parent.name}`);
	const sites = (parent.children ?? []).flatMap((child) => clone(child.sites ?? []));
	const groups = splitIntoGroups(sites, labels.length);
	parent.children = labels.map((name, index) => ({
		id: `${parent.id}-direction-${index + 1}`,
		name,
		icon: "📁",
		description: `${name}相关网站集合`,
		sites: groups[index],
	}));
	parent.sites = [];
}

website.categories = [featured, ...parents];
fs.writeFileSync(filePath, `${JSON.stringify(website, null, 2)}\n`, "utf8");