import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to the project root
const sourcePath = path.join(__dirname, "..", "..", "..", "source");
const targetPath = path.join(
  __dirname,
  "..",
  "public",
  "assets",
  "vendor",
  "zetajs"
);

// Files to copy
const files = ["zeta.js", "zetaHelper.js"];

// Ensure target directory exists
if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath, { recursive: true });
}

// Copy files
files.forEach((file) => {
  const src = path.join(sourcePath, file);
  const dest = path.join(targetPath, file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to public/assets/vendor/zetajs/`);
  } else {
    console.warn(`Warning: Source file ${file} not found at ${src}`);
  }
});

console.log("ZetaJS files copy complete!");
