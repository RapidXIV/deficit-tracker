import { eq, and, asc, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "./db";
import {
  userSettings,
  dailyLogs,
  liftingLogs,
  liftingTemplate,
  type UserSettings,
  type DailyLog,
  type LiftingEntry,
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

// ─── Lifting Entries ──────────────────────────────────────────────────────────

export async function getLiftingEntries(userId: string): Promise<LiftingEntry[]> {
  return db
    .select()
    .from(liftingLogs)
    .where(eq(liftingLogs.userId, userId))
    .orderBy(desc(liftingLogs.date), desc(liftingLogs.loggedAt));
}

export async function addLiftingEntry(
  userId: string,
  data: { exerciseName: string; weight: number; sets: number; reps: number }
): Promise<LiftingEntry> {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const totalWork = (data.weight / 2.205) * 9.81 * 0.5 * data.sets * data.reps;
  const [created] = await db
    .insert(liftingLogs)
    .values({ userId, date, ...data, totalWork })
    .returning();
  return created;
}

// ─── Lifting Template ─────────────────────────────────────────────────────────

export async function getLiftingTemplate(userId: string): Promise<LiftingExercise[]> {
  const [row] = await db
    .select()
    .from(liftingTemplate)
    .where(eq(liftingTemplate.userId, userId));
  return (row?.exercises as LiftingExercise[]) ?? [];
}

export async function upsertLiftingTemplate(
  userId: string,
  exercises: LiftingExercise[]
): Promise<void> {
  const [existing] = await db
    .select()
    .from(liftingTemplate)
    .where(eq(liftingTemplate.userId, userId));

  if (existing) {
    await db
      .update(liftingTemplate)
      .set({ exercises })
      .where(eq(liftingTemplate.userId, userId));
  } else {
    await db.insert(liftingTemplate).values({ userId, exercises });
  }
}
