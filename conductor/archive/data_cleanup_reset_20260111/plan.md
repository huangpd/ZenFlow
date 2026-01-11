# Plan: Maintenance: Data Cleanup & Daily Progress Reset

## Phase 1: Manual Data Cleanup
- [x] Task: Execute Cleanup Script (Completed)
    - [ ] Subtask: Create and run a script to clear `TaskLog` and `MeditationSession`.
- [x] Task: Conductor - User Manual Verification 'Data Cleanup' (Protocol in workflow.md) (checkpoint: 54b710d)

## Phase 2: Automatic Daily Reset Logic
- [x] Task: Implement Lazy Reset in `getTasks` (Completed)
    - [ ] Subtask: Update `src/actions/tasks.ts`.
    - [ ] Subtask: Add logic to check if a reset is needed based on the current date.
    - [ ] Subtask: Update all tasks for the user if it's a new day.
- [x] Task: Conductor - User Manual Verification 'Daily Reset' (Protocol in workflow.md) (checkpoint: b7aef81)
