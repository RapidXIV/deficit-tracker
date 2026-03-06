import { eq, and, asc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "./db";
import {
  userSettings,
  dailyLogs,
  liftingLogs,
  type UserSettings,
  type DailyLog,
  type LiftingLog,
  type LiftingExercise,
} from "../shared/schema";

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(userId: string): Promise<UserSettings | null> {
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));
  return settings ?? null;
}

export async function patchSettings(
  userId: string,
  data: Partial<Omit<UserSettings, "id" | "userId">>
): Promise<UserSettings> {
  const [updated] = await db
    .update(userSettings)
    .set(data)
    .where(eq(userSettings.userId, userId))
    .returning();
  return updated;
}

export async function upsertSettings(
  userId: string,
  data: Omit<UserSettings, "id" | "userId">
): Promise<UserSettings> {
  const existing = await getSettings(userId);

  if (existing) {
    const [updated] = await db
      .update(userSettings)
      .set(data)
      .where(eq(userSettings.userId, userId))
      .returning();
    return updated;
  } else {
    const [created] = await db
      .insert(userSettings)
      .values({ id: randomUUID(), userId, ...data })
      .returning();
    return created;
  }
}

// ─── Daily Logs ───────────────────────────────────────────────────────────────

export async function getLogs(userId: string): Promise<DailyLog[]> {
  return db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId));
}

export async function getLogByDate(
  userId: string,
  date: string
): Promise<DailyLog | null> {
  const [log] = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)));
  return log ?? null;
}

export async function recalculateDayNumbers(userId: string): Promise<void> {
  const logs = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.userId, userId))
    .orderBy(asc(dailyLogs.date));

  for (let i = 0; i < logs.length; i++) {
    await db
      .update(dailyLogs)
      .set({ dayNumber: i + 1 })
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, logs[i].date)));
  }
}

export async function upsertLog(
  userId: string,
  data: Omit<DailyLog, "id" | "userId">
): Promise<DailyLog> {
  const existing = await getLogByDate(userId, data.date);

  if (existing) {
    const [updated] = await db
      .update(dailyLogs)
      .set(data)
      .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, data.date)))
      .returning();
    return updated;
  } else {
    const allLogs = await getLogs(userId);
    const dayNumber = allLogs.length + 1;

    const [created] = await db
      .insert(dailyLogs)
      .values({ id: randomUUID(), userId, ...data, dayNumber })
      .returning();

    await recalculateDayNumbers(userId);
    return created;
  }
}

export async function deleteLog(userId: string, date: string): Promise<void> {
  await db
    .delete(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.date, date)));
  await recalculateDayNumbers(userId);
}

export async function deleteAllLogs(userId: string): Promise<void> {
  await db.delete(dailyLogs).where(eq(dailyLogs.userId, userId));
  await recalculateDayNumbers(userId);
}

// ─── Lifting Logs ──────────────────────────────────────────────────────────────

function calcTotalWork(exercises: LiftingExercise[]): number {
  // (weight_lbs / 2.205) × 9.81 × 0.5m × sets × reps
  return exercises.reduce((sum, ex) => {
    return sum + (ex.weight / 2.205) * 9.81 * 0.5 * ex.sets * ex.reps;
  }, 0);
}

export async function getLiftingLogs(userId: string): Promise<LiftingLog[]> {
  const rows = await db
    .select()
    .from(liftingLogs)
    .where(and(eq(liftingLogs.userId, userId), eq(liftingLogs.complete, true)));
  return rows as LiftingLog[];
}

export async function getLiftingLogByDate(
  userId: string,
  date: string
): Promise<LiftingLog | null> {
  const [row] = await db
    .select()
    .from(liftingLogs)
    .where(and(eq(liftingLogs.userId, userId), eq(liftingLogs.date, date)));
  return (row as LiftingLog) ?? null;
}

export async function upsertLiftingLog(
  userId: string,
  data: { date: string; exercises: LiftingExercise[]; complete: boolean }
): Promise<LiftingLog> {
  const totalWork = calcTotalWork(data.exercises);
  const existing = await getLiftingLogByDate(userId, data.date);

  if (existing) {
    const [updated] = await db
      .update(liftingLogs)
      .set({ exercises: data.exercises, totalWork, complete: data.complete })
      .where(and(eq(liftingLogs.userId, userId), eq(liftingLogs.date, data.date)))
      .returning();
    return updated as LiftingLog;
  } else {
    const [created] = await db
      .insert(liftingLogs)
      .values({ userId, date: data.date, exercises: data.exercises, totalWork, complete: data.complete })
      .returning();
    return created as LiftingLog;
  }
}
