import {
  pgTable,
  text,
  varchar,
  integer,
  serial,
  real,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── users ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(), // bcrypt hash
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── sessions ─────────────────────────────────────────────────────────────────
// connect-pg-simple expects this table to exist
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// ─── user_settings ────────────────────────────────────────────────────────────
// activityLevel removed — TDEE always uses 1.2 (sedentary) multiplier
export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  goalWeight: real("goal_weight").notNull(),   // lbs
  startWeight: real("start_weight").notNull(), // lbs
  age: integer("age").notNull(),
  sex: text("sex").notNull(),                  // 'male' | 'female'
  heightFt: integer("height_ft").notNull(),
  heightIn: integer("height_in").notNull(),
});

// ─── daily_logs ───────────────────────────────────────────────────────────────
// weight column removed — estimated weight is derived from cumulative deficit
export const dailyLogs = pgTable("daily_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),               // 'YYYY-MM-DD'
  caloriesIn: integer("calories_in").notNull().default(0),
  caloriesOut: integer("calories_out").notNull().default(0),
  deficit: integer("deficit").notNull().default(0),
  dayNumber: integer("day_number").notNull(),
  completed: boolean("completed").notNull().default(false),
});

// ─── lifting_logs ─────────────────────────────────────────────────────────────
// One row per Add press — individual exercise entries
export const liftingLogs = pgTable("lifting_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),              // 'YYYY-MM-DD' — server's today at log time
  exerciseName: text("exercise_name").notNull(),
  weight: real("weight").notNull().default(0),
  sets: integer("sets").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  totalWork: real("total_work").notNull().default(0), // Joules
  loggedAt: timestamp("logged_at").defaultNow(),
});

// ─── lifting_template ─────────────────────────────────────────────────────────
// One row per user — persists the exercise list with last-used numbers
export const liftingTemplate = pgTable("lifting_template", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  exercises: jsonb("exercises").notNull().default([]), // LiftingExercise[]
});

// ─── Zod schemas (for API input validation) ────────────────────────────────────
export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});
export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({
  id: true,
});

export const liftingExerciseSchema = z.object({
  name: z.string(),
  weight: z.number().min(0), // lbs
  sets: z.number().int().min(0),
  reps: z.number().int().min(0),
});
export type LiftingExercise = z.infer<typeof liftingExerciseSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type LiftingEntry = typeof liftingLogs.$inferSelect;
