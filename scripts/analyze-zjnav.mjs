import fs from "node:fs";

const file = process.argv[2] || "../zjnav全部分类网址整理.csv";
const content = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\r" || char === "\n") && !quoted) {
      if (field || row.length) {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      }
      if (char === "\r" && text[index + 1] === "\n") index += 1;
    } else field += char;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const rows = parseCsv(content).slice(1).map((values) => ({
  main: (values[0] || "").trim(),
  sub: (values[1] || "").trim(),
  title: (values[3] || "").trim().replaceAll("&#8211;", "-"),
  url: (values.slice(4).join(",") || "").trim().replaceAll("&amp;", "&"),
})).filter((row) => row.main && row.title && row.url);
const tree = new Map();
for (const row of rows) {
  if (!tree.has(row.main)) tree.set(row.main, new Map());
  const subs = tree.get(row.main);
  subs.set(row.sub, (subs.get(row.sub) || 0) + 1);
}
const urls = new Map();
for (const row of rows) urls.set(row.url, (urls.get(row.url) || 0) + 1);
console.log(JSON.stringify({
  rows: rows.length,
  mains: tree.size,
  duplicateRows: rows.length - urls.size,
  duplicateUrls: [...urls].filter(([, count]) => count > 1).length,
  tree: [...tree].map(([main, subs]) => ({ main, count: [...subs.values()].reduce((a, b) => a + b, 0), subs: [...subs] })),
}, null, 2));
