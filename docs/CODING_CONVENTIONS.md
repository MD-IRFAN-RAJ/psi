# Coding Conventions

To maintain a clean, readable, and production-grade codebase, all contributors must adhere to the following standards:

## General Principles
- **Readability Over Cleverness**: Code should be easy to understand for a reviewer or a new intern. Avoid overly complex one-liners.
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into helper functions, custom hooks, or services.
- **YAGNI (You Aren't Gonna Need It)**: Do not overengineer abstractions for future use cases that might never happen.

## Naming Conventions
- **Files & Folders**: 
  - React Components: `PascalCase.tsx` (e.g., `TaskBoard.tsx`)
  - Utility/Hooks/Services: `camelCase.ts` (e.g., `useAuth.ts`, `taskService.ts`)
  - Backend Controllers/Routes: `camelCase.ts` (e.g., `userController.ts`)
- **Variables & Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- **Types & Interfaces**: `PascalCase` (e.g., `TaskResponseDTO`)

## TypeScript Guidelines
- Enable `strict: true` in `tsconfig.json`.
- Do not use `any`. Use `unknown` if the type is truly unknown, or properly type it.
- Use Interfaces for object shapes and Type Aliases for unions/intersections.

## Comments & Documentation
- Add JSDoc comments for complex utility functions, services, and shared hooks to explain *why* something is done, not *what* is done (the code should explain the what).
- Provide API documentation using Swagger decorators or definitions.

## Git & Commits
- Use conventional commits format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(tasks): add task pagination functionality`
