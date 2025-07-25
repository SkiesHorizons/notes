---
applyTo: "**"
description: Generate Copilot instructions for SkiesHorizons Notes project
---

# Copilot Instructions

SkiesHorizons Notes is a simple note-taking application designed to be cross-platform, leveraging Tauri for desktop and
mobile applications. The project uses Supabase for backend services, including database management and authentication.

## Code Style

- Use TypeScript for all new code.
- Follow consistent naming conventions:
    - Use `camelCase` for variables and functions.
    - Use `PascalCase` for classes and interfaces.
    - Use `UPPER_CASE` for constants.
    - Use `kebab-case` for file names (e.g., `my-component.tsx`).
- Use meaningful names for variables, functions, and classes.
- Write clear and concise comments where necessary.

## Architecture

- **Frontend**: Use React with TypeScript, leveraging Tauri for desktop and mobile applications.
- **Backend**: Use Supabase for database management and authentication.

## Project Structure

- `app`: Contains main application code.
    - `src`: Contains frontend source code using React
    - `src-tauri`: Contains Tauri-specific code for building desktop and mobile applications.
- `supabase`: Contains the Supabase configuration and migrations.
    - `migrations`: Contains database migration files.

## Development Standards

- Follow single responsibility principle for components, services, and utilities.
- Separate concerns of UI and business logic.
- Apply clean code principles:
    - Keep functions small and focused.
    - Avoid deep nesting of code.
    - Use early returns to reduce complexity.
- UI should be responsive and accessible, following best practices for web accessibility (WCAG).
