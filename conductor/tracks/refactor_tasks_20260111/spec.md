# Specification: Refactor: Unique Tasks & Dynamic Sutra DB

## 1. Overview
Refactor the spiritual task system to ensure tasks are unique per user (no duplicate "Heart Sutra" tasks), migrate static sutra content to a dynamic database table, and simplify the task creation UX by removing step configuration for sutra tasks.

## 2. Goals
- **Unique Tasks:** A user cannot have two active tasks with the same name/definition. Adding an existing task should be blocked or handled gracefully.
- **Dynamic Sutra DB:** Move sutra content from `constants.tsx` to a new `Sutra` table in PostgreSQL to support long texts and dynamic updates.
- **Simplified UX:** Remove "Step Size" configuration for Sutra tasks (default to 1). Fetch available tasks from the database instead of hardcoded presets.

## 3. Database Changes
- **New Model:** `Sutra` (id, title, content, description, category).
- **Update Model:** `SpiritualTask` should link to `Sutra` (optional).
- **Constraints:** Ensure uniqueness of tasks for a user (e.g., composite unique key on `userId` + `text` or `sutraId`).

## 4. Logic Changes
- **Create Task:** Check existence before creation.
- **Read Sutra:** Fetch content from DB based on `sutraId`.
- **Seed:** Migration script to populate initial Sutras.
