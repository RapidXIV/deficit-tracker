import { Router, type Request } from "express";
import { z } from "zod";
import * as storage from "./storage";
import { liftingExerciseSchema } from "../shared/schema";

// ─── User identification ───────────────────────────────────────────────────────
export function getUserId(req: Request): string | null {
  return req.session.userId ?? null;
}

export const apiRouter = Router();

// ─── Settings ─────────────────────────────────────────────────────────────────

// GET /api/settings
apiRouter.get("/settings", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const settings = await storage.getSettings(userId);
    if (!settings) return res.status(404).json({ error: "No settings found" });
    res.json(settings);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/settings — create or update
apiRouter.post("/settings", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const schema = z.object({
    goalWeight: z.number().positive(),
    startWeight: z.number().positive(),
    age: z.number().int().positive(),
    sex: z.enum(["male", "female"]),
    heightFt: z.number().int().min(0),
    heightIn: z.number().int().min(0).max(11),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid data", details: parsed.error.flatten() });
  }

  try {
    const settings = await storage.upsertSettings(userId, parsed.data);
    res.json(settings);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/settings — partial update (e.g. just goalWeight)
apiRouter.patch("/settings", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const schema = z.object({
    goalWeight: z.number().positive(),
  }).partial().refine(obj => Object.keys(obj).length > 0, {
    message: "At least one field required",
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid data", details: parsed.error.flatten() });
  }

  try {
    const settings = await storage.patchSettings(userId, parsed.data);
    res.json(settings);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Logs ─────────────────────────────────────────────────────────────────────

// GET /api/logs — all logs for the current user
apiRouter.get("/logs", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const logs = await storage.getLogs(userId);
    res.json(logs);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/logs/:date — single day
apiRouter.get("/logs/:date", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const log = await storage.getLogByDate(userId, req.params.date);
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json(log);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/logs — create or update a daily log (autosave)
apiRouter.post("/logs", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const schema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    caloriesIn: z.number().int().min(0),
    caloriesOut: z.number().int().min(0),
    deficit: z.number().int(),
    dayNumber: z.number().int().min(1),
    completed: z.boolean(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid data", details: parsed.error.flatten() });
  }

  try {
    const log = await storage.upsertLog(userId, parsed.data);
    res.json(log);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/logs/:date — delete a single day's log
apiRouter.delete("/logs/:date", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await storage.deleteLog(userId, req.params.date);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/logs — clear ALL logs (reset goal)
apiRouter.delete("/logs", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    await storage.deleteAllLogs(userId);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Lifting ───────────────────────────────────────────────────────────────────

const liftingBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exercises: z.array(liftingExerciseSchema),
  complete: z.boolean(),
});

// GET /api/lifting — all complete lifting logs
apiRouter.get("/lifting", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const logs = await storage.getLiftingLogs(userId);
    res.json(logs);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/lifting/today — today's lifting log (must be before /:date)
apiRouter.get("/lifting/today", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  try {
    const log = await storage.getLiftingLogByDate(userId, date);
    if (!log) return res.status(404).json({ error: "No lifting log for today" });
    res.json(log);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/lifting/:date — lifting log for a specific date
apiRouter.get("/lifting/:date", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const log = await storage.getLiftingLogByDate(userId, req.params.date);
    if (!log) return res.status(404).json({ error: "Lifting log not found" });
    res.json(log);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/lifting — save/update lifting log (totalWork calculated server-side)
apiRouter.post("/lifting", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const parsed = liftingBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
  }

  try {
    const log = await storage.upsertLiftingLog(userId, parsed.data);
    res.json(log);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});
