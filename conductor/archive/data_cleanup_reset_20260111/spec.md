# Specification: Maintenance: Data Cleanup & Daily Progress Reset

## 1. Overview
Perform a one-time cleanup of practice data (TaskLogs, MeditationSessions) and implement a mechanism to automatically reset daily task progress at midnight (00:00).

## 2. Goals
- **Data Cleanup:** Provide a script or action to clear `TaskLog` and `MeditationSession` tables.
- **Daily Reset:** Ensure that every day at 00:00, all `SpiritualTask` progress (`current`) is set back to 0 and `completed` is set to `false`.
- **Implementation Approach:**
    - For the manual cleanup: A one-time script.
    - For the daily reset: Since this is a serverless-friendly Next.js app, we will use "Lazy Reset" logic. When a user fetches their tasks, the system checks if the tasks were last updated on a previous day. If so, it resets them before returning.

## 3. Detailed Requirements
- **Cleanup:** Clear all rows in `TaskLog` and `MeditationSession`.
- **Reset Logic:** 
    - Update the `getTasks` action.
    - Before returning tasks, check if `new Date().toLocaleDateString()` matches the date of the latest task update or a stored "last reset" timestamp.
    - If it's a new day, update all user's tasks: `current: 0, completed: false`.
