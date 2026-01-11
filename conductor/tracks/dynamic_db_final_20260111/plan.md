# Plan: Refactor: Fully Dynamic Tasks & Sutras from DB

## Phase 1: Database & Backend Consolidation
- [x] Task: Unify Task Templates in DB (Completed)
    - [ ] Subtask: Update `prisma/schema.prisma` to include general task template fields (type, defaultTarget, defaultStep, iconId).
    - [ ] Subtask: Run migrations.
- [x] Task: Comprehensive Data Migration (Completed)
    - [ ] Subtask: Create a seed script to migrate all remaining items from `PRESET_LIBRARY` to the unified template table.
- [x] Task: Conductor - User Manual Verification 'Database Consolidation' (Protocol in workflow.md) (checkpoint: unify_task_templates)

## Phase 2: UI & Logic Decoupling
- [x] Task: Refactor AddTaskModal (Completed)
    - [ ] Subtask: Remove reliance on `PRESET_LIBRARY`.
    - [ ] Subtask: Fetch all templates from the database.
- [x] Task: Enhance Admin Panel (Completed)
    - [ ] Subtask: Update Admin UI to manage all types of task templates (Normal, Counter, Sutra).
- [x] Task: Final Cleanup (Completed)
    - [ ] Subtask: Remove hardcoded constants from `src/constants.tsx`.
- [x] Task: Conductor - User Manual Verification 'Fully Dynamic System' (Protocol in workflow.md) (checkpoint: 0aee5f7)
