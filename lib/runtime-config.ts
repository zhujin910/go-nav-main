import { useEffect, useState } from "react";
import type { NavConfig, ThemeMode, WebsiteData } from "@/types";

export interface RuntimeConfig<TNav = NavConfig> {
	nav: TNav;
	websiteData: WebsiteData;
}

export async function fetchRuntimeJson<T>(
	url: string,
	signal: AbortSignal,
): Promise<T> {
	const response = await fetch(url, {
		// 允许浏览器/CDN 使用条件请求；配置变化时仍会通过 304/200 正确更新。
		cache: "no-cache",
		headers: {
			Accept: "application/json",
		},
		signal,
	});

	if (!response.ok) {
		throw new Error(`${url.split("?")[0]} 请求失败（HTTP ${response.status}）`);
	}

	try {
		return (await response.json()) as T;
	} catch {
		throw new Error(`${url.split("?")[0]} 不是有效的 JSON`);
	}
}

export function assertRuntimeConfig(nav: NavConfig, websiteData: WebsiteData) {
	if (!nav || typeof nav !== "object" || Array.isArray(nav)) {
		throw new Error("/nav.json 顶层必须是 JSON 对象");
	}
	if (
		!websiteData ||
		typeof websiteData !== "object" ||
		!Array.isArray(websiteData.categories)
	) {
		throw new Error("/website.json 必须包含 categories 数组");
	}
}

export function resolveThemeMode(nav: Pick<NavConfig, "themeMode">): ThemeMode {
	return nav.themeMode ?? "light";
}

export function useRuntimeConfig<TNav = NavConfig>(
	normalizeNav?: (nav: NavConfig) => TNav,
) {
	const [config, setConfig] = useState<RuntimeConfig<TNav> | null>(null);
	const [error, setError] = useState("");
	const [themeMode, setThemeMode] = useState<ThemeMode>("system");

	useEffect(() => {
		const controller = new AbortController();

		const navPromise = fetchRuntimeJson<NavConfig>(
			"/nav.json",
			controller.signal,
		);
		const websitePromise = fetchRuntimeJson<WebsiteData>(
			"/website.json",
			controller.signal,
		);

		void navPromise
			.then((nav) => {
				if (!controller.signal.aborted) {
					setThemeMode(resolveThemeMode(nav));
				}
			})
			.catch(() => undefined);

		Promise.all([navPromise, websitePromise])
			.then(([nav, websiteData]) => {
				assertRuntimeConfig(nav, websiteData);
				setConfig({
					nav: normalizeNav ? normalizeNav(nav) : (nav as TNav),
					websiteData,
				});
			})
			.catch((reason: unknown) => {
				if (controller.signal.aborted) return;
				setError(
					reason instanceof Error ? reason.message : "运行时配置加载失败",
				);
			});

		return () => controller.abort();
	}, [normalizeNav]);

	return { config, error, themeMode };
}
