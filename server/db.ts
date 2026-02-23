import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Shared pool — reused by both Drizzle and connect-pg-simple (sessions)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Without this handler, idle client errors crash the Node process (pg emits 'error' on EventEmitter)
pool.on("error", (err) => {
  console.error("Unexpected pool client error:", err.message);
});

export const db = drizzle(pool, { schema });
