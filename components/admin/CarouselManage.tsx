"use client";

import { Button, Card, Input, TextArea, toast } from "@heroui/react";
import { useEffect, useState, type ChangeEvent } from "react";
import { FiImage, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { useAtom } from "jotai";
import type { CarouselItem } from "@/types";
import { navAtom } from "@/lib/store/admin";
import { uploadImageWithCompression } from "@/lib/client/image-upload";
import { isHtmlDeployment } from "@/lib/client/html-admin";

function createCarouselItem(): CarouselItem {
	return { id: Date.now().toString(), title: "", desc: "", image: "", link: "", enable: true };
}

export default function CarouselManage() {
	const [config, setConfig] = useAtom(navAtom);
	const [list, setList] = useState<CarouselItem[]>(config.carousel ?? []);
	const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

	useEffect(() => setList(config.carousel ?? []), [config.carousel]);

	const updateItem = (index: number, key: keyof CarouselItem, value: string | boolean) => {
		setList((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
	};
	const handleTextChange = (index: number, key: "title" | "desc" | "image" | "link", event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		updateItem(index, key, event.target.value);
	};
	const handleImageUpload = async (index: number, file: File) => {
		setUploadingIndex(index);
		try {
			const url = await uploadImageWithCompression(file, {
				maxEdge: 1920,
				quality: 0.84,
				compress: config.imageUpload?.compress !== false,
				forceWebp: config.imageUpload?.convertToWebp !== false,
				fileNamePrefix: "carousel",
			});
			updateItem(index, "image", url);
			toast.success("轮播图上传成功");
		} catch (error) {
			toast.danger((error as Error).message || "轮播图上传失败");
		} finally {
			setUploadingIndex(null);
		}
	};
	const save = () => setConfig({ ...config, carousel: list });
	const enabledCount = list.filter((item) => item.enable).length;

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6">
			<div className="flex flex-col gap-4 border-b border-divider pb-5 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div className="mb-2 flex items-center gap-2 text-primary"><FiImage className="size-5" /><span className="text-sm font-semibold">首页内容</span></div>
					<h1 className="text-2xl font-semibold tracking-tight">轮播图管理</h1>
					<p className="mt-1 text-sm text-muted-foreground">管理首页搜索框上方展示的图片、文案和跳转链接。</p>
				</div>
				<div className="flex items-center gap-3"><span className="text-sm text-muted-foreground"><b className="text-foreground">{enabledCount}</b> / {list.length} 启用</span><Button variant="primary" onPress={save}><FiSave className="size-4" />保存配置</Button></div>
			</div>

			{list.length === 0 ? (
				<Card className="border border-dashed border-divider bg-transparent shadow-none"><div className="flex flex-col items-center justify-center px-6 py-16 text-center"><div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FiImage className="size-7" /></div><h2 className="text-lg font-semibold">还没有轮播图</h2><p className="mt-1 text-sm text-muted-foreground">添加图片后，它们会显示在首页搜索框上方。</p><Button className="mt-5" variant="outline" onPress={() => setList([createCarouselItem()])}><FiPlus className="size-4" />新增第一张</Button></div></Card>
			) : (
				<div className="space-y-4">{list.map((item, index) => (
					<Card key={item.id} className="overflow-hidden border border-divider shadow-sm"><div className="flex flex-col gap-5 p-5 lg:flex-row">
						<div className="w-full shrink-0 lg:w-56"><div className="relative aspect-video overflow-hidden rounded-xl bg-default-100">{item.image ? <img src={item.image} alt={item.title || "轮播图预览"} className={`size-full object-cover ${item.dynamicEffect ? "carousel-banner__image--dynamic" : ""}`} /> : <div className="flex size-full items-center justify-center text-default-400"><FiImage className="size-8" /></div>}</div><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-medium text-muted-foreground">第 {index + 1} 张</span><label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={item.enable} onChange={(event) => updateItem(index, "enable", event.target.checked)} className="size-4 accent-blue-600" />启用</label><label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={item.dynamicEffect === true} onChange={(event) => updateItem(index, "dynamicEffect", event.target.checked)} className="size-4 accent-blue-600" />动态效果</label></div></div>
						<div className="min-w-0 flex-1 space-y-4"><div className="grid gap-4 md:grid-cols-2"><label className="space-y-1.5"><span className="text-sm font-medium">标题</span><Input value={item.title} placeholder="例如：精选工具推荐" onChange={(event) => handleTextChange(index, "title", event)} /></label><label className="space-y-1.5"><span className="text-sm font-medium">跳转链接</span><Input value={item.link} placeholder="https://example.com" onChange={(event) => handleTextChange(index, "link", event)} /></label></div><label className="block space-y-1.5"><span className="text-sm font-medium">图片地址</span><div className="flex flex-col gap-2 sm:flex-row"><Input className="min-w-0 flex-1" value={item.image} placeholder="/uploads/banner.jpg 或远程图片地址" onChange={(event) => handleTextChange(index, "image", event)} />{!isHtmlDeployment ? <><input id={`carousel-upload-${item.id}`} type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void handleImageUpload(index, file); }} /><Button type="button" variant="outline" isDisabled={uploadingIndex !== null} onPress={() => document.getElementById(`carousel-upload-${item.id}`)?.click()}>{uploadingIndex === index ? "上传中..." : "上传图片"}</Button></> : null}</div><span className="block text-xs text-muted-foreground">推荐 30:7，建议 1500×350；支持 PNG、JPG、GIF、WebP、SVG，上传后会自动填入地址，首页会按容器裁剪。</span></label><label className="block space-y-1.5"><span className="text-sm font-medium">描述</span><TextArea value={item.desc} placeholder="补充一行简短介绍" onChange={(event) => handleTextChange(index, "desc", event)} /></label><div className="flex justify-end border-t border-divider pt-4"><Button variant="danger-soft" onPress={() => setList((current) => current.filter((entry) => entry.id !== item.id))}><FiTrash2 className="size-4" />删除此项</Button></div></div>
					</div></Card>
				))}</div>
			)}

			<Button variant="outline" onPress={() => setList((current) => [...current, createCarouselItem()])}><FiPlus className="size-4" />新增轮播项</Button>
		</div>
	);
}