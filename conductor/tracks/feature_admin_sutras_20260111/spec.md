# Specification: Feature: Sutra Management Admin

## 1. Overview
Implement a backend management interface for adding, editing, and deleting Sutras (scriptures) in the database. This allows dynamic expansion of the library without code changes.

## 2. Goals
- **List View:** Display all available sutras.
- **Editor:** Form to add/edit Title, Description, and Content (Textarea).
- **Uniqueness:** Prevent duplicate titles.
- **Security:** In a multi-user app, this would be admin-only. For this personal version, it will be accessible via a specific route.

## 3. Tech Stack
- **Route:** `/admin/sutras`
- **Actions:** CRUD operations for `Sutra` model.
- **UI:** Consistent with Zen Minimalist style but more dense for data management.
