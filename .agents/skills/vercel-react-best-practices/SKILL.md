---
name: vercel-react-best-practices
description: Official React and Next.js Best Practices from Vercel. Covers React Server Components (RSC), Client Component boundaries, data fetching patterns, Suspense streaming, optimistic updates, Server Actions, memory leak avoidance, and bundle size optimization.
---

# Vercel React & Next.js Best Practices

Technical guide for writing high-performance, maintainable React 19 and Next.js applications based on Vercel engineering standards.

---

## 1. Server vs Client Component Architecture

- **Default to Server Components**: Keep components as Server Components by default to reduce client JavaScript bundle size and fetch data directly from databases/APIs without client waterfalls.
- **Push `'use client'` to the Leaves**: Only add `'use client'` at the lowest possible component tree nodes that require browser APIs (e.g. event listeners, `useState`, `useEffect`, camera/audio access).
- **Pass Server Components as Children**: When a Client Component needs to wrap complex layouts, pass Server Components via `children` rather than importing them directly into the client boundary.

---

## 2. Data Fetching & Caching

- **Colocate Data Fetching**: Fetch data in the Server Component where it is consumed to eliminate prop drilling.
- **Eliminate Waterfalls**: Use `Promise.all()` to initiate parallel queries when data sources are independent.
- **Streaming SSR with Suspense**: Wrap slow or dynamic components in `<Suspense fallback={<Skeleton />}>` to deliver instant Initial Server Response (TTFB) while data streams in.

---

## 3. Mutations & Server Actions

- **Server Actions for Form Mutations**: Use Server Actions (`'use server'`) with `useActionState` and `useFormStatus` for progressive enhancement.
- **Optimistic UI Updates**: Use `useOptimistic()` to render immediate visual feedback on the UI before the server mutation finishes round-tripping.
- **Granular Revalidation**: Call `revalidatePath('/path')` or `revalidateTag('tag')` immediately after mutating data to update cache tags accurately.

---

## 4. Performance & Bundle Optimization

- **Dynamic Imports**: Use `next/dynamic` with `{ ssr: false }` for heavy client-only libraries (e.g. QR scanners, chart engines, rich text editors).
- **Image Optimization**: Use Next.js `<Image>` with explicit `width`, `height`, and modern formats (WebP/AVIF) with `priority` on above-the-fold hero assets.
- **Avoid Stale State & Memory Leaks**: Always clean up event listeners, timers, and Web Audio/MediaStream contexts in `useEffect` return cleanup handlers.
