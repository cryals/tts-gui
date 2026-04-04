import { access, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const plistDir = path.join(projectRoot, "node_modules", "plist");
const entryFile = path.join(plistDir, "index.js");
const distFile = path.join(plistDir, "dist", "plist.js");

async function ensurePlistEntryPoint() {
  try {
    await access(entryFile);
    return;
  } catch {
    // Fall through and create a compatibility shim.
  }

  try {
    await access(distFile);
  } catch {
    return;
  }

  await writeFile(
    entryFile,
    "\"use strict\";\nmodule.exports = require(\"./dist/plist.js\");\n",
    "utf8",
  );
}

await ensurePlistEntryPoint();
