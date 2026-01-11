# Specification: Core Features Migration: AI Companion & Spiritual Tools

## 1. Overview
This track focuses on migrating the core functionality of ZenFlow (ZenPath) from the legacy Vite/React codebase to the new Next.js full-stack architecture. It involves integrating the Google Gemini AI service, implementing the chat interface, and migrating the data model from LocalStorage to the new PostgreSQL database.

## 2. Goals
- **Migrate AI Service:** Port `geminiService.ts` to a server-side robust implementation (using API Routes/Server Actions) to secure API keys.
- **Implement Chat Interface:** Recreate the spiritual companion chat UI using React 19/Next.js conventions (Server Components for initial load, Client Components for interaction).
- **Migrate Data Models:**
    - Convert legacy "DiaryEntry" and "Task" concepts to Prisma models (`JournalEntry`, `SpiritualTask`).
    - Implement CRUD operations using Server Actions.
- **Restore UI Effects:** Port the `CelebrationEffect` and other visual elements.
- **Ensure Feature Parity:** The new app should offer the same or better experience as the legacy version.

## 3. User Stories
- **As a user**, I want to chat with the AI spiritual companion so that I can receive guidance and support.
- **As a user**, I want my chat history and journal entries to be saved to my account so I can access them from any device.
- **As a user**, I want to see visual celebrations when I complete a task or milestone.

## 4. Technical Requirements
- **AI Integration:** Google Generative AI SDK (Server-side execution).
- **Database:** Prisma models for `JournalEntry`, `ChatMessage`, `UserPreference`.
- **State Management:** React Hooks / Context for chat state.
- **Styling:** Tailwind CSS (matching the existing "Zen Minimalist" style).
- **Security:** Ensure API keys are never exposed to the client.

## 5. Out of Scope
- Mobile App specific features (React Native).
- Advanced multi-modal (image/audio) AI inputs (unless already present in legacy).
