"use client";

import { memo } from "react";
import type { NavCategory } from "@/types";
import type { CategorySectionModel } from "../layout.types";
import { CategoryContent } from "./category-section-content";
import { CategorySectionHeader } from "./category-section-header";
import { SubcategoryTabs } from "./subcategory-tabs";

export const CategorySection = memo(function CategorySection({
	category,
	view,
	isChild = false,
}: {
	category: NavCategory;
	view: CategorySectionModel;
	isChild?: boolean;
}) {
	const onlyChild = category.children?.length === 1 ? category.children[0] : null;
	if (onlyChild && !(category.sites && category.sites.length > 0)) {
		return <CategorySection category={onlyChild} view={view} isChild={isChild} />;
	}

	const { display, layout } = view;
	const hasMultipleChildren = (category.children?.length ?? 0) > 1;
	const hasAnyChildren = (category.children?.length ?? 0) > 0;
	const useTabs = layout?.showSubcategoryTabs !== false;
	const shouldHideContent =
		!useTabs && hasAnyChildren && !(category.sites && category.sites.length > 0);

	return (
		<section
			id={category.id}
			data-category-id={category.id}
			className="category-anchor scroll-mt-20"
			style={{
				contentVisibility: "auto",
				containIntrinsicSize: "480px",
			}}
		>
			{display.showTitle ? (
				<CategorySectionHeader
					category={category}
					showDescription={display.showDescription}
					isChild={isChild}
					withBottomSpacing={!shouldHideContent}
				/>
			) : null}

			{hasMultipleChildren && useTabs ? (
				<SubcategoryTabs category={category} view={view} />
			) : !shouldHideContent ? (
				<CategoryContent category={category} view={view} isSubcategory={isChild} />
			) : null}
		</section>
	);
});
