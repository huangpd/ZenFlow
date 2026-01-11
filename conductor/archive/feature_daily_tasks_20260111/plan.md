# Plan: Feature: Selective Daily Tasks & Persistence Logic

## Phase 1: Database & Backend
- [x] Task: Update Schema (Completed)
    - [ ] Subtask: Add `isDaily` field to `SpiritualTask`.
    - [ ] Subtask: Run migrations.
- [x] Task: Update Actions (Completed)
    - [ ] Subtask: Modify `createTask` to handle `isDaily`.
    - [ ] Subtask: Update `getTasks` reset logic (reset dailies, delete non-dailies).
- [x] Task: Conductor - User Manual Verification 'Backend Logic' (Protocol in workflow.md) (checkpoint: 0b48d77)

## Phase 2: UI Implementation
- [x] Task: Update AddTaskModal (Completed)
    - [ ] Subtask: Add a toggle/switch for "设为每日功课".
    - [ ] Subtask: Pass the state to the `createTask` action.
- [x] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md) (checkpoint: 7ebbc0d)
