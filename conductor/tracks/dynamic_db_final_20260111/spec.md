# Specification: Refactor: Fully Dynamic Tasks & Sutras from DB

## 1. Overview
Completely remove hardcoded task presets and sutra content from the codebase. All selectable tasks (mantras, scriptures, rituals) must be managed via the database and the admin interface.

## 2. Goals
- **Eliminate Hardcoded Presets:** Move `PRESET_LIBRARY` and `SUTRA_DATABASE` from `src/constants.tsx` to the database.
- **Dynamic Task Selection:** Update `AddTaskModal` to fetch all available task definitions from the database.
- **Admin Management:** Ensure the admin interface allows creating not just "Sutras" but also general "Task Definitions" (like rituals and mantras).
- **Cleanup:** Remove unused constants and static data structures.

## 3. Database Changes
- **Extend Sutra Model:** Possibly rename `Sutra` to `TaskTemplate` or create a new model to house non-scripture tasks (mantras, rituals).
- **Update Relationships:** Ensure `SpiritualTask` references these templates.

## 4. Expected Behavior
- The "Add Task" list should be empty if the database is empty.
- Admin can add a "Mantra" (counter type) or a "Scripture" (sutra type) via the backend.
- The UI reflects these changes without code deployments.
