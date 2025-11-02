const { exec } = require("child_process");
const path = require("path");
const util = require("util");
const execPromise = util.promisify(exec);


async function runStep(stepName, scriptPath, description) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔄 STEP ${stepName}: ${description}`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    const { stdout, stderr } = await execPromise(`node "${scriptPath}"`, {
      cwd: path.dirname(scriptPath),
      encoding: "utf8",
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    console.log(`\n✅ Step ${stepName} completed successfully!\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ Error in Step ${stepName}:`);
    console.error(error.message);
    if (error.stdout) console.error(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

async function main() {

  console.log("\n" + "=".repeat(60));
  console.log("PARLIAMENT SCRAPER - RUNNER");
  console.log("=".repeat(60));

  const steps = [
    {
      name: "1/3",
      script: path.join(__dirname, "index.js"),
      description: "Scraping articles from parliament.mn",
    },
    {
      name: "2/3",
      script: path.join(__dirname, "spliter", "spliter.js"),
      description: "Splitting long articles (>7000 chars)",
    },
    {
      name: "3/3",
      script: path.join(__dirname, "filter", "filterByCategory.js"),
      description: "Grouping articles by category",
    },
  ];

  for (const step of steps) {
    const success = await runStep(step.name, step.script, step.description);

    if (!success) {
      console.error(`\n❌ Pipeline stopped at Step ${step.name}`);
      console.error("Fix the error and try again.\n");
      process.exit(1);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ ALL STEPS COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(60));
  console.log("\n📁 Output files:");
  console.log("   • parliament.json (scraped articles)");
  console.log("   • parliament_split.json (split articles)");
  console.log("   • filter/categories/*.json (category files)");
  console.log("");

}


main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});

