# Plan: Refactor: Unique Tasks & Dynamic Sutra DB

## Phase 1: Database Refactoring
- [x] Task: Add Sutra Model (Applied in migration)
    - [ ] Subtask: Update `prisma/schema.prisma` to add `Sutra` model.
    - [ ] Subtask: Add `@@unique([userId, text])` to `SpiritualTask` (Skipped to avoid data loss, handled in logic).
    - [ ] Subtask: Run migrations.
- [x] Task: Seed Initial Sutras (Executed)
    - [ ] Subtask: Create a seed script or Server Action to populate `Sutra` table from `constants.tsx`.
    - [ ] Subtask: Execute seed.
- [x] Task: Conductor - User Manual Verification 'Database Refactoring' (Protocol in workflow.md)

## Phase 2: Logic & UX Updates
- [x] Task: Enforce Unique Tasks (Implemented)
    - [ ] Subtask: Update `createTask` action to check if task exists. If so, return error or existing task.
- [x] Task: Dynamic Task Loading (Implemented)
    - [ ] Subtask: Create `getAvailableSutras` action.
    - [ ] Subtask: Update `AddTaskModal` to load list from DB/Action instead of constants.
    - [ ] Subtask: Update `AddTaskModal` to hide "Step Size" for Sutra tasks.
- [x] Task: Dynamic Sutra Reader (Implemented)
    - [ ] Subtask: Update `SutraReader` to fetch content via `getSutra` action (by ID) instead of constants.
- [x] Task: Conductor - User Manual Verification 'Logic & UX Updates' (Protocol in workflow.md)
