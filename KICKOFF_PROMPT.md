Read the file DEFICIT_TRACKER_BLUEPRINT.md in this project root. It contains the complete specification for a caloric deficit tracking PWA I need you to build from scratch.

I have zero coding experience. Guide me through every step — explain each command before running it, and confirm things work before moving to the next step. Follow the Step-by-Step Build Plan in Section 4 exactly.

Key context:
- This is a rebuild of an existing app. The blueprint preserves the exact same UI/layout but strips out unused features (manual weight entry, sound/style/font themes) and makes the code leaner.
- The most important logic change: TDEE (daily calorie burn) now recalculates based on estimated weight (startWeight minus cumulative deficit / 3500), not a static field. As the user loses weight, they burn fewer calories.
- The core interaction is a +/- tally counter for logging calories. It must autosave silently and persist across app close/reopen.
- Multi-user auth (username/password + guest mode). PostgreSQL on Neon free tier. Deploy to Railway or Render.
- Pure black and white monospace aesthetic. Dark mode only. Mobile-first PWA.

Start with Phase 1: Project Setup. Create the directory structure, initialize the project, and install dependencies. Then pause and wait for me to confirm before moving to Phase 2.
