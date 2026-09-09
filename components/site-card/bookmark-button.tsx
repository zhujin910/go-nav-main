"use client";

import { Button } from "@heroui/react";
import { BiBookmark } from "react-icons/bi";
import { useEffect, useState } from "react";
import type { SiteCardData } from "./site-card.types";
import { isBookmarked, toggleBookmark } from "@/hooks/use-bookmarks";

export function BookmarkButton({ site }: { site: SiteCardData }) {
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		const sync = () => setSaved(isBookmarked(site));
		sync();
		const handleUpdate = () => sync();
		window.addEventListener("go-nav-bookmarks-update", handleUpdate);
		return () => window.removeEventListener("go-nav-bookmarks-update", handleUpdate);
	}, [site]);

	const handleClick = (event: {
		preventDefault: () => void;
		stopPropagation: () => void;
	}) => {
		event.preventDefault();
		event.stopPropagation();
		const nextSaved = toggleBookmark(site);
		setSaved(nextSaved);
	};

	return (
		<Button
			type="button"
			isIconOnly
			size="sm"
			variant="tertiary"
			aria-label={saved ? "已收藏" : "未收藏"}
			aria-pressed={saved}
			className="pointer-events-auto absolute top-2 right-2 z-30 flex size-9 items-center justify-center rounded-full border border-zinc-200/90 bg-white/95 text-zinc-700 opacity-100 shadow-[0_3px_10px_rgba(15,23,42,0.16)] backdrop-blur transition hover:scale-105 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-white/20 dark:bg-zinc-900/95 dark:text-zinc-200 dark:hover:border-amber-400/60 dark:hover:bg-amber-950/60 dark:hover:text-amber-300"
			onPointerDown={(event) => event.stopPropagation()}
			onClick={handleClick}
		>
			<BiBookmark className={`size-5 ${saved ? "fill-current text-amber-500" : ""}`} />
		</Button>
	);
}