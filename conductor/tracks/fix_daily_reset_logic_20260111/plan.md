# Implementation Plan - Fix Daily Reset Logic

## Phase 1: Fix Logic
- [x] Task: Create Reproduction Test
  - [x] Sub-task: Create a test case simulating a mix of old and new tasks.
  - [x] Sub-task: Verify that current logic deletes/resets the new tasks (fail).
- [x] Task: Update `getTasks` Implementation 
  - [x] Sub-task: Add `updatedAt` filter to `deleteMany` and `updateMany`.
- [x] Task: Verify Fix
  - [x] Sub-task: Run the reproduction test and ensure it passes.
- [x] Task: Conductor - User Manual Verification 'Fix Logic' (Protocol in workflow.md)
