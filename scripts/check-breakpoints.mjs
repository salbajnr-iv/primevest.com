import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const cssPath = path.join(root, "app", "globals.css");
const tsPath = path.join(root, "lib", "config", "breakpoints.ts");

const css = fs.readFileSync(cssPath, "utf8");
const ts = fs.readFileSync(tsPath, "utf8");

const keys = ["sm", "md", "lg", "xl", "xxl"];

function extractCssBreakpoints(source) {
  const result = {};
  for (const key of keys) {
    const match = source.match(new RegExp(`--bp-${key}\\s*:\\s*(\\d+)px\\s*;`));
    if (!match) {
      throw new Error(`Missing CSS breakpoint custom property: --bp-${key}`);
    }
    result[key] = Number(match[1]);
  }
  return result;
}

function extractTsBreakpoints(source) {
  const blockMatch = source.match(/export const BREAKPOINTS = \{([\s\S]*?)\} as const;/);
  if (!blockMatch) {
    throw new Error("Missing BREAKPOINTS object in lib/config/breakpoints.ts");
  }

  const result = {};
  const block = blockMatch[1];

  for (const key of keys) {
    const match = block.match(new RegExp(`${key}\\s*:\\s*(\\d+)`));
    if (!match) {
      throw new Error(`Missing TS breakpoint value for key: ${key}`);
    }
    result[key] = Number(match[1]);
  }

  return result;
}

const cssBreakpoints = extractCssBreakpoints(css);
const tsBreakpoints = extractTsBreakpoints(ts);

const mismatches = keys.filter((key) => cssBreakpoints[key] !== tsBreakpoints[key]);

if (mismatches.length > 0) {
  console.error("Breakpoint mismatch detected between CSS and TS config:");
  for (const key of mismatches) {
    console.error(`  ${key}: css=${cssBreakpoints[key]} ts=${tsBreakpoints[key]}`);
  }
  process.exit(1);
}

console.log("Breakpoints are in sync:", tsBreakpoints);
