"use client";

import {
    Button,
    FieldError,
    Input,
    InputGroup,
    Label,
    Separator,
	TextArea,
    TextField,
} from "@heroui/react";
import {
	BiDesktop,
	BiHide,
	BiLockAlt,
	BiMoon,
	BiShow,
	BiSun,
} from "react-icons/bi";
import type {
	BrandStyle,
	CardStyle,
	CategoryListStyle,
	CustomThemeConfig,
	FloatingActionStyle,
	FloatingActionLayout,
	HomeThemeStyle,
	LayoutConfig,
	PageLayoutStyle,
	SearchBarStyle,
	ThemeBackgroundConfig,
	ThemeMode,
	NavConfig,
	SiteAccessProtectionConfig,
	WidgetStyle,
} from "@/types";
import {
	THEME_BACKGROUND_PRESETS,
	THEME_GRADIENT_PRESETS,
	resolveThemeBackgroundValue,
} from "@/lib/theme-presets";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { navAtom, navFieldAtom } from "@/lib/store/admin";
import { DEFAULT_LAYOUT } from "@/lib/store/site";
import { IconPicker } from "./icon-picker";
import { AdminSwitch } from "./admin-switch";

export type WebsiteSection =
	| "basic"
	| "layout"
	| "theme"
	| "footer"
	| "access"
	| "ai";

const DEFAULT_RECENT_VISITS_MAX = 10;

const THEME_TEXT_PRESETS = [
	{ id: "executive", name: "商务典藏", fontFamily: "Microsoft YaHei, sans-serif", titleFontFamily: "Georgia, serif", color: "#1e293b", titleColor: "#0f172a", mutedColor: "#64748b", linkColor: "#1d4ed8", fontSize: 14, titleSize: 24, mutedSize: 12, fontWeight: 400, titleWeight: 700, lineHeight: 1.6, letterSpacing: 0, titleLetterSpacing: 2, textShadow: "none", titleShadow: "0 2px 10px rgba(15,23,42,0.12)" },
	{ id: "editorial", name: "杂志编辑", fontFamily: "Georgia, serif", titleFontFamily: "Georgia, serif", color: "#292524", titleColor: "#1c1917", mutedColor: "#78716c", linkColor: "#b45309", fontSize: 15, titleSize: 28, mutedSize: 12, fontWeight: 400, titleWeight: 700, lineHeight: 1.8, letterSpacing: 1, titleLetterSpacing: 3, textShadow: "none", titleShadow: "none" },
	{ id: "modern", name: "现代极简", fontFamily: "Segoe UI, sans-serif", titleFontFamily: "Segoe UI, sans-serif", color: "#334155", titleColor: "#0f172a", mutedColor: "#94a3b8", linkColor: "#2563eb", fontSize: 14, titleSize: 22, mutedSize: 12, fontWeight: 400, titleWeight: 600, lineHeight: 1.6, letterSpacing: 0, titleLetterSpacing: 1, textShadow: "none", titleShadow: "none" },
	{ id: "luxury", name: "轻奢金棕", fontFamily: "Helvetica Neue, sans-serif", titleFontFamily: "Georgia, serif", color: "#44403c", titleColor: "#78350f", mutedColor: "#a8a29e", linkColor: "#b45309", fontSize: 14, titleSize: 26, mutedSize: 12, fontWeight: 400, titleWeight: 600, lineHeight: 1.7, letterSpacing: 1, titleLetterSpacing: 3, textShadow: "none", titleShadow: "0 2px 12px rgba(180,83,9,0.18)" },
	{ id: "tech", name: "科技清晰", fontFamily: "Segoe UI, sans-serif", titleFontFamily: "Segoe UI, sans-serif", color: "#334155", titleColor: "#0c4a6e", mutedColor: "#64748b", linkColor: "#0284c7", fontSize: 14, titleSize: 22, mutedSize: 11, fontWeight: 500, titleWeight: 700, lineHeight: 1.55, letterSpacing: 0, titleLetterSpacing: 1, textShadow: "0 1px 3px rgba(14,116,144,0.12)", titleShadow: "0 2px 8px rgba(14,116,144,0.2)" },
	{ id: "creative", name: "创意彩墨", fontFamily: "Trebuchet MS, sans-serif", titleFontFamily: "Georgia, serif", color: "#334155", titleColor: "#701a75", mutedColor: "#7e22ce", linkColor: "#c026d3", fontSize: 14, titleSize: 25, mutedSize: 12, fontWeight: 400, titleWeight: 700, lineHeight: 1.65, letterSpacing: 1, titleLetterSpacing: 2, textShadow: "none", titleShadow: "0 2px 10px rgba(192,38,211,0.2)" },
	{ id: "nature", name: "自然雅致", fontFamily: "Palatino Linotype, serif", titleFontFamily: "Palatino Linotype, serif", color: "#365314", titleColor: "#14532d", mutedColor: "#4d7c0f", linkColor: "#15803d", fontSize: 14, titleSize: 24, mutedSize: 12, fontWeight: 400, titleWeight: 600, lineHeight: 1.75, letterSpacing: 1, titleLetterSpacing: 2, textShadow: "none", titleShadow: "none" },
	{ id: "mono", name: "代码秩序", fontFamily: "Consolas, monospace", titleFontFamily: "Consolas, monospace", color: "#334155", titleColor: "#0f172a", mutedColor: "#64748b", linkColor: "#0369a1", fontSize: 13, titleSize: 19, mutedSize: 11, fontWeight: 400, titleWeight: 600, lineHeight: 1.6, letterSpacing: 0, titleLetterSpacing: 1, textShadow: "none", titleShadow: "none" },
	{ id: "fashion", name: "时尚高对比", fontFamily: "Arial, sans-serif", titleFontFamily: "Arial, sans-serif", color: "#18181b", titleColor: "#18181b", mutedColor: "#71717a", linkColor: "#e11d48", fontSize: 14, titleSize: 30, mutedSize: 11, fontWeight: 500, titleWeight: 800, lineHeight: 1.45, letterSpacing: 1, titleLetterSpacing: 4, textShadow: "none", titleShadow: "2px 3px 0 rgba(244,63,94,0.15)" },
	{ id: "calm", name: "安静留白", fontFamily: "Verdana, sans-serif", titleFontFamily: "Verdana, sans-serif", color: "#475569", titleColor: "#334155", mutedColor: "#94a3b8", linkColor: "#0f766e", fontSize: 14, titleSize: 21, mutedSize: 12, fontWeight: 400, titleWeight: 500, lineHeight: 1.9, letterSpacing: 1, titleLetterSpacing: 1, textShadow: "none", titleShadow: "none" },
	{ id: "contrast", name: "黑白聚焦", fontFamily: "Arial, sans-serif", titleFontFamily: "Arial, sans-serif", color: "#27272a", titleColor: "#000000", mutedColor: "#71717a", linkColor: "#000000", fontSize: 14, titleSize: 26, mutedSize: 11, fontWeight: 400, titleWeight: 800, lineHeight: 1.55, letterSpacing: 0, titleLetterSpacing: 2, textShadow: "none", titleShadow: "0 1px 0 rgba(255,255,255,0.8)" },
] as const;

export function WebsiteEditor({
	section = "basic",
}: {
	section?: WebsiteSection;
}) {
	const [value, setValue] = useAtom(navAtom);
	const setLayout = useSetAtom(navFieldAtom("layout"));
	const setShowRecentVisits = useSetAtom(navFieldAtom("showRecentVisits"));
	const setRecentVisitsMax = useSetAtom(navFieldAtom("recentVisitsMax"));
	const patch = (p: Partial<NavConfig>) => {
		setValue({ ...value, ...p });
	};

	if (section === "layout") {
		return (
			<LayoutEditor
				layout={value.layout}
				onChange={setLayout}
				showRecentVisits={value.showRecentVisits}
				onShowRecentVisitsChange={setShowRecentVisits}
				recentVisitsMax={value.recentVisitsMax}
				onRecentVisitsMaxChange={setRecentVisitsMax}
			/>
		);
	}

	if (section === "theme") {
		return <ThemeEditor value={value} onPatch={patch} />;
	}

	if (section === "footer") {
		return <FooterEditor value={value} onPatch={patch} />;
	}

	if (section === "access") {
		return <AccessProtectionEditor value={value} onPatch={patch} />;
	}

	if (section === "ai") {
		return <AIChatEditor value={value} onPatch={patch} />;
	}

	return <BasicEditor value={value} onPatch={patch} />;
}

function AIChatEditor({
	value,
	onPatch,
}: {
	value: NavConfig;
	onPatch: (p: Partial<NavConfig>) => void;
}) {
	const config = value.aiChat ?? {};
	const patch = (next: Partial<NonNullable<NavConfig["aiChat"]>>) =>
		onPatch({ aiChat: { ...config, ...next } });
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 rounded-2xl border border-default-200 bg-default-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-sm font-semibold">前台 AI 对话助手</h3>
					<p className="mt-1 max-w-2xl text-xs leading-5 text-default-500">
						开启后，首页右下角会显示 AI 图标。助手可搜索导航网址，并按白名单读取外部网页内容。
					</p>
				</div>
				<AdminSwitch
					isSelected={config.enabled === true}
					onChange={(enabled) => patch({ enabled })}
					ariaLabel="开启 AI 对话助手"
				>
					<span className="text-sm font-medium">{config.enabled ? "已开启" : "未开启"}</span>
				</AdminSwitch>
			</div>

			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<div className="flex flex-col gap-2 md:col-span-2"><Label>OpenAI 兼容 API 地址</Label><TextField value={config.apiBase ?? ""} onChange={(apiBase) => patch({ apiBase })}><Label className="sr-only">API 地址</Label><Input placeholder="https://api.openai.com/v1" /></TextField></div>
				<div className="flex flex-col gap-2"><Label>API Key</Label><TextField value={config.apiKey ?? ""} onChange={(apiKey) => patch({ apiKey })}><Label className="sr-only">API Key</Label><Input type="password" placeholder="仅保存在服务端配置中" /></TextField></div>
				<div className="flex flex-col gap-2"><Label>模型名称</Label><TextField value={config.model ?? "gpt-4o-mini"} onChange={(model) => patch({ model })}><Label className="sr-only">模型名称</Label><Input placeholder="gpt-4o-mini" /></TextField></div>
				<div className="flex flex-col gap-2"><Label>面板宽度（320 - 720）</Label><TextField value={String(config.width ?? 420)} onChange={(width) => patch({ width: Number(width) || 420 })}><Label className="sr-only">面板宽度</Label><Input type="number" /></TextField></div>
				<div className="flex flex-col gap-2"><Label>面板高度（420 - 820）</Label><TextField value={String(config.height ?? 620)} onChange={(height) => patch({ height: Number(height) || 620 })}><Label className="sr-only">面板高度</Label><Input type="number" /></TextField></div>
				<div className="flex flex-col gap-2"><Label>悬浮入口位置</Label><select value={config.position ?? "right"} onChange={(event) => patch({ position: event.target.value as "left" | "right" })} className="h-10 rounded-lg border border-default-200 bg-transparent px-3 text-sm"><option value="right">右下角</option><option value="left">左下角</option></select></div>
				<div className="flex flex-col gap-2 md:col-span-2"><Label>可读取网址白名单</Label><TextArea value={(config.webUrls ?? []).join("\n")} onChange={(event) => patch({ webUrls: event.target.value.split("\n").map((url) => url.trim()).filter(Boolean) })} placeholder="每行一个网址，例如：https://example.com/docs" rows={5} /><p className="text-xs text-default-500">只允许读取这里配置的公网网址，避免 AI 任意访问外部资源。</p></div>
			</div>
		</div>
	);
}

function BasicEditor({
	value,
	onPatch,
}: {
	value: NavConfig;
	onPatch: (p: Partial<NavConfig>) => void;
}) {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">站点标题</Label>
				<TextField value={value.title} onChange={(v) => onPatch({ title: v })}>
					<Label className="sr-only">title</Label>
					<Input placeholder="浏览器标签标题" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">站点名称</Label>
				<TextField value={value.name} onChange={(v) => onPatch({ name: v })}>
					<Label className="sr-only">name</Label>
					<Input placeholder="左上角显示名" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2 md:col-span-2">
				<Label className="text-sm font-medium">站点描述</Label>
				<TextField
					value={value.description}
					onChange={(v) => onPatch({ description: v })}
				>
					<Label className="sr-only">description</Label>
					<Input placeholder="网站描述，用于 SEO" />
				</TextField>
			</div>

			<div className="md:col-span-2 rounded-2xl border border-default-200 bg-default-50/60 p-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h3 className="text-sm font-semibold">首页通知栏</h3>
						<p className="mt-1 text-xs text-default-500">显示在首页广告图下方，可根据网站需要隐藏。</p>
					</div>
					<AdminSwitch
						isSelected={value.homeNotice?.enabled === true}
						onChange={(enabled) => onPatch({ homeNotice: { ...(value.homeNotice ?? {}), enabled } })}
					>
						{value.homeNotice?.enabled ? "已显示" : "已隐藏"}
					</AdminSwitch>
				</div>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					<TextField value={value.homeNotice?.title ?? "网站通知"} onChange={(title) => onPatch({ homeNotice: { ...(value.homeNotice ?? {}), title } })}>
						<Label>通知标题</Label>
						<Input placeholder="网站通知" />
					</TextField>
					<TextField value={value.homeNotice?.content ?? ""} onChange={(content) => onPatch({ homeNotice: { ...(value.homeNotice ?? {}), content } })}>
						<Label>通知内容</Label>
						<Input placeholder="输入首页通知内容" />
					</TextField>
				</div>
			</div>

			<div className="flex flex-col gap-2 md:col-span-2">
				<Label className="text-sm font-medium">关键词</Label>
				<TextField
					value={value.keywords?.join(", ") ?? ""}
					onChange={(v) =>
						onPatch({
							keywords: v
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean),
						})
					}
				>
					<Label className="sr-only">keywords</Label>
					<Input placeholder="导航, nav, 书签" />
				</TextField>
				<p className="text-xs text-gray-400 dark:text-neutral-500">
					多个关键词用逗号分隔
				</p>
			</div>

			<div className="flex flex-col gap-2 md:col-span-2">
				<div className="rounded-2xl border border-default-200 bg-default-50/60 p-4">
					<h3 className="text-sm font-semibold">SEO / Geo 配置</h3>
					<p className="mt-1 text-xs text-default-500">用于搜索引擎收录、结构化数据和地区定位。</p>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">SEO 标题</Label>
				<TextField
					value={value.seo?.title ?? ""}
					onChange={(v) => onPatch({ seo: { ...(value.seo ?? {}), title: v } })}
				>
					<Label className="sr-only">seo title</Label>
					<Input placeholder="SEO 标题（可选）" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">SEO 描述</Label>
				<TextField
					value={value.seo?.description ?? ""}
					onChange={(v) => onPatch({ seo: { ...(value.seo ?? {}), description: v } })}
				>
					<Label className="sr-only">seo description</Label>
					<Input placeholder="SEO 描述（可选）" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">Canonical</Label>
				<TextField
					value={value.seo?.canonical ?? ""}
					onChange={(v) => onPatch({ seo: { ...(value.seo ?? {}), canonical: v } })}
				>
					<Label className="sr-only">seo canonical</Label>
					<Input placeholder="https://example.com" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">语言/地区</Label>
				<TextField
					value={value.seo?.locale ?? "zh-CN"}
					onChange={(v) => onPatch({ seo: { ...(value.seo ?? {}), locale: v } })}
				>
					<Label className="sr-only">seo locale</Label>
					<Input placeholder="zh-CN" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">国家</Label>
				<TextField
					value={value.geo?.country ?? "CN"}
					onChange={(v) => onPatch({ geo: { ...(value.geo ?? {}), country: v } })}
				>
					<Label className="sr-only">geo country</Label>
					<Input placeholder="CN" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">地区</Label>
				<TextField
					value={value.geo?.region ?? ""}
					onChange={(v) => onPatch({ geo: { ...(value.geo ?? {}), region: v } })}
				>
					<Label className="sr-only">geo region</Label>
					<Input placeholder="河南" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">城市</Label>
				<TextField
					value={value.geo?.city ?? ""}
					onChange={(v) => onPatch({ geo: { ...(value.geo ?? {}), city: v } })}
				>
					<Label className="sr-only">geo city</Label>
					<Input placeholder="郑州" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">地点名</Label>
				<TextField
					value={value.geo?.placename ?? ""}
					onChange={(v) => onPatch({ geo: { ...(value.geo ?? {}), placename: v } })}
				>
					<Label className="sr-only">geo placename</Label>
					<Input placeholder="Go Nav" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">纬度</Label>
				<TextField
					value={value.geo?.latitude ?? ""}
					onChange={(v) => onPatch({ geo: { ...(value.geo ?? {}), latitude: v } })}
				>
					<Label className="sr-only">geo latitude</Label>
					<Input placeholder="34.747" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">经度</Label>
				<TextField
					value={value.geo?.longitude ?? ""}
					onChange={(v) => onPatch({ geo: { ...(value.geo ?? {}), longitude: v } })}
				>
					<Label className="sr-only">geo longitude</Label>
					<Input placeholder="113.625" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">邮编</Label>
				<TextField
					value={value.geo?.postalCode ?? ""}
					onChange={(v) => onPatch({ geo: { ...(value.geo ?? {}), postalCode: v } })}
				>
					<Label className="sr-only">geo postalCode</Label>
					<Input placeholder="450000" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">Logo</Label>
				<IconPicker
					value={value.logo}
					uploadPrefix="logo"
					hint="建议透明背景的横向或正方形 Logo，推荐高度至少 128px；支持 PNG、SVG、WebP，也可填写图片 URL。"
					onChange={(v) => onPatch({ logo: v })}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">Favicon</Label>
				<IconPicker
					value={value.favicon}
					uploadPrefix="favicon"
					hint="建议正方形 32×32、64×64 或 128×128；支持 ICO、SVG、PNG，也可填写图片 URL。"
					onChange={(v) => onPatch({ favicon: v })}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">作者</Label>
				<TextField
					value={value.author}
					onChange={(v) => onPatch({ author: v })}
				>
					<Label className="sr-only">author</Label>
					<Input />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">版权</Label>
				<TextField
					value={value.copyright}
					onChange={(v) => onPatch({ copyright: v })}
				>
					<Label className="sr-only">copyright</Label>
					<Input />
				</TextField>
			</div>
		</div>
	);
}

function AccessProtectionEditor({
	value,
	onPatch,
}: {
	value: NavConfig;
	onPatch: (p: Partial<NavConfig>) => void;
}) {
	const config = value.accessProtection ?? { enabled: false };
	const passwordConfigured = config.passwordConfigured === true;
	const newPassword = config.newPassword ?? "";
	const confirmPassword = config.confirmPassword ?? "";
	const passwordTooShort = newPassword.length > 0 && newPassword.length < 4;
	const passwordMismatch =
		confirmPassword.length > 0 && newPassword !== confirmPassword;

	const patch = (next: Partial<SiteAccessProtectionConfig>) => {
		onPatch({
			accessProtection: {
				...config,
				...next,
			},
		});
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 rounded-2xl border border-default-200 bg-default-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
						<BiLockAlt className="size-5" />
					</div>
					<div>
						<h3 className="text-sm font-semibold">访问密码保护</h3>
						<p className="mt-1 max-w-2xl text-xs leading-5 text-default-500">
							开启后，访客需要先输入密码，验证通过后才能查看首页和网站详情页。
							管理后台不受影响。
						</p>
					</div>
				</div>
				<AdminSwitch
					isSelected={config.enabled === true}
					onChange={(enabled) => patch({ enabled })}
					ariaLabel="开启访问密码保护"
				>
					<span className="text-sm font-medium">
						{config.enabled ? "已开启" : "未开启"}
					</span>
				</AdminSwitch>
			</div>

			<div>
				<h3 className="text-sm font-semibold">设置访问密码</h3>
				<p className="mt-1 text-xs leading-5 text-default-500">
					{passwordConfigured
						? "已设置访问密码。下方留空会保留当前密码，填写后保存则会更换密码，并使已有访问授权失效。"
						: "尚未设置访问密码。开启保护时必须填写，密码长度为 4–128 个字符。"}
				</p>
			</div>

			<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
				<AccessPasswordField
					label={passwordConfigured ? "新访问密码（可选）" : "访问密码"}
					value={newPassword}
					onChange={(newPasswordValue) =>
						patch({ newPassword: newPasswordValue })
					}
					autoComplete="new-password"
					placeholder={
						passwordConfigured ? "留空则不修改" : "至少 4 个字符"
					}
					error={passwordTooShort ? "访问密码至少需要 4 个字符" : ""}
				/>
				<AccessPasswordField
					label="确认访问密码"
					value={confirmPassword}
					onChange={(confirmPasswordValue) =>
						patch({ confirmPassword: confirmPasswordValue })
					}
					autoComplete="new-password"
					placeholder="再次输入访问密码"
					error={passwordMismatch ? "两次输入的访问密码不一致" : ""}
				/>
			</div>

			<div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
				访问保护仅在 Server 部署模式下生效。密码会以带随机盐的哈希保存，
				不会写入页面或下发给访客。
			</div>
		</div>
	);
}

function AccessPasswordField({
	label,
	value,
	onChange,
	autoComplete,
	placeholder,
	error,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	autoComplete: string;
	placeholder: string;
	error: string;
}) {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<TextField
			value={value}
			onChange={onChange}
			isInvalid={Boolean(error)}
			fullWidth
		>
			<Label>{label}</Label>
			<InputGroup>
				<InputGroup.Input
					type={isVisible ? "text" : "password"}
					autoComplete={autoComplete}
					placeholder={placeholder}
					maxLength={128}
				/>
				<InputGroup.Suffix className="pr-0">
					<Button
						isIconOnly
						aria-label={isVisible ? "隐藏密码" : "显示密码"}
						size="sm"
						variant="ghost"
						onPress={() => setIsVisible((current) => !current)}
					>
						{isVisible ? (
							<BiShow className="size-4" />
						) : (
							<BiHide className="size-4" />
						)}
					</Button>
				</InputGroup.Suffix>
			</InputGroup>
			{error ? <FieldError>{error}</FieldError> : null}
		</TextField>
	);
}

function ThemeEditor({
	value,
	onPatch,
}: {
	value: NavConfig;
	onPatch: (p: Partial<NavConfig>) => void;
}) {
	const patchCardStyle = (cardStyle: CardStyle) => {
		onPatch({ layout: { ...(value.layout ?? {}), cardStyle } });
	};
	const [previewPosition, setPreviewPosition] = useState({ x: 24, y: 24 });
	const [isDraggingPreview, setIsDraggingPreview] = useState(false);

	useEffect(() => {
		if (!isDraggingPreview) return;
		const handlePointerMove = (event: PointerEvent) => {
			setPreviewPosition((current) => ({
				x: Math.max(8, Math.min(window.innerWidth - 328, current.x + event.movementX)),
				y: Math.max(8, Math.min(window.innerHeight - 188, current.y + event.movementY)),
			}));
		};
		const stopDragging = () => setIsDraggingPreview(false);
		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", stopDragging);
		return () => {
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", stopDragging);
		};
	}, [isDraggingPreview]);

	const panelClass =
		"rounded-3xl border border-slate-200/80 bg-white/70 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/70";
	const optionClass =
		"rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(59,130,246,0.08)]";
	const activeOptionClass =
		"border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-[0_12px_24px_rgba(59,130,246,0.12)] dark:border-blue-400 dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-blue-200";
	const inactiveOptionClass =
		"border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300 hover:bg-slate-100/80 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/60";

	return (
		<div className="flex flex-col gap-5">
			<div className={panelClass}>
				<div className="mb-4 flex items-center justify-between gap-3">
					<div>
						<h3 className="text-sm font-semibold tracking-[0.08em] text-slate-900 uppercase dark:text-white">
							主题模式
						</h3>
						<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
							决定站点的默认配色方案，支持自动跟随系统。
						</p>
					</div>
					<span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
						视觉层级
					</span>
				</div>
				<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
					{(
						[
							{
								key: "light" as ThemeMode,
								icon: BiSun,
								label: "浅色",
								desc: "明亮清新",
							},
							{
								key: "dark" as ThemeMode,
								icon: BiMoon,
								label: "深色",
								desc: "护眼沉浸",
							},
							{
								key: "system" as ThemeMode,
								icon: BiDesktop,
								label: "跟随系统",
								desc: "自动切换",
							},
						] as const
					).map((mode) => {
						const active = (value.themeMode ?? "light") === mode.key;
						const Icon = mode.icon;
						return (
							<button
								key={mode.key}
								type="button"
								onClick={() => onPatch({ themeMode: mode.key })}
								className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-5 transition-all ${
									active
										? activeOptionClass
										: inactiveOptionClass
								}`}
							>
								<Icon className="h-6 w-6" />
								<span className="text-base font-semibold">{mode.label}</span>
								<span className="text-xs font-medium opacity-70">{mode.desc}</span>
							</button>
						);
					})}
				</div>
			</div>

			<div className={panelClass}>
				<div className="mb-4 flex items-center justify-between gap-3">
					<div>
						<h3 className="text-sm font-semibold tracking-[0.08em] text-slate-900 uppercase dark:text-white">
							页面排版风格
						</h3>
						<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
							调整首页内容的宽度、留白和标题节奏，提升整体层级感。
						</p>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
					{([
						{ key: "default" as PageLayoutStyle, label: "标准导航", desc: "均衡紧凑" },
						{ key: "editorial" as PageLayoutStyle, label: "编辑精选", desc: "标题更醒目" },
						{ key: "dense" as PageLayoutStyle, label: "高密度", desc: "适合快速扫描" },
						{ key: "airy" as PageLayoutStyle, label: "舒展留白", desc: "更轻盈从容" },
					] as const).map((item) => {
						const active = (value.layout?.pageLayoutStyle ?? "default") === item.key;
						return (
							<button
								key={item.key}
								type="button"
								onClick={() => onPatch({ layout: { ...(value.layout ?? {}), pageLayoutStyle: item.key } })}
								className={`${optionClass} ${active ? activeOptionClass : inactiveOptionClass}`}
							>
								<span className="text-sm font-semibold">{item.label}</span>
								<span className="mt-1 block text-xs opacity-70">{item.desc}</span>
							</button>
						);
					})}
				</div>
			</div>

			<div className={panelClass}>
				<div className="mb-4 flex items-center justify-between gap-3">
					<div>
						<h3 className="text-sm font-semibold tracking-[0.08em] text-slate-900 uppercase dark:text-white">
							主页主题风格
						</h3>
						<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
							切换首页展示模式，轮播图、广告和分类区会同步展现对应气质。
						</p>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					{([
						{ key: "classic" as HomeThemeStyle, label: "大厂导航首页", desc: "成熟、稳重、适合品牌入口" },
						{ key: "editorial" as HomeThemeStyle, label: "内容型导航站", desc: "更像资讯与内容聚合首页" },
						{ key: "portal" as HomeThemeStyle, label: "资源型站点", desc: "适合工具、资源与入口聚合" },
						{ key: "compact" as HomeThemeStyle, label: "本地服务型站点", desc: "更适合本地服务与高密度展示" },
						{ key: "showcase" as HomeThemeStyle, label: "展示型首页", desc: "聚焦产品、案例与品牌展示" },
						{ key: "resource" as HomeThemeStyle, label: "资源聚合页", desc: "适合工具、资料与知识库" },
						{ key: "service" as HomeThemeStyle, label: "服务型入口", desc: "适合企业服务、代理与本地化入口" },
						{ key: "spotlight" as HomeThemeStyle, label: "焦点型首页", desc: "突出推荐位和重点内容" },
						{ key: "glass" as HomeThemeStyle, label: "液态玻璃", desc: "轻盈透亮，适合高级品牌页" },
						{ key: "glass-aurora" as HomeThemeStyle, label: "极光玻璃", desc: "彩色渐变、视觉冲击强" },
						{ key: "glass-ice" as HomeThemeStyle, label: "冰晶玻璃", desc: "清凉简洁，适合工具站" },
						{ key: "glass-frost" as HomeThemeStyle, label: "雾霭玻璃", desc: "柔和雾感，适合文档与资源型站" },
						{ key: "glass-tech" as HomeThemeStyle, label: "科技玻璃", desc: "更偏企业与平台风格" },
						{ key: "glass-luxury" as HomeThemeStyle, label: "轻奢玻璃", desc: "高端、温润、适合品牌展示" },
						{ key: "glass-minimal" as HomeThemeStyle, label: "极简玻璃", desc: "纯净留白，偏现代内容站" },
					] as const).map((item) => {
						const active = (value.layout?.homeTheme ?? "classic") === item.key;
						return (
							<button
								key={item.key}
								type="button"
								onClick={() => onPatch({ layout: { ...(value.layout ?? {}), homeTheme: item.key } })}
								className={`${optionClass} ${active ? activeOptionClass : inactiveOptionClass}`}
							>
								<span className="text-sm font-semibold">{item.label}</span>
								<span className="mt-1 block text-xs opacity-70">{item.desc}</span>
							</button>
						);
					})}
				</div>
			</div>

			<Separator />

			{(() => {
				const background = value.customTheme?.themeBackground ?? {
					mode: "preset",
					presetId: "aurora",
					blur: 8,
					liquid: 0.42,
					opacity: 0.72,
				} as ThemeBackgroundConfig;
				const textStyle = value.customTheme?.textStyle ?? {
					color: "#0f172a",
					mutedColor: "#64748b",
					titleColor: "#0f172a",
					linkColor: "#2563eb",
					fontFamily: "PingFang SC, Microsoft YaHei, sans-serif",
					fontSize: 14,
					titleSize: 20,
					mutedSize: 12,
					fontWeight: 400,
					titleWeight: 600,
					lineHeight: 1.6,
					letterSpacing: 0,
				};
				const patchBackground = (next: Partial<ThemeBackgroundConfig>) => {
					onPatch({
						customTheme: {
							...(value.customTheme ?? {}),
							themeBackground: { ...background, ...next },
						},
					});
				};
				const patchTextStyle = (next: Partial<typeof textStyle>) => {
					onPatch({
						customTheme: {
							...(value.customTheme ?? {}),
							textStyle: { ...textStyle, ...next },
						},
					});
				};
				const applyTextPreset = (preset: (typeof THEME_TEXT_PRESETS)[number]) => {
					const { id: _id, name: _name, ...presetStyle } = preset;
					onPatch({
						customTheme: {
							...(value.customTheme ?? {}),
							textStyle: { ...textStyle, ...presetStyle },
						},
					});
				};
				const currentPreset = THEME_BACKGROUND_PRESETS.find((preset) => preset.id === background.presetId) ?? THEME_BACKGROUND_PRESETS[0];
				const currentGradient = THEME_GRADIENT_PRESETS.find((preset) => preset.value === background.gradient) ?? THEME_GRADIENT_PRESETS[0];
				const previewLabel = background.mode === "upload" && background.image ? "自定义图片" : background.mode === "gradient" ? currentGradient.name : background.mode === "solid" ? "纯色背景" : currentPreset.name;
				const previewStyle =
					background.mode === "solid"
						? { background: background.solidColor ?? "#dbeafe" }
						: background.mode === "gradient"
							? { background: background.gradient ?? currentGradient.value }
							: background.mode === "upload" && background.image
								? { backgroundImage: `url("${background.image}")` }
								: { backgroundImage: `url("${currentPreset.image}")` };
				const solidColorPresets = ["#dbeafe", "#d1fae5", "#fef3c7", "#fbcfe8", "#e2e8f0", "#e9d5ff", "#dbeafe", "#f5d0fe", "#c7d2fe", "#bfdbfe"];
				return (
					<>
						<div className={`${panelClass} flex flex-col gap-4`}>
							<div className="mb-4 flex items-center justify-between gap-3">
								<div>
									<h3 className="text-sm font-semibold tracking-[0.08em] text-slate-900 uppercase dark:text-white">主题背景</h3>
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">可上传自定义背景图，或使用内置光影、渐变与纯色主题。推荐横向 16:9 或更宽，建议 1920×1080；支持 JPG、PNG、WebP，重要内容避免贴边，图片会居中裁剪。</p>
								</div>
								<span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
									{previewLabel}
								</span>
							</div>
							<div className="fixed z-50 w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/30 bg-slate-950/90 p-2 shadow-2xl shadow-slate-950/25 backdrop-blur-xl" style={{ left: previewPosition.x, top: previewPosition.y }}>
								<div
									className="mb-2 flex cursor-move items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1.5"
									onPointerDown={() => setIsDraggingPreview(true)}
									title="拖动预览"
								>
									<span className="text-[10px] font-semibold tracking-[0.12em] text-white/80 uppercase">当前背景效果</span>
									<span className="text-[10px] text-white/50">拖动</span>
								</div>
								<div className="relative h-28 overflow-hidden rounded-xl border border-white/20 bg-slate-900/80">
									<div
										className="absolute inset-0 bg-cover bg-center"
										style={{
											...previewStyle,
											filter: `blur(${background.blur ?? 8}px) saturate(1.12) brightness(1.03)`,
											opacity: background.opacity ?? 0.72,
										}}
									/>
									<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.38),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.22),transparent_35%)] opacity-100" />
									<div className="absolute inset-x-3 bottom-3 rounded-lg border border-white/30 bg-white/10 p-2 backdrop-blur-md">
										<div className="mt-1 flex items-center gap-2 text-[11px] text-white/80">
											<span>模糊 {background.blur ?? 8}px</span>
											<span>•</span>
											<span>液态 {Math.round((background.liquid ?? 0.42) * 100)}%</span>
										</div>
									</div>
								</div>
							</div>

						<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
							{THEME_BACKGROUND_PRESETS.map((preset) => {
								const active = background.mode === "preset" && background.presetId === preset.id;
								return (
									<button
										key={preset.id}
										type="button"
										onClick={() => patchBackground({ mode: "preset", presetId: preset.id })}
										className={`overflow-hidden rounded-lg border p-0.5 text-left transition ${active ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950/50" : "border-gray-200 dark:border-neutral-800"}`}
									>
										<div className="h-10 w-full rounded-md bg-cover bg-center" style={{ backgroundImage: `url("${preset.image}")`, filter: `blur(${Math.min(2, (background.blur ?? 8) / 8)}px)` }} />
										<div className="truncate px-0.5 py-1 text-[10px] font-medium">{preset.name}</div>
									</button>
								);
							})}
						</div>

						<div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
							{THEME_GRADIENT_PRESETS.map((preset) => {
								const active = background.mode === "gradient" && background.gradient === preset.value;
								return (
									<button
										key={preset.id}
										type="button"
										onClick={() => patchBackground({ mode: "gradient", gradient: preset.value })}
										className={`overflow-hidden rounded-lg border p-0.5 text-left transition ${active ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950/50" : "border-gray-200 dark:border-neutral-800"}`}
									>
										<div className="relative h-9 w-full overflow-hidden rounded-md" style={{ background: preset.value }}>
											<div className="absolute inset-0" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5), transparent 35%)", opacity: Math.min(1, (background.liquid ?? 0.42) + 0.2) }} />
										</div>
										<div className="truncate px-0.5 py-1 text-[10px] font-medium">{preset.name}</div>
									</button>
								);
							})}
						</div>

						<div className="rounded-2xl border border-dashed border-default-200 bg-default-50/60 p-4">
							<div className="mb-3 flex items-center justify-between gap-3">
								<span className="text-sm font-medium">纯色背景</span>
								<button
									type="button"
									onClick={() => patchBackground({ mode: "solid", solidColor: "#dbeafe" })}
									className="rounded-lg border border-default-200 px-2 py-1 text-xs text-default-600 hover:border-default-300"
								>
									选择纯色
								</button>
							</div>
							<div className="grid grid-cols-5 gap-2 lg:grid-cols-10">
								{solidColorPresets.map((color) => (
									<button
										key={color}
										type="button"
										onClick={() => patchBackground({ mode: "solid", solidColor: color })}
										className={`h-10 rounded-lg border-2 ${background.mode === "solid" && background.solidColor === color ? "border-slate-900 dark:border-white" : "border-transparent"}`}
										style={{ background: color }}
										aria-label={`选择纯色 ${color}`}
									/>
								))}
							</div>
							<div className="mt-3 flex items-center gap-3">
								<label className="flex items-center gap-2 text-xs text-default-600">
									<span>自定义</span>
									<input
										type="color"
										value={background.mode === "solid" && background.solidColor ? background.solidColor : "#dbeafe"}
										onChange={(event) => patchBackground({ mode: "solid", solidColor: event.target.value })}
										className="h-8 w-14 rounded-md border border-default-200 bg-transparent p-0"
									/>
								</label>
								<input
									type="text"
									value={background.mode === "solid" && background.solidColor ? background.solidColor : "#dbeafe"}
									onChange={(event) => patchBackground({ mode: "solid", solidColor: event.target.value })}
									placeholder="#dbeafe"
									className="h-8 w-28 rounded-md border border-default-200 bg-transparent px-2 text-xs uppercase"
									aria-label="背景颜色值"
								/>
							</div>
						</div>

						<div className="rounded-2xl border border-dashed border-default-200 bg-default-50/60 p-4">
							<div className="mb-3 flex items-center justify-between gap-3">
								<span className="text-sm font-medium">自定义上传图片</span>
								<button
									type="button"
									onClick={() => patchBackground({ mode: "upload", image: "" })}
									className="rounded-lg border border-default-200 px-2 py-1 text-xs text-default-600 hover:border-default-300"
								>
									清空自定义图
								</button>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<input
									type="file"
									accept="image/*"
									className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-2 file:text-white hover:file:bg-blue-600 dark:text-neutral-300"
									onChange={async (event) => {
										const file = event.target.files?.[0];
										event.target.value = "";
										if (!file) return;
										const { uploadImageWithCompression } = await import("@/lib/client/image-upload");
										const url = await uploadImageWithCompression(file, {
											maxEdge: 1800,
											quality: 0.8,
											compress: true,
											forceWebp: true,
											fileNamePrefix: "theme-bg",
										});
										patchBackground({ mode: "upload", image: url });
									}}
								/>
							</div>
							{background.mode === "upload" && background.image ? (
								<div className="mt-3 h-20 overflow-hidden rounded-lg border border-default-200 bg-white/60 dark:bg-slate-950/40">
									<div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url("${background.image}")`, filter: `blur(${Math.min(2, (background.blur ?? 8) / 8)}px)` }} />
								</div>
							) : null}
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<label className="flex flex-col gap-2 text-sm">
								<span>图片模糊</span>
								<input
									type="range"
									min={0}
									max={24}
									step={1}
									value={background.blur ?? 8}
									onChange={(event) => patchBackground({ blur: Number(event.target.value) })}
									className="w-full accent-blue-500"
								/>
								<span className="text-xs text-default-500">{background.blur ?? 8}px</span>
							</label>
							<label className="flex flex-col gap-2 text-sm">
								<span>液态强度</span>
								<input
									type="range"
									min={0}
									max={100}
									step={1}
									value={Math.round((background.liquid ?? 0.42) * 100)}
									onChange={(event) => patchBackground({ liquid: Number(event.target.value) / 100 })}
									className="w-full accent-violet-500"
								/>
								<span className="text-xs text-default-500">{Math.round((background.liquid ?? 0.42) * 100)}%</span>
							</label>
							<label className="flex flex-col gap-2 text-sm">
								<span>背景透明度</span>
								<input
									type="range"
									min={0}
									max={100}
									step={1}
									value={Math.round((background.opacity ?? 0.72) * 100)}
									onChange={(event) => patchBackground({ opacity: Number(event.target.value) / 100 })}
									className="w-full accent-cyan-500"
								/>
								<span className="text-xs text-default-500">{Math.round((background.opacity ?? 0.72) * 100)}%</span>
							</label>
						</div>

						<div className="rounded-2xl border border-default-200 bg-default-50/70 p-4">
							<div className="mb-3">
								<h4 className="text-sm font-semibold">网页文字设置</h4>
								<p className="mt-1 text-xs text-default-500">从高端搭配模板开始，也可以继续微调各层级文字效果。</p>
							</div>
							<div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-10">
								{THEME_TEXT_PRESETS.map((preset) => (
									<button key={preset.id} type="button" onClick={() => applyTextPreset(preset)} className="rounded-lg border border-slate-200 bg-white/70 px-2 py-2 text-left text-[10px] font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-sm dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-200">
										<span className="block truncate" style={{ fontFamily: preset.titleFontFamily }}>{preset.name}</span>
										<span className="mt-1 block text-[9px] font-normal text-slate-400">标题搭配</span>
									</button>
								))}
							</div>
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
								<label className="flex flex-col gap-2 text-sm">
									<span>文字颜色</span>
									<input
										type="color"
										value={textStyle.color ?? "#0f172a"}
										onChange={(event) => patchTextStyle({ color: event.target.value })}
										className="h-10 w-full rounded-lg border border-default-200 bg-transparent p-1"
									/>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>标题颜色</span>
									<input type="color" value={textStyle.titleColor ?? "#0f172a"} onChange={(event) => patchTextStyle({ titleColor: event.target.value })} className="h-10 w-full rounded-lg border border-default-200 bg-transparent p-1" />
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>辅助文字颜色</span>
									<input type="color" value={textStyle.mutedColor ?? "#64748b"} onChange={(event) => patchTextStyle({ mutedColor: event.target.value })} className="h-10 w-full rounded-lg border border-default-200 bg-transparent p-1" />
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>链接颜色</span>
									<input type="color" value={textStyle.linkColor ?? "#2563eb"} onChange={(event) => patchTextStyle({ linkColor: event.target.value })} className="h-10 w-full rounded-lg border border-default-200 bg-transparent p-1" />
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>字体</span>
									<select
										value={textStyle.fontFamily ?? "PingFang SC, Microsoft YaHei, sans-serif"}
										onChange={(event) => patchTextStyle({ fontFamily: event.target.value })}
										className="h-10 rounded-lg border border-default-200 bg-transparent px-3 text-sm"
									>
										<option value="PingFang SC, Microsoft YaHei, sans-serif">PingFang / 微软雅黑</option>
										<option value="Microsoft YaHei, PingFang SC, sans-serif">Microsoft YaHei</option>
										<option value="Noto Sans SC, Source Han Sans SC, sans-serif">Noto Sans SC / 思源黑体</option>
										<option value="Noto Serif SC, Source Han Serif SC, serif">Noto Serif SC / 思源宋体</option>
										<option value="LXGW WenKai, KaiTi, serif">霞鹜文楷</option>
										<option value="IBM Plex Sans, sans-serif">IBM Plex Sans</option>
										<option value="Source Code Pro, JetBrains Mono, monospace">Source Code Pro / JetBrains Mono</option>
										<option value="Segoe UI, sans-serif">Segoe UI</option>
										<option value="Helvetica Neue, Arial, sans-serif">Helvetica Neue</option>
										<option value="Georgia, serif">Georgia</option>
										<option value='"Times New Roman", serif'>Times New Roman</option>
									</select>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>字号</span>
									<input
										type="range"
										min={12}
										max={24}
										step={1}
										value={textStyle.fontSize ?? 14}
										onChange={(event) => patchTextStyle({ fontSize: Number(event.target.value) })}
										className="w-full accent-blue-500"
									/>
									<span className="text-xs text-default-500">{textStyle.fontSize ?? 14}px</span>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>标题字号</span>
									<input type="range" min={16} max={42} step={1} value={textStyle.titleSize ?? 20} onChange={(event) => patchTextStyle({ titleSize: Number(event.target.value) })} className="w-full accent-blue-500" />
									<span className="text-xs text-default-500">{textStyle.titleSize ?? 20}px</span>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>辅助文字字号</span>
									<input type="range" min={10} max={20} step={1} value={textStyle.mutedSize ?? 12} onChange={(event) => patchTextStyle({ mutedSize: Number(event.target.value) })} className="w-full accent-cyan-500" />
									<span className="text-xs text-default-500">{textStyle.mutedSize ?? 12}px</span>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>字重</span>
									<select
										value={String(textStyle.fontWeight ?? 400)}
										onChange={(event) => patchTextStyle({ fontWeight: Number(event.target.value) })}
										className="h-10 rounded-lg border border-default-200 bg-transparent px-3 text-sm"
									>
										<option value={300}>300</option>
										<option value={400}>400</option>
										<option value={500}>500</option>
										<option value={600}>600</option>
										<option value={700}>700</option>
									</select>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>标题字重</span>
									<select value={String(textStyle.titleWeight ?? 600)} onChange={(event) => patchTextStyle({ titleWeight: Number(event.target.value) })} className="h-10 rounded-lg border border-default-200 bg-transparent px-3 text-sm">
										<option value={400}>400</option><option value={500}>500</option><option value={600}>600</option><option value={700}>700</option><option value={800}>800</option>
									</select>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>标题字体</span>
									<select value={textStyle.titleFontFamily ?? textStyle.fontFamily} onChange={(event) => patchTextStyle({ titleFontFamily: event.target.value })} className="h-10 rounded-lg border border-default-200 bg-transparent px-3 text-sm">
										<option value="PingFang SC, Microsoft YaHei, sans-serif">PingFang / 微软雅黑</option>
										<option value="Noto Sans SC, Source Han Sans SC, sans-serif">Noto Sans SC / 思源黑体</option>
										<option value="Noto Serif SC, Source Han Serif SC, serif">Noto Serif SC / 思源宋体</option>
										<option value="LXGW WenKai, KaiTi, serif">霞鹜文楷</option>
										<option value="IBM Plex Sans, sans-serif">IBM Plex Sans</option>
										<option value="Georgia, serif">Georgia</option>
									</select>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>行高</span>
									<input
										type="range"
										min={1.2}
										max={2.4}
										step={0.1}
										value={textStyle.lineHeight ?? 1.6}
										onChange={(event) => patchTextStyle({ lineHeight: Number(event.target.value) })}
										className="w-full accent-violet-500"
									/>
									<span className="text-xs text-default-500">{textStyle.lineHeight ?? 1.6}</span>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>字间距</span>
									<input
										type="range"
										min={-10}
										max={40}
										step={1}
										value={textStyle.letterSpacing ?? 0}
										onChange={(event) => patchTextStyle({ letterSpacing: Number(event.target.value) })}
										className="w-full accent-cyan-500"
									/>
									<span className="text-xs text-default-500">{textStyle.letterSpacing ?? 0}px</span>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>标题字间距</span>
									<input type="range" min={-10} max={60} step={1} value={textStyle.titleLetterSpacing ?? 0} onChange={(event) => patchTextStyle({ titleLetterSpacing: Number(event.target.value) })} className="w-full accent-violet-500" />
									<span className="text-xs text-default-500">{textStyle.titleLetterSpacing ?? 0}px</span>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>正文透明度</span>
									<input type="range" min={35} max={100} step={1} value={Math.round((textStyle.textOpacity ?? 1) * 100)} onChange={(event) => patchTextStyle({ textOpacity: Number(event.target.value) / 100 })} className="w-full accent-cyan-500" />
									<span className="text-xs text-default-500">{Math.round((textStyle.textOpacity ?? 1) * 100)}%</span>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>标题透明度</span>
									<input type="range" min={35} max={100} step={1} value={Math.round((textStyle.titleOpacity ?? 1) * 100)} onChange={(event) => patchTextStyle({ titleOpacity: Number(event.target.value) / 100 })} className="w-full accent-blue-500" />
									<span className="text-xs text-default-500">{Math.round((textStyle.titleOpacity ?? 1) * 100)}%</span>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>文字特效</span>
									<select value={textStyle.textShadow ?? "none"} onChange={(event) => patchTextStyle({ textShadow: event.target.value })} className="h-10 rounded-lg border border-default-200 bg-transparent px-3 text-sm">
										<option value="none">无效果</option><option value="0 1px 3px rgba(15,23,42,0.18)">柔和阴影</option><option value="0 2px 8px rgba(37,99,235,0.2)">品牌光晕</option><option value="0 3px 6px rgba(15,23,42,0.22)">深层阴影</option><option value="1px 1px 0 #fff, -1px -1px 0 #fff">细线描边</option><option value="0 1px 0 #fff, 0 2px 0 rgba(15,23,42,0.2)">浮雕高光</option><option value="0 0 4px currentColor, 0 0 12px currentColor">柔和霓虹</option><option value="2px 2px 0 rgba(37,99,235,0.22)">偏移立体</option><option value="0 0 2px rgba(15,23,42,0.25)">微光锐化</option><option value="0 4px 12px rgba(14,116,144,0.25)">悬浮光影</option>
									</select>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>标题特效</span>
									<select value={textStyle.titleShadow ?? "none"} onChange={(event) => patchTextStyle({ titleShadow: event.target.value })} className="h-10 rounded-lg border border-default-200 bg-transparent px-3 text-sm">
										<option value="none">无效果</option><option value="0 2px 10px rgba(15,23,42,0.16)">柔和阴影</option><option value="0 3px 12px rgba(37,99,235,0.24)">标题光晕</option><option value="2px 3px 0 rgba(244,63,94,0.15)">撞色立体</option><option value="1px 1px 0 #fff, -1px -1px 0 #fff">细线描边</option><option value="0 1px 0 #fff, 0 2px 0 rgba(15,23,42,0.25)">浮雕高光</option><option value="0 0 5px currentColor, 0 0 16px currentColor">标题霓虹</option><option value="3px 3px 0 rgba(37,99,235,0.2)">斜向立体</option><option value="0 0 3px rgba(15,23,42,0.28)">清晰锐化</option><option value="0 5px 16px rgba(14,116,144,0.28)">悬浮标题</option>
									</select>
								</label>
								<label className="flex flex-col gap-2 text-sm">
									<span>英文格式</span>
									<select value={textStyle.textTransform ?? "none"} onChange={(event) => patchTextStyle({ textTransform: event.target.value as "none" | "uppercase" })} className="h-10 rounded-lg border border-default-200 bg-transparent px-3 text-sm"><option value="none">保持原样</option><option value="uppercase">英文大写</option></select>
								</label>
								<label className="flex items-center gap-2 pt-6 text-sm"><input type="checkbox" checked={textStyle.linkUnderline === true} onChange={(event) => patchTextStyle({ linkUnderline: event.target.checked })} />链接下划线</label>
							</div>
							<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
								<div className="rounded-xl border border-default-200 bg-white/60 p-2 dark:bg-slate-950/30" style={{ color: textStyle.color }}><span className="block text-[10px] text-default-500">颜色</span><strong className="text-sm">正文 Aa</strong></div>
								<div className="rounded-xl border border-default-200 bg-white/60 p-2 dark:bg-slate-950/30" style={{ fontSize: `${textStyle.titleSize ?? 20}px`, color: textStyle.titleColor }}><span className="block text-[10px] text-default-500">字号</span><strong>标题</strong></div>
								<div className="rounded-xl border border-default-200 bg-white/60 p-2 dark:bg-slate-950/30" style={{ fontFamily: textStyle.fontFamily }}><span className="block text-[10px] text-default-500">字体</span><strong>风格 Aa</strong></div>
								<div className="rounded-xl border border-default-200 bg-white/60 p-2 dark:bg-slate-950/30" style={{ textShadow: textStyle.titleShadow }}><span className="block text-[10px] text-default-500">阴影</span><strong>立体光感</strong></div>
								<div className="rounded-xl border border-default-200 bg-white/60 p-2 dark:bg-slate-950/30" style={{ letterSpacing: `${(textStyle.titleLetterSpacing ?? 0) / 100}em` }}><span className="block text-[10px] text-default-500">间距</span><strong>字距预览</strong></div>
								<div className="rounded-xl border border-default-200 bg-white/60 p-2 dark:bg-slate-950/30" style={{ opacity: textStyle.textOpacity ?? 1 }}><span className="block text-[10px] text-default-500">透明度</span><strong>层次显示</strong></div>
							</div>
							<div className="mt-4 rounded-xl border border-default-200 bg-white/70 p-3 text-sm dark:bg-slate-950/30" style={{ color: textStyle.color ?? "#0f172a", fontFamily: textStyle.fontFamily ?? "PingFang SC, Microsoft YaHei, sans-serif", fontSize: `${textStyle.fontSize ?? 14}px`, fontWeight: textStyle.fontWeight ?? 400, lineHeight: textStyle.lineHeight ?? 1.6, letterSpacing: `${(textStyle.letterSpacing ?? 0) / 100}em` }}>
								示例文字：这是页面文字样式预览，您可以直接调节颜色、大小、字体和间距。
							</div>
						</div>
						</div>
					</>
				);
				})()}

			<Separator />

			<div>
				<h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
					卡片样式
				</h3>
				<p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
					常规样式保留当前紧凑卡片；预览图样式会展示网址的预览图，适合更视觉化的首页。
				</p>
			</div>
			<div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
				{(
					[
						{
							key: "compact" as CardStyle,
							label: "常规卡片",
							desc: "紧凑、信息密度高",
						},
						{
							key: "preview" as CardStyle,
							label: "预览图卡片",
							desc: "类似 Vercel 模板卡片",
						},
						{
							key: "glass" as CardStyle,
							label: "玻璃卡片",
							desc: "轻盈透明、适合高级展示",
						},
						{
							key: "glass-soft" as CardStyle,
							label: "柔光玻璃",
							desc: "温和轻透，适合品牌导航",
						},
						{
							key: "glass-aurora" as CardStyle,
							label: "极光玻璃",
							desc: "渐变流光，更有科技感",
						},
						{
							key: "glass-contrast" as CardStyle,
							label: "对比玻璃",
							desc: "增强层次，适合重点入口",
						},
						{
							key: "glass-strong" as CardStyle,
							label: "强反差玻璃",
							desc: "更明显的深浅层级",
						},
						{
							key: "glass-tech" as CardStyle,
							label: "科技玻璃",
							desc: "更偏企业与平台风格",
						},
						{
							key: "glass-luxury" as CardStyle,
							label: "轻奢玻璃",
							desc: "高端质感，比传统玻璃更高级",
						},
						{
							key: "glass-minimal" as CardStyle,
							label: "极简玻璃",
							desc: "留白与清晰层级更突出",
						},
						{
							key: "feature" as CardStyle,
							label: "功能卡片",
							desc: "突出推荐和官网特色",
						},
						{
							key: "list" as CardStyle,
							label: "列表卡片",
							desc: "适合条目型导航密集展示",
						},
						{
							key: "outline" as CardStyle,
							label: "线框卡片",
							desc: "简洁现代、适合服务平台",
						},
						{
							key: "split" as CardStyle,
							label: "分栏卡片",
							desc: "图标与信息左右分区",
						},
						{
							key: "neon" as CardStyle,
							label: "霓虹卡片",
							desc: "深色底与发光边缘",
						},
						{
							key: "paper" as CardStyle,
							label: "纸张卡片",
							desc: "便笺质感与手工阴影",
						},
						{
							key: "terminal" as CardStyle,
							label: "终端卡片",
							desc: "命令行信息层级",
						},
						{
							key: "mosaic" as CardStyle,
							label: "马赛克卡片",
							desc: "色块拼贴与大胆构图",
						},
					] as const
				).map((item) => {
					const active = (value.layout?.cardStyle ?? "compact") === item.key;
					return (
						<button
							key={item.key}
							type="button"
							onClick={() => patchCardStyle(item.key)}
							className={`cursor-pointer rounded-xl border p-2 text-left transition-all ${
								active
									? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200"
									: "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
							}`}
						>
							<div className="mb-2 flex h-16 items-center justify-center rounded-lg bg-white/80 p-1.5 shadow-inner dark:bg-neutral-950/60">
								{item.key === "compact" ? (
									<div className="flex w-full max-w-32 items-center gap-2 rounded-lg bg-white p-2 shadow-sm dark:bg-zinc-800">
										<div className="size-6 rounded-full bg-blue-100 dark:bg-blue-950" />
										<div className="min-w-0 flex-1">
											<div className="h-2 w-12 rounded bg-zinc-900/80 dark:bg-zinc-100/80" />
											<div className="mt-1 h-1.5 w-20 rounded bg-zinc-300 dark:bg-zinc-600" />
										</div>
									</div>
								) : (
									<div className="relative h-full w-full max-w-64 overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900">
										<div className="p-2">
											<div className="h-2 w-14 rounded bg-zinc-900/80 dark:bg-zinc-100/80" />
											<div className="mt-1 h-1.5 w-20 rounded bg-zinc-300 dark:bg-zinc-600" />
										</div>
										<div className="absolute -bottom-4.5 left-8 h-16 w-48 -rotate-6 rounded-lg border bg-linear-to-br from-zinc-100 to-zinc-300 shadow-lg dark:border-white/10 dark:from-zinc-800 dark:to-zinc-950" />
									</div>
								)}
							</div>
							<div className="text-sm font-semibold">{item.label}</div>
							<div className="mt-1 text-xs opacity-65">{item.desc}</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function FooterEditor({
	value,
	onPatch,
}: {
	value: NavConfig;
	onPatch: (p: Partial<NavConfig>) => void;
}) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">ICP 备案号</Label>
				<TextField value={value.icp} onChange={(v) => onPatch({ icp: v })}>
					<Label className="sr-only">icp</Label>
					<Input placeholder="京ICP备xxxxxxxx号-1 / 留空" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">公安备案号</Label>
				<TextField value={value.beian} onChange={(v) => onPatch({ beian: v })}>
					<Label className="sr-only">beian</Label>
					<Input placeholder="留空则不显示" />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">底部声明</Label>
				<TextField
					value={value.copyright}
					onChange={(v) => onPatch({ copyright: v })}
				>
					<Label className="sr-only">copyright</Label>
					<Input />
				</TextField>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">公众号二维码</Label>
				<IconPicker
					value={value.qrCode}
					uploadPrefix="qr-code"
					hint="必须使用清晰的正方形二维码，推荐至少 512×512；支持 PNG、JPG、WebP，也可填写图片 URL。"
					onChange={(v) => onPatch({ qrCode: v })}
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">二维码提示文字</Label>
				<TextField
					value={value.qrCodeText}
					onChange={(v) => onPatch({ qrCodeText: v })}
				>
					<Label className="sr-only">qrCodeText</Label>
					<Input placeholder="微信扫码关注" />
				</TextField>
			</div>

			<Separator />

			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">底部链接</span>
				<Button
					size="sm"
					variant="outline"
					onPress={() =>
						onPatch({
							footerLinks: [
								...(value.footerLinks ?? []),
								{ label: "新链接", href: "#" },
							],
						})
					}
				>
					+ 添加链接
				</Button>
			</div>

			{(value.footerLinks ?? []).map((link, idx) => (
				<div
					key={idx}
					className="flex flex-wrap items-center gap-3"
				>
					<TextField
						value={link.label}
						className="flex-1 min-w-40"
						onChange={(v) => {
							const next = [...(value.footerLinks ?? [])];
							next[idx] = { ...next[idx], label: v };
							onPatch({ footerLinks: next });
						}}
					>
						<Label className="sr-only">label</Label>
						<Input placeholder="显示文案" variant="secondary" />
					</TextField>
					<TextField
						value={link.href}
						className="flex-2 min-w-50"
						onChange={(v) => {
							const next = [...(value.footerLinks ?? [])];
							next[idx] = { ...next[idx], href: v };
							onPatch({ footerLinks: next });
						}}
					>
						<Label className="sr-only">href</Label>
						<Input placeholder="跳转链接" variant="secondary" />
					</TextField>
					<Button
						size="sm"
						variant="tertiary"
						className="text-red-600 dark:text-red-400"
						onPress={() => {
							const next = (value.footerLinks ?? []).filter(
								(_, i) => i !== idx,
							);
							onPatch({ footerLinks: next });
						}}
					>
						删除
					</Button>
				</div>
			))}
		</div>
	);
}

function LayoutEditor({
	layout,
	onChange,
	showRecentVisits,
	onShowRecentVisitsChange,
	recentVisitsMax,
	onRecentVisitsMaxChange,
}: {
	layout?: LayoutConfig;
	onChange: (v: LayoutConfig) => void;
	showRecentVisits?: boolean;
	onShowRecentVisitsChange: (value: boolean) => void;
	recentVisitsMax?: number;
	onRecentVisitsMaxChange: (value: number | undefined) => void;
}) {
	const l = layout ?? {};
	const patch = (p: Partial<LayoutConfig>) => onChange({ ...l, ...p });
	const getLayoutValue = (key: keyof LayoutConfig) =>
		l[key] ?? DEFAULT_LAYOUT[key];
	const getToggleValue = (key: keyof LayoutConfig) => {
		if (key === "showFooterQrCode" && !getLayoutValue("showFooter")) {
			return false;
		}
		if (
			key === "showFloatingQrCode" &&
			!getLayoutValue("showFloatingActions")
		) {
			return false;
		}
		if (
			key === "showCategoryDescription" &&
			!getLayoutValue("showCategoryTitle")
		) {
			return false;
		}
		if (key === "linkTarget") {
			return getLayoutValue(key) === "new";
		}

		return Boolean(getLayoutValue(key));
	};
	const categoryListStyle = getLayoutValue("categoryListStyle") as CategoryListStyle;
	const searchBarStyle = getLayoutValue("searchBarStyle") as SearchBarStyle;
	const floatingActionStyle = getLayoutValue("floatingActionStyle") as FloatingActionStyle;
	const floatingActionLayout = getLayoutValue("floatingActionLayout") as FloatingActionLayout;
	const widgetStyle = getLayoutValue("widgetStyle") as WidgetStyle;
	const brandStyle = getLayoutValue("brandStyle") as BrandStyle;
	const patchToggle = (key: keyof LayoutConfig, value: boolean) => {
		const next: Partial<LayoutConfig> = { [key]: value };

		if (key === "showFooter" && !value) {
			next.showFooterQrCode = false;
		}
		if (key === "showFloatingActions" && !value) {
			next.showFloatingQrCode = false;
		}
		if (key === "showCategoryTitle" && !value) {
			next.showCategoryDescription = false;
		}
		if (key === "linkTarget") {
			next.linkTarget = value ? "new" : "current";
		}

		patch(next);
	};

	type ToggleItem = {
		label: string;
		disabled?: boolean;
	} &
		(
			| { kind?: "layout"; key: keyof LayoutConfig }
			| { kind: "recentVisits"; key: "showRecentVisits" }
		);

	const displayToggleItems: ToggleItem[] = [
		{ label: "显示左侧侧边栏（桌面端）", key: "showSidebar" },
		{ label: "显示搜索栏", key: "showSearch" },
		{ label: "分类导航栏搜索", key: "showCategorySearch" },
		{ label: "显示分类标题", key: "showCategoryTitle" },
		{
			label: "显示分类描述",
			key: "showCategoryDescription",
			disabled: !getLayoutValue("showCategoryTitle"),
		},
		{ label: "显示卡片描述", key: "showCardDescription" },
		{
			label: "右侧使用 Tabs 切换二级分类",
			key: "showSubcategoryTabs",
		},
		{
			label: "详情页展示网址链接",
			key: "showSiteDetailUrl",
		},
		{ label: "显示页脚", key: "showFooter" },
		{
			label: "页脚显示二维码",
			key: "showFooterQrCode",
			disabled: !getLayoutValue("showFooter"),
		},
		{ label: "显示浮动操作按钮", key: "showFloatingActions" },
		{
			label: "浮动按钮显示二维码入口",
			key: "showFloatingQrCode",
			disabled: !getLayoutValue("showFloatingActions"),
		},
		{
			kind: "recentVisits",
			label: "显示最近访问",
			key: "showRecentVisits",
		},
	];

	const behaviorToggleItems: ToggleItem[] = [
		{
			label: "新标签页打开链接",
			key: "linkTarget",
		},
		{
			label: "自动访问内网（可达时优先）",
			key: "autoUseIntranet",
		},
		{
			label: "点击卡片先进入网址详情页",
			key: "enableSiteDetailPage",
		},
	];

	const spacingFields: {
		label: string;
		key: keyof LayoutConfig;
		placeholder: string;
	}[] = [
		{
			label: "内容区最大宽度",
			key: "maxWidth",
			placeholder: "1200px / 1400px / 100%",
		},
		{
			label: "侧边栏宽度",
			key: "sidebarWidth",
			placeholder: "224px / 200px",
		},
		{
			label: "内容区左侧内边距",
			key: "contentPaddingLeft",
			placeholder: "8px / 16px（有侧边栏时较小）",
		},
		{
			label: "内容区右侧内边距",
			key: "contentPaddingRight",
			placeholder: "16px / 24px",
		},
		{
			label: "分类间距",
			key: "sectionGap",
			placeholder: "16px / 24px",
		},
		{
			label: "卡片网格内边距",
			key: "cardGridPadding",
			placeholder: "8px / 12px",
		},
	];

	const cardFields: {
		label: string;
		key: keyof LayoutConfig;
		placeholder: string;
	}[] = [
		{
			label: "网站卡片最小宽度",
			key: "cardMinWidth",
			placeholder: "160px / 200px",
		},
		{
			label: "网站卡片高度",
			key: "cardHeight",
			placeholder: "64px / 72px",
		},
		{
			label: "图标圆角",
			key: "iconBorderRadius",
			placeholder: "full / 12px / 8px",
		},
		{
			label: "图标默认内间距",
			key: "defaultIconPadding",
			placeholder: "8 / 8px / 留空",
		},
		{
			label: "子分类最多显示行数",
			key: "subcategoryMaxRows",
			placeholder: "0 表示不限制，例如 3",
		},
		{
			label: "子分类每行显示数量",
			key: "subcategoryColumns",
			placeholder: "0 表示自适应，例如 4",
		},
	];

	const renderToggleGroup = (
		items: ToggleItem[],
	) => (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			{items.map((item) => {
				const isRecentVisits = item.kind === "recentVisits";
				const cur = isRecentVisits
					? showRecentVisits !== false
					: getToggleValue(item.key);
				return (
					<AdminSwitch
						key={item.key}
						isSelected={cur}
						isDisabled={item.disabled}
						onChange={(value) => {
							if (isRecentVisits) {
								onShowRecentVisitsChange(value);
								return;
							}
							patchToggle(item.key, value);
						}}
					>
						<span className="text-sm">{item.label}</span>
					</AdminSwitch>
				);
			})}
		</div>
	);

	const renderFieldGroup = (
		items: { label: string; key: keyof LayoutConfig; placeholder: string }[],
	) => (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			{items.map((item) => (
				<div key={item.key} className="flex flex-col gap-2">
					<Label className="text-sm font-medium">{item.label}</Label>
					<TextField
						value={String(l[item.key] ?? "")}
						onChange={(v) => {
							if (item.key === "subcategoryMaxRows" || item.key === "subcategoryColumns") {
								const value = v.replace(/[^0-9]/g, "");
								patch({ [item.key]: value ? Number(value) : 0 });
								return;
							}
							patch({ [item.key]: v || undefined });
						}}
					>
						<Label className="sr-only">{String(item.key)}</Label>
						<Input placeholder={item.placeholder} />
					</TextField>
				</div>
			))}
		</div>
	);

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h3 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
					布局与显示控制
				</h3>
				<p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
					自定义站点的布局样式和显示效果
				</p>
			</div>

			<div className="space-y-3">
				<h4 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
					尺寸与间距
				</h4>
				{renderFieldGroup(spacingFields)}
			</div>

			<div className="space-y-2">
				<Label className="text-sm font-medium">分类列表风格</Label>
				<select
					value={categoryListStyle}
					onChange={(event) =>
						patch({ categoryListStyle: event.target.value as CategoryListStyle })
					}
					className="h-10 w-full rounded-lg border border-default-200 bg-background px-3 text-sm md:max-w-md"
				>
					<option value="default">默认高亮</option>
					<option value="card">卡片阴影</option>
					<option value="outline">线框分组</option>
					<option value="compact">紧凑列表</option>
					<option value="soft">柔和底板</option>
					<option value="rail">强调导轨</option>
					<option value="pill">胶囊标签</option>
					<option value="split">分栏切分</option>
					<option value="minimal">极简列表</option>
					<option value="badge">徽标风格</option>
					<option value="glass">液态玻璃</option>
					<option value="glass-pill">玻璃胶囊</option>
					<option value="glass-rail">玻璃导轨</option>
					<option value="glass-split">玻璃分栏</option>
					<option value="glass-tech">科技玻璃</option>
					<option value="glass-accent">强调玻璃</option>
					<option value="glass-mesh">网格玻璃</option>
				</select>
			</div>

			<div className="space-y-2">
				<Label className="text-sm font-medium">搜索框风格</Label>
				<select value={searchBarStyle} onChange={(event) => patch({ searchBarStyle: event.target.value as SearchBarStyle })} className="h-10 w-full rounded-lg border border-default-200 bg-background px-3 text-sm md:max-w-md">
					<option value="default">标准边框</option>
					<option value="pill">胶囊圆角</option>
					<option value="underline">底线聚焦</option>
					<option value="minimal">极简无边框</option>
				</select>
			</div>

			<div className="space-y-2">
				<Label className="text-sm font-medium">悬浮图标风格</Label>
				<select value={floatingActionStyle} onChange={(event) => patch({ floatingActionStyle: event.target.value as FloatingActionStyle })} className="h-10 w-full rounded-lg border border-default-200 bg-background px-3 text-sm md:max-w-md">
					<option value="default">默认亮色</option>
					<option value="glass">液态玻璃</option>
					<option value="glass-pill">玻璃胶囊</option>
					<option value="glass-rail">玻璃导轨</option>
					<option value="glass-tech">科技玻璃</option>
					<option value="glass-accent">强调玻璃</option>
					<option value="glass-mesh">网格玻璃</option>
					<option value="soft">柔和底板</option>
					<option value="outline">线框按钮</option>
				</select>
			</div>

			<div className="space-y-2">
				<Label className="text-sm font-medium">悬浮图标版面</Label>
				<select value={floatingActionLayout} onChange={(event) => patch({ floatingActionLayout: event.target.value as FloatingActionLayout })} className="h-10 w-full rounded-lg border border-default-200 bg-background px-3 text-sm md:max-w-md">
					<option value="stack">右侧竖列</option>
					<option value="dock">底部停靠栏</option>
					<option value="rail">右侧导轨</option>
					<option value="bubble">悬浮气泡</option>
					<option value="minimal">极简小图标</option>
				</select>
			</div>

			<div className="space-y-2">
				<Label className="text-sm font-medium">首页小组件风格</Label>
				<select value={widgetStyle} onChange={(event) => patch({ widgetStyle: event.target.value as WidgetStyle })} className="h-10 w-full rounded-lg border border-default-200 bg-background px-3 text-sm md:max-w-md">
					<option value="default">默认卡片</option>
					<option value="card">卡片阴影</option>
					<option value="outline">线框样式</option>
					<option value="soft">柔和底板</option>
					<option value="glass">液态玻璃</option>
					<option value="glass-pill">玻璃胶囊</option>
					<option value="glass-rail">玻璃导轨</option>
					<option value="glass-split">玻璃分栏</option>
					<option value="glass-tech">科技玻璃</option>
					<option value="glass-accent">强调玻璃</option>
					<option value="glass-mesh">网格玻璃</option>
				</select>
			</div>

			<div className="space-y-2">
				<Label className="text-sm font-medium">站点标题与名称风格</Label>
				<select value={brandStyle} onChange={(event) => patch({ brandStyle: event.target.value as BrandStyle })} className="h-10 w-full rounded-lg border border-default-200 bg-background px-3 text-sm md:max-w-md">
					<option value="default">默认展示</option>
					<option value="card">卡片风格</option>
					<option value="outline">线框风格</option>
					<option value="soft">柔和底板</option>
					<option value="glass">液态玻璃</option>
					<option value="glass-pill">玻璃胶囊</option>
					<option value="glass-rail">玻璃导轨</option>
					<option value="glass-split">玻璃分栏</option>
					<option value="glass-tech">科技玻璃</option>
					<option value="glass-accent">强调玻璃</option>
					<option value="glass-mesh">网格玻璃</option>
				</select>
			</div>

			<Separator />

			<div className="space-y-3">
				<h4 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
					卡片与图标
				</h4>
				{renderFieldGroup(cardFields)}
			</div>

			<Separator />

			<div className="space-y-3">
				<h4 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
					显示项
				</h4>
				{renderToggleGroup(displayToggleItems)}

				<div className="flex flex-wrap items-center gap-3">
					<span className="text-sm">最近访问最大条数</span>
					<TextField
						className="w-28"
						value={
							recentVisitsMax === undefined ? "" : String(recentVisitsMax)
						}
						onChange={(value) => {
							const digits = value.replace(/\D/g, "");
							if (!digits) {
								onRecentVisitsMaxChange(undefined);
								return;
							}
							const parsed = Number.parseInt(digits, 10);
							onRecentVisitsMaxChange(
								Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
							);
						}}
					>
						<Label className="sr-only">recentVisitsMax</Label>
						<Input
							inputMode="numeric"
							placeholder={String(DEFAULT_RECENT_VISITS_MAX)}
						/>
					</TextField>
					<span className="text-xs text-default-500">
						留空或 0 使用默认值 {DEFAULT_RECENT_VISITS_MAX}
					</span>
				</div>
			</div>

			<Separator />

			<div className="space-y-3">
				<h4 className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
					行为项
				</h4>
				{renderToggleGroup(behaviorToggleItems)}
			</div>
		</div>
	);
}
