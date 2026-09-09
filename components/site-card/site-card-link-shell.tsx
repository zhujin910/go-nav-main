"use client";

import Link from "next/link";
import type { PropsWithChildren } from "react";
import type { SiteCardNavigationModel } from "./site-card.types";
import type { SiteCardData } from "./site-card.types";
import { BookmarkButton } from "./bookmark-button";

export function SiteCardLinkShell({
	ariaLabel,
	className,
	navigation,
	site,
	children,
}: PropsWithChildren<{
	ariaLabel: string;
	className: string;
	navigation: SiteCardNavigationModel;
	site: SiteCardData;
}>) {
	const content = navigation.useDetailPage ? (
		<Link
			href={navigation.detailHref}
			prefetch={false}
			scroll
			onClick={navigation.handleDetailNavigate}
			aria-label={ariaLabel}
			className={className}
		>
			{children}
		</Link>
	) : (
		<a
			href={navigation.href}
			target={navigation.target}
			rel={navigation.rel}
			aria-label={ariaLabel}
			onClick={navigation.handleClick}
			onAuxClick={navigation.handleAuxClick}
			className={className}
		>
			{children}
		</a>
	);

	return (
		<div className="relative h-full">
			{content}
			<BookmarkButton site={site} />
		</div>
	);
}
