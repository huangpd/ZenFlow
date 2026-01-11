# Plan: Bugfix: Incomplete Sutra Content in Tasks

## Phase 1: Diagnosis & Fix
- [x] Task: Investigate Data Flow (Completed)
    - [ ] Subtask: Analyze `src/actions/tasks.ts` (createTask).
    - [ ] Subtask: Analyze `src/components/SutraReader.tsx` (fetch logic).
- [x] Task: Fix Implementation (Completed)
    - [ ] Subtask: Ensure `SpiritualTask` stores `sutraId`.
    - [ ] Subtask: Ensure `SutraReader` uses `sutraId` to fetch fresh content from `Sutra` table, not `task.text` or static/cached data.
- [x] Task: Conductor - User Manual Verification 'Diagnosis & Fix' (Protocol in workflow.md) (checkpoint: 490764d)
