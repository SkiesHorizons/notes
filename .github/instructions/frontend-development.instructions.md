---
applyTo: "app/**"
description: "Frontend development instructions for GitHub Copilot"
---

# Frontend Development Instructions

## Frontend Folder Structure (`app/`)

```
app/
├── src/                # Frontend source code
│   ├── components/     # Reusable UI components
│   ├── routes/         # TanStack routes and pages
│   │   ├── (app)/      # Main application routes with authenticated
│   │   ├── (auth)/     # Authentication routes (login, signup, etc.)
│   ├── lib/            # Business logic and utilities
│   │   ├── supabase/   # Supabase client and utilities
│   │   ├── models/     # TypeScript models and interfaces
│   │   ├── mappers/    # Data mappers and transformers
│   │   ├── queries/    # TanStack queries and mutations
│   │   ├── stores/     # TanStack stores for state management
│   ├── ...             # Other frontend directories (styles, assets, etc.)
```

## Tools and Libraries

- **Language:** TypeScript
- **Framework:** React
- **UI Library:** Mantine (`@mantine/core` and `@mantine/hooks`)
- **Icons:** Tabler Icons (`@tabler/icons-react`)
- **Routing:** TanStack Router (`@tanstack/react-router`)
- **State Management:** TanStack Stores (`@tanstack/react-store`)
- **Data Fetching:** TanStack Queries (`@tanstack/react-query`)
- **Backend service:** Supabase (`@supabase/supabase-js` for client-side operations), including authentication and
  database operations
- **Build Tool:** Vite
- **Package Manager:** `bun`, for building and running the application

## TypeScript Guidelines

- Use TypeScript for all new code.
- DO NOT use `any` type; prefer `unknown` or specific types.
- Prefer using `index.ts` to re-export modules for cleaner imports.
- Prefer `function` over arrow function for defining functions.
- Avoid using `export default` for modules; use named exports instead.
- Group related interfaces and types in a single file when possible.

## React Component Guidelines

- Use functional components with hooks as the primary pattern.
- Use TypeScript interfaces for component props.
- Each component should have its own directory with an `index.ts` file for exports.
- Use `useMemo` and `useCallback` to optimize performance where necessary.

### Do and Don't

```tsx
// my-component/my-component.tsx
// ✅ Good - Using functional component and TypeScript interface for props
import { Box, Button, Text } from "@mantine/core"

interface MyComponentProps {
  title: string
  onClick: () => void
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <Box>
      <Text>{title}</Text>
      <Button onClick={onClick}>Click Me</Button>
    </Box>
  )
}

// ❌ Bad - Using class component, type `any`, and no TypeScript interface
type MyComponentProps = {
  title: any
  onClick: any
}

export class MyComponent extends React.Component<MyComponentProps> {
  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <button onClick={this.props.onClick}>Click Me</button>
      </div>
    )
  }
}
```
