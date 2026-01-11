# Specification: Bugfix: Incomplete Sutra Content in Tasks

## 1. Issue Description
User reports that after modifying a Sutra in the admin panel, adding a task associated with that Sutra results in incomplete content.

## 2. Investigation Goals
- Verify how `SpiritualTask` relates to `Sutra`.
- Check if `SpiritualTask` copies content or references `Sutra`.
- If it references, ensure `SutraReader` fetches the latest content from `Sutra` table.
- If it copies (which it shouldn't for dynamic updates), refactor to reference.

## 3. Expected Behavior
- When a Sutra is updated in Admin, all tasks (new and existing) linked to that Sutra should reflect the updated content immediately.
- `AddTaskModal` should list available Sutras correctly.
- `SutraReader` should display the full, updated content.
