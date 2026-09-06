"use client";

import {
	AlertDialog,
	Button,
	Chip,
	Input,
	Label,
	Separator,
	Table,
	Tabs,
	TextField,
} from "@heroui/react";
import type { NavConfig, SearchEngine, SearchKeyword } from "@/types";
import { useAtom } from "jotai";
import { navAtom } from "@/lib/store/admin";
import { IconPicker } from "./icon-picker";
import { AdminSwitch } from "./admin-switch";
import {
	BiPlus,
	BiTrash,
	BiGlobe,
	BiChevronUp,
	BiChevronDown,
} from "react-icons/bi";
import { useRef, useState } from "react";

export function EnginesEditor() {
	const [value, setValue] = useAtom(navAtom);
	const s = value.search;
	const patch = (p: Partial<NavConfig["search"]>) => {
		setValue({ ...value, search: { ...s, ...p } });
	};

	const setEngines = (engines: SearchEngine[]) => {
		patch({ engines });
	};

	const keywords = s.keywords ?? [];
	const setKeywords = (next: SearchKeyword[]) => patch({ keywords: next });

	const patchSwitch = (
		key: keyof NonNullable<NavConfig["search"]>,
		selected: boolean,
	) => {
		if (key === "enableLocalSearch" && !selected) {
			patch({
				enableLocalSearch: false,
				defaultEngine: s.engines[0]?.id ?? "",
			});
			return;
		}

		patch({
			[key]: selected,
		} as Partial<NavConfig["search"]>);
	};

	const moveEngine = (idx: number, dir: "up" | "down") => {
		const newIdx = dir === "up" ? idx - 1 : idx + 1;
		if (newIdx < 0 || newIdx >= s.engines.length) return;
		const copy = s.engines.slice();
		const [moved] = copy.splice(idx, 1);
		copy.splice(newIdx, 0, moved);
		setEngines(copy);
	};

	const addEngine = () =>
		setEngines([
			{
				id: `engine-${Date.now()}`,
				name: "新引擎",
				icon: "🔍",
				url: "https://example.com/?q={query}",
			},
			...s.engines,
		]);

	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

	const switchItems: {
		label: string;
		key: keyof NonNullable<NavConfig["search"]>;
		def: boolean;
	}[] = [
		{
			label: "启用本地搜索（按标题/描述/标签过滤）",
			key: "enableLocalSearch",
			def: false,
		},
		{ label: "显示搜索引擎切换器", key: "showEngineSelector", def: true },
		{ label: "启用搜索联想词", key: "enableSuggestion", def: false },
		{
			label: "恢复上次选择的搜索引擎",
			key: "rememberLastEngine",
			def: false,
		},
		{ label: "Tab 键快捷聚焦搜索框", key: "enableTabFocus", def: true },
	];

	return (
		<>
			<Tabs defaultSelectedKey="config" className="w-full">
				<Tabs.ListContainer>
					<Tabs.List aria-label="搜索引擎管理" className="w-fit">
						<Tabs.Tab id="config">
							功能配置
							<Tabs.Indicator />
						</Tabs.Tab>
						<Tabs.Tab id="list">
							搜索引擎
							<Tabs.Indicator />
						</Tabs.Tab>
					</Tabs.List>
				</Tabs.ListContainer>

				<Tabs.Panel id="config">
					<div className="flex flex-col gap-4">
						<div>
							<h3 className="text-sm font-semibold">搜索功能配置</h3>
							<p className="mt-1 text-xs text-default-500">
								配置搜索栏的显示和行为
							</p>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-2">
								<Label className="text-sm font-medium">
									默认引擎 ID（本站请设置为：local）
								</Label>
								<TextField
									value={s.defaultEngine}
									onChange={(v) => patch({ defaultEngine: v })}
								>
									<Label className="sr-only">defaultEngine</Label>
									<Input placeholder="local / baidu / google ..." />
								</TextField>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-sm font-medium">占位文字</Label>
								<TextField
									value={s.placeholder}
									onChange={(v) => patch({ placeholder: v })}
								>
									<Label className="sr-only">placeholder</Label>
									<Input placeholder="搜索你想要的内容..." />
								</TextField>
							</div>
						</div>

						<Separator />

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{switchItems.map((item) => {
								const cur = (s[item.key] as boolean | undefined) ?? item.def;
								return (
									<AdminSwitch
										key={item.key as string}
										isSelected={cur}
										onChange={(v) => patchSwitch(item.key, v)}
									>
										<span className="text-sm">{item.label}</span>
									</AdminSwitch>
								);
							})}
						</div>

						{s.enableLocalSearch && (
							<div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
								本地搜索会在当前导航数据中按标题、描述和标签进行关键词匹配过滤，无需外部
								API。
							</div>
						)}

						{s.enableSuggestion && (
							<div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
								搜索联想词功能会请求百度搜索建议 API，非百度引擎时可能不适用。
							</div>
						)}

						<Separator />

						<div className="flex flex-col gap-3">
							<div className="flex items-center justify-between gap-3">
								<div>
									<h3 className="text-sm font-semibold">快捷关键词</h3>
									<p className="mt-1 text-xs text-default-500">
										显示在前台搜索框下方；填写链接后直接跳转，留空则使用当前搜索引擎搜索。
									</p>
								</div>
								<Button variant="outline" size="sm" onPress={() => setKeywords([...keywords, { label: "", url: "" }])}>
									<BiPlus data-icon="inline-start" />
									新增关键词
								</Button>
							</div>
							<div className="flex flex-wrap gap-4 rounded-lg border border-divider p-3">
								<label className="flex items-center gap-2 text-sm">
									<span>整体颜色</span>
									<input
										type="color"
										value={s.keywordColor ?? "#2563eb"}
										onChange={(event) => patch({ keywordColor: event.currentTarget.value })}
										className="h-8 w-12 cursor-pointer rounded border border-divider bg-transparent p-0.5"
									/>
								</label>
								<label className="flex items-center gap-2 text-sm">
									<span>整体悬停颜色</span>
									<input
										type="color"
										value={s.keywordHoverColor ?? "#1d4ed8"}
										onChange={(event) => patch({ keywordHoverColor: event.currentTarget.value })}
										className="h-8 w-12 cursor-pointer rounded border border-divider bg-transparent p-0.5"
									/>
								</label>
							</div>

							{keywords.length > 0 ? (
								<div className="flex flex-col gap-2">
									{keywords.map((keyword, index) => (
										<div key={index} className="flex flex-col gap-2 rounded-lg border border-divider p-3 md:flex-row md:items-center">
											<Input aria-label="关键词" value={keyword.label} placeholder="例如：AI 工具" onChange={(event) => {
												const next = keywords.slice();
												next[index] = { ...keyword, label: event.currentTarget.value };
												setKeywords(next);
											}} className="md:w-64" />
											<Input aria-label="关键词链接" value={keyword.url ?? ""} placeholder="可选，例如：https://example.com" onChange={(event) => {
												const next = keywords.slice();
												next[index] = { ...keyword, url: event.currentTarget.value };
												setKeywords(next);
											}} className="min-w-0 flex-1" />
											<label className="flex items-center gap-1 text-xs text-default-500">
												<span>颜色</span>
												<input type="color" aria-label="关键词颜色" value={keyword.color ?? s.keywordColor ?? "#2563eb"} onChange={(event) => {
													const next = keywords.slice();
													next[index] = { ...keyword, color: event.currentTarget.value };
													setKeywords(next);
												}} className="h-8 w-10 cursor-pointer rounded border border-divider bg-transparent p-0.5" />
											</label>
											<label className="flex items-center gap-1 text-xs text-default-500">
												<span>悬停</span>
												<input type="color" aria-label="关键词悬停颜色" value={keyword.hoverColor ?? s.keywordHoverColor ?? "#1d4ed8"} onChange={(event) => {
													const next = keywords.slice();
													next[index] = { ...keyword, hoverColor: event.currentTarget.value };
													setKeywords(next);
												}} className="h-8 w-10 cursor-pointer rounded border border-divider bg-transparent p-0.5" />
											</label>
											<Button isIconOnly size="sm" variant="outline" className="text-danger" aria-label="删除关键词" onPress={() => setKeywords(keywords.filter((_, itemIndex) => itemIndex !== index))}>
												<BiTrash />
											</Button>
										</div>
									))}
								</div>
							) : (
								<p className="rounded-lg border border-dashed border-divider px-4 py-6 text-center text-xs text-default-500">暂无快捷关键词</p>
							)}
						</div>
					</div>
				</Tabs.Panel>

				<Tabs.Panel id="list" className="px-0">
					<div className="flex flex-col gap-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 px-2">
								<h3 className="text-base font-semibold">外部搜索引擎</h3>
								<Chip variant="secondary" size="sm">
									<Chip.Label>{s.engines.length}</Chip.Label>
								</Chip>
							</div>
							<Button variant="primary" size="sm" onPress={addEngine}>
								<BiPlus data-icon="inline-start" />
								新增引擎
							</Button>
						</div>

						{s.engines.length === 0 ? (
							<div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-neutral-800">
								<div className="text-center">
									<BiGlobe className="mx-auto mb-2 size-8" />
									<p className="text-sm text-default-500">
										暂无引擎，点击右上角新增
									</p>
									<p className="mt-1 text-xs">
										URL 中请使用 {"{query}"} 作为搜索词占位符
									</p>
								</div>
							</div>
						) : (
							<Table variant="secondary" aria-label="搜索引擎列表">
								<Table.ScrollContainer>
									<Table.Content
										aria-label="搜索引擎列表"
										className="min-w-[96rem]"
									>
										<Table.Header>
											<Table.Column className="min-w-[26rem] whitespace-nowrap">
												图标
											</Table.Column>
											<Table.Column
												isRowHeader
												className="min-w-80 whitespace-nowrap"
											>
												ID
											</Table.Column>
											<Table.Column className="min-w-56 whitespace-nowrap">
												名称
											</Table.Column>
											<Table.Column className="min-w-[26rem] whitespace-nowrap">
												URL (使用 {"{query}"} 占位)
											</Table.Column>
											<Table.Column className="w-40 whitespace-nowrap">
												操作
											</Table.Column>
										</Table.Header>
										<Table.Body
											renderEmptyState={() => (
												<div className="py-12 text-center text-sm text-default-500">
													暂无引擎
												</div>
											)}
										>
											{s.engines.map((eng, idx) => (
												<EngineRow
													key={eng.id}
													eng={eng}
													isDefault={eng.id === s.defaultEngine}
													isFirst={idx === 0}
													isLast={idx === s.engines.length - 1}
													onChange={(next) => {
														const copy = [...s.engines];
														copy[idx] = next;
														setEngines(copy);
													}}
													onDelete={() => setDeleteConfirm(idx)}
													onSetDefault={() => patch({ defaultEngine: eng.id })}
													onMoveUp={() => moveEngine(idx, "up")}
													onMoveDown={() => moveEngine(idx, "down")}
												/>
											))}
										</Table.Body>
									</Table.Content>
								</Table.ScrollContainer>
							</Table>
						)}
					</div>
				</Tabs.Panel>
			</Tabs>

			{/* 删除确认对话框 */}
			<AlertDialog.Backdrop
				isOpen={deleteConfirm !== null}
				isDismissable
				isKeyboardDismissDisabled
				onOpenChange={(open) => !open && setDeleteConfirm(null)}
			>
				<AlertDialog.Container placement="center" size="sm">
					<AlertDialog.Dialog className="sm:max-w-[400px]">
						<AlertDialog.Header>
							<AlertDialog.Icon status="danger">
								<BiTrash />
							</AlertDialog.Icon>
							<AlertDialog.Heading>确认删除引擎</AlertDialog.Heading>
						</AlertDialog.Header>
						<AlertDialog.Body>
							<p className="text-sm">
								删除后该搜索引擎数据将被永久删除，此操作不可撤销。
							</p>
						</AlertDialog.Body>
						<AlertDialog.Footer>
							<Button
								variant="tertiary"
								onPress={() => setDeleteConfirm(null)}
							>
								取消
							</Button>
							<Button
								variant="danger"
								onPress={() => {
									if (deleteConfirm !== null) {
										setEngines(
											s.engines.filter((_, i) => i !== deleteConfirm),
										);
										setDeleteConfirm(null);
									}
								}}
							>
								确认删除
							</Button>
						</AlertDialog.Footer>
					</AlertDialog.Dialog>
				</AlertDialog.Container>
			</AlertDialog.Backdrop>
		</>
	);
}

function EngineRow({
	eng,
	isDefault,
	isFirst,
	isLast,
	onChange,
	onDelete,
	onSetDefault,
	onMoveUp,
	onMoveDown,
}: {
	eng: SearchEngine;
	isDefault: boolean;
	isFirst: boolean;
	isLast: boolean;
	onChange: (e: SearchEngine) => void;
	onDelete: () => void;
	onSetDefault: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
}) {
	const idRef = useRef<HTMLInputElement>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const urlRef = useRef<HTMLInputElement>(null);
	const patch = (p: Partial<SearchEngine>) =>
		onChange({
			...eng,
			id: idRef.current?.value ?? eng.id,
			name: nameRef.current?.value ?? eng.name,
			url: urlRef.current?.value ?? eng.url,
			...p,
		});

	const commitText = (field: "id" | "name" | "url", next: string) => {
		if (eng[field] !== next)
			patch({ [field]: next } as Pick<SearchEngine, typeof field>);
	};

	return (
		<Table.Row key={eng.id} id={eng.id}>
			<Table.Cell>
				<IconPicker
					isInline
					value={eng.icon}
					hint="建议正方形 128×128 或 256×256；支持 PNG、SVG、WebP、ICO、emoji 或图片 URL。"
					onChange={(v) => patch({ icon: v })}
				/>
			</Table.Cell>
			<Table.Cell>
				<div className="flex items-center gap-1.5">
					<Input
						ref={idRef}
						aria-label="id"
						defaultValue={eng.id}
						className="font-mono text-xs"
						onBlur={(e) => commitText("id", e.currentTarget.value)}
					/>
					{isDefault ? (
						<Chip size="sm" variant="secondary" color="accent">
							<Chip.Label>默认</Chip.Label>
						</Chip>
					) : (
						<Button
							size="sm"
							variant="outline"
							className="shrink-0 text-xs"
							onPress={onSetDefault}
						>
							设为默认
						</Button>
					)}
				</div>
			</Table.Cell>
			<Table.Cell>
				<Input
					ref={nameRef}
					aria-label="name"
					defaultValue={eng.name}
					onBlur={(e) => commitText("name", e.currentTarget.value)}
				/>
			</Table.Cell>
			<Table.Cell>
				<Input
					ref={urlRef}
					aria-label="url"
					defaultValue={eng.url}
					placeholder="https://example.com/search?q={query}"
					className="font-mono text-xs w-full min-w-52"
					onBlur={(e) => commitText("url", e.currentTarget.value)}
				/>
			</Table.Cell>
			<Table.Cell>
				<div className="flex items-center gap-1">
					<Button
						isIconOnly
						size="sm"
						variant="outline"
						aria-label="上移"
						isDisabled={isFirst}
						onPress={onMoveUp}
					>
						<BiChevronUp />
					</Button>
					<Button
						isIconOnly
						size="sm"
						variant="outline"
						aria-label="下移"
						isDisabled={isLast}
						onPress={onMoveDown}
					>
						<BiChevronDown />
					</Button>
					<Button
						isIconOnly
						size="sm"
						variant="outline"
						className="text-danger"
						aria-label="删除"
						onPress={onDelete}
					>
						<BiTrash />
					</Button>
				</div>
			</Table.Cell>
		</Table.Row>
	);
}
