#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const dashboardRoot = join(root, "app", "dashboard");
const scanRoots = [join(root, "app", "dashboard"), join(root, "components")];

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }

  return files;
}

const dashboardPaths = new Set();
for (const file of walk(dashboardRoot)) {
  if (!file.endsWith("/page.tsx")) continue;

  const route = relative(dashboardRoot, file)
    .replace(/\\/g, "/")
    .replace(/(?:^|\/)page\.tsx$/, "")
    .replace(/\/$/, "");

  dashboardPaths.add(route ? `/dashboard/${route}` : "/dashboard");
}

const hrefRegex = /href\s*=\s*["'`]([^"'`]+)["'`]/g;
const invalidLinks = [];

for (const scanRoot of scanRoots) {
  for (const file of walk(scanRoot)) {
    if (!file.endsWith(".tsx")) continue;

    const source = readFileSync(file, "utf8");
    let match;

    while ((match = hrefRegex.exec(source))) {
      const href = match[1];
      if (!href.startsWith("/dashboard")) continue;

      if (!dashboardPaths.has(href)) {
        invalidLinks.push({ file: relative(root, file), href });
      }
    }
  }
}

if (invalidLinks.length > 0) {
  console.error("Invalid dashboard route links found:");
  for (const bad of invalidLinks) {
    console.error(`- ${bad.file}: ${bad.href}`);
  }
  process.exit(1);
}

console.log(`Dashboard route check passed. ${dashboardPaths.size} routes verified.`);
