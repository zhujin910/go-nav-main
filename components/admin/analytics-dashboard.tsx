"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	Button,
	Chip,
} from "@heroui/react";
import { FiTrendingUp, FiEye, FiCalendar, FiGlobe, FiTrash2 } from "react-icons/fi";
import {
	clearAnalytics,
	getAnalyticsOverview,
	getDailyVisits,
	getTopSites,
	getVisitRecords,
	type AnalyticsOverview,
	type DailyVisit,
	type TopSite,
} from "@/lib/client/analytics";

function StatCard({
	icon: Icon,
	label,
	value,
	color,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string | number;
	color: string;
}) {
	return (
		<Card className="border-none bg-surface shadow-sm">
			<CardContent className="flex flex-row items-center gap-4 p-5">
				<div
					className={`flex size-12 items-center justify-center rounded-xl ${color}`}
				>
					<Icon className="size-6 text-white" />
				</div>
				<div>
					<p className="text-sm text-muted-foreground">{label}</p>
					<p className="text-2xl font-bold">{value}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function SimpleBarChart({ data }: { data: DailyVisit[] }) {
	const maxCount = Math.max(...data.map((d) => d.count), 1);
	return (
		<div className="flex h-48 items-end gap-1">
			{data.map((d) => (
				<div
					key={d.date}
					className="group relative flex flex-1 flex-col items-center"
				>
					<div
						className="w-full rounded-t bg-primary/70 transition-all group-hover:bg-primary"
						style={{
							height: `${(d.count / maxCount) * 100}%`,
							minHeight: d.count > 0 ? "4px" : "0",
						}}
					/>
					<div className="pointer-events-none absolute -top-8 hidden rounded bg-zinc-800 px-2 py-1 text-xs text-white group-hover:block">
						{d.count} 次
					</div>
				</div>
			))}
		</div>
	);
}

export function AnalyticsDashboard() {
	const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
	const [topSites, setTopSites] = useState<TopSite[]>([]);
	const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		fetch("/api/stats", { cache: "no-store" })
			.then((response) => response.ok ? response.json() : Promise.reject(new Error()))
			.then((data: { visitRecords?: Array<{ date: string; visit: number }>; clickRecords?: Array<{ websiteId: string; count: number }> }) => {
				setOverview({ totalVisits: data.visitRecords?.reduce((sum, item) => sum + item.visit, 0) ?? 0, todayVisits: data.visitRecords?.find((item) => item.date === new Date().toISOString().slice(0, 10))?.visit ?? 0, weekVisits: data.visitRecords?.slice(-7).reduce((sum, item) => sum + item.visit, 0) ?? 0, uniqueSites: data.clickRecords?.length ?? 0, uniqueCategories: 0 });
				setTopSites((data.clickRecords ?? []).sort((a, b) => b.count - a.count).slice(0, 10).map((item) => ({ url: item.websiteId, title: item.websiteId, visitCount: item.count, lastVisit: "" })));
				setDailyVisits(data.visitRecords?.slice(-14).map((item) => ({ date: item.date, count: item.visit })) ?? []);
			})
			.catch(() => {
				const records = getVisitRecords();
				setOverview(getAnalyticsOverview(records));
				setTopSites(getTopSites(records, 10));
				setDailyVisits(getDailyVisits(records, 14));
			});
	}, [refreshKey]);

	const handleClear = () => {
		if (confirm("确定要清空所有访问统计数据吗？此操作不可恢复。")) {
			void fetch("/api/stats", { method: "DELETE" }).finally(() => {
				clearAnalytics();
				setRefreshKey((k) => k + 1);
			});
		}
	};

	if (!overview) {
		return <div className="p-8 text-center text-muted">加载统计数据中...</div>;
	}

	return (
		<div className="space-y-6">
			{/* 标题栏 */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">数据统计仪表盘</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						基于本地浏览器的访问统计（数据存储在 localStorage，仅当前设备可见）
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="ghost"
						onClick={() => setRefreshKey((k) => k + 1)}
					>
						刷新
					</Button>
					<Button
						size="sm"
						variant="danger-soft"
						onClick={handleClear}
					>
						<FiTrash2 />
						清空数据
					</Button>
				</div>
			</div>

			{/* 统计卡片 */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<StatCard
					icon={FiEye}
					label="总访问量"
					value={overview.totalVisits}
					color="bg-blue-500"
				/>
				<StatCard
					icon={FiTrendingUp}
					label="今日访问"
					value={overview.todayVisits}
					color="bg-green-500"
				/>
				<StatCard
					icon={FiCalendar}
					label="本周访问"
					value={overview.weekVisits}
					color="bg-purple-500"
				/>
				<StatCard
					icon={FiGlobe}
					label="访问网站数"
					value={overview.uniqueSites}
					color="bg-orange-500"
				/>
			</div>

			{/* 访问趋势图 */}
			<Card className="border-none bg-surface shadow-sm">
				<CardHeader className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">最近 14 天访问趋势</h3>
					<Chip size="sm" variant="soft">
						日均 {Math.round(overview.weekVisits / 7)} 次
					</Chip>
				</CardHeader>
				<div className="h-px w-full bg-divider" />
				<CardContent className="p-5">
					<SimpleBarChart data={dailyVisits} />
					<div className="mt-2 flex justify-between text-xs text-muted-foreground">
						<span>{dailyVisits[0]?.date}</span>
						<span>{dailyVisits[dailyVisits.length - 1]?.date}</span>
					</div>
				</CardContent>
			</Card>

			{/* 热门网站排行 */}
			<Card className="border-none bg-surface shadow-sm">
				<CardHeader>
					<h3 className="text-lg font-semibold">热门网站 TOP 10</h3>
				</CardHeader>
				<div className="h-px w-full bg-divider" />
				<CardContent className="p-0">
					{topSites.length === 0 ? (
						<div className="p-8 text-center text-muted-foreground">
							暂无访问数据，点击网站后会自动记录
						</div>
					) : (
						<div className="divide-y">
							{topSites.map((site, index) => (
								<div
									key={site.url}
									className="flex items-center gap-4 px-5 py-3"
								>
									<span
										className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
											index < 3
												? "bg-primary text-white"
												: "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
										}`}
									>
										{index + 1}
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{site.title}</p>
										<p className="truncate text-xs text-muted-foreground">
											{site.url}
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold text-primary">
											{site.visitCount}
										</p>
										<p className="text-xs text-muted-foreground">次访问</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}