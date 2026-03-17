#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const supportHubFile = join(root, "app", "support", "page.tsx");
const supportPagesRoot = join(root, "app", "support");
const supportApiRoot = join(root, "app", "api", "support");

const ROUTE_API_CONTRACT = {
  "/support/contact": ["/api/support/contact"],
  "/support/tickets": [
    "/api/support/tickets",
    "/api/support/tickets/[id]",
    "/api/support/tickets/[id]/reply",
  ],
  "/support/status": ["/api/support/status"],
  "/support/community": ["/api/support/community"],
  "/support/faqs": [],
};

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

function normalizePath(pathname) {
  const [withoutHash] = pathname.split("#");
  const [withoutQuery] = withoutHash.split("?");
  if (!withoutQuery) return "/";
  if (withoutQuery !== "/" && withoutQuery.endsWith("/")) return withoutQuery.slice(0, -1);
  return withoutQuery;
}

function pageFileToRoute(file, baseRoot, basePath) {
  const rel = relative(baseRoot, file);
  const parts = rel.split(sep);
  parts.pop();

  const cleanParts = parts.filter((segment) => segment && !(segment.startsWith("(") && segment.endsWith(")")) && !segment.startsWith("@") && !segment.startsWith("_"));
  return cleanParts.length ? `${basePath}/${cleanParts.join("/")}` : basePath;
}

const implementedPages = new Set(
  walk(supportPagesRoot)
    .filter((file) => file.endsWith(`${sep}page.tsx`))
    .map((file) => pageFileToRoute(file, supportPagesRoot, "/support"))
);

const implementedApis = new Set(
  walk(supportApiRoot)
    .filter((file) => file.endsWith(`${sep}route.ts`))
    .map((file) => {
      const rel = relative(supportApiRoot, file).replace(/\\/g, "/");
      return `/api/support/${rel.replace(/\/route\.ts$/, "")}`;
    })
);

const source = readFileSync(supportHubFile, "utf8");
const hubLinks = new Set();
const hrefPatterns = [/href\s*:\s*["'`]([^"'`]+)["'`]/g, /href\s*=\s*["'`]([^"'`]+)["'`]/g];

for (const pattern of hrefPatterns) {
  let match;
  while ((match = pattern.exec(source))) {
    const href = normalizePath(match[1].trim());
    if (href.startsWith("/support")) hubLinks.add(href);
  }
}

const errors = [];

for (const hubLink of hubLinks) {
  if (!implementedPages.has(hubLink)) {
    errors.push(`Hub link points to missing page route: ${hubLink}`);
  }
}

for (const [route, apis] of Object.entries(ROUTE_API_CONTRACT)) {
  if (!implementedPages.has(route)) {
    errors.push(`Contract route is missing a page implementation: ${route}`);
  }

  for (const apiRoute of apis) {
    if (!implementedApis.has(apiRoute)) {
      errors.push(`Contract route ${route} references missing API route: ${apiRoute}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Support route contract failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Support route contract passed.");
console.log(`- Hub links checked: ${hubLinks.size}`);
console.log(`- Support pages discovered: ${implementedPages.size}`);
console.log(`- Support APIs discovered: ${implementedApis.size}`);
