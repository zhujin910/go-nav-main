import type { NavCategory, WebsiteData } from "@/types";

export function validateFrontendCategoryTree(websiteData: WebsiteData): void {
	for (const parent of websiteData.categories) {
		for (const child of parent.children ?? []) {
			if (child.children?.length) {
				throw new Error(`子分类“${child.name}”不能继续嵌套子分类，前端仅支持两级分类。`);
			}
		}
	}
}

export function getFrontendCategories(websiteData: WebsiteData): NavCategory[] {
	validateFrontendCategoryTree(websiteData);
	return websiteData.categories;
}
