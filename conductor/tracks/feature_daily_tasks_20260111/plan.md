# Plan: Feature: Selective Daily Tasks & Persistence Logic

## Phase 1: Database & Backend
- [ ] Task: Update Schema
    - [ ] Subtask: Add `isDaily` field to `SpiritualTask`.
    - [ ] Subtask: Run migrations.
- [ ] Task: Update Actions
    - [ ] Subtask: Modify `createTask` to handle `isDaily`.
    - [ ] Subtask: Update `getTasks` reset logic (reset dailies, delete non-dailies).
- [ ] Task: Conductor - User Manual Verification 'Backend Logic' (Protocol in workflow.md)

## Phase 2: UI Implementation
- [ ] Task: Update AddTaskModal
    - [ ] Subtask: Add a toggle/switch for "设为每日功课".
    - [ ] Subtask: Pass the state to the `createTask` action.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)
