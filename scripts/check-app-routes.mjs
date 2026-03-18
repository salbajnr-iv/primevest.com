#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const appRoot = join(root, "app");
const scanRoots = [join(root, "app"), join(root, "components")];

function walk(dir) {
  if (!existsSync(dir)) return [];

  const files = [];
  for (const entry of readdirSync(dir)) {
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

function toRouteSegments(file) {
  const rel = relative(appRoot, file);
  const parts = rel.split(sep);
  parts.pop(); // page.tsx

  return parts.filter((segment) => {
    if (!segment) return false;
    if (segment.startsWith("(") && segment.endsWith(")")) return false; // route groups
    if (segment.startsWith("@")) return false; // parallel routes
    if (segment.startsWith("_")) return false; // private folders
    return true;
  });
}

function buildMatcher(segments) {
  const patternSegments = segments.map((segment) => {
    if (/^\[\.\.\..+\]$/.test(segment)) return ".+"; // [...slug]
    if (/^\[\[\.\.\..+\]\]$/.test(segment)) return "(?:.+)?"; // [[...slug]]
    if (/^\[.+\]$/.test(segment)) return "[^/]+"; // [id]
    return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  });

  return new RegExp(`^/${patternSegments.join("/")}$`);
}

function normalizeHref(href) {
  const [noHash] = href.split("#");
  const [pathname] = noHash.split("?");

  if (!pathname) return "/";
  if (pathname !== "/" && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

const routes = [];
for (const file of walk(appRoot)) {
  if (!file.endsWith(`${sep}page.tsx`)) continue;
  const segments = toRouteSegments(file);
  const route = segments.length ? `/${segments.join("/")}` : "/";

  routes.push({ route, matcher: buildMatcher(segments) });
}

const hrefRegex = /href\s*=\s*["'`]([^"'`]+)["'`]/g;
const invalidLinks = [];

for (const scanRoot of scanRoots) {
  for (const file of walk(scanRoot)) {
    if (!file.endsWith(".tsx")) continue;

    const source = readFileSync(file, "utf8");
    let match;

    while ((match = hrefRegex.exec(source))) {
      const href = match[1].trim();
      if (!href.startsWith("/")) continue;
      if (href.startsWith("//")) continue;
      if (href.startsWith("/api/")) continue;

      const normalized = normalizeHref(href);
      const isValid = routes.some(({ matcher }) => matcher.test(normalized));

      if (!isValid) {
        invalidLinks.push({ file: relative(root, file), href });
      }
    }
  }
}

if (invalidLinks.length > 0) {
  console.error("Invalid internal route links found:");
  for (const bad of invalidLinks) {
    console.error(`- ${bad.file}: ${bad.href}`);
  }
  process.exit(1);
}

console.log(`App route check passed. ${routes.length} routes verified.`);
