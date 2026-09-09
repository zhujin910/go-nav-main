"use client";

import { Button } from "@heroui/react";
import { useAtom } from "jotai";
import { BiBookmark, BiX } from "react-icons/bi";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { bookmarksPanelOpenAtom } from "@/lib/store/site";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { SiteIcon } from "./site-icon";

export function BookmarksPanel() {
	const [open, setOpen] = useAtom(bookmarksPanelOpenAtom);
	const { bookmarks, mounted, remove } = useBookmarks();
	const [portalReady, setPortalReady] = useState(false);

	useEffect(() => {
		setPortalReady(true);
	}, []);

	if (!open || !portalReady) return null;

	return createPortal(
		(
		<div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="我的收藏">
			<button
				type="button"
				aria-label="关闭收藏面板"
				className="absolute inset-0 z-0 cursor-default bg-black/20 backdrop-blur-[2px]"
				onClick={() => setOpen(false)}
			/>
			<aside className="absolute top-0 right-0 z-10 flex h-full w-full max-w-md flex-col border-l border-black/8 bg-(--primary-foreground) shadow-2xl dark:border-white/10">
				<header className="flex items-center justify-between border-b border-divider px-5 py-4">
					<div>
						<h2 className="text-base font-semibold">我的收藏</h2>
						<p className="mt-0.5 text-xs text-muted">{mounted ? `${bookmarks.length} 个收藏` : "收藏加载中"}</p>
					</div>
					<Button isIconOnly variant="tertiary" aria-label="关闭收藏面板" onPress={() => setOpen(false)}>
						<BiX className="size-5" />
					</Button>
				</header>
				<div className="flex-1 overflow-y-auto p-4">
					{bookmarks.length === 0 ? (
						<div className="flex h-56 flex-col items-center justify-center text-center text-muted">
							<BiBookmark className="size-10 opacity-40" />
							<p className="mt-3 text-sm">还没有收藏内容</p>
							<p className="mt-1 text-xs">点击网站卡片右上角的书签即可收藏</p>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							{bookmarks.map((site) => (
								<div key={`${site.url}::${site.title}`} className="group flex items-center gap-3 rounded-xl border border-divider bg-surface p-3 transition hover:border-primary/30 hover:shadow-sm">
									<a href={site.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 items-center gap-3" onClick={() => setOpen(false)}>
										<SiteIcon site={site} size={36} />
										<span className="min-w-0 flex-1 truncate text-sm font-medium">{site.title}</span>
									</a>
									<Button isIconOnly size="sm" variant="tertiary" aria-label={`取消收藏 ${site.title}`} onPress={() => remove(site)}>
										<BiBookmark className="size-4 fill-current text-amber-500" />
									</Button>
								</div>
							))}
						</div>
					)}
				</div>
			</aside>
		</div>
		),
		document.body,
	);
}