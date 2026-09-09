"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteCardData } from "@/components/site-card/site-card.types";

const STORAGE_KEY = "go-nav-bookmarks";
const EVENT_KEY = "go-nav-bookmarks-update";

export type BookmarkItem = SiteCardData & { savedAt: number };

let cachedBookmarks: BookmarkItem[] = [];

function readBookmarks(): BookmarkItem[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		cachedBookmarks = Array.isArray(parsed) ? parsed : [];
	} catch {
		cachedBookmarks = [];
	}
	return cachedBookmarks;
}

function writeBookmarks(bookmarks: BookmarkItem[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
	} catch {
		// Ignore storage failures, such as private browsing restrictions.
	}
}

function bookmarkKey(site: Pick<SiteCardData, "url" | "title">) {
	return `${site.url}::${site.title}`;
}

function publish(bookmarks: BookmarkItem[]) {
	cachedBookmarks = bookmarks;
	writeBookmarks(bookmarks);
	window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: bookmarks }));
}

export function isBookmarked(site: Pick<SiteCardData, "url" | "title">) {
	return readBookmarks().some((item) => bookmarkKey(item) === bookmarkKey(site));
}

export function toggleBookmark(site: SiteCardData) {
	if (typeof window === "undefined") return false;
	const bookmarks = readBookmarks();
	const key = bookmarkKey(site);
	const exists = bookmarks.some((item) => bookmarkKey(item) === key);
	const next = exists
		? bookmarks.filter((item) => bookmarkKey(item) !== key)
		: [{ ...site, savedAt: Date.now() }, ...bookmarks];
	publish(next);
	return !exists;
}

export function removeBookmark(site: Pick<SiteCardData, "url" | "title">) {
	if (typeof window === "undefined") return;
	publish(readBookmarks().filter((item) => bookmarkKey(item) !== bookmarkKey(site)));
}

export function useBookmarks() {
	const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => cachedBookmarks);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		setBookmarks(readBookmarks());
	}, []);

	useEffect(() => {
		const handleUpdate = (event: Event) => {
			const next = (event as CustomEvent<BookmarkItem[]>).detail;
			if (Array.isArray(next)) setBookmarks(next);
		};
		window.addEventListener(EVENT_KEY, handleUpdate);
		return () => window.removeEventListener(EVENT_KEY, handleUpdate);
	}, []);

	const remove = useCallback((site: Pick<SiteCardData, "url" | "title">) => {
		removeBookmark(site);
	}, []);

	return { bookmarks, mounted, remove };
}
