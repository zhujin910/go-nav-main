import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const year = new URL(request.url).searchParams.get("year") || String(new Date().getFullYear());
	try {
		const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${encodeURIComponent(year)}/CN`, { next: { revalidate: 86400 } });
		if (!response.ok) throw new Error("holiday source unavailable");
		return NextResponse.json(await response.json());
	} catch {
		return NextResponse.json({ error: "节假日数据暂不可用" }, { status: 502 });
	}
}
