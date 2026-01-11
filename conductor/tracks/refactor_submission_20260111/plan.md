# Plan: Refactor: Simplified Task Submission UI

## Phase 1: TaskCard UI Overhaul
- [ ] Task: Unify Submission Buttons
    - [ ] Subtask: Update `TaskCard.tsx` to replace the two-button layout with a single, full-width button.
    - [ ] Subtask: For counter tasks, the button should trigger "Add Step" (and auto-complete if target reached).
    - [ ] Subtask: For normal tasks, the button marks as complete (with full target count).
- [ ] Task: Logic Update for Normal Tasks
    - [ ] Subtask: Ensure completing a normal task logs the full target count (e.g., 10) instead of 1.
- [ ] Task: Conductor - User Manual Verification 'TaskCard UI Overhaul' (Protocol in workflow.md)
