import type { DailyLog, UserSettings } from "@shared/schema";

export const CALORIES_PER_POUND = 3500;

// TDEE multiplier is always 1.2 (sedentary/low) — activity level removed
const ACTIVITY_MULTIPLIER = 1.2;

export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

// Mifflin-St Jeor BMR
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: "male" | "female"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

// TDEE always uses 1.2 (sedentary) multiplier
export function calculateTDEE(
  weightLbs: number,
  heightFt: number,
  heightIn: number,
  age: number,
  sex: "male" | "female"
): number {
  const weightKg = lbsToKg(weightLbs);
  const heightCm = feetInchesToCm(heightFt, heightIn);
  const bmr = calculateBMR(weightKg, heightCm, age, sex);
  return bmr * ACTIVITY_MULTIPLIER;
}

export function calculateTotalDeficitGoal(
  startWeight: number,
  goalWeight: number
): number {
  return CALORIES_PER_POUND * (startWeight - goalWeight);
}

export function calculateEstimatedWeight(
  startWeight: number,
  cumulativeDeficit: number
): number {
  return startWeight - cumulativeDeficit / CALORIES_PER_POUND;
}

export function calculateDeficitStreak(logs: DailyLog[]): number {
  const sorted = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  for (const log of sorted) {
    if (log.deficit > 0) streak++;
    else break;
  }
  return streak;
}

export interface DeficitStats {
  totalDeficitGoal: number;
  totalDeficitAchieved: number;
  deficitStreak: number;
  progressPercent: number;
  avgDailyDeficit: number;
  deficitRemaining: number;
  daysRemaining: number | null;
  estimatedCompletionDate: Date | null;
  latestEstimatedWeight: number;
}

const DEFAULT_STATS: DeficitStats = {
  totalDeficitGoal: 0,
  totalDeficitAchieved: 0,
  deficitStreak: 0,
  progressPercent: 0,
  avgDailyDeficit: 0,
  deficitRemaining: 0,
  daysRemaining: null,
  estimatedCompletionDate: null,
  latestEstimatedWeight: 0,
};

export function computeDeficitStats(
  settings: UserSettings | null,
  logs: DailyLog[]
): DeficitStats {
  if (!settings) return DEFAULT_STATS;

  const totalDeficitGoal = calculateTotalDeficitGoal(
    settings.startWeight,
    settings.goalWeight
  );
  const totalDeficitAchieved = logs.reduce((sum, log) => sum + log.deficit, 0);
  const latestEstimatedWeight = calculateEstimatedWeight(
    settings.startWeight,
    totalDeficitAchieved
  );

  const weightToLose = settings.startWeight - settings.goalWeight;
  const weightLost = settings.startWeight - latestEstimatedWeight;
  const progressPercent =
    weightToLose > 0 ? Math.min(100, Math.round((weightLost / weightToLose) * 100)) : 0;

  const avgDailyDeficit =
    logs.length > 0 ? totalDeficitAchieved / logs.length : 0;
  const deficitRemaining = Math.max(0, totalDeficitGoal - totalDeficitAchieved);
  const daysRemaining =
    avgDailyDeficit > 0 ? Math.ceil(deficitRemaining / avgDailyDeficit) : null;
  const estimatedCompletionDate = daysRemaining
    ? new Date(Date.now() + daysRemaining * 86_400_000)
    : null;

  return {
    totalDeficitGoal,
    totalDeficitAchieved,
    deficitStreak: calculateDeficitStreak(logs),
    progressPercent,
    avgDailyDeficit,
    deficitRemaining,
    daysRemaining,
    estimatedCompletionDate,
    latestEstimatedWeight,
  };
}

export interface LogWithEstimatedWeight extends DailyLog {
  estWeight: number;
}

export function computeLogsWithEstimatedWeights(
  logs: DailyLog[],
  startWeight: number
): LogWithEstimatedWeight[] {
  const sorted = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let cumulativeDeficit = 0;
  const result: LogWithEstimatedWeight[] = [];

  for (const log of sorted) {
    cumulativeDeficit += log.deficit;
    const estWeight = calculateEstimatedWeight(startWeight, cumulativeDeficit);
    result.push({ ...log, estWeight });
  }

  return result.reverse();
}
