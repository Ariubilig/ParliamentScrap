const puppeteer = require("puppeteer");
const fs = require("fs");

const startId = 76005;   // latest ID
const maxArticles = 50;  // how many to collect
const results = [];

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (let id = startId; id > startId - maxArticles; id--) {
    const url = `https://www.parliament.mn/nn/${id}/`;
    console.log("Fetching:", url);

    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      if (response.status() !== 200) {
        console.log("❌ Not found:", id);
        continue;
      }

      const article = await page.evaluate(() => {
        const title = document.querySelector(".entry h1")?.innerText.trim() || null;
        const date = document.querySelector(".entry-meta span")?.innerText.trim() || null;
        const category = document.querySelector(".entry-meta a.category")?.innerText.trim() || null;
        const content = Array.from(document.querySelectorAll(".entry-content p, table"))
          .map(el => el.innerText.trim())
          .join("\n\n");
        return { title, date, category, content };
      });

      if (article.title) {
        // 🧹 CLEANING STEP
        article.content = cleanText(article.content);

        console.log(`✅ Scraped & cleaned: ${article.title}`);
        results.push({ id, url, ...article });
      } else {
        console.log("⚠️ Missing title, skipping:", id);
      }

    } catch (err) {
      console.log("Error with ID", id, err.message);
    }
  }

  await browser.close();
  fs.writeFileSync("parliament.json", JSON.stringify(results, null, 2), "utf8");
  console.log(`\n✅ Done! Saved ${results.length} cleaned posts to parliament.json`);
})();

// 🧽 TEXT CLEANER FUNCTION
function cleanText(text) {
  return text
    .replace(/\s+/g, " ")             // collapse all whitespace
    .replace(/\n{2,}/g, "\n")         // collapse many newlines
    .replace(/^\s+|\s+$/g, "")        // trim start/end
    .replace(/([.,!?])([A-Za-zА-Яа-я])/g, "$1 $2") // ensure space after punctuation
    .replace(/(\d)\s+(\d)/g, "$1$2")  // fix spaces in numbers
    .replace(/-{2,}/g, "-")           // clean long dashes
    .trim();
}