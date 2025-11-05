const { spawn } = require("child_process");
const path = require("path");


function runStep(stepName, scriptPath, description, opts = {}) {

  const cwd = opts.cwd || path.dirname(scriptPath);
  const nodeArgs = opts.nodeArgs || [];
  const args = [...nodeArgs, scriptPath];

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🔄 STEP ${stepName}: ${description}`);
  console.log(`📁 Script: ${scriptPath}`);
  console.log(`${"=".repeat(60)}\n`);

  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    // Stream stdout/stderr live to parent process
    child.stdout.on("data", (chunk) => process.stdout.write(String(chunk)));
    child.stderr.on("data", (chunk) => process.stderr.write(String(chunk)));

    child.on("error", (err) => {
      console.error(`\n❌ Failed to start step ${stepName}:`, err.message);
      resolve({ success: false, code: null, error: err });
    });

    child.on("close", (code, signal) => {
      if (signal) {
        console.error(`\n❌ Step ${stepName} terminated by signal: ${signal}`);
        resolve({ success: false, code: null, signal });
        return;
      }
      if (code === 0) {
        console.log(`\n✅ Step ${stepName} completed successfully!\n`);
        resolve({ success: true, code });
      } else {
        console.error(`\n❌ Step ${stepName} exited with code ${code}`);
        resolve({ success: false, code });
      }
    });
  });

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
    // sanity check: script file path resolution
    const scriptPath = step.script;
    const result = await runStep(step.name, scriptPath, step.description);

    if (!result.success) {
      console.error(`\n❌ Pipeline stopped at Step ${step.name}`);
      if (result.code !== null) console.error(`Exit code: ${result.code}`);
      if (result.error) console.error(`Error: ${result.error.message}`);
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

}

main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
