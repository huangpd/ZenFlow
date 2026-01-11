# Specification: AI Connectivity Fix: Integrate OpenRouter

## 1. Overview
Due to network restrictions preventing direct access to Google Gemini API, this track migrates the AI service to use OpenRouter as a proxy. OpenRouter provides an OpenAI-compatible API that is more accessible in restricted network environments.

## 2. Goals
- Switch from `@google/genai` SDK to standard `fetch` calls to OpenRouter.
- Use `google/gemini-2.0-flash-exp:free` model.
- Maintain existing function signatures (`getSutraInsight`, `getDailyGuidance`, `generateChatResponse`) to avoid breaking UI.

## 3. Technical Requirements
- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Auth:** Bearer Token via `OPENROUTER_API_KEY`.
- **Model:** `google/gemini-2.0-flash-exp:free`.
