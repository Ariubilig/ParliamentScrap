const fs = require("fs");
const path = require("path");

// Load your main data file
const data = JSON.parse(fs.readFileSync("../parliament_split.json", "utf8"));

// List of categories to EXCLUDE
const excludeCategories = [
  "Inter-Parliamentary Groups at the State Great Hural",
  "Байнгын хорооны санал дүгнэлт",
  "Байнгын хорооны тогтоол",
  "Монгол Улсын нэгдсэн төсвийн гүйцэтгэлийн сарын товч мэдээ",
  "Мэдээ, мэдээлэл",
  "Нийгмийн бодлогын байнгын хороо",
  "Тамгын газар",
  "Төрийн мэдээлэл-2025 он",
  "Төсвийн тогтвортой байдлын зөвлөл",
  "Төсвийн шинжилгээ",
  "Улсын Их Хурлын гишүүний тавьсан асуулт, асуулга",
  "Улсын Их Хурлын гишүүний тавьсан асуулт, асуулгын хариу",
  "Улсын Их Хурлын чуулганы нэгдсэн хуралдаанд Ерөнхий сайдын хийх мэдээлэл",
  "Хуралдааны дэлгэрэнгүй тэмдэглэл",
  "Хуралдааны ирц",
  "Хууль зүйн байнгын хороо",
  "Хяналт шалгалт",
  "Хяналт шинжилгээ, үнэлгээ",
  "Хяналтын мэдээлэл",
  "Хянан шалгах түр хороо",
  "2025 он",
  "Монголын Парламентын Бүлгэм"
];

const categories = {};

// Group by category
data.forEach(item => {
  const category = item.category || "Unknown";

  // Skip excluded categories
  if (excludeCategories.includes(category)) {
    console.log(`🚫 Skipped: ${category}`);
    return;
  }

  if (!categories[category]) {
    categories[category] = [];
  }

  categories[category].push(item);
});

// Output folder
const outputDir = path.join(__dirname, "categories");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Write category files
for (const [category, items] of Object.entries(categories)) {
  const safeName = category.replace(/[\/\\:*?"<>|]/g, "_");
  const filePath = path.join(outputDir, `${safeName}.json`);

  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
  console.log(`✅ Saved ${items.length} items → ${safeName}.json`);
}

console.log("✨ All filtered category files created in ./categories folder");