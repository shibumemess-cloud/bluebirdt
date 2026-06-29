import fs from "fs";
import path from "path";

const shellPath = path.join("dist", "client", "_shell.html");
const indexPath = path.join("dist", "client", "index.html");
const fallbackPath = path.join("dist", "client", "404.html");

if (fs.existsSync(shellPath)) {
  fs.copyFileSync(shellPath, indexPath);
  fs.copyFileSync(shellPath, fallbackPath);
  console.log("Successfully copied _shell.html to index.html and 404.html");
} else {
  console.error("Error: dist/client/_shell.html not found!");
  process.exit(1);
}
