"use client";

import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { layoutAtom, navQrCodeAtom, navQrCodeTextAtom, widgetsAtom } from "@/lib/store/site";
import { FiCalendar, FiCloud, FiEdit3, FiPlus, FiSquare } from "react-icons/fi";

function Widget({ title, children, className = "", styleVariant = "default" }: { title: string; children: React.ReactNode; className?: string; styleVariant?: "default" | "card" | "outline" | "soft" | "glass" | "glass-pill" | "glass-rail" | "glass-split" | "glass-tech" | "glass-accent" | "glass-mesh" }) {
	const shellClass =
		styleVariant === "glass"
			? "rounded-2xl border border-white/30 bg-white/30 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
			: styleVariant === "glass-pill"
				? "rounded-2xl border border-white/40 bg-white/25 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
				: styleVariant === "glass-rail"
					? "rounded-2xl border border-white/25 bg-white/15 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-lg"
					: styleVariant === "glass-split"
						? "rounded-2xl border border-white/35 bg-gradient-to-r from-white/35 to-white/15 p-4 shadow-[0_12px_25px_rgba(15,23,42,0.04)] backdrop-blur-xl"
						: styleVariant === "glass-tech"
							? "rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-white/30 via-cyan-100/20 to-sky-200/20 p-4 shadow-[0_12px_28px_rgba(59,130,246,0.12)] backdrop-blur-xl"
							: styleVariant === "glass-accent"
								? "rounded-2xl border border-white/35 bg-white/20 p-4 shadow-[0_8px_22px_rgba(15,23,42,0.05)] backdrop-blur-xl"
								: styleVariant === "glass-mesh"
									? "rounded-2xl border border-white/30 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.44),rgba(255,255,255,0.12)_30%,rgba(59,130,246,0.06)_100%)] p-4 shadow-[0_12px_26px_rgba(15,23,42,0.06)] backdrop-blur-xl"
									: styleVariant === "card"
										? "rounded-xl border border-divider bg-surface p-4 shadow-sm"
										: styleVariant === "outline"
											? "rounded-xl border border-divider p-4"
											: styleVariant === "soft"
												? "rounded-xl bg-default-100/80 p-4"
												: "rounded-xl border border-default-200 bg-surface p-4 shadow-sm";
	return <section className={`widget-shell widget-${className || "default"} ${shellClass}`}><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">{title}</h2></div>{children}</section>;
}

function Clock({ world }: { world?: boolean }) {
	const [now, setNow] = useState<Date | null>(null);
	useEffect(() => {
		const update = () => setNow(new Date());
		update();
		const timer = window.setInterval(update, 1000);
		return () => window.clearInterval(timer);
	}, []);
	const value = now
		? world
			? now.toLocaleTimeString("zh-CN", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", second: "2-digit" })
			: now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
		: "--:--:--";
	const date = now
		? now.toLocaleDateString("zh-CN", { weekday: "long", month: "long", day: "numeric" })
		: "正在读取时间";
	return <section className={`widget-clock ${world ? "widget-world-clock" : "widget-digital-clock"}`}><div className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">{world ? "世界时钟 · 北京" : "数字时钟"}</div><div className="font-mono text-3xl font-semibold tracking-wider text-primary">{value}</div><p className="mt-2 text-xs text-muted">{date}</p></section>;
}

function ProgressWidgets({ workStart = "09:00", workEnd = "18:00" }: { workStart?: string; workEnd?: string }) {
	const now = new Date();
	const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
	const yearEnd = new Date(now.getFullYear() + 1, 0, 1).getTime();
	const year = Math.round(((now.getTime() - yearStart) / (yearEnd - yearStart)) * 100);
	const toMinutes = (value: string) => { const [hour, minute] = value.split(":").map(Number); return hour * 60 + minute; };
	const current = now.getHours() * 60 + now.getMinutes();
	const work = Math.max(0, Math.min(100, ((current - toMinutes(workStart)) / Math.max(1, toMinutes(workEnd) - toMinutes(workStart))) * 100));
	return <Widget title="时间进度" className="progress"><div className="space-y-3 text-xs"><Progress label={`年度进度 ${year}%`} value={year} /><Progress label={`工作日进度 ${Math.round(work)}%`} value={work} /></div></Widget>;
}

function Progress({ label, value }: { label: string; value: number }) { return <div><div className="mb-1 flex justify-between"><span>{label}</span><span className="text-muted">{Math.round(value)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-default-200"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} /></div></div>; }

function Countdown({ target }: { target?: string }) {
	const [left, setLeft] = useState(0);
	useEffect(() => { const update = () => setLeft(Math.max(0, new Date(target || `${new Date().getFullYear() + 1}-01-01T00:00:00`).getTime() - Date.now())); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, [target]);
	const days = Math.floor(left / 86400000); const hours = Math.floor(left / 3600000) % 24; const minutes = Math.floor(left / 60000) % 60; const seconds = Math.floor(left / 1000) % 60;
	return <Widget title="倒计时" className="countdown"><div className="font-mono text-2xl font-semibold text-primary">{days}天 {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div><p className="mt-2 text-xs text-muted">目标：{target || "明年元旦"}</p></Widget>;
}

function Pomodoro() {
	const [seconds, setSeconds] = useState(1500); const [running, setRunning] = useState(false);
	useEffect(() => { if (!running) return; const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [running]);
	return <Widget title="番茄计时器" className="pomodoro"><div className="text-center"><div className="font-mono text-4xl font-semibold text-primary">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</div><div className="mt-3 flex justify-center gap-2"><button className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground" onClick={() => setRunning((value) => !value)}>{running ? "暂停" : "开始"}</button><button className="rounded-lg border border-default-200 px-3 py-1.5 text-xs" onClick={() => { setRunning(false); setSeconds(1500); }}>重置</button></div></div></Widget>;
}

function Calendar() { const date = new Date(); const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); return <Widget title="日历月视图" className="calendar"><div className="mb-2 flex items-center gap-2 text-sm font-medium"><FiCalendar />{date.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}</div><div className="grid grid-cols-7 gap-1 text-center text-xs">{["日", "一", "二", "三", "四", "五", "六"].map((day) => <span key={day} className="py-1 text-muted">{day}</span>)}{Array.from({ length: new Date(date.getFullYear(), date.getMonth(), 1).getDay() }, (_, index) => <span key={`empty-${index}`} />)}{Array.from({ length: days }, (_, index) => <span key={index} className={`rounded py-1 ${index + 1 === date.getDate() ? "bg-primary text-primary-foreground" : ""}`}>{index + 1}</span>)}</div></Widget>; }

function Weather({ city = "北京" }: { city?: string }) { const [weather, setWeather] = useState<string>("正在定位..."); useEffect(() => { let cancelled = false; const load = (latitude: number, longitude: number, label: string) => fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`).then((response) => response.json()).then((data: { current?: { temperature_2m: number; weather_code: number } }) => { if (!cancelled) setWeather(data.current ? `${label} · ${Math.round(data.current.temperature_2m)}°C · 天气代码 ${data.current.weather_code}` : "暂无数据"); }); const fallback = () => fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`).then((response) => response.json()).then((data: { results?: Array<{ latitude: number; longitude: number; name?: string }> }) => { const place = data.results?.[0]; if (!place) throw new Error(); return load(place.latitude, place.longitude, place.name || city); }).catch(() => { if (!cancelled) setWeather("天气暂不可用"); }); if (navigator.geolocation) navigator.geolocation.getCurrentPosition((position) => void load(position.coords.latitude, position.coords.longitude, "当前位置"), fallback, { timeout: 5000 }); else void fallback(); return () => { cancelled = true; }; }, [city]); return <section className="widget-weather"><div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">实时天气</div><div className="flex items-center gap-3"><FiCloud className="size-7 text-primary" /><span className="text-lg font-semibold">{weather}</span></div></section>; }

function HolidayList() { const [items, setItems] = useState<Array<{ date: string; localName: string }>>([]); useEffect(() => { fetch(`/api/widgets/holidays?year=${new Date().getFullYear()}`).then((response) => response.json()).then((data: Array<{ date: string; localName: string }>) => setItems(data.slice(0, 6))).catch(() => setItems([])); }, []); return <Widget title="节假日"><div className="space-y-2 text-sm">{items.length ? items.map((item) => <div key={item.date} className="flex justify-between"><span>{item.localName}</span><time className="text-muted">{item.date.slice(5)}</time></div>) : <span className="text-muted">节假日数据暂不可用</span>}</div></Widget>; }

function HotSearch() { const [items, setItems] = useState<Array<{ title: string; url: string; source: string }>>([]); useEffect(() => { fetch("/api/widgets/hot-search").then((response) => response.json()).then((data: Array<{ title: string; url: string; source: string }>) => setItems(data)).catch(() => setItems([])); }, []); return <section className="widget-hot-search rounded-xl bg-zinc-950 p-4 text-zinc-100"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold">实时热榜</h2><span className="text-xs text-zinc-400">5 分钟更新</span></div><div className="space-y-2">{items.slice(0, 8).map((item, index) => <a key={`${item.source}-${item.url}`} href={item.url} target="_blank" rel="noreferrer" className="flex gap-2 text-sm hover:text-amber-300"><span className="font-mono text-amber-300">{String(index + 1).padStart(2, "0")}</span><span className="truncate">{item.title}</span></a>)}</div></section>; }

function Calculator() { const [value, setValue] = useState(""); const calculate = () => { if (!/^[0-9+\-*/().% ]+$/.test(value)) return; try { setValue(String(Function(`"use strict";return (${value})`)())); } catch { setValue("计算错误"); } }; return <Widget title="计算器"><div className="flex gap-2"><input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && calculate()} className="min-w-0 flex-1 rounded border border-default-200 bg-transparent px-2 py-1 text-sm" placeholder="1 + 2 * 3" /><button className="rounded bg-primary px-3 text-sm text-primary-foreground" onClick={calculate}>=</button></div></Widget>; }

function Counter() { const [count, setCount] = useState(0); return <Widget title="计数器"><div className="flex items-center justify-center gap-4"><button aria-label="减少" className="rounded border border-default-200 p-2" onClick={() => setCount((value) => value - 1)}>-</button><strong className="min-w-12 text-center text-2xl text-primary">{count}</strong><button aria-label="增加" className="rounded bg-primary p-2 text-primary-foreground" onClick={() => setCount((value) => value + 1)}><FiPlus /></button></div></Widget>; }

function NotesAndTodo({ notes, todo }: { notes?: boolean; todo?: boolean }) { const [note, setNote] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem("go-nav-note") || ""); const [items, setItems] = useState<string[]>(() => { if (typeof window === "undefined") return []; try { const data = JSON.parse(localStorage.getItem("go-nav-todo") || "[]"); return Array.isArray(data) ? data.filter((item): item is string => typeof item === "string") : []; } catch { return []; } }); const [input, setInput] = useState(""); const saveNote = (value: string) => { setNote(value); localStorage.setItem("go-nav-note", value); }; const add = () => { if (!input.trim()) return; const next = [...items, input.trim()]; setItems(next); setInput(""); localStorage.setItem("go-nav-todo", JSON.stringify(next)); }; return <>{notes ? <Widget title="便签笔记" className="notes"><div className="flex items-start gap-2"><FiEdit3 className="mt-2 text-primary" /><textarea value={note} onChange={(event) => saveNote(event.target.value)} placeholder="写下今天的想法..." className="min-h-24 w-full resize-y bg-transparent text-sm outline-none" /></div></Widget> : null}{todo ? <Widget title="待办清单" className="todo"><div className="flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && add()} placeholder="添加待办" className="min-w-0 flex-1 rounded border border-default-200 bg-transparent px-2 py-1 text-sm" /><button onClick={add} aria-label="添加待办" className="rounded bg-primary px-2 text-primary-foreground"><FiPlus /></button></div><div className="mt-3 space-y-1 text-sm">{items.map((item, index) => <button key={`${item}-${index}`} className="flex w-full items-center gap-2 text-left" onClick={() => { const next = items.filter((_, itemIndex) => itemIndex !== index); setItems(next); localStorage.setItem("go-nav-todo", JSON.stringify(next)); }}><FiSquare className="text-muted" />{item}</button>)}</div></Widget> : null}</>; }

function QrCode() { const image = useAtomValue(navQrCodeAtom); const text = useAtomValue(navQrCodeTextAtom); if (!image) return null; return <Widget title="二维码" className="qr"><div className="flex items-center gap-3"><img src={image} alt={text || "二维码"} className="size-20 rounded-lg bg-white p-1" /><span className="text-sm text-muted">{text || "扫码查看"}</span></div></Widget>; }

export function SiteWidgets({ placement = "top" }: { placement?: "top" | "sidebar" | "bottom" }) {
	const config = useAtomValue(widgetsAtom);
	const layout = useAtomValue(layoutAtom);
	const widgetStyle = layout.widgetStyle ?? "default";
	useEffect(() => {
		if (config.enabled === false || (config.position ?? "top") !== placement) return;
		const key = `go-nav-visit:${window.location.pathname}:${new Date().toISOString().slice(0, 10)}`;
		if (sessionStorage.getItem(key)) return;
		sessionStorage.setItem(key, "1");
		void fetch("/api/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "visit" }) }).catch(() => sessionStorage.removeItem(key));
	}, [config.enabled, config.position, placement]);
	if (config.enabled === false || (config.position ?? "top") !== placement) return null;
	const entries: Array<{ id: string; node: React.ReactNode }> = [
		{ id: "showClock", node: config.showClock !== false ? <Widget title="数字时钟" className="clock" styleVariant={widgetStyle}><Clock /></Widget> : null },
		{ id: "showWorldClock", node: config.showWorldClock ? <Widget title="世界时钟" className="world-clock" styleVariant={widgetStyle}><Clock world /></Widget> : null },
		{ id: "showCountdown", node: config.showCountdown ? <Widget title="倒计时" className="countdown" styleVariant={widgetStyle}><Countdown target={config.countdownTarget} /></Widget> : null },
		{ id: "showYearProgress", node: config.showYearProgress || config.showWorkProgress ? <Widget title="时间进度" className="progress" styleVariant={widgetStyle}><ProgressWidgets workStart={config.workStart} workEnd={config.workEnd} /></Widget> : null },
		{ id: "showPomodoro", node: config.showPomodoro ? <Widget title="番茄计时器" className="pomodoro" styleVariant={widgetStyle}><Pomodoro /></Widget> : null },
		{ id: "showCalendar", node: config.showCalendar ? <Widget title="日历月视图" className="calendar" styleVariant={widgetStyle}><Calendar /></Widget> : null },
		{ id: "showHolidays", node: config.showHolidays ? <Widget title="节假日" className="holidays" styleVariant={widgetStyle}><HolidayList /></Widget> : null },
		{ id: "showWeather", node: config.showWeather ? <Widget title="实时天气" className="weather" styleVariant={widgetStyle}><Weather city={config.weatherCity} /></Widget> : null },
		{ id: "showQuote", node: config.showQuote ? <Widget title="一言" styleVariant={widgetStyle}><p className="text-sm leading-6">保持好奇，持续前进。</p></Widget> : null },
		{ id: "showHotSearch", node: config.showHotSearch ? <Widget title="实时热榜" className="hot-search" styleVariant={widgetStyle}><HotSearch /></Widget> : null },
		{ id: "showCalculator", node: config.showCalculator ? <Widget title="计算器" className="calculator" styleVariant={widgetStyle}><Calculator /></Widget> : null },
		{ id: "showCounter", node: config.showCounter ? <Widget title="计数器" className="counter" styleVariant={widgetStyle}><Counter /></Widget> : null },
		{ id: "showQrCode", node: config.showQrCode ? <Widget title="二维码" className="qr" styleVariant={widgetStyle}><QrCode /></Widget> : null },
		{ id: "showNotes", node: config.showNotes ? <Widget title="便签笔记" className="notes" styleVariant={widgetStyle}><NotesAndTodo notes /></Widget> : null },
		{ id: "showTodo", node: config.showTodo ? <Widget title="待办清单" className="todo" styleVariant={widgetStyle}><NotesAndTodo todo /></Widget> : null },
	];
	const order = config.order?.length ? config.order : entries.map((entry) => entry.id);
	const ordered = [...entries].sort((a, b) => (order.indexOf(a.id) < 0 ? 999 : order.indexOf(a.id)) - (order.indexOf(b.id) < 0 ? 999 : order.indexOf(b.id))).filter((entry) => entry.node);
	const gap = config.gap === "compact" ? "gap-2" : config.gap === "spacious" ? "gap-5" : "gap-3";
	return <div className={`site-widgets mb-4 grid grid-cols-1 md:grid-cols-2 ${gap} ${placement === "sidebar" ? "px-2" : ""}`} style={{ "--widget-columns": config.columns ?? 3 } as React.CSSProperties}>
		{ordered.map((entry) => <div key={entry.id} className={`widget-slot widget-slot-${config.sizes?.[entry.id] ?? "medium"}`}>{entry.node}</div>)}
	</div>;
}