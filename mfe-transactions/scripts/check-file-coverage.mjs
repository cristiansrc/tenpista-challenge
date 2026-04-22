import fs from "node:fs";
import path from "node:path";

const COVERAGE_FILE = path.resolve("coverage", "coverage-summary.json");
const MIN_LINES_COVERAGE = 80;

if (!fs.existsSync(COVERAGE_FILE)) {
  console.error(`Coverage summary not found at ${COVERAGE_FILE}`);
  process.exit(1);
}

const raw = fs.readFileSync(COVERAGE_FILE, "utf-8");
const summary = JSON.parse(raw);

const failing = [];

for (const [filePath, metrics] of Object.entries(summary)) {
  if (filePath === "total") {
    continue;
  }

  const linesPct = metrics?.lines?.pct;
  if (typeof linesPct !== "number") {
    continue;
  }

  if (linesPct < MIN_LINES_COVERAGE) {
    failing.push({
      filePath: filePath.replaceAll("\\", "/"),
      linesPct,
    });
  }
}

if (failing.length > 0) {
  console.error(`\nPer-file coverage check failed (minimum lines: ${MIN_LINES_COVERAGE}%).`);
  for (const file of failing.sort((a, b) => a.linesPct - b.linesPct)) {
    console.error(`- ${file.filePath}: ${file.linesPct}%`);
  }
  process.exit(1);
}

console.log(`\nPer-file coverage check passed: all files are >= ${MIN_LINES_COVERAGE}% lines.`);
