"use client";

import { useAtomValue } from "jotai";
import { useCustomTheme } from "@/hooks/use-custom-theme";
import { customThemeAtom } from "@/lib/store/site";

export function ThemeRuntime() {
	const config = useAtomValue(customThemeAtom);
	useCustomTheme(config);
	return null;
}