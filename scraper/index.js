const puppeteer = require("puppeteer");

const url = "https://www.parliament.mn/nn/76004/";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitForSelector(".entry");

  const article = await page.evaluate(() => {
    const title = document.querySelector(".entry h1")?.innerText.trim() || null;
    const date = document.querySelector(".entry-meta span")?.innerText.trim() || null;
    const category = document.querySelector(".entry-meta a.category")?.innerText.trim() || null;
    const content = Array.from(document.querySelectorAll(".entry-content p"))
      .map(p => p.innerText.trim())
      .join("\n\n");

    return { title, date, category, content };
  });

  console.log(article);

  await browser.close();
})();