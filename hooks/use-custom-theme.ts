"use client";

import { useEffect } from "react";
import type { CustomThemeConfig } from "@/types";
import { resolveThemeBackgroundValue } from "@/lib/theme-presets";

function applyTheme(background?: CustomThemeConfig["themeBackground"], textStyle?: CustomThemeConfig["textStyle"]): void {
	const root = document.documentElement;
	root.style.setProperty("--theme-bg-image", resolveThemeBackgroundValue(background) ?? "none");
	root.style.setProperty("--theme-bg-color", background?.mode === "solid" && background.solidColor ? background.solidColor : "var(--background)");
	root.style.setProperty("--theme-bg-blur", `${Math.min(30, Math.max(0, background?.blur ?? 8))}px`);
	root.style.setProperty("--theme-bg-opacity", `${Math.min(1, Math.max(0, background?.opacity ?? 0.72))}`);
	root.style.setProperty("--theme-liquid-opacity", `${Math.min(1, Math.max(0, background?.liquid ?? 0.42))}`);
	root.style.setProperty("--site-text-color", textStyle?.color ?? "#0f172a");
	root.style.setProperty("--site-muted-color", textStyle?.mutedColor ?? "#64748b");
	root.style.setProperty("--site-title-color", textStyle?.titleColor ?? textStyle?.color ?? "#0f172a");
	root.style.setProperty("--site-link-color", textStyle?.linkColor ?? "#2563eb");
	root.style.setProperty("--site-text-size", `${Math.min(28, Math.max(12, textStyle?.fontSize ?? 14))}px`);
	root.style.setProperty("--site-title-size", `${Math.min(48, Math.max(16, textStyle?.titleSize ?? 20))}px`);
	root.style.setProperty("--site-muted-size", `${Math.min(24, Math.max(10, textStyle?.mutedSize ?? 12))}px`);
	root.style.setProperty("--site-font-family", textStyle?.fontFamily ?? "PingFang SC, Microsoft YaHei, sans-serif");
	root.style.setProperty("--site-title-font-family", textStyle?.titleFontFamily ?? textStyle?.fontFamily ?? "PingFang SC, Microsoft YaHei, sans-serif");
	root.style.setProperty("--site-muted-font-family", textStyle?.mutedFontFamily ?? textStyle?.fontFamily ?? "PingFang SC, Microsoft YaHei, sans-serif");
	root.style.setProperty("--site-font-weight", String(textStyle?.fontWeight ?? 400));
	root.style.setProperty("--site-title-weight", String(textStyle?.titleWeight ?? 600));
	root.style.setProperty("--site-line-height", `${Math.min(2.4, Math.max(1.2, textStyle?.lineHeight ?? 1.6))}`);
	root.style.setProperty("--site-letter-spacing", `${(textStyle?.letterSpacing ?? 0) / 100}em`);
	root.style.setProperty("--site-title-letter-spacing", `${(textStyle?.titleLetterSpacing ?? textStyle?.letterSpacing ?? 0) / 100}em`);
	root.style.setProperty("--site-text-opacity", String(Math.min(1, Math.max(0.35, textStyle?.textOpacity ?? 1))));
	root.style.setProperty("--site-title-opacity", String(Math.min(1, Math.max(0.35, textStyle?.titleOpacity ?? 1))));
	root.style.setProperty("--site-text-shadow", textStyle?.textShadow ?? "none");
	root.style.setProperty("--site-title-shadow", textStyle?.titleShadow ?? "none");
	root.style.setProperty("--site-text-transform", textStyle?.textTransform ?? "none");
	root.style.setProperty("--site-link-underline", textStyle?.linkUnderline === true ? "underline" : "none");
}

export function useCustomTheme(config?: CustomThemeConfig) {
	useEffect(() => {
		applyTheme(config?.themeBackground, config?.textStyle);
	}, [config?.themeBackground, config?.textStyle]);

	useEffect(() => {
		const observer = new MutationObserver(() => applyTheme(config?.themeBackground, config?.textStyle));
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		return () => observer.disconnect();
	}, [config?.themeBackground, config?.textStyle]);
}
