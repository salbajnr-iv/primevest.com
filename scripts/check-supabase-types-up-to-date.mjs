import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationsDir = path.join(root, "supabase", "migrations");
const typesFile = path.join(root, "types", "supabase.ts");

const migrationFiles = (await fs.readdir(migrationsDir)).filter((name) => /^\d+.*\.sql$/i.test(name));
if (!migrationFiles.length) {
  console.log("No migrations detected; skipping Supabase type freshness check.");
  process.exit(0);
}

const latestMigration = migrationFiles
  .map((name) => name.match(/^(\d+)/)?.[1] ?? "")
  .filter(Boolean)
  .sort()
  .at(-1);

if (!latestMigration) {
  throw new Error("Could not resolve latest migration version.");
}

const typesSource = await fs.readFile(typesFile, "utf8");
const schemaVersionMatch = typesSource.match(/schema-version:\s*(\d+)/i);

if (!schemaVersionMatch) {
  console.error("Missing schema-version comment in types/supabase.ts");
  process.exit(1);
}

const schemaVersion = schemaVersionMatch[1];

if (schemaVersion < latestMigration) {
  console.error(
    [
      "Supabase types are out of date.",
      `Latest migration version: ${latestMigration}`,
      `types/supabase.ts schema-version: ${schemaVersion}`,
      "Regenerate types and update types/supabase.ts.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(
  `Supabase types are up to date (schema-version ${schemaVersion}, latest migration ${latestMigration}).`,
);
