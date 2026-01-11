# Plan: Feature: Detailed Practice Statistics

## Phase 1: Backend Logic
- [x] Task: Implement `getDetailedTaskStats` Action (27f8c79)
    - [ ] Subtask: Fetch all `SpiritualTask` for the user (for all-time totals).
    - [ ] Subtask: Fetch `TaskLog` for today (for daily increments).
    - [ ] Subtask: Return structured data: `{ today: { [taskName]: number }, allTime: { [taskName]: number } }`.
- [x] Task: Conductor - User Manual Verification 'Backend Logic' (Protocol in workflow.md)

## Phase 2: Frontend Implementation
- [ ] Task: Update `PracticeStats` Component
    - [ ] Subtask: Fetch data using `getDetailedTaskStats`.
    - [ ] Subtask: Create `StatsSummary` sub-component to render the "Today vs Total" view.
    - [ ] Subtask: Integrate into the main stats page layout.
- [ ] Task: Conductor - User Manual Verification 'Frontend Implementation' (Protocol in workflow.md)
