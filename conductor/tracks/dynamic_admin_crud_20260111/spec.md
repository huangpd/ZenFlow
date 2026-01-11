# Specification: Dynamic Admin CRUD Dashboard

## Overview
A secure, generic administrative interface for managing all database tables defined in the project's Prisma schema. This dashboard allows administrators to perform Create, Read, Update, and Delete (CRUD) operations dynamically without writing model-specific pages.

## Functional Requirements

### 1. Dynamic Routing & UI
- Implement a catch-all or dynamic route at `/admin/data/[model]` to handle various tables.
- Automatically generate table headers and form fields by introspecting the Prisma schema or a generated metadata file.

### 2. CRUD Operations
- **Read:** List records for a selected model in a table view with pagination.
- **Create:** Form for adding new records, with inputs tailored to field types (String, Int, Boolean, DateTime).
- **Update:** Edit existing records with pre-filled forms.
- **Delete:** Individual record deletion with a confirmation prompt.

### 3. Relationship Management
- Support for foreign key relationships: When creating or editing records (e.g., a `JournalEntry`), the UI should provide a way to select related records (e.g., a `User`) via dropdowns or searchable inputs.

### 4. Authentication & Authorization
- Restrict access to the `/admin` path.
- Implementation: Use an email allowlist stored in an environment variable `ADMIN_EMAILS` (comma-separated).
- Only authenticated users with matching emails can access the dashboard; others should be redirected or see a 403 error.

## Technical Implementation Details
- **Tech Stack:** Next.js Server Actions, Prisma, Tailwind CSS.
- **Metadata:** Utilize Prisma's client metadata or a generated JSON schema to drive the dynamic UI generation.
- **State Management:** React Server Components for data fetching and Server Actions for mutations.

## Acceptance Criteria
- [ ] A navigation menu listing all available models (User, Sutra, JournalEntry, etc.).
- [ ] Navigating to `/admin/data/User` displays a list of all users.
- [ ] Creating a `JournalEntry` allows selecting a `User` from the database.
- [ ] Non-admin users (emails not in `ADMIN_EMAILS`) are blocked from all `/admin` routes.
- [ ] Basic validation for field types (e.g., numbers only in Int fields).

## Out of Scope
- Advanced data visualization or analytics charts.
- Bulk import/export (CSV/JSON).
- Complex custom UI overrides for specific models (initial version is strictly generic).
