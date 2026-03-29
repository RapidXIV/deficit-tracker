/**
 * Export all data from Neon DB to deficit-export.json
 * Usage: npx tsx scripts/export.ts
 */

import { writeFileSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "..");

// Load .env before importing server modules
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

const { pool, db } = await import("../server/db.ts");
const { users, userSettings, dailyLogs, liftingLogs, liftingTemplate } =
  await import("../shared/schema.ts");

// Find user Ryan
const [ryan] = await db
  .select({ id: users.id, username: users.username })
  .from(users)
  .where(eq(users.username, "Ryan"));

if (!ryan) throw new Error('User "Ryan" not found.');
console.log(`Found user: ${ryan.username} (${ryan.id})`);

// Export all tables
const settings = await db
  .select()
  .from(userSettings)
  .where(eq(userSettings.userId, ryan.id));

const logs = await db
  .select()
  .from(dailyLogs)
  .where(eq(dailyLogs.userId, ryan.id))
  .orderBy(dailyLogs.date);

const lifting = await db
  .select()
  .from(liftingLogs)
  .where(eq(liftingLogs.userId, ryan.id))
  .orderBy(liftingLogs.date);

const template = await db
  .select()
  .from(liftingTemplate)
  .where(eq(liftingTemplate.userId, ryan.id));

const output = {
  exportedAt: new Date().toISOString(),
  settings: settings[0] ?? null,
  logs,
  liftingEntries: lifting,
  liftingTemplate: template[0]?.exercises ?? [],
};

const outPath = join(root, "deficit-export.json");
writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`\nExport complete → ${outPath}`);
console.log(`  settings: ${settings.length ? "found" : "none"}`);
console.log(`  daily logs: ${logs.length}`);
console.log(`  lifting entries: ${lifting.length}`);
console.log(`  lifting template exercises: ${Array.isArray(output.liftingTemplate) ? output.liftingTemplate.length : 0}`);

await pool.end();
