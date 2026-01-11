# Plan: Core Features: Daily Practice, Meditation & Analytics

## Phase 1: Daily Practice & Sutra System
- [x] Task: Database Schema Expansion (828c487)
    - [ ] Subtask: Add `SpiritualTask`, `TaskLog`, `MeditationSession` models to Prisma.
    - [ ] Subtask: Update `JournalEntry` to support categories and image URLs.
    - [ ] Subtask: Run migrations.
- [x] Task: Daily Task UI & Logic (63c5557)
    - [ ] Subtask: Create `TaskConfig` UI for setting up daily routines.
    - [ ] Subtask: Implement `TaskCounter` component with custom step logic.
    - [ ] Subtask: Implement `SutraReader` component with distraction-free mode.
- [~] Task: Conductor - User Manual Verification 'Daily Practice & Sutra System' (Protocol in workflow.md)

## Phase 2: Meditation Timer [checkpoint: ffddd62]
- [ ] Task: Immersive Timer UI
    - [ ] Subtask: Create `BreathingCircle` component (SVG/CSS animation).
    - [ ] Subtask: Implement countdown logic with presets.
    - [ ] Subtask: Integrate audio playback for "Zen Bell".
- [ ] Task: Meditation Session Tracking
    - [ ] Subtask: Save completed sessions to database via Server Action.
- [ ] Task: Conductor - User Manual Verification 'Meditation Timer' (Protocol in workflow.md)

## Phase 3: Analytics ## Phase 3: Analytics & Enhanced Journaling Enhanced Journaling [checkpoint: 654397d]
- [ ] Task: Practice Heatmap
    - [ ] Subtask: Implement data aggregation logic (calculate daily "intensity").
    - [ ] Subtask: Render Heatmap component (similar to GitHub contributions).
- [ ] Task: AI Image Generation for Journal
    - [ ] Subtask: Integrate OpenRouter image generation API.
    - [ ] Subtask: Add "Generate Zen Image" button to Journal editor.
- [ ] Task: Conductor - User Manual Verification 'Analytics & Enhanced Journaling' (Protocol in workflow.md)
