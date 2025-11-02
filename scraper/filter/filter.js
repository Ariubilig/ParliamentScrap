const fs = require("fs");

const data = JSON.parse(fs.readFileSync("parliament.json", "utf8")); // read data

// 2️⃣ Example filter: only "Хуралдааны тов /7 хоногоор/"
const filtered = data.filter(item => item.category.includes("Хуралдааны ирц"));

fs.writeFileSync("filtered.json", JSON.stringify(filtered, null, 2)); // 3️⃣ Save result


console.log(`✅ Filtered ${filtered.length} items saved to filtered.json`);