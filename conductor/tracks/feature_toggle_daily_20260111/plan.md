# Implementation Plan - Toggle Daily Homework

## Phase 1: Backend Support
- [x] Task: Implement `updateTask` Action 8bd2e10
  - [x] Sub-task: Add `updateTask(id, data)` to `src/actions/tasks.ts`.
  - [x] Sub-task: Ensure it checks ownership.
  - [x] Sub-task: Support `isDaily` update.
- [x] Task: Conductor - User Manual Verification 'Backend Support' (Protocol in workflow.md)

## Phase 2: Frontend Implementation
- [x] Task: Update TaskCard UI 3131661
  - [x] Sub-task: Add `isDaily` to `TaskCardProps`.
  - [x] Sub-task: Add Toggle Icon (e.g., `Star` or `Calendar`) to the card (top right or near title).
  - [x] Sub-task: Implement `handleToggleDaily` function calling `updateTask`.
  - [x] Sub-task: Handle visual feedback (optimistic update or loading).
- [ ] Task: Conductor - User Manual Verification 'Frontend Implementation' (Protocol in workflow.md)

## Phase 3: Change Default Behavior
- [x] Task: Update `AddTaskModal` default state.
- [x] Task: Update Schema default.
