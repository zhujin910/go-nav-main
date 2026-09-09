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

	const handlePress = () => {
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
			className="pointer-events-auto absolute top-2 right-2 z-20 size-8 rounded-full border border-white/60 bg-white/85 text-zinc-600 opacity-80 shadow-sm backdrop-blur transition hover:scale-105 hover:bg-white hover:text-primary focus-visible:opacity-100 dark:border-white/15 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
			onPress={handlePress}
		>
			<BiBookmark className={`size-4 ${saved ? "fill-current text-primary" : ""}`} />
		</Button>
	);
}