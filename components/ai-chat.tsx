"use client";

import { Button, TextArea } from "@heroui/react";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { BiBot, BiLinkExternal, BiRefresh, BiSend, BiX } from "react-icons/bi";
import { aiChatAtom, aiChatSitesAtom } from "@/lib/store/site";
import type { NavSite } from "@/types";

interface Message {
	role: "user" | "assistant";
	content: string;
	sources?: string[];
}

function matchesSite(site: NavSite, query: string) {
	const haystack = [site.title, site.description, site.url, ...(site.tags ?? [])]
		.join(" ")
		.toLowerCase();
	return haystack.includes(query.toLowerCase());
}

function toExternalHref(rawUrl: string): string {
	const value = rawUrl.trim();
	if (/^https?:\/\//i.test(value)) return value;
	return `https://${value}`;
}

export function AiChat() {
	const config = useAtomValue(aiChatAtom);
	const sites = useAtomValue(aiChatSitesAtom);
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");
	const [sourceUrl, setSourceUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{
			role: "assistant",
			content: "你好，我可以搜索当前导航内容，也可以阅读后台配置的网址并帮你提炼重点。",
		},
	]);

	if (!config.enabled) return null;

	const localResults = input.trim()
		? sites.filter((site) => matchesSite(site, input.trim())).slice(0, 6)
		: [];

	const sendMessage = async () => {
		const message = input.trim();
		if (!message || loading) return;
		setInput("");
		setMessages((current) => [...current, { role: "user", content: message }]);
		setLoading(true);
		try {
			const response = await fetch("/api/ai-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message,
					sourceUrl: sourceUrl || undefined,
					pageText: document.body.innerText,
				}),
			});
			const data = (await response.json()) as {
				answer?: string;
				sources?: string[];
				error?: string;
			};
			if (!response.ok) throw new Error(data.error || "请求失败");
			setMessages((current) => [
				...current,
				{ role: "assistant", content: data.answer || "没有返回内容。", sources: data.sources },
			]);
		} catch (error) {
			setMessages((current) => [
				...current,
				{ role: "assistant", content: (error as Error).message },
			]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{open && (
				<section
					aria-label="AI 对话"
					className={`fixed bottom-24 z-[60] flex flex-col overflow-hidden rounded-2xl border border-default-200 bg-(--primary-foreground) shadow-2xl ${config.position === "left" ? "left-4 sm:left-6" : "right-4 sm:right-6"}`}
					style={{ width: `min(${config.width}px, calc(100vw - 2rem))`, height: `min(${config.height}px, calc(100dvh - 7rem))` }}
				>
					<header className="flex shrink-0 items-center justify-between border-b border-default-200 px-4 py-3">
						<div className="flex items-center gap-2">
							<span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-primary"><BiBot className="size-5" /></span>
							<div><h2 className="text-sm font-semibold">AI 页面助手</h2><p className="text-[11px] text-default-500">导航内容与网址问答</p></div>
						</div>
						<div className="flex items-center gap-1">
							<Button isIconOnly size="sm" variant="tertiary" aria-label="清空对话" onPress={() => setMessages([])}><BiRefresh /></Button>
							<Button isIconOnly size="sm" variant="tertiary" aria-label="关闭 AI 对话" onPress={() => setOpen(false)}><BiX /></Button>
						</div>
					</header>

					<div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
						{messages.map((message, index) => (
							<div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-8" : "mr-4"}>
								<div className={`rounded-xl px-3 py-2 text-sm leading-6 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-default-100"}`}>
									{message.content}
								</div>
								{message.sources?.map((source) => <a key={source} href={toExternalHref(source)} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 truncate px-2 text-xs text-primary hover:underline"><BiLinkExternal />{source}</a>)}
							</div>
						))}
						{loading && <div className="mr-4 rounded-xl bg-default-100 px-3 py-2 text-sm text-default-500">正在阅读页面并整理答案...</div>}
						{localResults.length > 0 && (
							<div className="space-y-1 rounded-xl border border-default-200 p-2">
								<p className="px-1 text-xs font-medium text-default-500">站内搜索结果</p>
								{localResults.map((site) => <a key={site.url} href={toExternalHref(site.url)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-default-100"><span className="truncate">{site.title}</span><BiLinkExternal className="shrink-0 text-default-400" /></a>)}
							</div>
						)}
					</div>

					<div className="shrink-0 space-y-2 border-t border-default-200 p-3">
						{(config.webUrls ?? []).length > 0 && <select value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} className="w-full rounded-lg border border-default-200 bg-transparent px-2 py-1.5 text-xs"><option value="">当前页面 / 不指定网址</option>{config.webUrls?.map((url) => <option key={url} value={url}>{url}</option>)}</select>}
						<div className="flex items-end gap-2">
							<TextArea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} placeholder="问问当前页面..." rows={2} className="min-w-0 flex-1" />
							<Button isIconOnly aria-label="发送消息" variant="primary" isDisabled={!input.trim() || loading} onPress={() => void sendMessage()}><BiSend /></Button>
						</div>
					</div>
				</section>
			)}
			<Button isIconOnly size="lg" aria-label={open ? "关闭 AI 对话" : "打开 AI 对话"} variant="primary" className="rounded-full shadow-lg" onPress={() => setOpen((value) => !value)}><BiBot className="size-6" /></Button>
		</>
	);
}
