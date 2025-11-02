const fs = require("fs");
const data = JSON.parse(fs.readFileSync("../parliament.json", "utf8")); // Read scraped file


function splitText(text, maxLength = 7000) { // split long text into 7000-character each

    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
    }
    return chunks;

}

const output = [];

for (const article of data) {
  if (!article.content) continue;

  if (article.content.length > 7000) {
    const parts = splitText(article.content, 7000);
    parts.forEach((part, index) => {
      output.push({
        id: `${article.id}-${index + 1}`,
        title: article.title,
        date: article.date,
        category: article.category,
        part: index + 1,
        totalParts: parts.length,
        content: part,
      });
    });
  } else {
    output.push(article);
  }
}


fs.writeFileSync("parliament_split.json", JSON.stringify(output, null, 2), "utf8");
console.log(`✅ Done! Saved ${output.length} records to parliament_split.json`);