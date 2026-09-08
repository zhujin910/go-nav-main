"use client";
import { Button } from "@heroui/react";
import { memo } from "react";
import { useAtomValue } from "jotai";
import { getIconImageSrc } from "@/lib/icon";
import { layoutAtom } from "@/lib/store/site";
import { SearchBar } from "./search-bar";
import type { HeaderBranding, HeaderSearchModel } from "./header.types";
import { BiMenuAltLeft, BiGlobe } from "react-icons/bi";

/**
 * 头部只负责布局与触发器展示。
 * 交互状态由 HeaderBundle 编排后，以 branding / search 两组模型传入，
 * 避免零散 props 横向蔓延。
 */
export const AppHeader = memo(function AppHeader({
	branding,
	onMenuOpen,
	search,
}: {
	branding: HeaderBranding;
	onMenuOpen: () => void;
	search?: HeaderSearchModel;
}) {
	const logoSrc = getIconImageSrc(branding.logo);
	const layout = useAtomValue(layoutAtom);
	const showSearch = !!search;
	const showEngineSelector = search?.config.showEngineSelector !== false;
	const brandStyle = layout.brandStyle ?? "default";
	const brandShellClass =
		brandStyle === "glass"
			? "rounded-xl border border-white/30 bg-white/25 px-2.5 py-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
			: brandStyle === "glass-pill"
				? "rounded-full border border-white/40 bg-white/25 px-2.5 py-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
				: brandStyle === "glass-rail"
					? "relative rounded-xl border border-white/25 bg-white/15 px-2.5 py-1.5 pl-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-lg before:absolute before:left-2 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-primary before:opacity-80"
					: brandStyle === "glass-tech"
						? "rounded-xl border border-cyan-200/40 bg-gradient-to-r from-white/30 via-cyan-100/20 to-sky-200/20 px-2.5 py-1.5 shadow-[0_12px_28px_rgba(59,130,246,0.12)] backdrop-blur-xl dark:border-cyan-400/20 dark:from-cyan-400/5 dark:to-sky-500/10"
						: brandStyle === "glass-accent"
							? "rounded-xl border border-white/35 bg-white/20 px-2.5 py-1.5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] backdrop-blur-xl before:absolute before:left-2 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-gradient-to-r before:from-primary before:to-cyan-400 before:opacity-80"
							: brandStyle === "glass-mesh"
								? "rounded-xl border border-white/30 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.44),rgba(255,255,255,0.12)_30%,rgba(59,130,246,0.06)_100%)] px-2.5 py-1.5 shadow-[0_12px_26px_rgba(15,23,42,0.06)] backdrop-blur-xl"
								: brandStyle === "card"
									? "rounded-xl border border-divider bg-surface px-2.5 py-1.5 shadow-sm"
									: brandStyle === "outline"
										? "rounded-xl border border-divider px-2.5 py-1.5"
										: brandStyle === "soft"
											? "rounded-lg bg-default-100/80 px-2.5 py-1.5"
											: "rounded-lg px-2 py-1";
	return (
		<header className="site-theme-header site-layout-header sticky top-0 z-30 flex min-h-16 h-auto items-center gap-3 px-4 pb-2 sm:px-6 min-[860px]:grid min-[860px]:grid-cols-[minmax(0,1fr)_minmax(0,36rem)_minmax(0,1fr)] pointer-events-none *:pointer-events-auto">
			<div className="flex min-w-0 items-center gap-2 min-[860px]:col-start-1 min-[860px]:justify-self-start">
				<Button
					variant="tertiary"
					size="md"
					isIconOnly
					aria-label="打开菜单"
					aria-haspopup="dialog"
					className="shrink-0 touch-manipulation select-none shadow bg-(--primary-foreground) lg:hidden"
					onPressStart={onMenuOpen}
				>
					<BiMenuAltLeft className="scale-150" />
				</Button>
				<div className={`max-[639px]:hidden relative flex min-w-0 items-center gap-2 ${brandShellClass}`}>
					{logoSrc ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={logoSrc}
							alt={branding.name}
							className="h-6 w-6 object-contain"
						/>
					) : null}
					<span className="text-base! max-w-32 truncate font-semibold">
						{branding.name}
					</span>
				</div>
			</div>
			{search && (
				<div className="ml-auto w-full flex-1 max-w-xl pt-2 min-[860px]:col-start-2 min-[860px]:max-w-none">
					<SearchBar config={search.config} engineState={search.engineState} />
				</div>
			)}
			{showSearch && showEngineSelector && (
				<div className="flex max-[479px]:flex min-[480px]:hidden">
					<Button
						variant="tertiary"
						size="md"
						isIconOnly
						aria-label="切换搜索引擎"
						className="shrink-0 shadow bg-(--primary-foreground)"
						onPress={search?.onDrawerOpen}
					>
						<BiGlobe className="scale-150" />
					</Button>
				</div>
			)}
		</header>
	);
});
