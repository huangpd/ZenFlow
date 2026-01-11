# Specification: Fix Daily Task Reset Logic

## Overview
The current `getTasks` implementation has a critical flaw. When a reset is triggered (by detecting *any* task from a previous day), it executes `deleteMany` and `updateMany` without filtering by `updatedAt`. This means if a user has a mix of old and new tasks, the new tasks (created/updated today) will also be deleted (if one-off) or reset (if daily), causing data loss.

## Functional Requirements

### 1. Targeted Deletion
- Only delete one-off tasks (`isDaily: false`) that were last updated *before* today (00:00 local time).

### 2. Targeted Reset
- Only reset daily tasks (`isDaily: true`) that were last updated *before* today (00:00 local time).

### 3. Trigger Mechanism
- The trigger condition (`findFirst` with `updatedAt < today`) is correct for *detecting* the need, but the *actions* must be scoped.

## Technical Details
- Modify `src/actions/tasks.ts`.
- Use `today` (Start of Day) timestamp for filtering.
- Ensure timezones are handled consistently (using `new Date().setHours(0,0,0,0)` uses server local time, which is acceptable for MVP, but consistent with the check).

## Acceptance Criteria
- [ ] Old one-off tasks are deleted.
- [ ] New one-off tasks (created today) are PRESERVED.
- [ ] Old daily tasks are reset.
- [ ] New daily tasks (completed/updated today) are PRESERVED (progress kept).
