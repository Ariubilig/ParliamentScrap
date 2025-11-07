const puppeteer = require("puppeteer");
const fs = require("fs");

const results = [];
const maxArticles = 1000;


(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // STEP 1: Find the latest post ID automatically
  console.log("🔍 Finding the latest post ID...");
  await page.goto("https://www.parliament.mn/nn/", { waitUntil: "domcontentloaded" });

  const latestId = await page.evaluate(() => {
    const link = Array.from(document.querySelectorAll("a[href*='/nn/']"))
      .map(a => a.href)
      .filter(href => href.match(/\/nn\/\d+\//))
      .map(href => parseInt(href.match(/\/nn\/(\d+)\//)[1]))
      .sort((a, b) => b - a)[0];
    return link || null;
  });

  if (!latestId) {
    console.log("❌ Could not find latest post ID!");
    await browser.close();
    return;
  }

  console.log(`🆕 Latest ID detected: ${latestId}`);

  // STEP 2: Go backwards
  for (let id = latestId; id > latestId - maxArticles; id--) {
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

function cleanText(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .replace(/^\s+|\s+$/g, "")
    .replace(/([.,!?])([A-Za-zА-Яа-я])/g, "$1 $2")
    .replace(/(\d)\s+(\d)/g, "$1$2")
    .replace(/-{2,}/g, "-")
    .trim();
}