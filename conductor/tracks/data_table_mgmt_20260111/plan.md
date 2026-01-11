# Plan: Data Table Management (CRUD) for Project Review

## Phase 1: Backend Infrastructure & Security
- [ ] Task: Configure Administrator Access
    - [ ] Subtask: Define `ADMIN_EMAILS` environment variable in `.env.local`.
    - [ ] Subtask: Create a middleware or utility to check for admin privileges.
- [ ] Task: Implement Base Admin Actions
    - [ ] Subtask: Create `src/actions/admin-core.ts` to house generic or shared admin utilities.
- [ ] Task: Conductor - User Manual Verification 'Backend Infrastructure & Security' (Protocol in workflow.md)

## Phase 2: User Management CRUD
- [ ] Task: Implement User Data Actions
    - [ ] Subtask: Write tests for User CRUD operations.
    - [ ] Subtask: Implement `getUsers`, `createUser`, `updateUser`, and `deleteUser` Server Actions.
- [ ] Task: Build User Management UI
    - [ ] Subtask: Create `src/app/admin/users/page.tsx` with a searchable data table.
    - [ ] Subtask: Implement Add/Edit User Modals.
- [ ] Task: Conductor - User Manual Verification 'User Management CRUD' (Protocol in workflow.md)

## Phase 3: Account & Session Management
- [ ] Task: Implement Account CRUD
    - [ ] Subtask: Write tests for Account CRUD operations.
    - [ ] Subtask: Implement Server Actions for Account management.
    - [ ] Subtask: Create `src/app/admin/accounts/page.tsx`.
- [ ] Task: Implement Session & Token Management
    - [ ] Subtask: Write tests for Session/Token CRUD operations.
    - [ ] Subtask: Implement Server Actions for Session and VerificationToken management.
    - [ ] Subtask: Create `src/app/admin/sessions/page.tsx` and `src/app/admin/tokens/page.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Account & Session Management' (Protocol in workflow.md)

## Phase 4: Integration & Navigation
- [ ] Task: Implement Admin Dashboard Home
    - [ ] Subtask: Create `src/app/admin/page.tsx` as a navigation hub for all management tables.
- [ ] Task: Final Quality Audit
    - [ ] Subtask: Verify mobile responsiveness for all admin tables.
    - [ ] Subtask: Ensure all sensitive data is masked or handled securely in the UI.
- [ ] Task: Conductor - User Manual Verification 'Integration & Navigation' (Protocol in workflow.md)
