const fs = require("fs");
const path = require("path");

// Load your main data file
const data = JSON.parse(fs.readFileSync("../parliament_split.json", "utf8"));

const categories = {};

// Group by category
data.forEach(item => {
  const category = item.category || "Unknown";

  // Remove "Файл татах" from content if it exists
  if (item.content && item.content.includes("Файл татах", "Нэр Файл Хавсралт файл")) {
    item.content = item.content.replace(/Файл татах/g, "").replace(/Нэр Файл Хавсралт файл/g, "").trim();
  }

  // Skip items with content less than 100 characters
  if (!item.content || item.content.length < 100) {
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