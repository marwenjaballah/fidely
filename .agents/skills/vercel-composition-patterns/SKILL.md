---
name: vercel-composition-patterns
description: Vercel Component Composition Patterns for React & Next.js. Covers Radix UI primitive composition, compound components, polymorphic components (asChild), slot patterns, headless UI patterns, and scalable design system architecture.
---

# Vercel Component Composition Patterns

Architecture standards for building composable, headless, and scalable UI component systems with Radix UI, Tailwind CSS, and shadcn-style patterns.

---

## 1. The Slot & `asChild` Polymorphic Pattern

- **Radix Slot Primitive**: Use `@radix-ui/react-slot` to allow components to merge their props and styles onto their child element without adding unnecessary DOM wrapper `<div>` tags.
- **Example Implementation**:
  ```tsx
  import { Slot } from '@radix-ui/react-slot';

  interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
  }

  export function Button({ asChild = false, className, ...props }: ButtonProps) {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ className }))} {...props} />;
  }
  ```
- **Usage with Next.js Link**:
  ```tsx
  <Button asChild>
    <Link href="/dashboard">Go to Dashboard</Link>
  </Button>
  ```

---

## 2. Compound Component Architecture

- Group related logic and DOM structure into self-contained, composable sets of components that communicate via React Context.
- **Example**:
  - `<Card>`
    - `<CardHeader>`
      - `<CardTitle>`
      - `<CardDescription>`
    - `<CardContent>`
    - `<CardFooter>`
- **Benefits**:
  - Full control over markup layout.
  - Zero bloated monolith prop lists (`headerTitle`, `headerSubtitle`, `showFooterButtons`, etc.).

---

## 3. Headless UI Separation (State vs Styling)

- Separate behavior (keyboard navigation, ARIA tags, focus trapping) from appearance (Tailwind classes).
- Use Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`) as unstyled logic foundations, then apply design system tokens via Tailwind `cn(...)`.

---

## 4. Controlled vs Uncontrolled Flexibility

- Support both controlled state (`value` + `onValueChange`) and uncontrolled state (`defaultValue`) in reusable inputs, tabs, and selectors.
- Provide custom hooks (e.g. `useControllableState`) to streamline dual-mode behavior.
