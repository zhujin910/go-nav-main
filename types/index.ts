/**
 * 主题模式
 * - "light": 始终亮色
 * - "dark": 始终暗色
 * - "system": 跟随系统
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * 网站卡片展示样式
 * - "compact": 当前常规紧凑样式
 * - "preview": 带预览图的大卡片样式
 * - "glass": 玻璃拟态卡片
 * - "glass-soft": 柔光玻璃卡片
 * - "glass-aurora": 极光玻璃卡片
 * - "glass-contrast": 对比玻璃卡片
 * - "glass-strong": 强反差玻璃卡片
 * - "feature": 强调主视觉的功能卡片
 * - "list": 列表型信息卡片
 * - "outline": 线框卡片
 * - "split": 左右分栏信息卡片
 * - "neon": 霓虹高亮卡片
 * - "paper": 纸张便笺卡片
 * - "terminal": 终端命令卡片
 * - "mosaic": 马赛克拼贴卡片
 */
export type CardStyle =
	| "compact"
	| "preview"
	| "glass"
	| "glass-soft"
	| "glass-aurora"
	| "glass-contrast"
	| "glass-strong"
	| "glass-tech"
	| "glass-luxury"
	| "glass-minimal"
	| "feature"
	| "list"
	| "outline"
	| "split"
	| "neon"
	| "paper"
	| "terminal"
	| "mosaic";

/** 左侧分类列表显示风格 */
export type CategoryListStyle =
	| "default"
	| "card"
	| "outline"
	| "compact"
	| "soft"
	| "rail"
	| "pill"
	| "split"
	| "minimal"
	| "badge"
	| "glass"
	| "glass-pill"
	| "glass-rail"
	| "glass-split"
	| "glass-tech"
	| "glass-accent"
	| "glass-mesh";

/** 顶部搜索框显示风格 */
export type SearchBarStyle = "default" | "pill" | "underline" | "minimal";

export type FloatingActionStyle =
	| "default"
	| "glass"
	| "glass-pill"
	| "glass-rail"
	| "glass-tech"
	| "glass-accent"
	| "glass-mesh"
	| "soft"
	| "outline";

export type FloatingActionLayout =
	| "stack"
	| "dock"
	| "rail"
	| "bubble"
	| "minimal";

export type WidgetStyle =
	| "default"
	| "card"
	| "outline"
	| "soft"
	| "glass"
	| "glass-pill"
	| "glass-rail"
	| "glass-split"
	| "glass-tech"
	| "glass-accent"
	| "glass-mesh";

export type BrandStyle =
	| "default"
	| "card"
	| "outline"
	| "soft"
	| "glass"
	| "glass-pill"
	| "glass-rail"
	| "glass-split"
	| "glass-tech"
	| "glass-accent"
	| "glass-mesh";

/** 前台页面排版风格 */
export type PageLayoutStyle = "default" | "editorial" | "dense" | "airy";

/** 首页主题风格 */
export type HomeThemeStyle =
	| "classic"
	| "editorial"
	| "portal"
	| "compact"
	| "showcase"
	| "resource"
	| "service"
	| "spotlight"
	| "glass"
	| "glass-aurora"
	| "glass-ice"
	| "glass-frost"
	| "glass-tech"
	| "glass-luxury"
	| "glass-minimal";

/**
 * 上传图片处理策略
 */
export interface ImageUploadConfig {
	/**
	 * 是否压缩可安全重编码的图片
	 * - 默认开启：按场景缩放并优化体积；显式设置为 false 时保留原始内容
	 * - 开启后：图标、预览图与远程抓取图片会按场景缩放并优化体积
	 */
	compress?: boolean;
	/**
	 * 是否尽量统一转换成 WebP
	 * - 默认开启：手动上传、远程抓取 favicon 等场景会优先转为 webp
	 * - 适用于 png / jpg / webp / svg
	 */
	convertToWebp?: boolean;
}
// 轮播图类型
export interface CarouselItem {
  id: string;
  title: string;
  desc: string;
  image: string;
  link: string;
  enable: boolean;
	/** 当前轮播项切换到前台时是否启用轻微缩放平移动效 */
	dynamicEffect?: boolean;
}

// 自定义配色
export interface CustomColor {
  primary: string;
  secondary: string;
  background: string;
  cardBg: string;
  text: string;
  textSecondary: string;
}

// 自定义主题
export interface CustomTheme {
  id: string;
  name: string;
  colors: CustomColor;
  darkMode: boolean;
}

// RSS资讯源
export interface RssSource {
  id:string;
  name:string;
  url:string;
  enable:boolean;
}

// 扩展WebsiteItem导航条目，增加标签、有效性状态
export interface WebsiteItem {
  id: string;
  name: string;
  url: string;
  icon?: string;
  desc?: string;
  tags: string[]; //增强标签
  validStatus?: "ok"|"invalid"|"unknown"; //链接检测状态
}

export type ArticleStatus = "published" | "disabled";

export interface ArticleRecord {
	id: number;
	unique_key: string;
	title: string;
	desc: string;
	cover: string;
	cover_visible?: boolean;
	content: string;
	status: ArticleStatus;
	is_draft: boolean;
	expire_at: string | null;
	created_at: string;
	updated_at: string;
}
/**
 * 布局与显示配置
 */
export interface LayoutConfig {
	/** 内容区最大宽度，如 "1200px"、"1400px"、"100%"（不限制） */
	maxWidth?: string;
	/** 内容区右侧内边距，如 "16px"、"24px" */
	contentPaddingRight?: string;
	/** 内容区左侧内边距（有侧边栏时通常比右侧小），如 "8px"、"16px" */
	contentPaddingLeft?: string;
	/** 分类之间的间距，如 "16px"、"24px" */
	sectionGap?: string;
	/** 是否显示左侧侧边栏（桌面端） */
	showSidebar?: boolean;
	/** 侧边栏宽度，如 "224px"、"200px" */
	sidebarWidth?: string;
	/** 是否显示浮动操作按钮（回到顶部等） */
	showFloatingActions?: boolean;
	/** 是否在浮动按钮显示二维码入口 */
	showFloatingQrCode?: boolean;
	/** 是否在页脚显示二维码 */
	showFooterQrCode?: boolean;
	/** 是否显示页脚 */
	showFooter?: boolean;
	/** 是否显示搜索栏 */
	showSearch?: boolean;
	/** 是否显示分类标题（分类名称） */
	showCategoryTitle?: boolean;
	/** 是否显示分类描述（分类名称下方的描述文字） */
	showCategoryDescription?: boolean;
	/** 网站卡片最小宽度，如 "160px"、"200px" */
	cardMinWidth?: string;
	/** 网站卡片高度，如 "64px"、"72px" */
	cardHeight?: string;
	/** 是否显示网站卡片描述 */
	showCardDescription?: boolean;
	/** 网站卡片展示样式："compact" 常规样式，"preview" 预览图样式 */
	cardStyle?: CardStyle;
	/** 子分类最多显示的行数，0 表示不限制 */
	subcategoryMaxRows?: number;
	/** 子分类每行显示的网站数量，0 表示自适应 */
	subcategoryColumns?: number;
	/** 卡片网格左右内边距，如 "8px"、"12px" */
	cardGridPadding?: string;
	/** 网站卡片图标圆角，如 "full"、"12px"、"8px" */
	iconBorderRadius?: string;
	/** 网站图标默认内边距，如 "8px"、"6px" */
	defaultIconPadding?: string;
	/** 链接打开方式："current" 当前页打开，"new" 新标签页打开 */
	linkTarget?: "current" | "new";
	/** 是否自动优先访问内网地址（可达时优先） */
	autoUseIntranet?: boolean;
	/** 点击网站卡片时是否先进入"网址详情页" */
	enableSiteDetailPage?: boolean;
	/** 是否在网址详情页的信息区域展示网址链接 */
	showSiteDetailUrl?: boolean;
	/** 是否在右侧使用 Tabs 展示二级分类（开启时：左侧仅展示父级分类，右侧用 Tabs 切换二级分类；关闭时：左侧树形展示父子分类，右侧平铺所有分类卡片） */
	showSubcategoryTabs?: boolean;
	/** 是否显示分类导航栏搜索框（开启后在左侧导航顶部显示搜索框，输入后过滤分类） */
	showCategorySearch?: boolean;
	/** 分类列表显示风格 */
	categoryListStyle?: CategoryListStyle;
	/** 顶部搜索框显示风格 */
	searchBarStyle?: SearchBarStyle;
	/** 悬浮图标显示风格 */
	floatingActionStyle?: FloatingActionStyle;
	/** 悬浮图标版面 */
	floatingActionLayout?: FloatingActionLayout;
	/** 首页小组件显示风格 */
	widgetStyle?: WidgetStyle;
	/** 站点标题与名称显示风格 */
	brandStyle?: BrandStyle;
	/** 前台页面排版风格 */
	pageLayoutStyle?: PageLayoutStyle;
	/** 首页主题风格：classic / editorial / portal / compact */
	homeTheme?: HomeThemeStyle;
}

/**
 * 网站数据 - website.json 的类型定义
 * 只包含分类和网址数据
 */
export interface WebsiteData {
	/** 所有分类 (支持多级嵌套) */
	categories: NavCategory[];
}

/**
 * 广告配置
 */
export interface AdConfig {
	/** 广告唯一 ID */
	id: string;
	/** 广告标题 */
	title: string;
	/** 广告描述 */
	description?: string;
	/** 广告图片 URL */
	image?: string;
	/** 跳转链接 */
	url: string;
	/** 是否启用 */
	enabled: boolean;
	/** 广告所属位置；旧数据未配置时按旧版全局位置兼容，最终回退到侧边栏 */
	placement?: AdDisplayPosition;
	/** 排序权重（数字越小越靠前） */
	sort?: number;
}

/** 广告区域展示位置 */
export type AdDisplayPosition = "sidebar" | "home-top";

/**
 * 投稿收录配置。
 *
 * 部署模式不写入配置：server 构建自动使用本地审核流，static 构建自动使用邮件流。
 */
export interface SubmissionConfig {
	/** 是否启用投稿收录功能 */
	enabled?: boolean;
	/** 是否在右下角展示独立悬浮入口 */
	showFloatingButton?: boolean;
	/** 是否在左侧分类列表底部展示入口 */
	showSidebarButton?: boolean;
	/** 静态部署接收投稿邮件的邮箱 */
	staticEmail?: string;
}

/** 投稿审核状态 */
export type SubmissionStatus = "pending" | "approved" | "rejected";

/** 前台投稿表单数据 */
export interface SubmissionInput {
	title: string;
	url: string;
	/** 网站图标 URL、站内上传路径或 emoji */
	icon?: string;
	description?: string;
	submitterName?: string;
	contact?: string;
	note?: string;
	/** 机器人诱捕字段，正常用户应始终留空 */
	company?: string;
}

/** 动态部署中保存到本地、供后台审核的投稿记录 */
export interface SiteSubmission extends Omit<SubmissionInput, "company"> {
	id: string;
	status: SubmissionStatus;
	createdAt: string;
	updatedAt: string;
	reviewedAt?: string;
	reviewNote?: string;
	targetCategoryId?: string;
	targetCategoryName?: string;
	publishedSite?: NavSite;
}

/** data/submissions.json 的数据结构 */
export interface SubmissionData {
	submissions: SiteSubmission[];
}

/**
 * 单个网站条目
 */
export interface NavSite {
	/** 唯一 ID (可选)，如不提供将以 title+url 生成 */
	id?: string;
	/** 网站名称 */
	title: string;
	/** 网站简介，用于卡片描述与本地搜索 */
	description: string;
	/** 网站跳转 URL */
	url: string;
	/** 网站内网地址（可选） */
	intranetUrl?: string;
	/** 网站图标 URL (可为本地/远程，支持 emoji 开头) */
	icon?: string;
	/** 网站预览图 URL（用于预览图卡片样式） */
	previewImage?: string;
	/** 详情页预览图 URL 列表；未配置时详情页回退到 previewImage */
	previewImages?: string[];
	/** 详情页 Markdown 正文；不参与卡片摘要和本地搜索 */
	detailMarkdown?: string;
	/** 图标背景颜色 (hex 格式，如 #FF5733) */
	bgColor?: string;
	/** 图标区域内边距，如 "2px"、"4px" */
	iconPadding?: string;
	/** 搜索标签，辅助本地搜索命中 */
	tags?: string[];
}

/** 批量导入待审核网站 */
export interface SiteImportCandidate extends NavSite {
	categoryId?: string;
	categoryName?: string;
	selected?: boolean;
	importError?: string;
}

/**
 * 分类节点，可递归嵌套实现多级分类
 */
export interface NavCategory {
	/** 分类唯一 ID，用于锚点与菜单 key */
	id: string;
	/** 分类名称 */
	name: string;
	/** 分类图标 (可为 emoji 或 URL) */
	icon?: string;
	/** 分类描述 (可选，展示在分类标题下方) */
	description?: string;
	/** 是否在前台隐藏该分类及其子分类 */
	hidden?: boolean;
	/** 该分类下的网站列表 */
	sites?: NavSite[];
	/** 子分类 (支持无限级嵌套) */
	children?: NavCategory[];
}

/**
 * 自定义插件（用于注入样式 / 脚本 / 资源提示）
 * - type="css"           : code 以 <style> 注入 <head>
 * - type="js"            : code 以内联 <script> 注入 <body> 末尾
 * - type="resource-hint" : 生成 <link rel="preconnect|dns-prefetch" href="...">
 * - type="external-script": 生成底部外链 <script src="...">，可附带初始化 code
 */
export interface PluginConfig {
	/** 插件唯一 ID */
	id: string;
	/** 插件显示名称 */
	name: string;
	/** 插件类型 */
	type: "css" | "js" | "resource-hint" | "external-script";
	/** 代码内容（CSS / JS / 外链脚本附带的初始化代码） */
	code: string;
	/** 是否启用（仅启用的插件才会注入到前台页面） */
	enabled: boolean;
	/** 备注说明（可选，方便后台识别） */
	description?: string;
	/** 排序权重（数字越小越靠前） */
	sort?: number;
	/** 头部资源提示 rel（仅 type="resource-hint" 有意义） */
	resourceHintRel?: "preconnect" | "dns-prefetch";
	/** 资源提示地址（仅 type="resource-hint" 有意义） */
	href?: string;
	/** 外链脚本地址（仅 type="external-script" 有意义） */
	src?: string;
	/** 跨域属性（resource hint / external script 可选） */
	crossOrigin?: "" | "anonymous" | "use-credentials";
	/**
	 * 脚本加载模式（仅 type="js" / type="external-script" 有意义）
	 * - "sync"（默认）：同步执行，位于 body 末尾
	 * - "defer"：使用 defer 属性，DOM 解析完成后执行
	 * - "async"：异步执行（可能在解析过程中执行）
	 */
	loading?: "sync" | "defer" | "async";
}

/**
 * 搜索引擎配置
 */
export interface SearchEngine {
	/** 唯一 ID (用于切换) */
	id: string;
	/** 显示名称 */
	name: string;
	/** 搜索 URL，使用 {query} 占位符，程序会替换为搜索词 */
	url: string;
	/** 可选图标 URL / emoji */
	icon?: string;
}

/** 搜索框下方的快捷关键词 */
export interface SearchKeyword {
	/** 显示文案，同时也是未配置链接时提交到搜索框的内容 */
	label: string;
	/** 可选直达链接；留空时使用当前搜索引擎搜索 */
	url?: string;
	/** 关键词文字颜色 */
	color?: string;
	/** 鼠标悬停时的文字颜色 */
	hoverColor?: string;
}

/**
 * 前台访问保护配置。
 *
 * passwordHash 只允许保存在服务端配置文件中；其余标记用于后台编辑器，
 * 保存时会由服务端校验、生成哈希并剥离，绝不能下发到前台页面。
 */
export interface SiteAccessProtectionConfig {
	/** 是否要求访客输入访问密码 */
	enabled: boolean;
	/** 服务端持久化的密码哈希 */
	passwordHash?: string;
	/** 后台展示用：服务端是否已经保存过密码 */
	passwordConfigured?: boolean;
	/** 后台提交用：待设置的新密码 */
	newPassword?: string;
	/** 后台提交用：新密码确认 */
	confirmPassword?: string;
}

/**
 * 导航数据配置 - nav.json 的类型定义
 * 包含：网站基础信息、搜索、广告、最近访问、布局、主题、页脚等所有后台配置
 */
export interface GeoConfig {
	/** 国家代码，例如 CN */
	country?: string;
	/** 地区/省份 */
	region?: string;
	/** 城市 */
	city?: string;
	/** 地点名称 */
	placename?: string;
	/** 邮编 */
	postalCode?: string;
	/** 纬度 */
	latitude?: string;
	/** 经度 */
	longitude?: string;
}

export interface NavConfig {
	/** SEO 配置 */
	seo?: {
		title?: string;
		description?: string;
		keywords?: string | string[];
		canonical?: string;
		locale?: string;
	};
	/** Geo/地域定位信息，用于 SEO 与结构化数据 */
	geo?: GeoConfig;
	/** 兼容旧版字段 */
	city?: string;
	/** 旧版兼容的首页轮播图列表 */
	carousel?: CarouselItem[];
	/** 自定义配色 */
	customColors?: CustomColor;
	/** 自定义主题列表 */
	customThemes?: CustomTheme[];
	/** RSS 资讯源 */
	rssSources?: RssSource[];
	/** AI 推荐旧版配置字段 */
	aiRecommendEnable?: boolean;
	aiApiKey?: string;
	aiApiBase?: string;
	aiModel?: string;
	/** 网站标题 (显示于浏览器标签与 SEO title) */
	title: string;
	/** 网站名称 (用于页面左上角品牌展示) */
	name: string;
	/** 简短描述 (SEO description & 页面副标题) */
	description: string;
	/** 关键词列表 (SEO keywords) */
	keywords: string[];
	/** Logo 图片 URL（放在 public/ 下或远程图片均可） */
	logo: string;
	/** favicon 路径（相对于 public/） */
	favicon: string;
	/** 作者 / 所属机构 */
	author: string;
	/** 版权信息 (例如 © 2026 xxx) */
	copyright: string;
	/** 工信部 ICP 备案号（如：京ICP备xxxxxxxx号-1），留空则不显示 */
	icp: string;
	/** 公安网备案号，留空则不显示 */
	beian: string;
	/** 公众号二维码图片路径（放在 public/ 下） */
	qrCode: string;
	/** 二维码下方提示文字 */
	qrCodeText: string;
	/** 页脚友情链接 / 自定义链接 */
	footerLinks: Array<{
		/** 链接显示文案 */
		label: string;
		/** 链接跳转地址 */
		href: string;
	}>;
	/** 布局与显示控制 */
	layout?: LayoutConfig;
	/** 主题模式: "light" | "dark" | "system"（跟随系统），默认 "light" */
	themeMode?: ThemeMode;
	/** 前台访问密码保护（仅 Server 部署模式生效） */
	accessProtection?: SiteAccessProtectionConfig;
	/** 搜索相关配置 */
	search: {
		/** 默认选中的搜索引擎 ID (`local` 表示本地搜索) */
		defaultEngine: string;
		/** 是否启用本地搜索（在网站列表中过滤） */
		enableLocalSearch: boolean;
		/** 搜索框占位文字 */
		placeholder: string;
		/** 外部搜索引擎列表（id 为 `local` 表示本地搜索保留项，通常不必添加） */
		engines: SearchEngine[];
		/** 搜索框下方展示的快捷关键词 */
		keywords?: SearchKeyword[];
		/** 所有快捷关键词的默认文字颜色 */
		keywordColor?: string;
		/** 所有快捷关键词的默认悬停文字颜色 */
		keywordHoverColor?: string;
		/** 是否显示搜索引擎切换器（设为 false 则只用默认引擎） */
		showEngineSelector?: boolean;
		/** 是否启用搜索联想词（非本地搜索时显示百度搜索联想词） */
		enableSuggestion?: boolean;
		/** 是否在下次打开首页时恢复上次选择的搜索引擎（默认关闭） */
		rememberLastEngine?: boolean;
		/** 是否启用全局 Tab 键快捷聚焦到搜索框（默认 true）
		 *  开启后：页面任意位置（包括侧边栏/卡片等）按 Tab 都会跳入搜索框；
		 *  主要供键盘用户快速进入搜索。关闭后使用浏览器原生 Tab 顺序。 */
		enableTabFocus?: boolean;
	};
	/** 广告列表 */
	ads: AdConfig[];
	/** 投稿收录入口、静态邮件等配置 */
	submission?: SubmissionConfig;
	/** @deprecated 旧版全局广告宽高比，仅用于兼容已有配置 */
	adsAspectRatio?: string;
	/** @deprecated 旧版全局广告位置，仅用于迁移未标记 placement 的广告 */
	adsDisplayPosition?: AdDisplayPosition;
	/** @deprecated 旧版全局同时展示数量，仅用于兼容已有配置 */
	adsVisibleCount?: number;
	/** 主页顶部单张广告图片比例，默认 16/9 */
	homeAdsAspectRatio?: string;
	/** 侧边栏单张广告图片比例，默认 4/3 */
	sidebarAdsAspectRatio?: string;
	/** 是否开启主页顶部广告，默认 true */
	homeAdsEnabled?: boolean;
	/** 是否开启侧边栏广告，默认 true */
	sidebarAdsEnabled?: boolean;
	/** @deprecated 旧版全局广告切换间隔，仅用于兼容已有配置 */
	adsAutoplayInterval?: number;
	/** 主页顶部广告自动切换间隔（毫秒），默认 5000 */
	homeAdsAutoplayInterval?: number;
	/** 侧边栏广告自动切换间隔（毫秒），默认 5000 */
	sidebarAdsAutoplayInterval?: number;
	/** 主页顶部 Swiper 同时展示的最大数量，正整数，默认 3 */
	homeAdsVisibleCount?: number;
	/** 主页顶部广告卡片间距（px），范围 0-48，默认 6 */
	homeAdsGap?: number;
	/** 主页广告移动端自动切换间隔（毫秒），默认 5000 */
	homeAdsMobileAutoplayInterval?: number;
	/** 主页广告移动端每屏最多展示数量，默认 1 */
	homeAdsMobileVisibleCount?: number;
	/** 主页广告移动端卡片间距（px），范围 0-48，默认 8 */
	homeAdsMobileGap?: number;
	/** @deprecated 侧边栏固定单卡展示，仅保留旧配置兼容 */
	sidebarAdsVisibleCount?: number;
	/** @deprecated 旧版全局广告开关，仅用于兼容已有配置 */
	showAds?: boolean;
	/** 是否显示最近访问 */
	showRecentVisits?: boolean;
	/** 最近访问最大显示条数 */
	recentVisitsMax?: number;
	/** 图片上传处理策略 */
	imageUpload?: ImageUploadConfig;
	/** 自定义代码插件列表（自定义 CSS / JS 注入） */
	plugins?: PluginConfig[];
	/** 首页轮播图配置 */
	heroBanner?: HeroBannerConfig;
	/** 首页广告下方通知栏配置 */
	homeNotice?: HomeNoticeConfig;
	/** 访问统计配置 */
	analytics?: AnalyticsConfig;
	/** 首页轻量组件配置 */
	widgets?: WidgetsConfig;
	/** AI 对话搜索配置 */
	aiChat?: AIChatConfig;
	/** 链接有效性检测配置 */
	linkCheck?: LinkCheckConfig;
	/** 自定义主题配置 */
	customTheme?: CustomThemeConfig;
	/** 资讯聚合配置 */
	newsAggregation?: NewsAggregationConfig;
	}
	/**
 * 首页轮播图配置
 */
export interface HeroBannerConfig {
	/** 是否启用首页轮播图 */
	enabled?: boolean;
	/** 轮播图高度，如 "320px"、"400px" */
	height?: string;
	/** 自动播放间隔（毫秒），默认 5000 */
	autoplayInterval?: number;
	/** 轮播图列表 */
	slides?: HeroSlide[];
}

export interface HomeNoticeConfig {
	/** 是否显示通知栏 */
	enabled?: boolean;
	/** 通知栏标题 */
	title?: string;
	/** 通知栏正文 */
	content?: string;
}

/**
 * 单张轮播图
 */
export interface HeroSlide {
	/** 唯一 ID */
	id: string;
	/** 标题（大字） */
	title: string;
	/** 副标题/描述（小字） */
	description?: string;
	/** 背景图片 URL */
	image: string;
	/** 跳转链接（点击整张图跳转） */
	url?: string;
	/** 按钮文字（如"立即查看"），留空则不显示按钮 */
	buttonText?: string;
	/** 文字颜色："light" 白色文字（深色背景），"dark" 深色文字（浅色背景） */
	textColor?: "light" | "dark";
	/** 背景遮罩透明度 0-1，默认 0.3 */
	overlay?: number;
	/** 切换到当前幻灯片时是否启用轻微缩放平移动效 */
	dynamicEffect?: boolean;
	/** 是否启用 */
	enabled?: boolean;
	/** 排序权重（数字越小越靠前） */
	sort?: number;
}
/**
 * 访问统计记录（单条）
 */
export interface VisitRecord {
	/** 网站 URL */
	url: string;
	/** 网站标题 */
	title: string;
	/** 访问时间 ISO 字符串 */
	timestamp: string;
	/** 来源分类 ID */
	categoryId?: string;
}

/**
 * 统计仪表盘配置
 */
export interface AnalyticsConfig {
	/** 是否启用访问统计 */
	enabled?: boolean;
	/** 统计数据保留天数（超过自动清理），默认 90 */
	retentionDays?: number;
	/** 是否在后台显示统计仪表盘 */
	showDashboard?: boolean;
}

export interface WidgetsConfig {
	enabled?: boolean;
	position?: "top" | "sidebar" | "bottom";
	columns?: 1 | 2 | 3 | 4;
	gap?: "compact" | "comfortable" | "spacious";
	order?: string[];
	sizes?: Record<string, "small" | "medium" | "large">;
	showClock?: boolean;
	showWorldClock?: boolean;
	showCountdown?: boolean;
	countdownTarget?: string;
	showYearProgress?: boolean;
	showWorkProgress?: boolean;
	workStart?: string;
	workEnd?: string;
	showPomodoro?: boolean;
	showCalendar?: boolean;
	showHolidays?: boolean;
	showWeather?: boolean;
	weatherCity?: string;
	showHotSearch?: boolean;
	showQuote?: boolean;
	showWallpaper?: boolean;
	showNotes?: boolean;
	showTodo?: boolean;
	showQrCode?: boolean;
	showCalculator?: boolean;
	showCounter?: boolean;
}

/**

/** AI 对话搜索配置 */
export interface AIChatConfig {
	/** 是否显示前台悬浮 AI 入口 */
	enabled?: boolean;
	/** OpenAI 兼容 API 地址 */
	apiBase?: string;
	/** API Key，服务端使用，不下发给访客 */
	apiKey?: string;
	/** 模型名称 */
	model?: string;
	/** 允许 AI 抓取的外部网址 */
	webUrls?: string[];
	/** 面板宽度 */
	width?: number;
	/** 面板高度 */
	height?: number;
	/** 悬浮入口位置 */
	position?: "left" | "right";
}

/** 链接检测结果 */
export interface LinkCheckResult {
	url: string;
	title: string;
	status: "ok" | "failed" | "timeout" | "unknown";
	statusCode?: number;
	responseTime?: number;
	error?: string;
	checkedAt: string;
	categoryId?: string;
	categoryName?: string;
}

/** 链接检测配置 */
export interface LinkCheckConfig {
	enabled?: boolean;
	timeout?: number;
	concurrency?: number;
	showBrokenBadge?: boolean;
}

/** 网页文字样式配置 */
export interface ThemeTextStyleConfig {
	color?: string;
	mutedColor?: string;
	titleColor?: string;
	linkColor?: string;
	fontFamily?: string;
	titleFontFamily?: string;
	mutedFontFamily?: string;
	fontSize?: number;
	titleSize?: number;
	mutedSize?: number;
	fontWeight?: number | string;
	titleWeight?: number | string;
	lineHeight?: number;
	letterSpacing?: number;
	titleLetterSpacing?: number;
	textOpacity?: number;
	titleOpacity?: number;
	textShadow?: string;
	titleShadow?: string;
	textTransform?: "none" | "uppercase";
	linkUnderline?: boolean;
}

/** 自定义主题配置 */
export interface ThemeBackgroundConfig {
	mode?: "none" | "preset" | "gradient" | "solid" | "upload";
	presetId?: string;
	gradient?: string;
	solidColor?: string;
	image?: string;
	blur?: number;
	liquid?: number;
	opacity?: number;
}

export interface CustomThemeConfig {
	themeBackground?: ThemeBackgroundConfig;
	textStyle?: ThemeTextStyleConfig;
}

/** 资讯源配置 */
export interface NewsSource {
	id: string;
	name: string;
	url: string;
	icon?: string;
	category?: string;
	enabled?: boolean;
}

/** 单条资讯 */
export interface NewsItem {
	id: string;
	title: string;
	url: string;
	summary?: string;
	publishedAt?: string;
	sourceName: string;
	sourceId: string;
	image?: string;
	tags?: string[];
}

/** 资讯聚合配置 */
export interface NewsAggregationConfig {
	enabled?: boolean;
	sources?: NewsSource[];
	homeCount?: number;
	showOnHome?: boolean;
	title?: string;
	refreshInterval?: number;
	layout?: "list" | "grid" | "card";
}
