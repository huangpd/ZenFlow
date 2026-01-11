# Implementation Plan - Dynamic Admin Dashboard

## Phase 1: Security & Setup
- [x] Task: Admin Access Control 0defe19
  - [x] Sub-task: Add `ADMIN_EMAILS` to `.env` and `types.ts`.
  - [x] Sub-task: Create a utility function `isAdmin(email: string)` to check permissions.
  - [x] Sub-task: Create `admin-layout` or middleware logic to protect `/admin` routes.
- [x] Task: Schema Introspection Setup 402aa2a
  - [x] Sub-task: Generate a schema metadata utility (or script) that maps Prisma models to field names, types, and relations.
  - [x] Sub-task: Verify the metadata output covers all current models.
- [x] Task: Conductor - User Manual Verification 'Security & Setup' (Protocol in workflow.md)

## Phase 2: Dynamic Core UI
- [x] Task: Admin Layout & Navigation a3bddd4
  - [x] Sub-task: Create `/app/admin/layout.tsx` with a sidebar listing all models dynamically.
  - [x] Sub-task: Ensure the sidebar is responsive.
- [x] Task: Dynamic Table View f2e8a42
  - [x] Sub-task: Implement `/app/admin/data/[model]/page.tsx`.
  - [x] Sub-task: Create a generic server action `fetchModelData(modelName, page, limit)` using generic Prisma calls.
  - [x] Sub-task: Render the data in a responsive table component.
- [x] Task: Conductor - User Manual Verification 'Dynamic Core UI' (Protocol in workflow.md)

## Phase 3: Dynamic Forms & Actions
- [x] Task: Delete Action a336073
  - [x] Sub-task: Implement delete button with confirmation modal.
  - [x] Sub-task: Create generic server action `deleteRecord(model, id)`.
- [x] Task: Dynamic Form Component 916c566
  - [x] Sub-task: Create a `DynamicForm` component that accepts schema metadata.
  - [x] Sub-task: Implement inputs for basic types (Text, Number, Boolean, Date).
  - [x] Sub-task: Implement relation picker (Dropdown) for foreign keys (fetching ID + display field).
- [x] Task: Create & Update Actions 1c11b36
  - [x] Sub-task: Create generic server action `createRecord(model, data)`.
  - [x] Sub-task: Create generic server action `updateRecord(model, id, data)`.
  - [x] Sub-task: Wire up `DynamicForm` to these actions.
- [x] Task: Conductor - User Manual Verification 'Dynamic Forms & Actions' (Protocol in workflow.md)

## Phase 4: Refinement & Testing
- [x] Task: Error Handling & Validation 6048725
  - [x] Sub-task: Add basic error messages for constraint violations (e.g., unique fields).
  - [x] Sub-task: Ensure invalid data types are caught before submission.
- [x] Task: Integration Testing
  - [x] Sub-task: Manually verify CRUD for complex models like `JournalEntry` (relations) and `User` (basic).
  - [x] Sub-task: Verify security prevents non-admin access.
- [x] Task: Conductor - User Manual Verification 'Refinement & Testing' (Protocol in workflow.md)
