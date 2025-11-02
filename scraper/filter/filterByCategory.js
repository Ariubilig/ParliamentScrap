const fs = require("fs");
const path = require("path");


const data = JSON.parse(fs.readFileSync("../../parliament.json", "utf8")); // Read scraped file
const categories = {}; // Group by category

data.forEach(item => {
  const category = item.category || "Unknown";

  // Create array for this category if not exist
  if (!categories[category]) {
    categories[category] = [];
  }

  // Push the item into category list
  categories[category].push(item);
});

// Create an "output" folder /if not exist/
const outputDir = path.join(__dirname, "categories");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Write each category into its own JSON file
for (const [category, items] of Object.entries(categories)) {
  // Sanitize filename (remove special chars)
  const safeName = category.replace(/[\/\\:*?"<>|]/g, "_");
  const filePath = path.join(outputDir, `${safeName}.json`);

  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
  console.log(`✅ Saved ${items.length} items → ${safeName}.json`);
}

console.log("All category files created in ./categories folder");