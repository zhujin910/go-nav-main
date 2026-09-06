"use client";

import { useEffect, useRef, useState } from "react";
import { BiAlignLeft, BiAlignMiddle, BiAlignRight, BiBold, BiCode, BiFontColor, BiItalic, BiLink, BiRedo, BiStrikethrough, BiText, BiUndo, BiUnderline } from "react-icons/bi";

type ArticleRichEditorProps = {
	value: string;
	onChange: (value: string) => void;
	height: number;
	onHeightChange: (height: number) => void;
};

type EditorCommand = {
	label: string;
	icon: typeof BiBold;
	command: string;
	value?: string;
};

type ToolbarOption = {
	label: string;
	value: string;
};

type SpecialCategory = "文字" | "数字" | "符号" | "表情";

const FONT_OPTIONS: ToolbarOption[] = [
	{ label: "Arial", value: "Arial" },
	{ label: "Verdana", value: "Verdana" },
	{ label: "Trebuchet MS", value: "Trebuchet MS" },
	{ label: "Georgia", value: "Georgia" },
	{ label: "Times New Roman", value: "Times New Roman" },
	{ label: "Courier New", value: "Courier New" },
	{ label: "思源黑体", value: "Source Han Sans SC" },
	{ label: "思源宋体", value: "Source Han Serif SC" },
	{ label: "Noto Sans 简体中文", value: "Noto Sans CJK SC" },
	{ label: "Noto Serif 简体中文", value: "Noto Serif CJK SC" },
	{ label: "霞鹜文楷", value: "LXGW WenKai" },
	{ label: "站酷小薇", value: "ZCOOL XiaoWei" },
	{ label: "站酷快乐体", value: "ZCOOL KuaiLe" },
	{ label: "马善政毛笔楷书", value: "Ma Shan Zheng" },
	{ label: "刘建毛笔字", value: "Liu Jian Mao Cao" },
	{ label: "龙藏体", value: "Long Cang" },
];

const SPECIAL_CHAR_GROUPS: Record<SpecialCategory, string[]> = {
	文字: ["甲", "乙", "丙", "丁", "天", "地", "人", "和", "中", "文", "上", "下", "左", "右", "前", "后", "一", "二", "三", "大", "小", "新", "旧", "开", "关", "是", "否", "问", "答", "注", "意", "※", "〆", "々", "〇", "「", "」", "『", "』", "〈", "〉", "《", "》", "【", "】", "〔", "〕"],
	数字: ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳", "㊿", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ", "Ⅸ", "Ⅹ", "½", "⅓", "¼", "¾", "²", "³", "⁰", "¹", "⁴", "⁵", "₀", "₁", "₄", "₅"],
	符号: ["©", "®", "™", "§", "¶", "№", "℗", "℠", "±", "×", "÷", "≈", "≠", "≤", "≥", "∞", "√", "∑", "∫", "∂", "∆", "∇", "∈", "∉", "⊂", "⊃", "∧", "∨", "∩", "∪", "∴", "∵", "→", "←", "↑", "↓", "↔", "⇒", "⇐", "⇔", "★", "☆", "◆", "◇", "■", "□", "●", "○", "△", "▽", "✓", "✔", "✕", "✖", "⚠", "℃", "℉", "¥", "€", "£", "¢", "₽", "₩", "‰", "·", "•", "…", "—", "–", "±"],
	表情: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😎", "🤔", "🤗", "🤩", "🥳", "😢", "😭", "😡", "😱", "😴", "🤯", "👍", "👎", "👏", "🙌", "🙏", "💪", "🎉", "🎊", "❤️", "💔", "🔥", "⭐", "✅", "❌", "💡", "🚀", "🌟", "🌈", "🍀", "☀️", "🌙", "☕", "🎵", "📌"],
};

const COMMANDS: EditorCommand[] = [
	{ label: "加粗", icon: BiBold, command: "bold" },
	{ label: "下划线", icon: BiUnderline, command: "underline" },
	{ label: "斜体", icon: BiItalic, command: "italic" },
	{ label: "删除线", icon: BiStrikethrough, command: "strikeThrough" },
	{ label: "左对齐", icon: BiAlignLeft, command: "justifyLeft" },
	{ label: "居中", icon: BiAlignMiddle, command: "justifyCenter" },
	{ label: "右对齐", icon: BiAlignRight, command: "justifyRight" },
	{ label: "撤销", icon: BiUndo, command: "undo" },
	{ label: "重做", icon: BiRedo, command: "redo" },
	{ label: "清除格式", icon: BiText, command: "removeFormat" },
];

function runCommand(command: string, value?: string) {
	document.execCommand(command, false, value);
}

function normalizeUrl(value: string) {
	const url = value.trim();
	if (!url) return "";
	if (/^(https?:|mailto:|tel:|\/|#)/i.test(url) || url.startsWith("//")) return url;
	return `https://${url}`;
}

export function ArticleRichEditor({ value, onChange, height, onHeightChange }: ArticleRichEditorProps) {
	const editorRef = useRef<HTMLDivElement | null>(null);
	const selectionRef = useRef<Range | null>(null);
	const selectedMediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
	const [linkUrl, setLinkUrl] = useState("");
	const [videoUrl, setVideoUrl] = useState("");
	const [selectedMedia, setSelectedMedia] = useState<HTMLImageElement | HTMLVideoElement | null>(null);
	const [openToolbarMenu, setOpenToolbarMenu] = useState<"style" | "font" | "size" | null>(null);
	const [showSpecialChars, setShowSpecialChars] = useState(false);
	const [specialCategory, setSpecialCategory] = useState<SpecialCategory>("符号");

	useEffect(() => {
		const editor = editorRef.current;
		if (editor && editor.innerHTML !== value) editor.innerHTML = value || "";
	}, [value]);

	const keepSelection = () => {
		const selection = window.getSelection();
		const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
		const editor = editorRef.current;
		if (range && editor?.contains(range.commonAncestorContainer)) {
			selectionRef.current = range.cloneRange();
		}
	};

	useEffect(() => {
		const rememberSelection = () => keepSelection();
		document.addEventListener("selectionchange", rememberSelection);
		return () => document.removeEventListener("selectionchange", rememberSelection);
	});

	const restoreSelection = () => {
		const selection = window.getSelection();
		const range = selectionRef.current;
		const editor = editorRef.current;
		if (selection && range && editor?.contains(range.commonAncestorContainer)) {
			selection.removeAllRanges();
			selection.addRange(range);
			return true;
		}
		return false;
	};

	const handleCommand = (command: string, commandValue?: string) => {
		if (!restoreSelection()) return;
		const editor = editorRef.current;
		if (!editor) return;
		const alignment = command === "justifyLeft" ? "left" : command === "justifyCenter" ? "center" : command === "justifyRight" ? "right" : null;
		if (alignment) {
			const range = selectionRef.current;
			if (!range || range.collapsed || !editor.contains(range.commonAncestorContainer)) return;
			const blocks = Array.from(editor.querySelectorAll<HTMLElement>("p, div, h1, h2, h3, h4, h5, h6, blockquote")).filter((block) => {
				try {
					return range.intersectsNode(block);
				} catch {
					return false;
				}
			});
			if (blocks.length === 0) return;
			blocks.forEach((block) => {
				block.style.textAlign = alignment;
			});
			keepSelection();
			onChange(editor.innerHTML);
			return;
		}
		editor.focus();
		runCommand(command, commandValue);
		keepSelection();
		if (editorRef.current) onChange(editorRef.current.innerHTML);
	};

	const handleLink = () => {
		const url = normalizeUrl(linkUrl);
		if (!url) return;
		const editor = editorRef.current;
		const range = selectionRef.current;
		if (!editor || !range || range.collapsed || !editor.contains(range.commonAncestorContainer)) return;
		const selection = window.getSelection();
		selection?.removeAllRanges();
		selection?.addRange(range);
		const link = document.createElement("a");
		link.href = url;
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		try {
			link.appendChild(range.extractContents());
			range.insertNode(link);
			const after = document.createRange();
			after.setStartAfter(link);
			after.collapse(true);
			selection?.removeAllRanges();
			selection?.addRange(after);
			keepSelection();
			onChange(editor.innerHTML);
		} catch {
			return;
		}
		setLinkUrl("");
	};

	const handleDeleteMedia = () => {
		const media = selectedMediaRef.current;
		if (!media || !editorRef.current?.contains(media)) return;
		const wrapper = media.parentElement;
		media.remove();
		if (wrapper?.tagName === "P" && !wrapper.textContent?.trim() && wrapper.children.length === 0) {
			wrapper.remove();
		}
		selectedMediaRef.current = null;
		setSelectedMedia(null);
		handleInput();
	};

	const handleInput = () => {
		if (editorRef.current) onChange(editorRef.current.innerHTML);
	};

	const insertVideoAtSelection = (url: string) => {
		const editor = editorRef.current;
		if (!editor) return;
		const selection = window.getSelection();
		if (selectionRef.current && editor.contains(selectionRef.current.commonAncestorContainer)) {
			selection?.removeAllRanges();
			selection?.addRange(selectionRef.current);
		}
		editor.focus();
		document.execCommand("insertHTML", false, `<p><video src="${url}" controls style="max-width:100%;max-height:420px;border-radius:12px;display:block;margin:12px 0;"></video></p><p><br></p>`);
		const insertedVideo = editor.querySelectorAll("video").item(editor.querySelectorAll("video").length - 1);
		const afterParagraph = insertedVideo?.parentElement?.nextElementSibling;
		if (afterParagraph) {
			const after = document.createRange();
			after.selectNodeContents(afterParagraph);
			after.collapse(true);
			selection?.removeAllRanges();
			selection?.addRange(after);
		}
		keepSelection();
		onChange(editor.innerHTML);
	};

	const handleEditorClick = (event: React.MouseEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;
		const media = (target.closest("img, video") ?? target.closest("p")?.querySelector("img, video")) as HTMLImageElement | HTMLVideoElement | null;
		selectedMediaRef.current = media;
		setSelectedMedia(media);
		keepSelection();
	};

	const handleEditorMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;
		const media = (target.closest("img, video") ?? target.closest("p")?.querySelector("img, video")) as HTMLImageElement | HTMLVideoElement | null;
		if (media) {
			event.preventDefault();
			selectedMediaRef.current = media;
			setSelectedMedia(media);
			media.setAttribute("data-article-selected-media", "true");
			editorRef.current?.focus();
		}
	};

	const handleEditorPointerDownCapture = (event: React.PointerEvent<HTMLDivElement>) => {
		const target = event.target as HTMLElement;
		const media = (target.closest("img, video") ?? target.closest("p")?.querySelector("img, video")) as HTMLImageElement | HTMLVideoElement | null;
		if (!media) return;
		event.preventDefault();
		selectedMediaRef.current = media;
		setSelectedMedia(media);
		media.setAttribute("data-article-selected-media", "true");
		editorRef.current?.focus();
	};

	const handleEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (selectedMediaRef.current && (event.key === "Backspace" || event.key === "Delete")) {
			event.preventDefault();
			handleDeleteMedia();
		}
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
		event.preventDefault();
		const text = event.clipboardData.getData("text/plain");
		document.execCommand("insertText", false, text);
		handleInput();
	};

	const insertSpecialChar = (character: string) => {
		if (!restoreSelection()) editorRef.current?.focus();
		document.execCommand("insertText", false, character);
		setShowSpecialChars(false);
		handleInput();
	};

	const handleToolbarMouseDown = (event: React.MouseEvent<HTMLElement>) => {
		keepSelection();
		event.preventDefault();
	};

	const handleToolbarSelectionMouseDown = () => {
		keepSelection();
	};

	const renderToolbarMenu = (menu: "style" | "font" | "size", label: string, options: ToolbarOption[], command: string) => (
		<div className="relative">
			<button type="button" aria-haspopup="listbox" aria-expanded={openToolbarMenu === menu} onMouseDown={(event) => { event.preventDefault(); keepSelection(); }} onClick={() => setOpenToolbarMenu((current) => current === menu ? null : menu)} className="inline-flex h-8 min-w-20 items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 hover:border-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
				<span>{label}</span><span className="text-xs">▾</span>
			</button>
			{openToolbarMenu === menu ? (
				<div role="listbox" aria-label={label} className="absolute left-0 top-9 z-30 min-w-full overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
					{options.map((option) => (
						<button key={option.value} type="button" role="option" aria-selected="false" onMouseDown={(event) => event.preventDefault()} onClick={() => { handleCommand(command, option.value); setOpenToolbarMenu(null); }} className="block w-full whitespace-nowrap rounded px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-100 dark:hover:bg-slate-700">
							{option.label}
						</button>
					))}
				</div>
			) : null}
		</div>
	);

	const submitVideo = () => {
		const url = normalizeUrl(videoUrl);
		if (!url) return;
		insertVideoAtSelection(url);
		setVideoUrl("");
	};

	return (
		<div className="article-rich-editor overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-950">
			<style>{`.article-rich-editor__content video { pointer-events: none; } .article-rich-editor__content [data-article-selected-media="true"] { outline: 3px solid rgb(245 158 11); outline-offset: 3px; }`}</style>
			<div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
				{renderToolbarMenu("style", "正文", [{ label: "正文", value: "p" }, { label: "标题 2", value: "h2" }, { label: "标题 3", value: "h3" }, { label: "引用", value: "blockquote" }], "formatBlock")}
				{renderToolbarMenu("font", "字体", FONT_OPTIONS, "fontName")}
				{renderToolbarMenu("size", "字号", [{ label: "12px", value: "1" }, { label: "14px", value: "2" }, { label: "16px", value: "3" }, { label: "18px", value: "4" }, { label: "24px", value: "5" }, { label: "32px", value: "6" }], "fontSize")}
				{COMMANDS.map(({ label, icon: Icon, command, value: commandValue }) => (
					<button key={command} type="button" title={label} aria-label={label} onMouseDown={(event) => { keepSelection(); event.preventDefault(); }} onClick={() => handleCommand(command, commandValue)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-600 hover:bg-slate-200 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-700">
						<Icon className="text-lg" />
					</button>
				))}
				<label onMouseDown={handleToolbarSelectionMouseDown} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-700" title="文字颜色">
					<BiFontColor className="text-lg" />
					<input type="color" className="sr-only" defaultValue="#334155" onChange={(event) => handleCommand("foreColor", event.target.value)} />
				</label>
				<label onMouseDown={handleToolbarSelectionMouseDown} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-700" title="文字背景色">
					<span className="rounded border border-slate-400 bg-yellow-200 px-1 text-xs font-bold text-slate-700">A</span>
					<input type="color" className="sr-only" defaultValue="#fff3a3" onChange={(event) => { restoreSelection(); editorRef.current?.focus(); runCommand("hiliteColor", event.target.value); runCommand("backColor", event.target.value); handleInput(); }} />
				</label>
				<div className="relative">
					<button type="button" aria-label="插入特殊字符" aria-expanded={showSpecialChars} onMouseDown={(event) => { event.preventDefault(); keepSelection(); }} onClick={() => setShowSpecialChars((current) => !current)} className="inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1 text-base text-slate-600 hover:bg-slate-200 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-700" title="插入特殊字符">Ω</button>
					{showSpecialChars ? (
						<div className="absolute left-0 top-9 z-30 w-80 rounded-md border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
							<div className="mb-2 grid grid-cols-4 gap-1 border-b border-slate-200 pb-2 dark:border-slate-700">
								{(Object.keys(SPECIAL_CHAR_GROUPS) as SpecialCategory[]).map((category) => (
									<button key={category} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => setSpecialCategory(category)} className={`rounded px-2 py-1 text-xs ${specialCategory === category ? "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"}`}>{category}</button>
								))}
							</div>
							<div className="grid max-h-64 grid-cols-8 gap-1 overflow-y-auto">
							{SPECIAL_CHAR_GROUPS[specialCategory].map((character, index) => (
								<button key={`${specialCategory}-${character}-${index}`} type="button" title={`插入 ${character}`} onMouseDown={(event) => event.preventDefault()} onClick={() => insertSpecialChar(character)} className="flex h-8 items-center justify-center rounded text-base text-slate-700 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-100 dark:hover:bg-slate-700">{character}</button>
							))}
							</div>
						</div>
					) : null}
				</div>
				<label className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
					<span>高度</span>
					<input aria-label="编辑框高度" type="range" min="300" max="720" step="20" value={height} onChange={(event) => onHeightChange(Number(event.target.value))} className="w-28 accent-sky-500" />
					<span className="w-10 text-right tabular-nums">{height}px</span>
				</label>
			</div>
			<div className="grid gap-2 border-b border-slate-200 p-2 dark:border-slate-700 md:grid-cols-2">
				<div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-700">
					<BiLink className="text-lg text-slate-500" />
					<label htmlFor="article-link-url" className="shrink-0 text-xs font-medium text-slate-500">选中文字插入超链接</label>
					<input id="article-link-url" value={linkUrl} onFocus={keepSelection} onChange={(event) => setLinkUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") handleLink(); }} placeholder="https://..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none dark:text-slate-100" />
					<button type="button" onMouseDown={handleToolbarMouseDown} onClick={handleLink} className="shrink-0 rounded-md px-2 py-1 text-xs text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40">插入</button>
				</div>
				<div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 dark:border-slate-700">
					<label htmlFor="article-video-url" className="shrink-0 text-xs font-medium text-slate-500">插入视频链接</label>
					<input id="article-video-url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submitVideo(); }} placeholder="example.com/video.mp4" className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none dark:text-slate-100" />
					<button type="button" onClick={submitVideo} className="shrink-0 rounded-md px-2 py-1 text-xs text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40">插入</button>
				</div>
			</div>
			{selectedMedia ? (
				<div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
					<span>已选中{selectedMedia.tagName === "VIDEO" ? "视频" : "图片"}，可删除</span>
					<button type="button" onMouseDown={(event) => event.preventDefault()} onClick={handleDeleteMedia} className="font-medium hover:underline">删除选中媒体</button>
				</div>
			) : null}
			<div
				ref={editorRef}
				contentEditable
				suppressContentEditableWarning
				role="textbox"
				aria-multiline="true"
				aria-label="文章正文"
				onInput={handleInput}
				onFocus={keepSelection}
				onKeyUp={keepSelection}
				onMouseUp={keepSelection}
				onMouseDown={handleEditorMouseDown}
				onPointerDownCapture={handleEditorPointerDownCapture}
				onClick={handleEditorClick}
				onKeyDown={handleEditorKeyDown}
				onPaste={handlePaste}
				data-placeholder="请输入文章内容..."
				style={{ minHeight: height, height, resize: "vertical" }}
				className="article-rich-editor__content overflow-y-auto p-4 text-[15px] leading-7 text-slate-800 outline-none dark:text-slate-100"
			/>
			<div className="flex items-center gap-2 border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
				<BiCode className="text-base" />
				<span>支持标题、加粗、列表、对齐、链接和文字颜色</span>
			</div>
		</div>
	);
}
