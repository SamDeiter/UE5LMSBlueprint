import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git") {
        walk(filePath);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      // List of text extensions to normalize
      const textExtensions = [
        ".js",
        ".jsx",
        ".json",
        ".css",
        ".html",
        ".md",
        ".txt",
        ".xml",
        ".svg",
      ];

      if (textExtensions.includes(ext)) {
        try {
          const content = fs.readFileSync(filePath, "utf8");
          // Check if it has CRLF
          if (content.indexOf("\r\n") !== -1) {
            const newContent = content.replace(/\r\n/g, "\n");
            fs.writeFileSync(filePath, newContent, "utf8");
            console.log(`Normalized: ${filePath}`);
          }
        } catch (err) {
          console.error(`Error processing ${filePath}: ${err.message}`);
        }
      }
    }
  });
}

console.log("Starting Line Ending Normalization (CRLF -> LF)...");
walk(path.join(rootDir, "src"));
console.log("Normalization Complete.");
