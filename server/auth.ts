import { Router, type Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "./db";
import { users } from "../shared/schema";

// Teach TypeScript that sessions have a userId field
declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const PgSession = connectPgSimple(session);

export function setupAuth(app: Express): void {
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: false,
      }),
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );
}

export const authRouter = Router();

// POST /api/auth/signup
authRouter.post("/signup", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username.trim()));

    if (existing.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const hash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({ username: username.trim(), password: hash })
      .returning({ id: users.id, username: users.username });

    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.trim()));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/logout
authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

// GET /api/auth/me
authRouter.get("/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const [user] = await db
      .select({ id: users.id, username: users.username })
      .from(users)
      .where(eq(users.id, req.session.userId));

    if (!user) return res.status(401).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});
