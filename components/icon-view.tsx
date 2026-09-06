import { useEffect, useState, type ReactNode } from "react";
import { getIconImageSrc } from "@/lib/icon";

interface IconViewProps {
	icon?: string;
	alt?: string;
	size?: number;
	className?: string;
	imageClassName?: string;
	textClassName?: string;
	fallback?: ReactNode;
}

/**
 * Small icon renderer for category/search chrome.
 * Keeps URL/SVG/emoji handling in one place without pulling in Next Image for
 * user-provided dynamic icon sources.
 */
export function IconView({
	icon,
	alt = "",
	size = 20,
	className = "",
	imageClassName = "",
	textClassName = "",
	fallback = null,
}: IconViewProps) {
	const imageSrc = getIconImageSrc(icon);
	const [imageFailed, setImageFailed] = useState(false);

	useEffect(() => setImageFailed(false), [imageSrc]);

	if (!icon) return fallback;

	if (imageSrc && !imageFailed) {
		return (
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={imageSrc}
				alt={alt}
				width={size}
				height={size}
				className={`inline-block shrink-0 rounded object-contain ${className} ${imageClassName}`.trim()}
				style={{ width: size, height: size }}
				loading="lazy"
				decoding="async"
				referrerPolicy="no-referrer"
				onError={() => setImageFailed(true)}
			/>
		);
	}

	if (imageSrc && imageFailed) return fallback;
	if (isRemoteIcon(icon)) return fallback;

	return (
		<span
			aria-hidden={alt ? undefined : true}
			className={`inline-flex shrink-0 items-center justify-center text-center leading-none ${className} ${textClassName}`.trim()}
			style={{ width: size, height: size }}
		>
			{icon}
		</span>
	);
}

function isRemoteIcon(value: string): boolean {
	return /^(?:https?:)?\/\//i.test(value.trim());
}
