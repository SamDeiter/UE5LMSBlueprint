/**
 * build.js - Build script for UE5 LMS Blueprint Editor
 * Creates a clean dist folder for deployment
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");

// Files and directories to copy
const COPY_ITEMS = [
  "index.html",
  "robots.txt",
  "src",
  "assets",
  "config",
  "review-sdk",
];

// Clean dist folder
function cleanDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR);
  console.log("✓ Cleaned dist folder");
}

// Copy file or directory recursively
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const items = fs.readdirSync(src);
    items.forEach((item) => {
      // Skip test files and development-only items
      if (
        item === "tests" ||
        item === "node_modules" ||
        item === "coverage" ||
        item === "dist" ||
        item === ".git" ||
        item.endsWith(".test.js") ||
        item.endsWith(".spec.js") ||
        item.startsWith(".")
      ) {
        return;
      }
      copyRecursive(path.join(src, item), path.join(dest, item));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Main build
function build() {
  console.log("🔨 Building for production...\n");

  cleanDist();

  COPY_ITEMS.forEach((item) => {
    const src = path.resolve(ROOT_DIR, item);
    const dest = path.resolve(DIST_DIR, item);

    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
      console.log(`✓ Copied ${item}`);
    } else {
      console.log(`⚠ Skipped ${item} (not found)`);
    }
  });

  console.log("\n✅ Build complete! Output in dist/");
  console.log('📦 Run "npm run deploy" to publish to GitHub Pages');
}

build();
