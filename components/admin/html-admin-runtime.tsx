"use client";

import { type ReactNode, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { RuntimeLoadingScreen } from "@/components/runtime-loading-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { useRuntimeConfig } from "@/lib/runtime-config";
import { AdminStoreProvider } from "@/lib/store/hydrate";

export function HtmlAdminRuntime({ children }: { children: ReactNode }) {
	const { config, error, themeMode } = useRuntimeConfig();

	useEffect(() => {
		if (config?.nav) {
			document.title = `${config.nav.name || "Go Nav"} 配置后台`;
		}
	}, [config]);

	if (error) {
		return (
			<ThemeProvider mode={themeMode}>
				<main className="flex min-h-dvh items-center justify-center bg-background px-6 text-foreground">
					<div className="w-full max-w-xl rounded-2xl border border-danger/30 bg-danger-soft p-6 text-danger-soft-foreground">
						<h1 className="text-lg font-semibold">配置后台加载失败</h1>
						<p className="mt-2 break-words text-sm leading-6">{error}</p>
						<p className="mt-3 text-sm leading-6">
							请确认 nav.json 与 website.json 位于网站根目录，并通过
							HTTP/HTTPS 访问。
						</p>
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
			<AdminStoreProvider initial={config}>
				<AdminShell>{children}</AdminShell>
			</AdminStoreProvider>
		</ThemeProvider>
	);
}
