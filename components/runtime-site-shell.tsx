"use client";

import { Suspense, useCallback } from "react";
import { AppLayout } from "@/components/app-layout";
import { RuntimeDocumentConfig } from "@/components/runtime-document-config";
import { RuntimeLoadingScreen } from "@/components/runtime-loading-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { useRuntimeConfig } from "@/lib/runtime-config";
import { toPublicNavConfig } from "@/lib/site-access-config";
import { SiteStoreProvider } from "@/lib/store/hydrate";
import type { NavConfig } from "@/types";
import { ThemeRuntime } from "./theme-runtime";

export function RuntimeSiteShell() {
	const normalizeNav = useCallback(
		(nav: NavConfig) => toPublicNavConfig(nav),
		[],
	);
	const { config, error, themeMode } = useRuntimeConfig(normalizeNav);

	if (error) {
		return (
			<ThemeProvider mode={themeMode}>
				<main className="mx-auto flex min-h-dvh max-w-xl items-center px-6">
					<div className="w-full rounded-2xl border border-danger/30 bg-danger-soft p-6 text-danger-soft-foreground">
						<h1 className="text-lg font-semibold">配置加载失败</h1>
						<p className="mt-2 break-words text-sm leading-6">{error}</p>
						<p className="mt-3 text-sm leading-6">
							请确认 nav.json 与 website.json 位于网站根目录，并通过
							HTTP/HTTPS 访问本站。
						</p>
						<button
							type="button"
							className="mt-5 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-danger-foreground"
							onClick={() => window.location.reload()}
						>
							重新加载
						</button>
					</div>
				</main>
			</ThemeProvider>
		);
	}

	if (!config) {
		return (
			<ThemeProvider mode={themeMode}>
				<RuntimeLoadingScreen message="正在读取网站配置…" />
			</ThemeProvider>
		);
	}

	return (
		<ThemeProvider mode={themeMode}>
			<SiteStoreProvider initial={config}>
				<ThemeRuntime />
				<RuntimeDocumentConfig nav={config.nav} />
				<Suspense
					fallback={<RuntimeLoadingScreen message="正在加载页面…" />}
				>
					<AppLayout deploymentMode="html" />
				</Suspense>
			</SiteStoreProvider>
		</ThemeProvider>
	);
}
