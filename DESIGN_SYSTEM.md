# DEFICIT TRACKER — Design System V2
## Codename: PRECISION

> **Design philosophy:** A tool that earns respect through restraint. Every pixel has a purpose. No decoration — only information density, clarity, and quiet confidence. The user should feel like they're operating an instrument, not using an app.

---

## 1. COLOR PALETTE

### Foundation Layers (Grayscale Depth)
The screen is not flat black. It has **elevation** — subtle layers that create depth without color.

| Token | Hex | Usage |
|-------|-----|-------|
| `--surface-0` | `#000000` | True black. App background. The void. |
| `--surface-1` | `#0A0A0A` | Card backgrounds, ProgressCard, Total Deficit card |
| `--surface-2` | `#111111` | Elevated elements — counter button backgrounds on hover, table header |
| `--surface-3` | `#1A1A1A` | Active states, pressed buttons, selected table rows |
| `--border-subtle` | `#1E1E1E` | Default card/panel borders. Barely visible — felt more than seen |
| `--border-medium` | `#2A2A2A` | Counter button borders, input borders, table borders |
| `--border-focus` | `#3A3A3A` | Focused inputs, hover state borders |

### Text Hierarchy
| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#E8E8E8` | Primary numbers, counter display, main content. NOT pure white — slightly softened to reduce eye strain |
| `--text-secondary` | `#888888` | Labels, column headers, dates, subtitles |
| `--text-muted` | `#555555` | Disabled states, placeholder text, footnotes |
| `--text-bright` | `#FFFFFF` | Reserved. Only for the single most important number on screen (Today's Deficit when positive) |

### Accent Colors (Surgical — Used Sparingly)
| Token | Hex | Usage | Rule |
|-------|-----|-------|------|
| `--accent-positive` | `#00D26A` | Positive deficit, progress bar fill, streak flame | Only on numbers/indicators that confirm progress |
| `--accent-positive-dim` | `#00D26A` at 15% opacity | Positive deficit card background glow | Subtle wash behind positive numbers |
| `--accent-negative` | `#FF3B3B` | Negative deficit (surplus), destructive actions | Only on warnings/failures |
| `--accent-negative-dim` | `#FF3B3B` at 10% opacity | Background wash behind negative numbers | Very subtle danger signal |
| `--accent-cold` | `#4A9EFF` | Progress bar track fill, interactive highlights, links | The "confidence" color — trust, precision |
| `--accent-cold-dim` | `#4A9EFF` at 8% opacity | Hover states on interactive elements | Barely-there highlight |
| `--accent-streak` | `#FF8C00` | Streak flame icon only | Warmth in a cold interface — earned, not given |

### Accent Usage Rules
1. **Never more than 2 accent colors visible at once** in any single viewport
2. Green and red are **exclusively for deficit numbers** — never on buttons or decoration
3. The cold blue is for **interactive feedback only** — progress bars, focus rings, hover states
4. Orange is **only** for the streak flame. Nowhere else.
5. When in doubt, use grayscale. Color is a reward, not a default.

---

## 2. TYPOGRAPHY

### Font Stack
```
Primary: "SF Mono", "Cascadia Code", "JetBrains Mono", ui-monospace, monospace
Fallback: "SF Pro Display", -apple-system, system-ui, sans-serif (for labels only)
```

### Type Scale
| Token | Size | Weight | Tracking | Usage |
|-------|------|--------|----------|-------|
| `--type-display` | 3rem (48px) | 700 | -0.02em | Total Deficit number only |
| `--type-counter` | 2.5rem (40px) | 700 | -0.02em | Calorie counter display |
| `--type-stat` | 2rem (32px) | 700 | -0.01em | Today's Deficit number |
| `--type-value` | 1rem (16px) | 600 | 0 | ProgressCard stat values (Est. lbs, Goal lbs, etc.) |
| `--type-label` | 0.625rem (10px) | 500 | 0.08em | Uppercase labels (CALORIES IN, STREAK, etc.) |
| `--type-body` | 0.875rem (14px) | 400 | 0 | Table data, general text |
| `--type-caption` | 0.75rem (12px) | 400 | 0.02em | Progress bar labels, secondary info |
| `--type-micro` | 0.625rem (10px) | 400 | 0.04em | Timestamp details, tertiary info |

### Typography Rules
1. **All numbers use tabular-nums** (digits are equal width so columns align and counters don't shift)
2. **Labels are always uppercase** with letter-spacing. This is the military HUD influence.
3. **Weight contrast creates hierarchy** — not size alone. A bold 16px number outranks a regular 16px label.
4. **Negative letter-spacing on large numbers** (-0.02em) makes them feel dense and precise
5. **Positive letter-spacing on labels** (+0.08em) makes them feel institutional and authoritative

---

## 3. SPACING SYSTEM

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Micro gaps (icon to text, inner padding of tight elements) |
| `--space-2` | 8px | Default gap between related items (label to value, table cell padding) |
| `--space-3` | 12px | Gap between components in a section |
| `--space-4` | 16px | Section padding, card inner padding |
| `--space-5` | 20px | Gap between major sections on Day Screen |
| `--space-6` | 24px | Page top/bottom padding |

### Spacing Rules
1. **The Day Screen must NOT scroll on iPhone 13 Pro (390 × 844pt).** Every pixel of vertical space matters. Measure twice.
2. **Container max-width: 390px** (matches iPhone 13 Pro exactly)
3. **Horizontal page padding: 16px** each side (leaving 358px of usable width)
4. **Vertical rhythm: consistent 12px gaps** between sections unless tighter is needed to fit
5. **No screen scrolls except History.** All screens (Landing, Sign In/Up, Setup, Day) must fit entirely within the iPhone 13 Pro viewport (390 × 844pt) with no overflow. Apply `overflow-hidden` to every screen container except LogScreen to enforce this at the CSS level. Use `h-screen` (not `min-h-screen`) so the container is exactly the viewport — never taller.

---

## 4. BORDER TREATMENTS

### Border Radii
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0px | Table corners (sharp = data-dense) |
| `--radius-sm` | 4px | Inputs, small buttons |
| `--radius-md` | 8px | Cards, panels, counter buttons |
| `--radius-lg` | 12px | Total Deficit card, ProgressCard |
| `--radius-full` | 9999px | Streak badge, pill indicators |

### Border Widths
- Default: `1px` everywhere
- Never use 2px borders. Thickness = heaviness = amateur.

### Border Style
- All borders use `--border-subtle` by default
- On hover/focus, borders transition to `--border-medium` over 150ms
- **No box shadows anywhere.** Depth comes from surface color differences, not shadows. Shadows feel soft. This app is not soft.

---

## 5. COMPONENT-SPECIFIC STYLES

### 5.1 Progress Card

```
Container:
  background: var(--surface-1)
  border: 1px solid var(--border-subtle)
  border-radius: var(--radius-lg)       // 12px
  padding: 14px 16px

Progress Bar:
  Track: 
    height: 3px                         // Thin = precise
    background: var(--surface-3)
    border-radius: var(--radius-full)
  Fill:
    background: var(--accent-cold)      // Cold blue
    border-radius: var(--radius-full)
    transition: width 600ms ease-out    // Smooth, satisfying fill animation

Stats Grid (2×2):
  Labels: var(--type-label), var(--text-secondary), uppercase
  Values: var(--type-value), var(--text-primary), font-weight 600
  
  Streak special treatment:
    Icon + number in var(--accent-streak) when active
    Icon: 12px, filled when streak > 0
    
  Est. lbs special treatment:
    When weight is trending down, briefly flash var(--accent-positive) on update
```

### 5.2 Tally Counter Buttons

```
Layout: [ – ]   1100   [ + ]

Buttons:
  width: 72px
  height: 64px
  background: var(--surface-1)
  border: 1px solid var(--border-medium)
  border-radius: var(--radius-md)       // 8px
  icon-color: var(--text-secondary)
  
  :hover / :active
    background: var(--surface-2)
    border-color: var(--border-focus)
    icon-color: var(--text-primary)
    transition: all 100ms ease          // Snappy, not sluggish
  
  :active
    background: var(--surface-3)
    transform: scale(0.97)              // Subtle press effect — tactile
    transition: transform 50ms ease

Counter Display (center number):
  font: var(--type-counter), weight 700
  color: var(--text-primary)
  min-width: 120px
  text-align: center
  letter-spacing: -0.02em
  
  The number should feel HEAVY. It's the most important thing on screen.
  Use font-variant-numeric: tabular-nums so the width doesn't shift.
```

### 5.3 Deficit Numbers

```
Today's Deficit:
  Label: var(--type-label), var(--text-secondary), uppercase, centered
  Number: var(--type-stat)              // 2rem
  
  When positive (in deficit):
    color: var(--accent-positive)       // Green
    prefix: "+"
  When negative (surplus):
    color: var(--accent-negative)       // Red
    no prefix (the minus sign is inherent)
  When zero:
    color: var(--text-muted)

Total Deficit Card:
  Container:
    background: var(--surface-1)
    border: 1px solid var(--border-subtle)
    border-radius: var(--radius-lg)
    padding: 16px
    text-align: center
    
  Label: var(--type-label), var(--text-secondary)
  Number: var(--type-display)           // 3rem — the biggest number in the app
  
  Same green/red coloring rules as Today's Deficit
  
  Micro-detail: a 1px horizontal line above the number,
    width: 40px, centered, color: var(--border-medium)
    This is a subtle "data underline" that adds gravitas.
```

### 5.4 History Table

```
Container:
  background: var(--surface-0)          // No elevation — raw data
  border: 1px solid var(--border-subtle)
  border-radius: var(--radius-none)     // Sharp corners. This is a data grid.
  overflow: hidden

Header Row:
  background: var(--surface-2)
  border-bottom: 1px solid var(--border-medium)
  Labels: var(--type-micro), var(--text-secondary), uppercase, letter-spacing 0.06em
  padding: 6px 8px
  position: sticky, top: 0

Data Rows:
  font: var(--type-body), var(--text-primary)
  padding: 8px
  border-bottom: 1px solid var(--border-subtle)
  
  :hover
    background: var(--surface-1)        // Subtle highlight
  
  Deficit column:
    var(--accent-positive) or var(--accent-negative) based on sign
  
  Day number column:
    var(--text-muted)                   // De-emphasized — it's metadata
  
  Delete [x] button:
    Invisible until row hover, then var(--text-muted)
    :hover var(--accent-negative)

Alternating rows: NO. Zebra striping feels casual. 
  Uniform rows with border separation feels clinical. That's what we want.
```

### 5.5 Buttons

```
Primary (Finish Day):
  background: var(--surface-2)
  border: 1px solid var(--border-medium)
  border-radius: var(--radius-sm)       // 4px — tight, not friendly
  color: var(--text-primary)
  font: var(--type-label) size but 12px, uppercase, letter-spacing 0.1em
  height: 44px
  width: 100%
  
  :hover
    background: var(--surface-3)
    border-color: var(--border-focus)
  
  :active
    transform: scale(0.98)

Secondary (History):
  background: transparent
  border: 1px solid var(--border-subtle)
  All other styles same as Primary but border is more subtle
  
  :hover
    border-color: var(--border-medium)

Destructive (Reset Goal):
  Same as Primary but:
  :hover border-color changes to var(--accent-negative) at 40% opacity
  On confirm state: border becomes var(--accent-negative) solid

Auth Buttons (Landing Page — Sign In, Sign Up):
  Same as Primary style
  "Continue as Guest": no border, just text in var(--text-muted)
    :hover var(--text-secondary)
```

---

## 6. INTERACTION & MOTION

### Transitions
| Property | Duration | Easing | Usage |
|----------|----------|--------|-------|
| `background-color` | 100ms | ease | Button hover/active |
| `border-color` | 150ms | ease | Focus/hover states |
| `color` | 150ms | ease | Text color changes |
| `transform` | 50ms | ease | Button press scale |
| `width` (progress bar) | 600ms | ease-out | Progress bar fill animation |
| `opacity` | 200ms | ease | Fade in/out |

### Rules
1. **No bounce, no spring, no elastic easing.** Those feel playful. This app is serious.
2. **Transitions under 150ms for direct interactions** (button press, hover). User should feel zero delay.
3. **Transitions around 600ms for data visualization** (progress bar fill). This should feel satisfying and smooth.
4. **No page transition animations.** Screen switches are instant. Efficiency > flair.

---

## 7. SPECIAL DETAILS (Micro-Interactions That Reward Attention)

### The Deficit Flash
When Today's Deficit number changes (from counter increment/decrement), the number does a brief opacity pulse: `1.0 → 0.7 → 1.0` over 200ms. Subtle feedback that the calculation updated. No color change, no bounce — just a breath.

### Counter Momentum Indicator
After the user taps +/- rapidly (3+ taps within 1 second), the counter number's font-weight visually increases from 700 to 800 for 500ms then settles back. A barely-perceptible "heaviness" that subconsciously confirms rapid input is registering. (Optional — implement only if it feels right.)

### Progress Bar Milestone Markers
At 25%, 50%, and 75% along the progress bar track, place 1px-wide vertical tick marks in `var(--border-medium)`. These are barely visible but give the bar a "measurement ruler" quality. Precision instrument vibes.

### The Zero State
When there are no logs yet and deficit is 0, the Total Deficit number shows "0" in `var(--text-muted)` with a thin horizontal line through it (like a strikethrough on zero). A visual that says "nothing to show yet — get to work."

### The Streak Ember
When the streak is active (> 0 days), the flame icon has a subtle CSS animation: a very slow, gentle opacity oscillation between 0.8 and 1.0 over 3 seconds, looping. Like a pilot light. Alive but controlled. Not a raging fire animation — a steady flame.

---

## 8. DO NOT BREAK LIST

When applying this design system, these functional elements must NOT change:
- Calculation logic (BMR, TDEE, deficit formulas)
- API routes and request/response shapes
- Database schema
- Hook behavior (useCalorieTracking, useLogs, useSettings, useDeficitStats)
- Autosave debounce timing (500ms)
- Auth flow (session + guest mode)
- PWA manifest and installability
- The tally counter increment value (100 calories)

**Only modify:** JSX structure, Tailwind/CSS classes, CSS custom properties, and component-level presentational logic (like conditional classnames for color).

---

## 9. IMPLEMENTATION ORDER

Apply the design system in this exact order, committing after each step:

1. **CSS Custom Properties** — Add all tokens to `index.css` as CSS variables
2. **ProgressCard** — Restyle the card, progress bar, and stats grid
3. **CalorieCounter** — Restyle the buttons and counter display
4. **Deficit Numbers** — Restyle Today's Deficit and Total Deficit card
5. **Buttons** — Restyle Finish Day, History, and auth buttons
6. **History Table** — Restyle the log table
7. **Layout/Spacing** — Final pass on the Day Screen to nail the iPhone 13 Pro fit
8. **Landing Page** — Align with the new design language
9. **Setup Screen** — Align inputs and form styling
10. **Micro-interactions** — Add the subtle animations and details from Section 7

Test on iPhone after every step. Commit after every step.
