"use client";

import { useCallback, useMemo, type MouseEvent } from "react";
import type { LayoutConfig } from "@/types";
import {
	getPreferredSiteHref,
	openSiteWithPreference,
	type SiteLinkMode,
} from "@/lib/client/site-link";
import { saveHomeSnapshot } from "@/lib/client/home-restore";
import { trackVisit as trackAnalyticsVisit } from "@/lib/client/analytics";
import { buildSiteDetailPath } from "@/lib/site-detail";
import type { SiteCardData, SiteCardNavigationModel } from "./site-card.types";

export function useSiteCardNavigation({
	site,
	categoryId,
	layout,
	siteLinkMode,
}: {
	site: SiteCardData;
	categoryId?: string;
	layout?: Required<LayoutConfig>;
	siteLinkMode: SiteLinkMode;
}): SiteCardNavigationModel {
	const detailHref = useMemo(() => buildSiteDetailPath(site), [site]);
	const useDetailPage = layout?.enableSiteDetailPage === true;
	const target =
		useDetailPage || layout?.linkTarget === "current" ? undefined : "_blank";
	const rel = target ? "noopener noreferrer" : undefined;
	const preferredHref = useMemo(
		() =>
			getPreferredSiteHref(
				site,
				{
					autoUseIntranet: layout?.autoUseIntranet,
				},
				siteLinkMode,
			),
		[layout?.autoUseIntranet, site, siteLinkMode],
	);
	const href = useDetailPage ? detailHref : preferredHref;

	const handleClick = useCallback(
		(event: MouseEvent<HTMLAnchorElement>) => {
			if (useDetailPage) return;
			trackAnalyticsVisit(site.url, site.title, categoryId);
			void fetch("/api/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "click", websiteId: site.url }) }).catch(() => undefined);
			const isModifiedClick =
				event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

			if (isModifiedClick) {
				return;
			}

			event.preventDefault();
			void openSiteWithPreference(site, {
				linkTarget: layout?.linkTarget,
				autoUseIntranet: layout?.autoUseIntranet,
			});
		},
		[
			layout?.autoUseIntranet,
			layout?.linkTarget,
			site,
			categoryId,
			useDetailPage,
		],
	);

	const handleAuxClick = useCallback(
		(event: MouseEvent<HTMLAnchorElement>) => {
			if (useDetailPage) return;
			if (event.button !== 1) return;

			event.preventDefault();
			trackAnalyticsVisit(site.url, site.title, categoryId);
			void fetch("/api/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "click", websiteId: site.url }) }).catch(() => undefined);
			void openSiteWithPreference(
				site,
				{
					linkTarget: layout?.linkTarget,
					autoUseIntranet: layout?.autoUseIntranet,
				},
				{ forceNewTab: true },
			);
		},
		[
			layout?.autoUseIntranet,
			layout?.linkTarget,
			site,
			categoryId,
			useDetailPage,
		],
	);

	const handleDetailNavigate = useCallback(
		(event: MouseEvent<HTMLAnchorElement>) => {
			if (!useDetailPage) return;
			if (event.defaultPrevented) return;
			if (event.button !== 0) return;
			if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

			trackAnalyticsVisit(site.url, site.title, categoryId);

			const selected = document.querySelector<HTMLElement>(
				"aside [role=option][data-selected=true]",
			);
			const fallbackFirst = document.querySelector<HTMLElement>(
				"aside [role=option]",
			);

			saveHomeSnapshot({
				scrollY: window.scrollY,
				activeId: selected?.id || fallbackFirst?.id,
			});
		},
		[categoryId, site.title, site.url, useDetailPage],
	);

	return {
		detailHref,
		handleAuxClick,
		handleClick,
		handleDetailNavigate,
		href,
		rel,
		target,
		useDetailPage,
	};
}
