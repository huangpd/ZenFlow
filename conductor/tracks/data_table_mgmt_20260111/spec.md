# Specification: Data Table Management (CRUD) for Project Review

## 1. Overview
Implement a comprehensive administrative interface to manage the core data tables of the ZenFlow project. This will facilitate data auditing, testing, and maintenance of user-related and authentication-related information.

## 2. Functional Requirements
- **Table Coverage:** Implement CRUD (Create, Read, Update, Delete) operations for the following tables:
    - User
    - Account
    - Session
    - VerificationToken
- **Granular Management:**
    - Provide a list view for each table with search/filtering capabilities.
    - Provide forms to create new records or edit existing ones.
    - Allow deletion of records for cleanup purposes.
- **Organization:** 
    - Create dedicated sub-pages for each table under the `/admin` route (e.g., `/admin/users`, `/admin/accounts`, etc.).
- **Access Control:**
    - Restrict access to these pages to a specific list of administrator emails (hardcoded in the system/env).
    - Redirect unauthorized users to the login page or a "Forbidden" page.

## 3. Non-Functional Requirements
- **Security:** Ensure sensitive fields like password hashes are handled with care (e.g., masked in UI or requiring explicit confirmation for changes).
- **UI/UX:** Maintain the "Zen Minimalist" aesthetic consistent with the rest of the application.
- **Consistency:** Use standardized Server Actions for all database operations to ensure type safety and error handling.

## 4. Acceptance Criteria
- Admin users can successfully list, view, create, edit, and delete records in all specified tables.
- Non-admin users are strictly blocked from accessing any management routes.
- Changes in the admin panel are immediately reflected in the database.

## 5. Out of Scope
- Management of Spiritual Practice tables (SpiritualTask, TaskLog, etc.) - to be handled in a separate track if needed.
- Bulk data export/import features.
