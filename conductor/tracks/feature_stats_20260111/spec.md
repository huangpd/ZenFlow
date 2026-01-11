# Specification: Feature: Detailed Practice Statistics

## 1. Overview
Enhance the "Practice Stats" (精进) page to provide a clear, detailed breakdown of practice counts. Users need to see exactly what they have accomplished "Today" versus "All Time" for each specific task (e.g., "Mantra A: 100 times").

## 2. Goals
- **Today's Stats:** Display a list of tasks performed today with their specific counts (aggregated from `TaskLog`).
- **All-Time Stats:** Display the total cumulative count for each task (from `SpiritualTask.current`).
- **UI:** Integrate this as a prominent section in `PracticeStats.tsx`, using a clean, tabular, or card-based layout matching the Zen Minimalist style.

## 3. Data Logic
- **Today:** Sum `count` from `TaskLog` where `createdAt` is today. Group by `taskId`.
- **All Time:** Query `SpiritualTask` directly for `current` (total) value and `text` (name).

## 4. UI Design
- Two columns or tabs: "今日" (Today) and "累计" (Total).
- List items showing: Icon + Task Name + Count + Unit (times/遍).
