# Refactoring & Modernization Guidelines

## Core Philosophy
- **Modernize Infrastructure, Preserve Logic:** The primary goal is to migrate the technical foundation to a modern full-stack architecture (Next.js) while strictly maintaining the existing business logic and user flows unless explicitly improved.
- **Component-First Architecture:** Break down monolithic logic into reusable, strictly typed React components.

## Modernization Standards

### Framework & Architecture
- **Next.js App Router:** Use the App Router (`app/` directory) for routing and layouts.
- **Server Components:** Prioritize Server Components for data fetching and static content. Use Client Components (`"use client"`) only when interactivity is required.
- **API Routes:** Migrate backend logic to Next.js API Routes (or Server Actions) to encapsulate server-side logic securely.

### State Management & Data
- **React Hooks:** Use modern hooks (`useState`, `useReducer`, `useContext`) and custom hooks to encapsulate logic. Avoid class components.
- **Data Fetching:** Use `fetch` with caching or established libraries (like SWR or React Query) for client-side fetching.
- **Database Access:** Use strictly typed ORM (Prisma/Drizzle) queries. Do not write raw SQL unless necessary for performance.

### Styling
- **Tailwind CSS:** Use Tailwind CSS for styling. Avoid CSS modules or global CSS files where possible.
- **Responsive Design:** Ensure all components are mobile-first and fully responsive.

## Refactoring Constraints

### Logic Preservation
- **Behavioral Parity:** The refactored application must behave exactly as the original regarding core features (e.g., meditation flows, tracking algorithms) unless a bug fix is applied.
- **Test-Driven Refactoring:** Where possible, ensure tests cover existing logic before refactoring to guarantee no regression.

### Migration Strategy
- **Incremental Migration:** Migrate feature by feature (e.g., Auth first, then Tracking, then Chat) rather than a "big bang" rewrite if possible.
- **Type Safety:** Ensure strict TypeScript types are applied during the migration of any `.js` or loose `.ts` files.
