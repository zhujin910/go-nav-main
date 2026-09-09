"use client";

import type { Selection } from "@heroui/react";
import {
	Chip,
	EmptyState,
	ListBox,
	ListBoxItem,
	SearchField,
} from "@heroui/react";
import type { Key } from "@heroui/react";
import {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import type { NavCategory } from "@/types";
import {
	activeIdAtom,
	layoutAtom,
	showCategorySearchAtom,
	showSubcategoryTabsAtom,
} from "@/lib/store/site";
import { IconView } from "./icon-view";
import { SubmissionSidebarButton } from "./submission-trigger";

function countSites(category: NavCategory): number {
	let count = category.sites?.length ?? 0;
	if (category.children) {
		for (const child of category.children) {
			count += countSites(child);
		}
	}
	return count;
}

function flattenCategoriesForTree(categories: NavCategory[]): NavCategory[] {
	const result: NavCategory[] = [];
	for (const cat of categories) {
		result.push(cat);
		if (cat.children && cat.children.length > 0) {
			result.push(...cat.children);
		}
	}
	return result;
}

interface CategorySearchEntry {
	category: NavCategory;
	text: string;
	pinyin: string;
	pinyinInitials: string;
}

export const CategorySidebar = memo(function CategorySidebar({
	categories,
	onItemClick,
	showSubmissionAction = false,
	context,
	footer,
}: {
	categories: NavCategory[];
	onItemClick?: (id: string) => void;
	showSubmissionAction?: boolean;
	context: "desktop" | "drawer";
	footer?: ReactNode;
}) {
	const activeId = useAtomValue(activeIdAtom);
	const showSubcategoryTabs = useAtomValue(showSubcategoryTabsAtom);
	const showCategorySearch = useAtomValue(showCategorySearchAtom);
	const categoryListStyle = useAtomValue(layoutAtom).categoryListStyle;
	const pathname = usePathname();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchHighlightIndex, setSearchHighlightIndex] = useState(-1);
	const [searchEntries, setSearchEntries] = useState<CategorySearchEntry[]>([]);
	const [searchIndexReady, setSearchIndexReady] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const visibleCategories = useMemo(() => {
		const filterVisible = (items: NavCategory[]): NavCategory[] =>
			items.flatMap((category) => {
				if (category.hidden) return [];
				return [{
					...category,
					children: category.children?.length
						? filterVisible(category.children)
						: category.children,
				}];
			});
		return filterVisible(categories);
	}, [categories]);

	const displayCategories = useMemo(
		() =>
			showSubcategoryTabs
				? visibleCategories
				: flattenCategoriesForTree(visibleCategories),
		[showSubcategoryTabs, visibleCategories],
	);

	useEffect(() => {
		if (!showCategorySearch) {
			setSearchEntries([]);
			return;
		}

		// 先提供中文/描述文本匹配，拼音索引在后台按需补全。
		setSearchEntries(
			displayCategories.map((category) => ({
				category,
				text: `${category.name}\u0001${category.description ?? ""}`.toLowerCase(),
				pinyin: "",
				pinyinInitials: "",
			})),
		);
		if (!searchIndexReady) return;

		let cancelled = false;
		void import("@/lib/client/pinyin-search")
			.then(({ createPinyinVariants }) => {
				if (cancelled) return;
				setSearchEntries(
					displayCategories.map((category) => {
						const variants = createPinyinVariants(category.name);
						return {
							category,
							text: `${category.name}\u0001${category.description ?? ""}`.toLowerCase(),
							pinyin: variants.full,
							pinyinInitials: variants.initials,
						};
					}),
				);
			})
			.catch(() => {
				// 动态块加载失败时保留普通文本搜索。
			});

		return () => {
			cancelled = true;
		};
	}, [displayCategories, searchIndexReady, showCategorySearch]);

	const filteredCategories = useMemo(() => {
		if (!showCategorySearch || !searchQuery.trim()) return displayCategories;
		const q = searchQuery.trim().toLowerCase();
		return searchEntries
			.filter(
				(entry) =>
					entry.text.includes(q) ||
					entry.pinyin.includes(q) ||
					entry.pinyinInitials.includes(q),
			)
			.map((entry) => entry.category);
	}, [displayCategories, searchEntries, searchQuery, showCategorySearch]);

	const allCategoryIds = useMemo(() => {
		const ids = new Set<string>(visibleCategories.map((c) => c.id));
		for (const cat of visibleCategories) {
			if (cat.children) {
				for (const child of cat.children) {
					ids.add(child.id);
				}
			}
		}
		return ids;
	}, [visibleCategories]);

	const parentIdByCategoryId = useMemo(() => {
		const map = new Map<string, string>();
		for (const cat of visibleCategories) {
			map.set(cat.id, cat.id);
			if (!cat.children) continue;
			for (const child of cat.children) {
				map.set(child.id, cat.id);
			}
		}
		return map;
	}, [visibleCategories]);

	const inDetailPage = pathname.startsWith("/site/");

	const selectedId = useMemo(() => {
		if (inDetailPage) return null;
		if (!activeId) {
			return visibleCategories[0]?.id ?? null;
		}
		if (showSubcategoryTabs) {
			return parentIdByCategoryId.get(activeId) ?? (visibleCategories[0]?.id ?? null);
		}
		if (!allCategoryIds.has(activeId)) {
			return visibleCategories[0]?.id ?? null;
		}
		return activeId;
	}, [
		activeId,
		allCategoryIds,
		visibleCategories,
		inDetailPage,
		parentIdByCategoryId,
		showSubcategoryTabs,
	]);

	const selectedKeys: Selection = useMemo(() => {
		if (!selectedId) return new Set();
		return new Set([selectedId]);
	}, [selectedId]);

	const hasAnyIcon = useMemo(
		() => visibleCategories.some((c) => !!c.icon),
		[visibleCategories],
	);

	const siteCounts = useMemo(() => {
		const map = new Map<string, number>();
		const cats = showSubcategoryTabs ? visibleCategories : displayCategories;
		for (const c of cats) {
			map.set(c.id, countSites(c));
		}
		return map;
	}, [displayCategories, showSubcategoryTabs, visibleCategories]);

	const childIds = useMemo(() => {
		const ids = new Set<string>();
		for (const cat of visibleCategories) {
			if (cat.children) {
				for (const child of cat.children) {
					ids.add(child.id);
				}
			}
		}
		return ids;
	}, [visibleCategories]);

	const jumpTo = useCallback(
		(key: Key) => {
			const id = String(key);
			if (inDetailPage) {
				if (id === "home") {
					onItemClick?.("");
					router.push("/");
					return;
				}
				onItemClick?.(id);
				router.push(`/#${encodeURIComponent(id)}`);
				return;
			}

			if (id === "home") {
				if (typeof window !== "undefined") {
					window.scrollTo({ top: 0, behavior: "smooth" });
				}
				onItemClick?.("");
			} else {
				onItemClick?.(id);
				const el = document.getElementById(id);
				if (el) {
					el.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}
		},
		[inDetailPage, onItemClick, router],
	);

	const listRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!listRef.current) return;
		const selected = listRef.current.querySelector('[data-selected="true"]');
		if (selected) {
			// 页面滚动结束后的被动同步不再额外启动一段侧栏平滑滚动。
			selected.scrollIntoView({ block: "nearest", behavior: "auto" });
		}
	}, [selectedId]);

	useEffect(() => {
		if (!showCategorySearch || !searchQuery.trim()) {
			setSearchHighlightIndex(-1);
			return;
		}
		setSearchHighlightIndex(filteredCategories.length > 0 ? 0 : -1);
	}, [filteredCategories.length, searchQuery, showCategorySearch]);

	useEffect(() => {
		if (searchHighlightIndex < 0 || !listRef.current) return;
		const items = listRef.current.querySelectorAll("[role=option]");
		const target = items[searchHighlightIndex] as HTMLElement | undefined;
		if (target) {
			target.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, [searchHighlightIndex]);

	const handleSearchKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				searchInputRef.current?.blur();
				return;
			}
			if (!showCategorySearch || filteredCategories.length === 0) return;
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSearchHighlightIndex((prev) =>
					prev < filteredCategories.length - 1 ? prev + 1 : 0,
				);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSearchHighlightIndex((prev) =>
					prev > 0 ? prev - 1 : filteredCategories.length - 1,
				);
			} else if (e.key === "Enter" && searchHighlightIndex >= 0) {
				e.preventDefault();
				e.stopPropagation();
				(
					e.nativeEvent as KeyboardEvent & {
						stopImmediatePropagation?: () => void;
					}
				).stopImmediatePropagation?.();
				const target = filteredCategories[searchHighlightIndex];
				if (target) jumpTo(target.id);
			}
		},
		[showCategorySearch, filteredCategories, searchHighlightIndex, jumpTo],
	);

	return (
		<div className="h-full flex flex-col">
			{showCategorySearch && (
				<div className="px-3 pt-2 shrink-0 mb-2">
					<SearchField
						value={searchQuery}
						onChange={setSearchQuery}
						className="w-full"
					>
						<SearchField.Group>
							<SearchField.SearchIcon />
							<SearchField.Input
								ref={searchInputRef}
								placeholder="搜索分类..."
								onFocus={() => setSearchIndexReady(true)}
								onKeyDown={handleSearchKeyDown}
							/>
							<SearchField.ClearButton className="absolute right-0 cursor-pointer" />
						</SearchField.Group>
					</SearchField>
				</div>
			)}
			<div ref={listRef} className="flex-1 overflow-y-auto">
				{filteredCategories.length === 0 ? (
					<div className="flex items-center justify-center p-8">
						<EmptyState className="text-center">
							<p className="text-sm text-muted">暂无分类</p>
						</EmptyState>
					</div>
				) : (
					<ListBox
						aria-label="导航菜单"
						selectedKeys={selectedKeys}
						selectionMode="single"
						onSelectionChange={(keys) => {
							const first = [...keys][0];
							if (first) {
								setSearchHighlightIndex(-1);
								jumpTo(first);
							}
						}}
						className="px-2 *:px-4 *:font-medium"
					>
						{filteredCategories.map((c, index) => {
							const isChild = childIds.has(c.id);
							const siteCount = siteCounts.get(c.id) ?? 0;
							const isSearchHighlighted = index === searchHighlightIndex;
							return (
								<CategorySidebarItem
									key={c.id}
									category={c}
									isChild={isChild}
									siteCount={siteCount}
									hasAnyIcon={hasAnyIcon}
									isSearchHighlighted={isSearchHighlighted}
									listStyle={categoryListStyle}
								/>
							);
						})}
					</ListBox>
				)}
			</div>
			{showSubmissionAction && <SubmissionSidebarButton context={context} />}
			{footer}
		</div>
	);
});

const CategorySidebarItem = memo(function CategorySidebarItem({
	category,
	isChild,
	siteCount,
	hasAnyIcon,
	isSearchHighlighted,
	listStyle = "default",
}: {
	category: NavCategory;
	isChild: boolean;
	siteCount: number;
	hasAnyIcon: boolean;
	isSearchHighlighted: boolean;
	listStyle?:
		| "default"
		| "card"
		| "outline"
		| "compact"
		| "soft"
		| "rail"
		| "pill"
		| "split"
		| "minimal"
		| "badge"
		| "glass"
		| "glass-pill"
		| "glass-rail"
		| "glass-split"
		| "glass-tech"
		| "glass-accent"
		| "glass-mesh";
}) {
	const styleClass =
		listStyle === "card"
			? "mb-1 rounded-xl bg-surface shadow-sm data-[selected=true]:bg-(--primary-foreground)! data-[selected=true]:shadow-md"
			: listStyle === "outline"
				? "mb-1 rounded-xl border border-divider data-[selected=true]:border-primary/50 data-[selected=true]:bg-primary/10"
				: listStyle === "compact"
					? "gap-2 rounded-lg py-1.5 text-xs data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
					: listStyle === "soft"
						? "mb-1 rounded-lg bg-default-100/55 data-[selected=true]:bg-primary/12 data-[selected=true]:text-primary"
						: listStyle === "rail"
							? "relative mb-1 rounded-lg pl-5 before:absolute before:left-1 before:top-1/2 before:h-0 before:w-0 before:-translate-y-1/2 before:rounded-full before:bg-primary before:transition-all data-[selected=true]:before:h-6 data-[selected=true]:before:w-1"
							: listStyle === "pill"
								? "mb-1 rounded-full border border-divider bg-white/40 px-3 py-2 text-sm data-[selected=true]:bg-primary/12 data-[selected=true]:text-primary dark:bg-white/5"
								: listStyle === "split"
									? "mb-1 rounded-xl border border-divider/70 bg-gradient-to-r from-transparent to-default-100/80 px-3 py-2 data-[selected=true]:border-primary/50 data-[selected=true]:bg-primary/10"
									: listStyle === "minimal"
										? "rounded-lg px-2 py-1.5 text-sm opacity-80 data-[selected=true]:bg-default/60 data-[selected=true]:opacity-100"
										: listStyle === "badge"
											? "mb-1 rounded-lg border border-primary/15 bg-primary/5 px-2.5 py-1.5 text-sm data-[selected=true]:border-primary/40 data-[selected=true]:bg-primary/10"
											: listStyle === "glass"
												? "mb-1 rounded-2xl border border-white/30 bg-white/30 px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl data-[selected=true]:bg-primary/15 data-[selected=true]:shadow-[0_10px_30px_rgba(59,130,246,0.15)] dark:border-white/10 dark:bg-white/5"
												: listStyle === "glass-pill"
													? "mb-1 rounded-full border border-white/40 bg-white/25 px-3 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.04)] backdrop-blur-xl data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary dark:border-white/10 dark:bg-white/5"
													: listStyle === "glass-rail"
														? "relative mb-1 rounded-xl border border-white/25 bg-white/15 pl-5 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-lg before:absolute before:left-1.5 before:top-1/2 before:h-0 before:w-0 before:-translate-y-1/2 before:rounded-full before:bg-primary before:transition-all data-[selected=true]:before:h-6 data-[selected=true]:before:w-1"
														: listStyle === "glass-split"
															? "mb-1 rounded-2xl border border-white/35 bg-gradient-to-r from-white/35 to-white/15 px-3 py-2 shadow-[0_12px_25px_rgba(15,23,42,0.04)] backdrop-blur-xl data-[selected=true]:border-primary/30 data-[selected=true]:bg-primary/10"
																		: listStyle === "glass-tech"
																			? "mb-1 rounded-2xl border border-cyan-200/40 bg-gradient-to-r from-white/30 via-cyan-100/20 to-sky-200/20 px-3 py-2 shadow-[0_12px_28px_rgba(59,130,246,0.12)] backdrop-blur-xl data-[selected=true]:border-cyan-400/50 data-[selected=true]:bg-cyan-400/10"
																			: listStyle === "glass-accent"
																				? "mb-1 rounded-xl border border-white/35 bg-white/20 px-3 py-2 shadow-[0_8px_22px_rgba(15,23,42,0.05)] backdrop-blur-xl before:absolute before:left-2 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:bg-gradient-to-r before:from-primary before:to-cyan-400 before:opacity-80 data-[selected=true]:before:scale-110"
																				: listStyle === "glass-mesh"
																					? "mb-1 rounded-2xl border border-white/30 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.44),rgba(255,255,255,0.12)_30%,rgba(59,130,246,0.06)_100%)] px-3 py-2 shadow-[0_12px_26px_rgba(15,23,42,0.06)] backdrop-blur-xl data-[selected=true]:border-primary/35 data-[selected=true]:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),rgba(255,255,255,0.1)_30%,rgba(59,130,246,0.14)_100%)]"
																					: "rounded-xl data-[selected=true]:bg-(--primary-foreground)! data-[selected=true]:shadow!";
	return (
		<ListBoxItem
			id={category.id}
			textValue={category.name}
			className={`${styleClass} gap-2.5 ${
				isChild ? "pl-8 text-sm" : ""
			} ${isSearchHighlighted ? "bg-default" : ""}`}
		>
			{hasAnyIcon || isChild ? (
				<span
					className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-sm leading-none"
					aria-hidden
				>
					<IconView
						icon={category.icon}
						size={16}
						textClassName="w-full"
					/>
				</span>
			) : (
				<GridIcon />
			)}
			<span className="flex-1 truncate">{category.name}</span>
			{siteCount > 0 && (
				<Chip size="sm" variant="soft" className="ml-auto">
					{siteCount}
				</Chip>
			)}
		</ListBoxItem>
	);
});

function GridIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden
			className="shrink-0"
		>
			<rect
				x="2"
				y="2"
				width="5"
				height="5"
				rx="1"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<rect
				x="9"
				y="2"
				width="5"
				height="5"
				rx="1"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<rect
				x="2"
				y="9"
				width="5"
				height="5"
				rx="1"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<rect
				x="9"
				y="9"
				width="5"
				height="5"
				rx="1"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</svg>
	);
}
