# Specification: Refactor Task Editing with Save Button

## Overview
Currently, the "Daily Homework" (`isDaily`) toggle saves immediately when clicked, which might be confusing or prone to accidental changes. The user wants a more explicit flow where they can set the status and then click a "Save" button. We will integrate this into the existing "Modify" flow of the `TaskCard`.

## Functional Requirements

### 1. Unified Task Editing
- When the user clicks the "Modify" (修改) button on a `TaskCard`:
    - The progress number becomes an input (existing behavior).
    - The "Daily Homework" star/toggle becomes editable but DOES NOT save immediately.
    - A "Save" (保存) button appears.
- The standalone "Star" toggle that autosaves will be removed or deactivated during normal view.

### 2. Explicit Save Interaction
- Clicking "Save":
    - Triggers a backend update for both the `current` progress and the `isDaily` status.
    - Exits the editing state.
    - Provides visual confirmation.

### 3. Backend Support
- Enhance `updateTask` server action to support multiple fields (current, isDaily).
- Ensure progress changes are still logged in `TaskLog` if `current` is updated.

## Acceptance Criteria
- [ ] TaskCard has an editing mode triggered by "Modify".
- [ ] In editing mode, user can toggle "Daily" status without immediate save.
- [ ] Clicking "Save" persists all changes to the database.
- [ ] Progress changes via the save button are correctly logged in `TaskLog`.

## Out of Scope
- Changing task text or target (reserved for future admin or advanced edit).
