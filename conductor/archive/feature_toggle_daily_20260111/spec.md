# Specification: Toggle Daily Homework Status

## Overview
Allow users to toggle the "Daily Homework" (`isDaily`) status of a task directly from the Task Card. This ensures tasks can be easily converted between one-off and recurring daily tasks without recreating them. The change should be autosaved immediately.

## Functional Requirements

### 1. Task Card UI
- Display a "Daily" indicator/toggle on the Task Card (e.g., a Star or Calendar icon).
- Visual state:
    - **Active (Daily):** Highlighted/Filled (e.g., Yellow/Gold Star).
    - **Inactive (One-off):** Gray/Outline.
- Interaction: Clicking the icon toggles the state and saves immediately.

### 2. Backend Action
- Implement `updateTask` server action in `src/actions/tasks.ts`.
- Support updating `isDaily` field.
- Ensure security (user owns the task).
- Revalidate dashboard path.

## Acceptance Criteria
- [ ] Clicking the toggle icon on a task updates the database `isDaily` field.
- [ ] The UI reflects the new state immediately (optimistic) or after update.
- [ ] One-off tasks are removed on daily reset (existing logic), Daily tasks are reset. Toggling ensures correct behavior for next reset.

## Out of Scope
- Editing other task fields (text, target) via this specific toggle (Text editing handled separately).
