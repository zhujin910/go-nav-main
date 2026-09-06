import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const csvPath = path.resolve(root, "../toolsdar导航网址整理.csv");
const websitePath = path.resolve(root, "data/website.json");

function parseLine(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }
  fields.push(field);
  return fields.map((value) => value.trim().replaceAll("&amp;", "&"));
}

function idForCategory(name) {
  return `toolsdar-${Buffer.from(name).toString("hex").slice(0, 12)}`;
}

const csv = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "").trim();
const rows = csv.split(/\r?\n/).slice(1).map(parseLine).map(([category, serial, title, url]) => ({
  category,
  serial,
  title,
  url,
})).filter((row) => row.category && row.title && row.url);

const website = JSON.parse(fs.readFileSync(websitePath, "utf8"));
const existingUrls = new Set();
const walk = (categories) => {
  for (const category of categories) {
    for (const site of category.sites ?? []) existingUrls.add(site.url);
    walk(category.children ?? []);
  }
};
walk(website.categories);

const categoriesByName = new Map();
for (const category of website.categories) categoriesByName.set(category.name, category);
const importedUrls = new Set();
let addedSites = 0;
let skippedSites = 0;
let addedCategories = 0;

for (const row of rows) {
  if (existingUrls.has(row.url) || importedUrls.has(row.url)) {
    skippedSites += 1;
    continue;
  }
  let category = categoriesByName.get(row.category);
  if (!category) {
    category = {
      id: idForCategory(row.category),
      name: row.category,
      icon: "🔗",
      description: `${row.category}相关网站集合`,
      sites: [],
    };
    website.categories.push(category);
    categoriesByName.set(row.category, category);
    addedCategories += 1;
  }
  category.sites ??= [];
  category.sites.push({
    id: `${category.id}-${row.serial}-${addedSites + 1}`,
    title: row.title,
    description: "",
    url: row.url,
    tags: [],
  });
  importedUrls.add(row.url);
  addedSites += 1;
}

fs.writeFileSync(websitePath, `${JSON.stringify(website, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ rows: rows.length, addedCategories, addedSites, skippedSites }, null, 2));
