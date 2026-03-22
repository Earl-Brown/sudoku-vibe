const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "out");
const noJekyllPath = path.join(outDir, ".nojekyll");

if (!fs.existsSync(outDir)) {
  console.error("Missing out/ directory. Run the static export first.");
  process.exit(1);
}

fs.writeFileSync(noJekyllPath, "");
console.log(`Wrote ${path.relative(root, noJekyllPath)}`);
