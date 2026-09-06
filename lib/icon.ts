export function isInlineSvgIcon(value: string | undefined): boolean {
	return /^<svg[\s>]/i.test(value?.trimStart() ?? "");
}

export function getIconImageSrc(
	value: string | undefined,
	baseUrl?: string,
): string | null {
	if (!value) return null;
	const icon = value.trim();
	if (isInlineSvgIcon(icon)) {
		return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(icon)}`;
	}
	if (icon.startsWith("//")) return `https:${icon}`;
	if (icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("/")) {
		if (isSlowFaviconProxy(icon)) return null;
		return icon;
	}
	if (icon.startsWith("data:image/")) return icon;
	if (baseUrl && (icon.startsWith("./") || icon.startsWith("../") || !icon.includes("/"))) {
		try {
			return new URL(
				icon,
				/^https?:\/\//i.test(baseUrl) ? baseUrl : `https://${baseUrl}`,
			).toString();
		} catch {
			return null;
		}
	}
	if (/^(www\.)?[^\s/]+\.[^\s/]+(?:\/.*)?$/i.test(icon)) {
		return `https://${icon}`;
	}
	return null;
}

function isSlowFaviconProxy(value: string): boolean {
	try {
		const url = new URL(value);
		return (
			url.hostname === "www.google.com" &&
			url.pathname === "/s2/favicons"
		);
	} catch {
		return false;
	}
}
