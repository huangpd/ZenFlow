# Implementation Plan - Refactor Task Edit & Save

## Phase 1: Backend Consolidation
- [x] Task: Consolidate Update Actions fc9015b
  - [x] Sub-task: Refactor `src/actions/tasks.ts` to have a single `updateTask` that handles `current` and `isDaily`.
  - [x] Sub-task: Ensure progress logging works when `current` is changed via `updateTask`.
- [ ] Task: Conductor - User Manual Verification 'Backend Consolidation' (Protocol in workflow.md)

## Phase 2: TaskCard UI Refactor
- [x] Task: Update TaskCard State & Rendering 42d6fd8
  - [x] Sub-task: Add `pendingIsDaily` state to `TaskCard`.
  - [x] Sub-task: Modify `Star` icon behavior: toggle `pendingIsDaily` when `isEditing` is true.
  - [x] Sub-task: Add "Save" button visible only when `isEditing` is true.
  - [x] Sub-task: Wire up "Save" button to consolidated `updateTask` action.
- [ ] Task: Conductor - User Manual Verification 'TaskCard UI Refactor' (Protocol in workflow.md)
