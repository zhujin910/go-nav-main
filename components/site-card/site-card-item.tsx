"use client";

import { memo } from "react";
import type { LayoutConfig } from "@/types";
import type { SiteLinkMode } from "@/lib/client/site-link";
import { CompactSiteCard } from "./site-card-compact";
import { PreviewSiteCard } from "./site-card-preview";
import { SiteCardLinkShell } from "./site-card-link-shell";
import { SiteIcon } from "../site-icon";
import type { SiteCardData, SiteCardVisualProps } from "./site-card.types";
import { useSiteCardNavigation } from "./use-site-card-navigation";

function GlassSiteCard({ site, layout, navigation, variant }: SiteCardVisualProps & { variant?: string }) {
	const showDescription = layout?.showCardDescription !== false;
	const paletteClass =
		variant === "glass-soft"
			? "border-white/30 bg-white/60 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
			: variant === "glass-aurora"
				? "border-white/35 bg-gradient-to-br from-white/50 via-white/35 to-cyan-200/25 shadow-[0_14px_35px_rgba(34,211,238,0.12)]"
				: variant === "glass-contrast"
					? "border-slate-300/40 bg-slate-900/10 shadow-[0_14px_35px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/5"
					: variant === "glass-strong"
						? "border-primary/20 bg-gradient-to-br from-white/70 via-white/35 to-primary/10 shadow-[0_18px_38px_rgba(59,130,246,0.14)]"
						: variant === "glass-tech"
							? "border-cyan-200/50 bg-gradient-to-br from-white/60 via-cyan-50/30 to-sky-200/25 shadow-[0_18px_38px_rgba(59,130,246,0.13)]"
							: variant === "glass-luxury"
								? "border-amber-200/60 bg-gradient-to-br from-white/70 via-amber-50/35 to-violet-100/25 shadow-[0_18px_42px_rgba(168,85,247,0.12)]"
								: variant === "glass-minimal"
									? "border-slate-200/60 bg-white/45 shadow-[0_12px_28px_rgba(15,23,42,0.06)]"
									: "border-white/30 bg-white/65 shadow-[0_12px_30px_rgba(15,23,42,0.08)]";

	return (
		<SiteCardLinkShell
			ariaLabel={site.title}
			className="group block h-full rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			navigation={navigation}
		>
			<div className={`site-card-surface site-card-glass site-card-glass--${variant ?? "default"} pointer-events-none flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-3 backdrop-blur-xl ${paletteClass} dark:border-white/10`}>
				<div className="flex items-center gap-3">
					<SiteIcon site={site} layout={layout} size={38} className="text-base!" initialClassName="text-sm!" />
					<div className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{site.title}</div>
				</div>
				{showDescription && <div className="mt-3 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">{site.description}</div>}
			</div>
		</SiteCardLinkShell>
	);
}

function FeatureSiteCard({ site, layout, navigation }: SiteCardVisualProps) {
	const showDescription = layout?.showCardDescription !== false;
	return (
		<SiteCardLinkShell
			ariaLabel={site.title}
			className="group block h-full rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			navigation={navigation}
		>
			<div className="site-card-surface site-card-feature pointer-events-none flex h-full flex-col overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-primary/10 shadow-[0_16px_32px_rgba(37,99,235,0.08)] dark:from-primary/15 dark:via-zinc-900 dark:to-primary/10">
				<div className="flex items-center justify-between gap-3 p-3">
					<SiteIcon site={site} layout={layout} size={40} className="text-lg!" initialClassName="text-sm!" />
					<div className="rounded-full border border-primary/20 bg-white/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-primary dark:bg-zinc-800/80">Hot</div>
				</div>
				<div className="px-3 pb-3">
					<div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">{site.title}</div>
					{showDescription && <div className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">{site.description}</div>}
				</div>
			</div>
		</SiteCardLinkShell>
	);
}

function ListSiteCard({ site, layout, navigation }: SiteCardVisualProps) {
	const showDescription = layout?.showCardDescription !== false;
	return (
		<SiteCardLinkShell
			ariaLabel={site.title}
			className="group block h-full rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			navigation={navigation}
		>
			<div className="site-card-surface site-card-list pointer-events-none flex h-full items-center gap-3 rounded-xl border border-divider bg-surface px-3 py-2.5 shadow-sm transition-colors duration-200 group-hover:bg-default-100 dark:bg-zinc-900">
				<SiteIcon site={site} layout={layout} size={32} className="text-base!" initialClassName="text-sm!" />
				<div className="min-w-0 flex-1">
					<div className="truncate text-sm font-medium text-foreground">{site.title}</div>
					{showDescription && <div className="truncate text-[11px] text-muted">{site.description}</div>}
				</div>
			</div>
		</SiteCardLinkShell>
	);
}

function OutlineSiteCard({ site, layout, navigation }: SiteCardVisualProps) {
	const showDescription = layout?.showCardDescription !== false;
	return (
		<SiteCardLinkShell
			ariaLabel={site.title}
			className="group block h-full rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
			navigation={navigation}
		>
			<div className="site-card-surface site-card-outline pointer-events-none flex h-full flex-col rounded-2xl border border-dashed border-primary/25 bg-transparent p-3 transition-colors duration-200 group-hover:border-primary/40 group-hover:bg-primary/[0.03]">
				<div className="flex items-center gap-3">
					<SiteIcon site={site} layout={layout} size={34} className="text-base!" initialClassName="text-sm!" />
					<div className="min-w-0 flex-1 truncate text-sm font-medium">{site.title}</div>
				</div>
				{showDescription && <div className="mt-2 line-clamp-2 text-xs text-muted">{site.description}</div>}
			</div>
		</SiteCardLinkShell>
	);
}

function SplitSiteCard({ site, layout, navigation }: SiteCardVisualProps) {
	const showDescription = layout?.showCardDescription !== false;
	return (
		<SiteCardLinkShell ariaLabel={site.title} className="site-card-hover-region group block h-full rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-primary" navigation={navigation}>
			<div className="site-card-surface site-card-split pointer-events-none flex h-full items-stretch overflow-hidden rounded-xl border">
				<div className="flex w-16 shrink-0 items-center justify-center bg-primary text-primary-foreground">
					<SiteIcon site={site} layout={layout} size={38} className="text-xl!" initialClassName="text-sm!" />
				</div>
				<div className="min-w-0 flex-1 p-3">
					<div className="truncate text-sm font-bold">{site.title}</div>
					{showDescription && <div className="mt-1 line-clamp-2 text-xs text-muted">{site.description}</div>}
				</div>
			</div>
		</SiteCardLinkShell>
	);
}

function NeonSiteCard({ site, layout, navigation }: SiteCardVisualProps) {
	const showDescription = layout?.showCardDescription !== false;
	return (
		<SiteCardLinkShell ariaLabel={site.title} className="site-card-hover-region group block h-full rounded-xl outline-none focus-visible:outline-2 focus-visible:outline-primary" navigation={navigation}>
			<div className="site-card-surface site-card-neon pointer-events-none flex h-full flex-col justify-between rounded-xl border p-3">
				<div className="flex items-center gap-3">
					<SiteIcon site={site} layout={layout} size={38} className="text-lg!" initialClassName="text-sm!" />
					<div className="min-w-0 flex-1 truncate text-sm font-bold">{site.title}</div>
				</div>
				{showDescription && <div className="mt-3 line-clamp-2 text-xs opacity-75">{site.description}</div>}
			</div>
		</SiteCardLinkShell>
	);
}

function PaperSiteCard({ site, layout, navigation }: SiteCardVisualProps) {
	const showDescription = layout?.showCardDescription !== false;
	return (
		<SiteCardLinkShell ariaLabel={site.title} className="site-card-hover-region group block h-full rounded-lg outline-none focus-visible:outline-2 focus-visible:outline-primary" navigation={navigation}>
			<div className="site-card-surface site-card-paper pointer-events-none flex h-full flex-col justify-between border p-3">
				<div className="flex items-center gap-3">
					<SiteIcon site={site} layout={layout} size={36} className="text-lg!" initialClassName="text-sm!" />
					<div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{site.title}</div>{showDescription && <div className="mt-1 line-clamp-2 text-xs text-muted">{site.description}</div>}</div>
				</div>
				<div className="mt-3 line-clamp-2 text-xs text-muted">{site.description}</div>
			</div>
		</SiteCardLinkShell>
	);
}

function TerminalSiteCard({ site, layout, navigation }: SiteCardVisualProps) {
	const showDescription = layout?.showCardDescription !== false;
	return (
		<SiteCardLinkShell ariaLabel={site.title} className="site-card-hover-region group block h-full rounded-md outline-none focus-visible:outline-2 focus-visible:outline-primary" navigation={navigation}>
			<div className="site-card-surface site-card-terminal pointer-events-none flex h-full flex-col overflow-hidden rounded-md border">
				<div className="flex items-center gap-1.5 border-b px-3 py-1.5 text-[10px] uppercase tracking-[0.18em]"><span className="size-1.5 rounded-full bg-emerald-400" /> nav://site</div>
				<div className="flex items-center gap-3 p-3"><SiteIcon site={site} layout={layout} size={32} className="text-base!" initialClassName="text-sm!" /><div className="min-w-0 flex-1 truncate text-sm font-bold">{site.title}</div></div>
				{showDescription && <div className="px-3 pb-3 text-xs opacity-70">$ open {site.url.replace(/^https?:\/\//, "")}</div>}
			</div>
		</SiteCardLinkShell>
	);
}

function MosaicSiteCard({ site, layout, navigation }: SiteCardVisualProps) {
	const showDescription = layout?.showCardDescription !== false;
	return (
		<SiteCardLinkShell ariaLabel={site.title} className="site-card-hover-region group block h-full rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-primary" navigation={navigation}>
			<div className="site-card-surface site-card-mosaic pointer-events-none flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-3">
				<div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="truncate text-sm font-black uppercase tracking-wide">{site.title}</div>{showDescription && <div className="mt-1 line-clamp-2 text-xs opacity-75">{site.description}</div>}</div><SiteIcon site={site} layout={layout} size={42} className="text-xl!" initialClassName="text-sm!" /></div>
				<div className="mt-4 h-1.5 w-2/3 rounded-full bg-current opacity-35" />
			</div>
		</SiteCardLinkShell>
	);
}

export const SiteCard = memo(function SiteCard({
	site,
	trackVisit = true,
	categoryId,
	layout,
	siteLinkMode,
}: {
	site: SiteCardData;
	trackVisit?: boolean;
	categoryId?: string;
	layout?: Required<LayoutConfig>;
	siteLinkMode: SiteLinkMode;
}) {
	const navigation = useSiteCardNavigation({
		site,
		trackVisit,
		categoryId,
		layout,
		siteLinkMode,
	});

	if (layout?.cardStyle === "preview") {
		return <PreviewSiteCard site={site} layout={layout} navigation={navigation} />;
	}
	if (
		layout?.cardStyle === "glass" ||
		layout?.cardStyle === "glass-soft" ||
		layout?.cardStyle === "glass-aurora" ||
		layout?.cardStyle === "glass-contrast" ||
		layout?.cardStyle === "glass-strong" ||
		layout?.cardStyle === "glass-tech" ||
		layout?.cardStyle === "glass-luxury" ||
		layout?.cardStyle === "glass-minimal"
	) {
		return (
			<GlassSiteCard
				site={site}
				layout={layout}
				navigation={navigation}
				variant={layout.cardStyle}
			/>
		);
	}
	if (layout?.cardStyle === "feature") {
		return <FeatureSiteCard site={site} layout={layout} navigation={navigation} />;
	}
	if (layout?.cardStyle === "list") {
		return <ListSiteCard site={site} layout={layout} navigation={navigation} />;
	}
	if (layout?.cardStyle === "outline") {
		return <OutlineSiteCard site={site} layout={layout} navigation={navigation} />;
	}
	if (layout?.cardStyle === "split") {
		return <SplitSiteCard site={site} layout={layout} navigation={navigation} />;
	}
	if (layout?.cardStyle === "neon") {
		return <NeonSiteCard site={site} layout={layout} navigation={navigation} />;
	}
	if (layout?.cardStyle === "paper") {
		return <PaperSiteCard site={site} layout={layout} navigation={navigation} />;
	}
	if (layout?.cardStyle === "terminal") {
		return <TerminalSiteCard site={site} layout={layout} navigation={navigation} />;
	}
	if (layout?.cardStyle === "mosaic") {
		return <MosaicSiteCard site={site} layout={layout} navigation={navigation} />;
	}

	return <CompactSiteCard site={site} layout={layout} navigation={navigation} />;
});
