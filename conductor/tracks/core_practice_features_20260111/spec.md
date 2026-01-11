# Specification: Core Features: Daily Practice, Meditation & Analytics

## 1. Overview
This track implements the advanced spiritual practice features of ZenFlow, focusing on daily rituals, meditation support, enhanced journaling with AI imagery, and data analytics.

## 2. Daily Practice System (定课系统)
- **Task Types:**
    - **Standard:** Simple checkbox (e.g., Offering incense).
    - **Counter:** Tally-based (e.g., Mantras 108 times). Custom step size (e.g., +108 per click).
    - **Sutra Reading:** Integrated reader for "Heart Sutra", "Diamond Sutra".
- **AI Integration:** "Sutra Insight" (禅意开解) using Gemini to explain text in modern context.
- **Persistence:** Sync to PostgreSQL database (priority) with potential local caching.

## 3. Meditation Timer (禅坐计时器)
- **UI:** Immersive, dynamic circular progress bar breathing with the countdown.
- **Settings:** Presets (10/25/45/60 mins).
- **Audio:** Simulated "Zen Bell" (磬/铃) sound on completion.
- **Tracking:** Duration syncs to daily progress stats.

## 4. Enhanced Journaling (多维日记)
- **Categories:** Insight (感悟), Charity (布施), Offering (供僧), Life Release (放生), Dharma Sharing (法施).
- **AI Visuals:** Generate "Minimalist Chinese Ink Wash Painting" (极简中国写意水墨画) from entry text using Gemini Image model.
- **Search & Review:** Full-text search and timeline review mode.

## 5. Analytics & Heatmap (数据复盘)
- **Practice Heatmap:** GitHub-style contribution graph based on meditation time, task completion, and journal entries.
- **Dynamic Weighting:** Shades of green/grey (0-4 levels) based on daily intensity.
- **AI Daily Wisdom:** Personalized daily encouragement based on recent stats.

## 6. Technical Requirements
- **Database:** Expand `SpiritualTask` and `JournalEntry` models. Add `MeditationSession`.
- **Audio:** HTML5 Audio API for bell sounds.
- **AI:** Use OpenRouter for text (Gemini Pro) and image generation (Gemini Flash Image).
- **Charts:** Use `recharts` or custom SVG for the heatmap.
