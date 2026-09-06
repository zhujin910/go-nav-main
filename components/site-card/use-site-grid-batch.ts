"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SiteCardData } from "./site-card.types";

const BATCH_THRESHOLD = 80;
const BATCH_INITIAL = 60;
const BATCH_STEP = 80;

const scheduleIdle = (callback: () => void) => {
	if (typeof window === "undefined") return 0;
	const requestIdle = (
		window as unknown as {
			requestIdleCallback?: (
				cb: IdleRequestCallback,
				opts?: { timeout: number },
			) => number;
		}
	).requestIdleCallback;

	if (typeof requestIdle === "function") {
		return requestIdle(() => callback(), { timeout: 300 });
	}

	return window.setTimeout(callback, 50) as unknown as number;
};

const cancelIdle = (id: number) => {
	if (typeof window === "undefined" || !id) return;
	const cancelIdleCallback = (
		window as unknown as { cancelIdleCallback?: (id: number) => void }
	).cancelIdleCallback;

	if (typeof cancelIdleCallback === "function") cancelIdleCallback(id);
	else clearTimeout(id);
};

export function useSiteGridBatch(sites?: SiteCardData[]) {
	const total = sites?.length ?? 0;
	const needBatch = total > BATCH_THRESHOLD;
	const containerRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(!needBatch);
	const [renderCount, setRenderCount] = useState(() =>
		needBatch ? BATCH_INITIAL : total,
	);

	useEffect(() => {
		setIsVisible(!needBatch);
		setRenderCount(needBatch ? BATCH_INITIAL : total);
	}, [needBatch, sites, total]);

	useEffect(() => {
		if (!needBatch || !containerRef.current) return;
		if (typeof IntersectionObserver === "undefined") {
			setIsVisible(true);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => setIsVisible(entries.some((entry) => entry.isIntersecting)),
			{ rootMargin: "320px 0px" },
		);
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [needBatch]);

	useEffect(() => {
		if (!needBatch || !isVisible || renderCount >= total) return;

		const id = scheduleIdle(() => {
			setRenderCount((current) => Math.min(current + BATCH_STEP, total));
		});

		return () => cancelIdle(id);
	}, [isVisible, needBatch, renderCount, total]);

	const visibleSites = useMemo(() => {
		if (!sites || total === 0) return [] as SiteCardData[];
		return renderCount >= total ? sites : sites.slice(0, renderCount);
	}, [renderCount, sites, total]);

	const visibleKeys = useMemo(() => {
		const seen = new Map<string, number>();
		return visibleSites.map((site, index) => {
			const baseKey =
				site.id?.trim() || site.url || `${site.title || "site"}-${index}`;
			const count = seen.get(baseKey) ?? 0;
			seen.set(baseKey, count + 1);
			return count === 0 ? baseKey : `${baseKey}#${count}`;
		});
	}, [visibleSites]);

	return {
		containerRef,
		total,
		visibleKeys,
		visibleSites,
	};
}
