import { Router, type Request } from "express";
import { z } from "zod";
import * as storage from "./storage";

// ─── User identification ───────────────────────────────────────────────────────
// Authenticated users: userId comes from express-session
// Guest users: userId derived from x-guest-id header, prefixed with "guest_"
export function getUserId(req: Request): string | null {
  if (req.session.userId) return req.session.userId;

  const guestId = req.headers["x-guest-id"];
  if (typeof guestId === "string" && guestId.trim()) {
    return `guest_${guestId.trim()}`;
  }
  return null;
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
