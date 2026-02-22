# DEFICIT TRACKER — Full Rebuild Blueprint

> **What this is:** A complete specification for Claude Code to rebuild a caloric deficit tracking PWA from scratch. Follow this document step-by-step. Assume the developer has zero coding experience — explain every terminal command, every file, and every decision before executing.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [What Changed From the Old App](#3-what-changed-from-the-old-app)
4. [Step-by-Step Build Plan](#4-step-by-step-build-plan)
5. [Database Schema](#5-database-schema)
6. [Calculation Logic (Exact Formulas)](#6-calculation-logic-exact-formulas)
7. [API Routes](#7-api-routes)
8. [Frontend Screens & Components (Exact UI Spec)](#8-frontend-screens--components-exact-ui-spec)
9. [Frontend Hooks & State Management](#9-frontend-hooks--state-management)
10. [Authentication System](#10-authentication-system)
11. [Deployment Guide](#11-deployment-guide)
12. [Design System (CSS/Styling)](#12-design-system-cssstyling)

---

## 1. PROJECT OVERVIEW

A **mobile-first PWA** for tracking daily caloric deficit toward a weight loss goal. The user taps +/- buttons to tally calories eaten throughout the day. The app calculates their TDEE (calories burned), subtracts what they ate, and shows their daily deficit. Over time, the cumulative deficit translates to estimated pounds lost.

**Core philosophy:** Convenience and speed. The tally counter is the hero interaction. Open app → tap a few buttons → done. No food databases, no barcode scanning, no meal logging. Just a running count of estimated calories.

**Users:** 1–3 people (personal use, potentially scaling later).

---

## 2. ARCHITECTURE & TECH STACK

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│  React 18 + TypeScript + Vite               │
│  TanStack Query (server state)              │
│  Tailwind CSS (dark mode, monospace)        │
│  wouter (client-side routing)               │
│  PWA manifest (installable on iOS/Android)  │
└─────────────────────┬───────────────────────┘
                      │ REST API (JSON)
                      ▼
┌─────────────────────────────────────────────┐
│                  BACKEND                     │
│  Express.js + TypeScript                    │
│  bcryptjs (password hashing)                │
│  express-session + connect-pg-simple        │
└─────────────────────┬───────────────────────┘
                      │ Drizzle ORM
                      ▼
┌─────────────────────────────────────────────┐
│                 DATABASE                     │
│  PostgreSQL (Neon free tier)                │
│  Tables: users, sessions,                   │
│          user_settings, daily_logs           │
└─────────────────────────────────────────────┘
```

**Deployment target:** Railway ($5/mo) or Render ($7/mo). Single Node.js process serves both the API and the static React build. Neon PostgreSQL free tier for the database.

**Key dependencies (keep minimal):**
- react, react-dom, @tanstack/react-query, wouter
- tailwindcss, class-variance-authority, clsx, tailwind-merge, lucide-react
- @radix-ui/react-progress, @radix-ui/react-dialog, @radix-ui/react-alert-dialog, @radix-ui/react-select, @radix-ui/react-radio-group, @radix-ui/react-label
- express, express-session, connect-pg-simple, bcryptjs
- drizzle-orm, drizzle-kit, pg, drizzle-zod, zod
- vite, typescript, tsx, esbuild

**DO NOT include** these packages from the old app (bloat): framer-motion, recharts, embla-carousel-react, react-day-picker, react-hook-form, @hookform/resolvers, react-resizable-panels, cmdk, vaul, input-otp, memoizee, memorystore, next-themes, openid-client, passport, passport-local, ws, react-icons, or any of the unused @radix-ui packages (accordion, aspect-ratio, avatar, checkbox, collapsible, context-menu, dropdown-menu, hover-card, menubar, navigation-menu, popover, scroll-area, separator, slider, switch, tabs, toast, toggle, toggle-group, tooltip).

---

## 3. WHAT CHANGED FROM THE OLD APP

### REMOVED
1. **Manual scale weight entry** — The entire feature where users click the weight column in the log table to enter their scale weight. Gone.
2. **Deficit correction offset** — The `deficitCorrectionOffset` field in user_settings and all related logic (`updateDeficitCorrectionOffset`, `setDeficitCorrectionOffset`, `resetDeficitCorrectionOffset`, the `PATCH /api/logs/:date/weight` endpoint). Gone.
3. **Weight override logic in calculations** — `isOverride` flag on logs, the baseline-reset logic in `computeLogsWithEstimatedWeights`. Simplified: estimated weight is always `startWeight - (totalDeficit / 3500)`.
4. **Sound theme system** — `sounds.ts`, `playSound()`, all sound-related code. Gone.
5. **Style preset system** — `styles.ts`, the 5 visual themes (Classic, Sharp, Minimal, Pill, Terminal), `applyStyle()`, `getCurrentStyle()`. Gone. We keep ONE clean style (the current "Minimal" black-and-white look).
6. **Font picker** — The font selection in settings. Gone. We use the monospace system font stack.
7. **Theme picker** — Light/dark toggle in settings. Gone. We are dark mode only (pure black background).
8. **Settings modal bloat** — The SettingsModal with font/theme/style/sound pickers is replaced with a minimal settings gear that only has "Log Out" and "Reset Goal" options.

### CHANGED
1. **TDEE now uses estimated weight, not static currentWeight** — This is the key logic change. Previously, TDEE was calculated using the `currentWeight` field from settings (which only changed when the user manually entered a scale weight). Now, TDEE is calculated using `latestEstimatedWeight` which is derived from `startWeight - (cumulativeDeficit / 3500)`. This means as the user loses weight, their TDEE decreases, and they need to eat fewer calories to maintain the same deficit. This creates a natural feedback loop without any manual weight input.
2. **The `weight` column removed from daily_logs** — Since we no longer track manual weight, the `weight` field is removed from the daily_logs table entirely.
3. **The `currentWeight` and `deficitCorrectionOffset` columns removed from user_settings** — No longer needed.
4. **Log history table simplified** — The "Wt" column (which was editable) is replaced with a read-only "Est." column showing the calculated estimated weight for that day. The [x] reset button per row remains.

### KEPT EXACTLY THE SAME
1. **Landing page** — "DEFICIT" title, "caloric deficit tracker" subtitle, Sign In / Sign Up / Continue as Guest buttons. Pure black background, white text and borders.
2. **Setup screen** — Goal (lbs), Current (lbs), Age, Height (ft/in), Sex (M/F radio), Activity (Low/Medium/High dropdown), "Start Tracking" button at bottom.
3. **Day screen layout** — Top: date navigation (< Mon, 4/20/26 >) with logout arrow and settings gear. Then: ProgressCard (progress bar + 2x2 grid: Streak, Est. lbs, Est. Complete, Goal lbs). Then: CALORIES IN label with +/- tally counter. Then: CALORIES OUT input. Then: TODAY'S DEFICIT (green/red number). Then: TOTAL DEFICIT card (large green/red number). Then: "Finish Day" and "History" buttons at bottom.
4. **Log screen** — "History" title with back arrow. Scrollable table with columns: #, Date, In, Out, Def, Est., [x].
5. **Tally counter behavior** — +/- buttons increment/decrement by 100 calories. Direct number input also works. Silent debounced autosave (500ms after last change). Persistent across app close/reopen.
6. **Sticky day logic** — App opens to the most recent day with calorie data, not necessarily today. If no data exists, opens to today.
7. **Finish Day** — Saves the day's data and advances to the next date.
8. **Guest mode** — UUID stored in localStorage, sent as `x-guest-id` header. No account required.
9. **Auth mode** — Username/password with bcrypt. Session-based via express-session + connect-pg-simple.
10. **All math formulas** — BMR (Mifflin-St Jeor), TDEE, deficit calculation, estimated weight, streak counting, progress %, estimated completion date.

---

## 4. STEP-BY-STEP BUILD PLAN

Guide me through each step. Before running any command, explain what it does. After each step, verify it worked.

### Phase 1: Project Setup
1. Create a new directory and initialize the project
2. Set up TypeScript config
3. Install all dependencies (and ONLY the ones listed in Section 2)
4. Set up the folder structure:
```
deficit-tracker/
├── client/
│   ├── src/
│   │   ├── components/ui/          # Minimal shadcn components
│   │   ├── features/deficit/
│   │   │   ├── components/         # CalorieCounter, ProgressCard, LogHistoryTable
│   │   │   ├── screens/            # SetupScreen, DayScreen, LogScreen
│   │   │   └── hooks/              # useSettings, useLogs, useCalorieTracking, useDeficitStats
│   │   ├── hooks/                  # use-auth
│   │   ├── lib/                    # calculations, date-utils, queryClient, utils
│   │   ├── pages/
│   │   │   ├── home.tsx            # Main orchestrator
│   │   │   └── landing.tsx         # Auth landing page
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   └── public/
│       └── manifest.json
├── server/
│   ├── index.ts                    # Entry point
│   ├── routes.ts                   # API routes
│   ├── storage.ts                  # Database operations
│   ├── db.ts                       # Database connection
│   └── auth.ts                     # Auth setup + routes
├── shared/
│   └── schema.ts                   # Drizzle schema + types
├── drizzle.config.ts
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── DEFICIT_TRACKER_BLUEPRINT.md    # This file
```

### Phase 2: Database
5. Set up Neon PostgreSQL (guide me through creating a free Neon account and database)
6. Write the Drizzle schema (Section 5)
7. Push the schema to the database with `drizzle-kit push`

### Phase 3: Backend
8. Write the Express server entry point (serves API + static files)
9. Write the auth system (Section 10)
10. Write the storage layer (database operations)
11. Write the API routes (Section 7)
12. Test the backend with curl commands

### Phase 4: Frontend
13. Set up Vite config
14. Write the CSS/design system (Section 12)
15. Write the minimal shadcn UI components needed (Button, Input, Progress, Dialog, AlertDialog, Select, RadioGroup, Label, Table)
16. Write the calculation library (Section 6)
17. Write the date utilities
18. Write the query client setup
19. Write the auth hook
20. Write the feature hooks (useSettings, useLogs, useCalorieTracking, useDeficitStats)
21. Write the UI components (CalorieCounter, ProgressCard, LogHistoryTable)
22. Write the screens (SetupScreen, DayScreen, LogScreen)
23. Write the landing page
24. Write the home page orchestrator
25. Write main.tsx entry point
26. Write the PWA manifest
27. Test the full app locally

### Phase 5: Deploy
28. Set up Railway (or Render) account
29. Configure environment variables
30. Deploy
31. Set up custom domain
32. Verify production PWA works

---

## 5. DATABASE SCHEMA

### Table: `users`
```sql
users (
  id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username    VARCHAR UNIQUE NOT NULL,
  password    VARCHAR NOT NULL,          -- bcrypt hash
  created_at  TIMESTAMP DEFAULT now(),
  updated_at  TIMESTAMP DEFAULT now()
)
```

### Table: `sessions`
```sql
sessions (
  sid     VARCHAR PRIMARY KEY,
  sess    JSONB NOT NULL,
  expire  TIMESTAMP NOT NULL
)
CREATE INDEX IDX_session_expire ON sessions (expire);
```

### Table: `user_settings`
```sql
user_settings (
  id              VARCHAR PRIMARY KEY,
  user_id         VARCHAR NOT NULL,      -- auth user ID or 'guest_{uuid}'
  goal_weight     REAL NOT NULL,         -- lbs
  start_weight    REAL NOT NULL,         -- lbs
  age             INTEGER NOT NULL,
  sex             TEXT NOT NULL,          -- 'male' or 'female'
  height_ft       INTEGER NOT NULL,
  height_in       INTEGER NOT NULL,
  activity_level  TEXT NOT NULL DEFAULT 'low'  -- 'low', 'medium', 'high'
)
```

**NOTE:** `current_weight` and `deficit_correction_offset` are REMOVED compared to the old schema.

### Table: `daily_logs`
```sql
daily_logs (
  id            VARCHAR PRIMARY KEY,
  user_id       VARCHAR NOT NULL,
  date          TEXT NOT NULL,           -- 'YYYY-MM-DD'
  calories_in   INTEGER NOT NULL DEFAULT 0,
  calories_out  INTEGER NOT NULL DEFAULT 0,
  deficit       INTEGER NOT NULL DEFAULT 0,
  day_number    INTEGER NOT NULL
)
```

**NOTE:** `weight` column is REMOVED compared to the old schema.

### Drizzle Schema (TypeScript)

```typescript
// shared/schema.ts
import { pgTable, text, varchar, integer, real, date, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  goalWeight: real("goal_weight").notNull(),
  startWeight: real("start_weight").notNull(),
  age: integer("age").notNull(),
  sex: text("sex").notNull(),
  heightFt: integer("height_ft").notNull(),
  heightIn: integer("height_in").notNull(),
  activityLevel: text("activity_level").notNull().default("low"),
});

export const dailyLogs = pgTable("daily_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(),
  caloriesIn: integer("calories_in").notNull().default(0),
  caloriesOut: integer("calories_out").notNull().default(0),
  deficit: integer("deficit").notNull().default(0),
  dayNumber: integer("day_number").notNull(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true });
export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({ id: true });

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type ActivityLevel = "low" | "medium" | "high";
```

---

## 6. CALCULATION LOGIC (EXACT FORMULAS)

All calculations happen client-side. This is the exact math:

```typescript
// lib/calculations.ts

export const CALORIES_PER_POUND = 3500;

export const activityMultipliers: Record<string, number> = {
  low: 1.2,       // Sedentary
  medium: 1.375,  // Moderate exercise
  high: 1.465,    // Active
};

// Unit conversions
export function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

// BMR: Mifflin-St Jeor Equation
// Men:   (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
// Women: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
export function calculateBMR(
  weightKg: number, heightCm: number, age: number, sex: "male" | "female"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

// TDEE = BMR × activity multiplier
export function calculateTDEE(
  weightLbs: number, heightFt: number, heightIn: number,
  age: number, sex: "male" | "female", activityLevel: string
): number {
  const weightKg = lbsToKg(weightLbs);
  const heightCm = feetInchesToCm(heightFt, heightIn);
  const bmr = calculateBMR(weightKg, heightCm, age, sex);
  return bmr * (activityMultipliers[activityLevel] || 1.2);
}

// Total deficit goal = 3500 × (startWeight - goalWeight)
export function calculateTotalDeficitGoal(startWeight: number, goalWeight: number): number {
  return CALORIES_PER_POUND * (startWeight - goalWeight);
}

// Estimated weight = startWeight - (cumulativeDeficit / 3500)
export function calculateEstimatedWeight(startWeight: number, cumulativeDeficit: number): number {
  return startWeight - cumulativeDeficit / CALORIES_PER_POUND;
}

// Daily deficit = TDEE + caloriesOut - caloriesIn
// (positive = in deficit = good, negative = surplus)

// Streak = count of consecutive days with positive deficit, from most recent backward
export function calculateDeficitStreak(logs: DailyLog[]): number {
  const sorted = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  for (const log of sorted) {
    if (log.deficit > 0) streak++;
    else break;
  }
  return streak;
}
```

### THE KEY CHANGE: Dynamic TDEE

In the old app, TDEE was calculated once using the static `currentWeight` from settings. In the new app:

```typescript
// When computing today's deficit, use the ESTIMATED weight (not a static field):
const latestEstimatedWeight = startWeight - (totalCumulativeDeficit / 3500);
const dynamicTDEE = calculateTDEE(latestEstimatedWeight, heightFt, heightIn, age, sex, activityLevel);
// Then: todayDeficit = dynamicTDEE + caloriesOut - caloriesIn
```

This means as the user accumulates deficit and their estimated weight drops, their TDEE decreases, making it progressively harder to maintain the same daily deficit. This is physiologically accurate and eliminates the need for manual scale weight entry.

### DeficitStats computation (simplified — no weight override logic)

```typescript
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

export function computeDeficitStats(settings, logs): DeficitStats {
  if (!settings) return defaults;
  
  const totalDeficitGoal = CALORIES_PER_POUND * (settings.startWeight - settings.goalWeight);
  const totalDeficitAchieved = logs.reduce((sum, log) => sum + log.deficit, 0);
  const latestEstimatedWeight = settings.startWeight - (totalDeficitAchieved / CALORIES_PER_POUND);
  
  const weightToLose = settings.startWeight - settings.goalWeight;
  const weightLost = settings.startWeight - latestEstimatedWeight;
  const progressPercent = weightToLose > 0 ? Math.round((weightLost / weightToLose) * 100) : 0;
  
  const avgDailyDeficit = logs.length > 0 ? totalDeficitAchieved / logs.length : 0;
  const deficitRemaining = Math.max(0, totalDeficitGoal - totalDeficitAchieved);
  const daysRemaining = avgDailyDeficit > 0 ? Math.ceil(deficitRemaining / avgDailyDeficit) : null;
  const estimatedCompletionDate = daysRemaining 
    ? new Date(Date.now() + daysRemaining * 86400000) 
    : null;
  
  return { totalDeficitGoal, totalDeficitAchieved, calculateDeficitStreak(logs), 
           progressPercent, avgDailyDeficit, deficitRemaining, daysRemaining,
           estimatedCompletionDate, latestEstimatedWeight };
}
```

### Logs with estimated weight (simplified — no override logic)

```typescript
export interface LogWithEstimatedWeight extends DailyLog {
  estWeight: number;
}

export function computeLogsWithEstimatedWeights(
  logs: DailyLog[], startWeight: number
): LogWithEstimatedWeight[] {
  const sorted = [...logs].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  let cumulativeDeficit = 0;
  const result: LogWithEstimatedWeight[] = [];
  
  for (const log of sorted) {
    cumulativeDeficit += log.deficit;
    const estWeight = startWeight - (cumulativeDeficit / CALORIES_PER_POUND);
    result.push({ ...log, estWeight });
  }
  
  // Return newest first for display
  return result.reverse();
}
```

---

## 7. API ROUTES

### Authentication Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account (username + password) |
| POST | `/api/auth/login` | Log in (returns session cookie) |
| POST | `/api/auth/logout` | Log out (destroy session) |
| GET | `/api/auth/me` | Get current user (from session) |

### Settings Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get user settings |
| POST | `/api/settings` | Create or update settings |

### Log Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | Get all logs for user |
| GET | `/api/logs/:date` | Get log for specific date |
| POST | `/api/logs` | Create or update a daily log |
| DELETE | `/api/logs/:date` | Delete a single day's log |
| DELETE | `/api/logs` | Clear ALL logs (reset goal) |

**REMOVED from old app:** `PATCH /api/logs/:date/weight` and `PATCH /api/settings` (deficit days setting).

### User identification
Every API route extracts userId from either:
1. Session (`req.session.userId`) for authenticated users
2. `x-guest-id` header for guest users (prefixed with `guest_`)

---

## 8. FRONTEND SCREENS & COMPONENTS (EXACT UI SPEC)

### Landing Page (`/`)
- **Pure black background**, centered content
- Large "DEFICIT" text (bold, uppercase, monospace)
- Small "caloric deficit tracker" subtitle below in muted gray
- Three actions stacked vertically with generous spacing:
  - "Sign In" button — full width, white border, black background, white text, icon: arrow-right-to-line
  - "Sign Up" button — full width, white border, black background, white text, icon: user-plus
  - "Continue as Guest" — subtle text link below buttons, muted color, icon: user

### Setup Screen
- "DEFICIT TRACKER" header at top center (bold, uppercase, monospace)
- Form fields stacked vertically:
  - **GOAL (LBS)** — label + number input
  - **CURRENT (LBS)** — label + number input
  - **AGE** — label + number input
  - **HEIGHT** — label + two inputs side by side: [feet] ft [inches] in
  - **SEX** — label + radio buttons: M / F (horizontal)
  - **ACTIVITY** — label + dropdown select: Low / Medium / High
- All labels: uppercase, small, muted color, monospace
- All inputs: full width, black background, white border, white text, rounded
- "Start Tracking" button pinned to bottom — full width, white border

### Day Screen (Main View)
Top bar (single row):
- Left: Logout icon (arrow-right, reversed)
- Center: `< Mon, 4/20/26 >` (left/right chevrons for date navigation)
- Right: Settings gear icon

**ProgressCard** (bordered card):
- Top row: "Progress (XX%)" left, "Goal: XXX,XXX CAL" right
- Progress bar (thin, blue fill on dark track)
- 2×2 stats grid below:
  - Top-left: "Streak" label + 🔥 XXd (orange when active)
  - Top-right: "Est. lbs" label + XXX (bold mono)
  - Bottom-left: "Est. Complete" label + "MMM DD YY" (bold mono)
  - Bottom-right: "Goal lbs" label + XXX (bold mono)

**Calorie Counter section:**
- "CALORIES IN" label (centered, uppercase)
- [ – ]  **1100**  [ + ] (large buttons, large number in center)
  - Buttons: bordered, tall rectangles with minus/plus icons
  - Center number: very large monospace font, editable (tap to type)
  - +/- changes value by 100

**Calories Out:**
- "CALORIES OUT" label (centered, uppercase)
- Single bordered input field showing "0" (for exercise calories)

**Today's Deficit:**
- "TODAY'S DEFICIT" label (centered, uppercase)
- Large number below in **green** if positive, **red** if negative
- Format: "+1,290" or "-500"

**Total Deficit** (bordered card):
- "TOTAL DEFICIT" label (centered, uppercase)
- Very large number in **green** if positive, **red** if negative
- Format: "+70,000"

**Bottom buttons:**
- "Finish Day" — full width bordered button
- "History" — full width bordered button below

### Log Screen (History)
- Top: back arrow (left) + "History" title (centered)
- Scrollable table filling remaining viewport:
  - Columns: # | Date | In | Out | Def | Est. | [x]
  - # = day number (mono)
  - Date = short format "Jan 4"
  - In = calories in (right-aligned, mono)
  - Out = calories out or "—" (right-aligned, mono)
  - Def = deficit with +/- sign, **green** if positive, **red** if negative
  - Est. = estimated weight (read-only, right-aligned, mono) — **NOT editable** (unlike old app)
  - [x] = small X button to delete that day's log (with confirmation dialog)
- Sticky header row
- Empty state: "No logs yet. Start tracking!"

### Settings (Minimal)
When the user taps the gear icon, show a simple Dialog with:
- Title: "Settings"
- "Reset Goal" button (with double-tap confirmation: first tap shows "Confirm Reset?", second tap executes)
- "Log Out" button
- That's it. No font/theme/style/sound pickers.

---

## 9. FRONTEND HOOKS & STATE MANAGEMENT

### `useCalorieTracking` — The core tally counter hook
- Manages local state for caloriesIn, caloriesOut
- Syncs from server when date changes (but not during user editing)
- **Silent autosave**: 500ms debounce after any change, POST to `/api/logs`
- **Revision tracking**: prevents stale responses from overwriting newer edits
- `increment()` / `decrement()` — +/- 100 calories
- `finishDay()` — manual save + callback to advance date
- **CRITICAL: The TDEE passed into this hook must be the DYNAMIC TDEE** calculated from estimated weight, not a static value.

### `useSettings` — Settings CRUD
- Fetches settings from `/api/settings`
- `saveSettings()` mutation
- `computeTDEE(weightLbs)` helper that calculates TDEE for any given weight

### `useLogs` — Log CRUD
- Fetches all logs from `/api/logs`
- `resetLogs()` — DELETE all logs (reset goal)
- `resetDay(date)` — DELETE single day's log
- **REMOVED**: `updateWeight` mutation (no longer needed)

### `useDeficitStats` — Derived statistics
- Memoized computation of all stats from settings + logs
- Returns: totalDeficitGoal, totalDeficitAchieved, deficitStreak, progressPercent, avgDailyDeficit, deficitRemaining, daysRemaining, estimatedCompletionDate, latestEstimatedWeight, logsWithEstWeight

### `useAuth` — Authentication state
- Fetches `/api/auth/me` to check if user is logged in
- Returns: user, isAuthenticated, isLoading

### Query Client Configuration
- Guest mode: store UUID in localStorage under `deficit_guest_id`
- All API requests include `credentials: "include"` for session cookies
- Guest requests include `x-guest-id` header
- `apiRequest` helper: generic fetch wrapper that adds auth headers

---

## 10. AUTHENTICATION SYSTEM

### Password Auth (bcryptjs)
- **Signup**: Hash password with bcrypt (10 rounds), store in users table
- **Login**: Fetch user by username, verify password with bcrypt.compare, set `req.session.userId`
- **Logout**: Destroy session
- **Me**: Return user from session

### Guest Mode
- On "Continue as Guest" click, generate UUID, store in localStorage as `deficit_guest_id`, set `deficit_guest_mode = true`
- All API requests from guest include `x-guest-id: {uuid}` header
- Server prefixes guest IDs with `guest_` for the userId

### Session Configuration
- Store: connect-pg-simple (uses the `sessions` table in PostgreSQL)
- TTL: 7 days
- Cookie: httpOnly, secure (in production), sameSite lax
- Secret: from `SESSION_SECRET` environment variable

---

## 11. DEPLOYMENT GUIDE

### Option A: Railway (Recommended, ~$5/mo)
1. Create Railway account at railway.app
2. Create new project → Deploy from GitHub repo
3. Set environment variables:
   - `DATABASE_URL` — Neon connection string
   - `SESSION_SECRET` — random 32+ character string
   - `NODE_ENV` — "production"
   - `PORT` — Railway sets this automatically
4. Build command: `npm run build`
5. Start command: `npm run start`
6. Add custom domain in Railway settings

### Option B: Render (~$7/mo)
1. Create Render account at render.com
2. New Web Service → Connect GitHub repo
3. Same env vars as above
4. Build: `npm run build`, Start: `npm run start`
5. Add custom domain

### Neon PostgreSQL Setup
1. Create free account at neon.tech
2. Create new project → copy the connection string
3. Use as `DATABASE_URL` env var
4. Run `npx drizzle-kit push` to create tables

### Custom Domain
1. Buy domain from Namecheap, Cloudflare, or Google Domains
2. In your hosting provider (Railway/Render), add the custom domain
3. Update DNS: Add CNAME record pointing your domain to the provided URL
4. Wait for SSL certificate provisioning (automatic, ~5 min)

### Build Scripts
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist",
    "start": "NODE_ENV=production node dist/index.cjs",
    "db:push": "drizzle-kit push"
  }
}
```

### PWA Manifest
```json
{
  "name": "Deficit",
  "short_name": "Deficit",
  "description": "Caloric deficit tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 12. DESIGN SYSTEM (CSS/STYLING)

### Dark mode only. Pure black (#000) background, pure white (#fff) foreground.

### CSS Variables (the key ones)
```css
:root {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --border: 0 0% 25%;
  --card: 0 0% 0%;
  --card-foreground: 0 0% 100%;
  --primary: 0 0% 100%;
  --primary-foreground: 0 0% 0%;
  --muted: 0 0% 10%;
  --muted-foreground: 0 0% 60%;
  --input: 0 0% 30%;
  --ring: 0 0% 100%;
  --radius: 0.5rem;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
}
```

### Typography
- Everything uses the monospace font stack
- Labels: uppercase, letter-spacing 0.05em, small size (10-12px), muted color
- Numbers: mono, bold, tabular-nums
- Counter display: 2.5rem font size
- Daily deficit number: 2.5rem
- Total deficit number: 3.5rem

### Color accents
- Green for positive deficit: `text-green-600 dark:text-green-400` (Tailwind)
- Red for negative deficit: `text-red-600 dark:text-red-400`
- Orange for streak flame: `text-orange-500 dark:text-orange-400`
- Blue for progress bar fill

### Layout
- Max width: `max-w-md mx-auto` (448px)
- Container padding: `px-4 py-2`
- Cards: rounded corners (0.75rem), 1px border, no shadow
- Buttons: rounded (0.5rem), 1px border, no shadow
- Counter buttons: tall (5rem height × 6.5rem width)

### Key classes to define in index.css
```css
body {
  font-family: var(--font-mono);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}

/* Card/panel style */
.styled-card {
  border-radius: 0.75rem;
  border-width: 1px;
  padding: 1.25rem;
  border-color: hsl(var(--border));
  background-color: hsl(var(--card));
}

/* Counter buttons */
.styled-counter-btn {
  border-radius: 0.5rem;
  height: 5rem;
  width: 6.5rem;
  border-width: 1px;
  padding: 0;
}

/* Counter value display */
.styled-counter-value {
  font-size: 2.5rem;
  min-width: 7.5rem;
}
```

---

## INSTRUCTIONS FOR CLAUDE CODE

When building this app:

1. **Read this entire document first** before writing any code.
2. **Follow the build plan in Section 4** step by step. Ask me to confirm after each phase before moving on.
3. **Use ONLY the dependencies listed in Section 2.** Do not add anything else.
4. **Match the UI exactly** as described in Section 8. Reference the screenshots I will provide if anything is unclear.
5. **The dynamic TDEE change (Section 6) is the most critical logic change.** Make sure the TDEE used for deficit calculation is always based on the latest estimated weight, not a static value.
6. **Test at every phase.** After backend is done, test with curl. After frontend is done, test in browser.
7. **Explain every command** before running it. I have no coding experience.
8. **Keep the code clean and minimal.** No dead code, no unused imports, no over-engineering.
9. **The app must work as a PWA** — installable from the browser on iOS and Android.
10. **All counter values must persist** — if I add 500 calories, close the app, and reopen it, it should show 500. This is handled by the autosave to the database.
