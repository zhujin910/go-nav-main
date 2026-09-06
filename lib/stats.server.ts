import fs from "fs";
import path from "path";

export type ClickRecord = {
  websiteId: string;
  count: number;
};
export type VisitRecord = {
  date: string;
  visit: number;
};

// 数据存储目录：优先用环境变量 DATA_DIR，没有就用项目 data 目录
const getDataDir = () => {
  return process.env.DATA_DIR || path.join(process.cwd(), "data");
};

const getStatPath = () => path.join(getDataDir(), "stats.json");

export async function readStats() {
  const fp = getStatPath();
  if (!fs.existsSync(fp)) {
    return { clickRecords: [] as ClickRecord[], visitRecords: [] as VisitRecord[] };
  }
  const buf = fs.readFileSync(fp, { encoding: "utf-8" });
  return JSON.parse(buf);
}

type StatsData = { clickRecords: ClickRecord[]; visitRecords: VisitRecord[] };

export async function writeStats(obj: StatsData) {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(getStatPath(), JSON.stringify(obj, null, 2), { encoding: "utf-8" });
}

// 记录访问
export async function recordVisit() {
  const stats = await readStats();
  const today = new Date().toISOString().slice(0, 10);
  const find = stats.visitRecords.find((i: VisitRecord) => i.date === today);
  if (find) find.visit += 1;
  else stats.visitRecords.push({ date: today, visit: 1 });
  await writeStats(stats);
}

// 记录网址点击
export async function recordClick(websiteId: string) {
  const stats = await readStats();
  const find = stats.clickRecords.find((c: ClickRecord) => c.websiteId === websiteId);
  if (find) find.count += 1;
  else stats.clickRecords.push({ websiteId, count: 1 });
  await writeStats(stats);
}