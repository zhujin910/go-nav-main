"use client";

import { Button, toast } from "@heroui/react";
import { BiCopy } from "react-icons/bi";
import type { ArticleRecord } from "@/types";

export function ArticleShareActions({ article }: { article: ArticleRecord }) {
	const shareUrl = `${window.location.origin}/article/${article.unique_key}`;

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			toast.success("分享链接已复制");
		} catch {
			toast.danger("复制失败，请手动复制页面地址");
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Button size="sm" variant="secondary" onPress={() => void copyLink()}>
				<BiCopy className="text-base" />
				复制链接
			</Button>
		</div>
	);
}
