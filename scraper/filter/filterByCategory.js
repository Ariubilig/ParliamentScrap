const fs = require("fs");
const path = require("path");


const data = JSON.parse(fs.readFileSync("../parliament.json", "utf8")); // Read scraped file
const categories = {}; // Group by category

data.forEach(item => {
  const category = item.category || "Unknown";

  if (!categories[category]) { // Create array if category not exist
    categories[category] = [];
  }

  categories[category].push(item); // Push items into category list
});

const outputDir = path.join(__dirname, "categories"); // Create an "output" folder /if not exist/
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Write each category into its own JSON file
for (const [category, items] of Object.entries(categories)) {

  const safeName = category.replace(/[\/\\:*?"<>|]/g, "_"); // remove special chars
  const filePath = path.join(outputDir, `${safeName}.json`);

  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
  console.log(`✅ Saved ${items.length} items → ${safeName}.json`);
}

console.log("All category files created in ./categories folder");