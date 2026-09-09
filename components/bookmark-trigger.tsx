"use client";

import { Button } from "@heroui/react";
import { useAtom } from "jotai";
import { BiBookmarkHeart } from "react-icons/bi";
import { bookmarksPanelOpenAtom } from "@/lib/store/site";
import { useBookmarks } from "@/hooks/use-bookmarks";

export function BookmarkTrigger({ compact = false }: { compact?: boolean }) {
	const [open, setOpen] = useAtom(bookmarksPanelOpenAtom);
	const { bookmarks } = useBookmarks();

	return (
		<Button
			size={compact ? "sm" : "md"}
			variant="tertiary"
			aria-label={`打开收藏${bookmarks.length > 0 ? `，${bookmarks.length} 个收藏` : ""}`}
			aria-expanded={open}
			className={compact ? "w-full justify-start gap-2 rounded-xl px-3" : "relative"}
			type="button"
			onClick={() => setOpen(true)}
		>
			<BiBookmarkHeart className="size-5 shrink-0" />
			{compact ? <span className="flex-1 text-left">我的收藏</span> : null}
			{bookmarks.length > 0 ? (
				<span className="min-w-5 rounded-full bg-primary/12 px-1.5 text-center text-[11px] font-semibold text-primary">
					{bookmarks.length > 99 ? "99+" : bookmarks.length}
				</span>
			) : null}
		</Button>
	);
}
