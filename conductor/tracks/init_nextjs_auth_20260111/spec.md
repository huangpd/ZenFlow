# Specification: Initialize Next.js Full-Stack Architecture & Auth

## 1. Overview
This track focuses on establishing the foundational architecture for the modernized ZenFlow application. It involves initializing a Next.js full-stack project, configuring the database and ORM, and implementing a robust authentication system to support future multi-user features.

## 2. Goals
- Set up a Next.js 14+ (App Router) project with TypeScript and Tailwind CSS.
- Configure PostgreSQL database connectivity using Prisma ORM.
- Implement authentication using Auth.js (NextAuth.js) supporting credential/email login initially (extensible to OAuth).
- Ensure the environment is ready for migrating existing business logic.

## 3. User Stories
- **As a developer**, I want a configured Next.js environment so that I can start building full-stack features.
- **As a developer**, I want a database connection set up so I can model user and app data.
- **As a user**, I want to be able to sign up and log in so that my progress can be saved securely.

## 4. Technical Requirements
- **Framework:** Next.js (latest stable)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Local Docker instance or cloud provider for dev)
- **ORM:** Prisma
- **Auth:** Auth.js (v5 beta or v4 stable depending on Next.js compatibility)
- **Testing:** Jest + React Testing Library (setup only)

## 5. Out of Scope
- Migration of existing "CelebrationEffect" or specific meditation logic (reserved for future tracks).
- Implementation of Google/Apple/WeChat login providers (infrastructure setup only; actual API keys/integration in later refinement).
- Mobile/Mini-program specific code.
