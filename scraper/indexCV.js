const fs = require("fs");
const puppeteer = require("puppeteer");

const BASE_URL = "https://www.parliament.mn/cv/";
const START_ID = 0;
const END_ID = 400;

const results = [];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  for (let id = START_ID; id <= END_ID; id++) {
    const url = `${BASE_URL}${id}/`;
    console.log(`🔍 Checking ID: ${id}`);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      const hasDetails = await page.$(".cv-details");
      if (!hasDetails) continue;

      const appointmentText = await page.$eval(".appointment", el => el.textContent.trim());
      if (!appointmentText.includes("Монгол Улсын Их Хурлын")) continue;

      const data = await page.evaluate(() => {
        const cv = document.querySelector(".cv-details");
        if (!cv) return null;

        const getText = (sel) => cv.querySelector(sel)?.textContent.trim() || "";
        const lastname = getText(".lastname");
        const firstname = getText(".firstname");
        const appointment = getText(".appointment");

        const sections = {};
        document.querySelectorAll(".cv-details h3").forEach(h3 => {
          const title = h3.textContent.trim();
          const next = h3.nextElementSibling;
          sections[title] = next?.innerText?.trim() || "";
        });

        return { lastname, firstname, appointment, sections };
      });

      if (data) {
        results.push({ id, url, ...data });
        console.log(`✅ Got: ${data.lastname} ${data.firstname}`);
      }
    } catch (err) {
      console.log(`❌ Error on ID ${id}: ${err.message}`);
    }
  }

  await browser.close();

  fs.writeFileSync("parliament_cv.json", JSON.stringify(results, null, 2), "utf8");
  console.log(`\n✅ Done! Saved ${results.length} valid CVs to parliament_cv.json`);
})();