# Plan: Refactor: Simplified Task Submission UI

## Phase 1: TaskCard UI Overhaul
- [x] Task: Unify Submission Buttons (Implemented)
    - [ ] Subtask: Update `TaskCard.tsx` to replace the two-button layout with a single, full-width button.
    - [ ] Subtask: For counter tasks, the button should trigger "Add Step" (and auto-complete if target reached).
    - [ ] Subtask: For normal tasks, the button marks as complete (with full target count).
- [x] Task: Logic Update for Normal Tasks (Implemented)
    - [ ] Subtask: Ensure completing a normal task logs the full target count (e.g., 10) instead of 1.
- [x] Task: Conductor - User Manual Verification 'TaskCard UI Overhaul' (Protocol in workflow.md)
