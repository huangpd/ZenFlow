# Plan: Core Features Migration: AI Companion & Spiritual Tools

## Phase 1: Database Modeling & Migration [checkpoint: 66bd8f3]
- [x] Task: Define Spiritual Data Models (e2c8a29)
    - [ ] Subtask: Update `prisma/schema.prisma` to include `JournalEntry`, `ChatMessage`, and `UserPreference` models.
    - [ ] Subtask: Run migrations (`npx prisma migrate dev`).
    - [ ] Subtask: Update `src/lib/db.ts` or create new data access utilities if needed.
- [x] Task: Conductor - User Manual Verification 'Database Modeling & Migration' (Protocol in workflow.md)

## Phase 2: AI Service Integration [checkpoint: 751c18c]

- [x] Task: Implement Gemini Service (Server-Side) (6e7e369)

    - [ ] Subtask: Create `src/lib/ai/gemini.ts` to encapsulate Google GenAI logic.

    - [ ] Subtask: Securely load `GEMINI_API_KEY` from environment variables.

    - [ ] Subtask: Create a Server Action `generateGuidance` to call Gemini.

- [x] Task: Implement Chat Interface (751c18c)

    - [ ] Subtask: Create `src/components/ChatInterface.tsx` (Client Component).

    - [ ] Subtask: Implement the UI for sending messages and displaying responses (streaming support recommended).

    - [ ] Subtask: Integrate with `generateGuidance` Server Action.

- [x] Task: Conductor - User Manual Verification 'AI Service Integration' (Protocol in workflow.md)

## Phase 3: Journaling & User Progress [checkpoint: 336193c]
- [x] Task: Implement Journaling Feature (df3ea1b)
    - [ ] Subtask: Create UI for writing journal/diary entries.
    - [ ] Subtask: Implement Server Actions for CRUD operations on `JournalEntry`.
    - [ ] Subtask: Display past entries on the Dashboard.
- [x] Task: Port UI Effects & Polish (8f2185e)
    - [ ] Subtask: Port `CelebrationEffect` component.
    - [ ] Subtask: Apply "Zen Minimalist" styling globally.
- [x] Task: Conductor - User Manual Verification 'Journaling & User Progress' (Protocol in workflow.md)
