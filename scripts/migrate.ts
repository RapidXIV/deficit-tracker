/**
 * One-time migration: import historical daily logs from a CSV export.
 *
 * Usage:
 *   npx tsx scripts/migrate.ts                        # auto-finds drizzle-data*.csv in project root
 *   npx tsx scripts/migrate.ts path/to/file.csv       # explicit path
 */

import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

// ── Load .env before importing server modules (they read DATABASE_URL at init) ─
const envText = readFileSync(join(root, ".env"), "utf-8");
for (const line of envText.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = val;
}

// ── Dynamic imports (DATABASE_URL is now in process.env) ──────────────────────
const { pool, db } = await import("../server/db.ts");
const { recalculateDayNumbers } = await import("../server/storage.ts");
const { users, dailyLogs } = await import("../shared/schema.ts");

// ── Locate CSV ────────────────────────────────────────────────────────────────
const csvArg = process.argv[2];
let csvPath: string;

if (csvArg) {
  csvPath = resolve(csvArg);
} else {
  const matches = readdirSync(root).filter(
    (f) => f.startsWith("drizzle-data") && f.endsWith(".csv")
  );
  if (matches.length === 0) {
    throw new Error(
      "No drizzle-data*.csv found in project root. Place the file there or pass its path as an argument."
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple CSV files found: ${matches.join(", ")} — pass the path as an argument to disambiguate.`
    );
  }
  csvPath = join(root, matches[0]);
}

console.log(`CSV: ${csvPath}`);

// ── Parse CSV ─────────────────────────────────────────────────────────────────
const [headerLine, ...dataLines] = readFileSync(csvPath, "utf-8").trim().split("\n");
const header = headerLine.replace(/"/g, "").split(",").map((h) => h.trim());
const rows = dataLines.map((line) => {
  const values = line.replace(/"/g, "").split(",");
  return Object.fromEntries(header.map((h, i) => [h, (values[i] ?? "").trim()]));
});

console.log(`Rows in CSV: ${rows.length}`);

// ── Run ───────────────────────────────────────────────────────────────────────
try {
  // 1. Find user Ryan
  const [ryan] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, "Ryan"));

  if (!ryan) throw new Error('User "Ryan" not found in the database.');
  const userId = ryan.id;
  console.log(`User: Ryan (${userId})`);

  // 2. Fetch existing log dates to avoid duplicates
  const existing = await db
    .select({ date: dailyLogs.date })
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId));
  const existingDates = new Set(existing.map((l) => l.date));
  console.log(`Existing log entries: ${existingDates.size}`);

  // 3. Insert new rows
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    if (existingDates.has(row.date)) {
      console.log(`  Skip  ${row.date} (already exists)`);
      skipped++;
      continue;
    }
    await db.insert(dailyLogs).values({
      id: randomUUID(),
      userId,
      date: row.date,
      caloriesIn: parseInt(row.calories_in, 10),
      caloriesOut: parseInt(row.calories_out, 10),
      deficit: parseInt(row.deficit, 10),
      dayNumber: parseInt(row.day_number, 10),
      completed: true,
    });
    console.log(`  Import ${row.date} (day ${row.day_number})`);
    imported++;
  }

  // 4. Recalculate day numbers to ensure sequential ordering
  console.log("Recalculating day numbers...");
  await recalculateDayNumbers(userId);

  console.log(`\nDone. Imported: ${imported}  Skipped: ${skipped}`);
} finally {
  await pool.end();
}
