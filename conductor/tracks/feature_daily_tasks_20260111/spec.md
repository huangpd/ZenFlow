# Specification: Feature: Selective Daily Tasks & Persistence Logic

## 1. Overview
Allow users to specify if a task is a "Daily Task" (recurring) or a one-off task. Implement logic to automatically reset daily tasks at midnight while removing non-daily tasks.

## 2. Goals
- **Granular Control:** User chooses recurrence at the time of claiming.
- **Automated Cleanup:** Midnight logic handles both reset (for recurring) and deletion (for one-off).
- **Empty State:** New users or a new day starts with only the selected daily tasks.

## 3. Implementation
- **Schema:** Add `isDaily` Boolean field to `SpiritualTask`.
- **Action `createTask`:** Accept `isDaily` parameter.
- **Action `getTasks`:** 
    - Check if reset is needed (new day).
    - If yes:
        - `deleteMany` where `isDaily = false`.
        - `updateMany` where `isDaily = true` -> `current = 0, completed = false`.
- **UI:** Toggle button in `AddTaskModal`.
