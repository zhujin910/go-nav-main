"use client";

import {
	useCallback,
	useRef,
	useState,
	type ChangeEvent,
	useEffect,
	useMemo,
} from "react";
import { Button, Card, Chip, toast } from "@heroui/react";
import {
	BiBookContent,
	BiCopy,
	BiImage,
	BiLinkExternal,
	BiPencil,
	BiPlus,
	BiSave,
	BiShow,
	BiTrash,
} from "react-icons/bi";
import type { ArticleRecord } from "@/types";
import { useAtomValue } from "jotai";
import { navAtom } from "@/lib/store/admin";
import { uploadImageWithCompression } from "@/lib/client/image-upload";
import { ArticleRichEditor } from "./article-rich-editor";

type ArticleForm = {
	title: string;
	desc: string;
	cover: string;
	cover_visible: boolean;
	content: string;
	status: "published" | "disabled";
	is_draft: boolean;
	expire_at: string;
};

const EMPTY_FORM: ArticleForm = {
	title: "",
	desc: "",
	cover: "",
	cover_visible: true,
	content: "",
	status: "published",
	is_draft: false,
	expire_at: "",
};

function formatTimestamp(value: string | null | undefined) {
	if (!value) return "未设置";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

function sanitizeEditableHtml(value: string) {
	return value
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
		.replace(/javascript\s*:/gi, "")
		.replace(/data\s*:/gi, "");
}

export function ArticlesEditor() {
	const nav = useAtomValue(navAtom);
	const [articles, setArticles] = useState<ArticleRecord[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);
	const [preview, setPreview] = useState<ArticleRecord | null>(null);
	const titleInputRef = useRef<HTMLInputElement | null>(null);
	const editorPanelRef = useRef<HTMLDivElement | null>(null);
	const mediaInputRef = useRef<HTMLInputElement | null>(null);
	const coverInputRef = useRef<HTMLInputElement | null>(null);
	const [uploadingMedia, setUploadingMedia] = useState(false);
	const [uploadingCover, setUploadingCover] = useState(false);
	const [editorHeight, setEditorHeight] = useState(360);
	const [now] = useState(() => Date.now());


	const loadArticles = useCallback(async () => {
		setLoading(true);
		try {
			const qs = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
			const response = await fetch(`/api/articles/${qs}`, { cache: "no-store" });
			const data = (await response.json().catch(() => ({}))) as {
				items?: ArticleRecord[];
				error?: string;
			};
			if (!response.ok) {
				throw new Error(data.error || "读取文章列表失败");
			}
			setArticles(data.items ?? []);
		} catch (error) {
			toast.danger((error as Error).message || "读取失败");
		} finally {
			setLoading(false);
		}
	}, [search]);

	useEffect(() => {
		void loadArticles();
	}, [loadArticles]);

	const resetForm = useCallback(() => {
		setEditingId(null);
		setForm(EMPTY_FORM);
		requestAnimationFrame(() => {
			editorPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			titleInputRef.current?.focus();
		});
	}, []);

	const copyShareLink = useCallback(async (url: string) => {
		try {
			await navigator.clipboard.writeText(url);
			toast.success("分享链接已复制到剪贴板");
		} catch {
			toast.danger("复制失败，请手动复制链接");
		}
	}, []);

	const canShareArticle = useCallback((article: ArticleRecord) => {
		if (article.status !== "published" || article.is_draft) return false;
		if (article.expire_at && Date.parse(article.expire_at) <= Date.now()) return false;
		return true;
	}, []);

	const handleMediaUpload = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			event.target.value = "";
			if (!file) return;
			setUploadingMedia(true);
			try {
				const formData = new FormData();
				formData.append("file", file);
				const response = await fetch("/api/articles/upload", {
					method: "POST",
					body: formData,
				});
				const data = (await response.json().catch(() => ({}))) as {
					url?: string;
					error?: string;
				};
				if (!response.ok || !data.url) {
					throw new Error(data.error || "上传失败");
				}
				const mediaMarkup = file.type.startsWith("image/")
					? `<img src="${data.url}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:12px;display:block;margin:12px 0;" />`
					: `<video src="${data.url}" controls style="max-width:100%;max-height:420px;border-radius:12px;display:block;margin:12px 0;"></video>`;
				setForm((prev) => ({ ...prev, content: `${prev.content}${mediaMarkup}` }));
				toast.success(file.type.startsWith("image/") ? "图片已插入编辑器" : "视频已插入编辑器");
			} catch (error) {
				toast.danger((error as Error).message || "上传失败");
			} finally {
				setUploadingMedia(false);
			}
		},
		[],
	);

	const handleCoverUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		setUploadingCover(true);
		try {
			const url = await uploadImageWithCompression(file, {
				maxEdge: 1920,
				quality: 0.84,
				compress: nav.imageUpload?.compress !== false,
				forceWebp: nav.imageUpload?.convertToWebp !== false,
				fileNamePrefix: "article-cover",
			});
			setForm((prev) => ({ ...prev, cover: url }));
			toast.success("封面图已上传");
		} catch (error) {
			toast.danger((error as Error).message || "封面上传失败");
		} finally {
			setUploadingCover(false);
		}
	}, [nav.imageUpload]);

	const handleSave = useCallback(
		async (saveAsDraft = form.is_draft) => {
			const payload = {
				...form,
				is_draft: saveAsDraft,
				expire_at: form.expire_at ? new Date(form.expire_at).toISOString() : null,
			};
			setSaving(true);
			try {
				const endpoint = editingId ? `/api/articles/${editingId}` : "/api/articles";
				const method = editingId ? "PUT" : "POST";
				const response = await fetch(endpoint, {
					method,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
				const data = (await response.json().catch(() => ({}))) as {
					article?: ArticleRecord;
					error?: string;
				};
				if (!response.ok) {
					throw new Error(data.error || "保存失败");
				}
				toast.success(saveAsDraft ? "草稿已保存" : editingId ? "文章已更新" : "文章已创建");
				resetForm();
				await loadArticles();
			} catch (error) {
				toast.danger((error as Error).message || "保存失败");
			} finally {
				setSaving(false);
			}
		},
		[editingId, form, loadArticles, resetForm],
	);

	const handleDelete = useCallback(
		async (article: ArticleRecord) => {
			if (!window.confirm(`确认删除文章「${article.title}」吗？`)) return;
			try {
				const response = await fetch(`/api/articles/${article.id}`, {
					method: "DELETE",
				});
				const data = (await response.json().catch(() => ({}))) as { error?: string };
				if (!response.ok) {
					throw new Error(data.error || "删除失败");
				}
				toast.success("文章已删除");
				if (editingId === article.id) resetForm();
				await loadArticles();
			} catch (error) {
				toast.danger((error as Error).message || "删除失败");
			}
		},
		[editingId, loadArticles, resetForm],
	);

	const articleStats = useMemo(() => {
		const published = articles.filter((article) => article.status === "published" && !article.is_draft).length;
		const drafts = articles.filter((article) => article.is_draft).length;
		const expired = articles.filter((article) => article.expire_at && Date.parse(article.expire_at) <= now).length;
		return { published, drafts, expired };
	}, [articles, now]);

	const shareUrl = useMemo(() => {
		if (!preview) return "";
		if (typeof window === "undefined") return "";
		return `${window.location.origin}/article/${preview.unique_key}`;
	}, [preview]);

	const getShareUrl = useCallback((article: ArticleRecord) => {
		if (typeof window === "undefined") return `/article/${article.unique_key}`;
		return `${window.location.origin}/article/${article.unique_key}`;
	}, []);

	const startEdit = useCallback((article: ArticleRecord) => {
		setEditingId(article.id);
		setForm({
			title: article.title,
			desc: article.desc,
			cover: article.cover,
			cover_visible: article.cover_visible !== false,
			content: article.content,
			status: article.status,
			is_draft: article.is_draft,
			expire_at: article.expire_at ? article.expire_at.slice(0, 16) : "",
		});
	}, []);

	return (
		<div className="space-y-6 p-1">
			<div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-slate-900 dark:text-white">文章管理</h2>
					<p className="text-sm text-slate-600 dark:text-slate-300">富文本编辑、发布状态与公开分享链接统一管理。</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="primary" onPress={resetForm}>
						<BiPlus className="text-lg" />
						新建文章
					</Button>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-500/30 dark:from-sky-950/40 dark:to-slate-900">
					<p className="text-xs uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">已发布</p>
					<p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{articleStats.published}</p>
				</div>
				<div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 dark:border-amber-500/30 dark:from-amber-950/30 dark:to-slate-900">
					<p className="text-xs uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">草稿</p>
					<p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{articleStats.drafts}</p>
				</div>
				<div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 dark:border-rose-500/30 dark:from-rose-950/30 dark:to-slate-900">
					<p className="text-xs uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">已过期</p>
					<p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{articleStats.expired}</p>
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
				<Card className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
					<div className="mb-3 flex items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<BiBookContent className="text-xl text-sky-500" />
							<span className="font-semibold text-slate-900 dark:text-slate-100">文章列表</span>
						</div>
						<span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{articles.length} 篇</span>
					</div>
					<input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="搜索标题或摘要"
						className="mb-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
					/>
					<div className="space-y-3">
						{loading ? (
							<div className="flex min-h-28 items-center justify-center text-sm text-slate-500">
								正在加载…
							</div>
						) : articles.length === 0 ? (
							<div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300">
								暂无文章
							</div>
						) : (
							articles.map((article) => (
								<div
									key={article.id}
									className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/30"
								>
									<div className="mb-2 flex items-start justify-between gap-2">
										<div className="min-w-0">
											<p className="truncate font-medium text-slate-800 dark:text-slate-100">{article.title}</p>
											<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(article.updated_at)}</p>
										</div>
										<Chip size="sm" color={article.status === "published" ? "success" : "default"} variant={article.is_draft ? "secondary" : "soft"}>
											{article.is_draft ? "草稿" : article.status === "published" ? "已发布" : "已禁用"}
										</Chip>
									</div>
									<p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{article.desc || "暂无摘要"}</p>
									<div className="mt-3 flex flex-wrap gap-2">
										<Button size="sm" variant="secondary" onPress={() => startEdit(article)}>
											<BiPencil className="text-base" />
											编辑
										</Button>
										<Button size="sm" variant="primary" onPress={() => setPreview(article)}>
											<BiShow className="text-base" />
											预览
										</Button>
										<Button
											size="sm"
											variant="secondary"
											isDisabled={!canShareArticle(article)}
											onPress={() => void copyShareLink(getShareUrl(article))}
										>
											<BiCopy className="text-base" />
											复制链接
										</Button>
										<Button size="sm" variant="danger" onPress={() => void handleDelete(article)}>
											<BiTrash className="text-base" />
											删除
										</Button>
									</div>
								</div>
							))
						)}
					</div>
				</Card>

				<Card ref={editorPanelRef} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
					<div className="mb-4 flex items-center justify-between gap-3">
						<h3 className="text-lg font-semibold text-slate-900 dark:text-white">{editingId ? "编辑文章" : "新建文章"}</h3>
						{editingId !== null && (
							<Button size="sm" variant="outline" onPress={resetForm}>取消编辑</Button>
						)}
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
							<span>标题</span>
							<input ref={titleInputRef} value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-950" />
						</label>
						<label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
							<span>封面图 URL</span>
							<input value={form.cover} onChange={(event) => setForm((prev) => ({ ...prev, cover: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-950" />
							<span className="text-xs text-slate-500 dark:text-slate-400">推荐 16:9，至少 1200×675；支持 JPG、PNG、GIF，展示时会按横向封面区域裁剪。</span>
							<input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleCoverUpload} />
							<div className="flex flex-wrap gap-2">
								<Button size="sm" variant="secondary" isDisabled={uploadingCover} onPress={() => coverInputRef.current?.click()}>
									<BiImage className="text-base" />
									{uploadingCover ? "上传中..." : "上传封面图"}
								</Button>
								<Button
									size="sm"
									variant={form.cover_visible ? "primary" : "secondary"}
									onPress={() => setForm((prev) => ({ ...prev, cover_visible: !prev.cover_visible }))}
									isDisabled={!form.cover}
								>
									{form.cover_visible ? "显示封面图" : "不显示封面图"}
								</Button>
							</div>
						</label>
					</div>

					<div className="mt-4 grid gap-4 md:grid-cols-3">
						<select
							value={form.status}
							onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as "published" | "disabled" }))}
							className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-0 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
						>
							<option value="published">已发布</option>
							<option value="disabled">已禁用</option>
						</select>
						<label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100">
							<input
								type="checkbox"
								checked={form.is_draft}
								onChange={(event) => setForm((prev) => ({ ...prev, is_draft: event.target.checked }))}
							/>
							存为草稿
						</label>
						<label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
							<span>过期时间</span>
							<input type="datetime-local" value={form.expire_at} onChange={(event) => setForm((prev) => ({ ...prev, expire_at: event.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-950" />
						</label>
					</div>

					<div className="mt-4">
						<label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
							<span>摘要</span>
							<textarea value={form.desc} onChange={(event) => setForm((prev) => ({ ...prev, desc: event.target.value }))} rows={3} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-slate-600 dark:bg-slate-950" />
						</label>
					</div>

					<div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/40">
						<div className="mb-3 flex flex-wrap gap-2">
							<Button
								size="sm"
								variant="secondary"
								isDisabled={uploadingMedia}
								onPress={() => mediaInputRef.current?.click()}
							>
								{uploadingMedia ? "上传中..." : "上传图片/视频"}
							</Button>
						</div>
						<input
							ref={mediaInputRef}
							type="file"
							accept="image/jpeg,image/png,image/gif,video/mp4"
							className="hidden"
							onChange={handleMediaUpload}
						/>
								<ArticleRichEditor
									value={form.content}
									onChange={(content) => setForm((prev) => ({ ...prev, content: sanitizeEditableHtml(content) }))}
									height={editorHeight}
									onHeightChange={setEditorHeight}
								/>
						<div className="mt-4 flex flex-wrap items-center gap-3">
							<Button variant="secondary" isDisabled={saving} onPress={() => void handleSave(true)}>
								<BiSave className="text-lg" />
								{saving ? "保存中..." : "保存草稿"}
							</Button>
							<Button variant="primary" isDisabled={saving} onPress={() => void handleSave(false)}>
								<BiSave className="text-lg" />
								{saving ? "发布中..." : editingId ? "更新发布" : "发布文章"}
							</Button>
							{preview && (
								<Button variant="secondary" onPress={() => window.open(shareUrl, "_blank", "noopener,noreferrer")}>
									<BiLinkExternal className="text-lg" />
									打开分享页
								</Button>
							)}
						</div>
					</div>
				</Card>
			</div>
			<p className="mb-3 text-xs text-slate-500 dark:text-slate-400">正文图片支持 JPG、PNG、GIF，建议宽度至少 1200px；会按原比例自适应。视频仅支持 MP4。</p>

			{preview && (
				<Card className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
					<div className="mb-3 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-lg font-semibold text-slate-900 dark:text-white">预览</h3>
							<p className="text-sm text-slate-500 dark:text-slate-400">{shareUrl}</p>
						</div>
						<Button size="sm" variant="ghost" onPress={() => setPreview(null)}>关闭</Button>
					</div>
					<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/30">
						{preview.cover && (
							<img src={preview.cover} alt={preview.title} className="mb-4 h-48 w-full rounded-lg object-cover" />
						)}
						<h4 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{preview.title}</h4>
						<p className="mb-6 text-sm text-slate-500 dark:text-slate-400">{preview.desc || "暂无摘要"}</p>
						<div className="article-share-content text-slate-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: preview.content }} />
					</div>
				</Card>
			)}
		</div>
	);
}
