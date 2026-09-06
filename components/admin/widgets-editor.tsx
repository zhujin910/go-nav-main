"use client";

import { Input, Label, Separator, TextField } from "@heroui/react";
import { useAtom } from "jotai";
import { navAtom } from "@/lib/store/admin";
import type { WidgetsConfig } from "@/types";
import { AdminSwitch } from "./admin-switch";

const ITEMS: Array<[keyof WidgetsConfig, string]> = [
	["showClock", "数字时钟"],
	["showWorldClock", "世界时钟"],
	["showCountdown", "倒计时"],
	["showYearProgress", "年度时间进度"],
	["showWorkProgress", "打工摸鱼进度"],
	["showPomodoro", "番茄计时器"],
	["showCalendar", "日历月视图"],
	["showHolidays", "节假日"],
	["showWeather", "天气"],
	["showHotSearch", "热搜入口"],
	["showQuote", "一言句子"],
	["showNotes", "便签笔记"],
	["showTodo", "待办清单"],
	["showCalculator", "计算器"],
	["showCounter", "计数器"],
	["showQrCode", "二维码"],
];

export function WidgetsEditor() {
	const [nav, setNav] = useAtom(navAtom);
	const config = nav.widgets ?? {};
	const patch = (widgets: Partial<WidgetsConfig>) => setNav({ ...nav, widgets: { ...config, ...widgets } });
	const order = config.order?.length ? config.order : ITEMS.map(([key]) => key);
	const move = (key: string, direction: -1 | 1) => {
		const index = order.indexOf(key);
		const target = index + direction;
		if (index < 0 || target < 0 || target >= order.length) return;
		const next = [...order];
		[next[index], next[target]] = [next[target], next[index]];
		patch({ order: next });
	};
	return (
		<div className="mx-auto w-full max-w-4xl space-y-6">
			<div><h1 className="text-2xl font-semibold">首页小组件</h1><p className="mt-1 text-sm text-muted-foreground">每个组件可单独开关、设置尺寸和排序，整体位置也可调整。</p></div>
			<AdminSwitch isSelected={config.enabled !== false} onChange={(enabled) => patch({ enabled })}>启用首页小组件</AdminSwitch>
			<div className="grid gap-4 md:grid-cols-3">
				<label className="text-sm">显示位置<select value={config.position ?? "top"} onChange={(event) => patch({ position: event.target.value as WidgetsConfig["position"] })} className="mt-1 w-full rounded-lg border border-default-200 bg-transparent p-2"><option value="top">顶部</option><option value="sidebar">侧边栏</option><option value="bottom">网址列表底部</option></select></label>
				<label className="text-sm">每行列数<select value={config.columns ?? 3} onChange={(event) => patch({ columns: Number(event.target.value) as WidgetsConfig["columns"] })} className="mt-1 w-full rounded-lg border border-default-200 bg-transparent p-2"><option value="1">1 列</option><option value="2">2 列</option><option value="3">3 列</option><option value="4">4 列</option></select></label>
				<label className="text-sm">组件间距<select value={config.gap ?? "comfortable"} onChange={(event) => patch({ gap: event.target.value as WidgetsConfig["gap"] })} className="mt-1 w-full rounded-lg border border-default-200 bg-transparent p-2"><option value="compact">紧凑</option><option value="comfortable">舒适</option><option value="spacious">宽松</option></select></label>
			</div>
			<Separator />
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{ITEMS.map(([key, label]) => <AdminSwitch key={key} isSelected={config[key] === true || (key === "showClock" && config[key] !== false)} onChange={(value) => patch({ [key]: value })}>{label}</AdminSwitch>)}</div>
			<div><h2 className="mb-3 text-sm font-semibold">组件顺序与尺寸</h2><div className="space-y-2">{order.map((key, index) => { const label = ITEMS.find(([itemKey]) => itemKey === key)?.[1] ?? key; return <div key={key} className="flex flex-wrap items-center gap-2 rounded-lg border border-default-200 p-2"><span className="min-w-28 flex-1 text-sm">{label}</span><select value={config.sizes?.[key] ?? "medium"} onChange={(event) => patch({ sizes: { ...(config.sizes ?? {}), [key]: event.target.value as "small" | "medium" | "large" } })} className="rounded border border-default-200 bg-transparent p-1.5 text-xs"><option value="small">小</option><option value="medium">中</option><option value="large">大</option></select><button type="button" disabled={index === 0} onClick={() => move(key, -1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">上移</button><button type="button" disabled={index === order.length - 1} onClick={() => move(key, 1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">下移</button></div>; })}</div></div>
			<div className="grid gap-4 md:grid-cols-2"><TextField value={config.weatherCity ?? "北京"} onChange={(value) => patch({ weatherCity: value })}><Label>天气城市</Label><Input placeholder="例如：北京" /></TextField><TextField value={config.countdownTarget ?? ""} onChange={(value) => patch({ countdownTarget: value })}><Label>倒计时目标</Label><Input type="datetime-local" /></TextField><TextField value={config.workStart ?? "09:00"} onChange={(value) => patch({ workStart: value })}><Label>工作开始时间</Label><Input type="time" /></TextField><TextField value={config.workEnd ?? "18:00"} onChange={(value) => patch({ workEnd: value })}><Label>工作结束时间</Label><Input type="time" /></TextField></div><p className="text-xs text-muted-foreground">修改后请点击后台顶部“保存”。便签和待办保存在访客当前浏览器中。</p>
		</div>
	);
}
