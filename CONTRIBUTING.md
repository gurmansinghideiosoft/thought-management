# Frontend — development notes

Next.js 16 (App Router) + React 19 + Tailwind v4. The data layer is entirely
client-side: RTK Query over a shared axios instance. Almost every page is a
Client Component.

> Next 16 renamed `middleware.ts` → `proxy.ts`, and route `params` is now a
> `Promise`. Auth here is a **client guard** (localStorage tokens can't be read
> server-side), so there is no `proxy.ts`.

## Run it

```bash
npm run dev        # http://localhost:3000 by default — start the backend on
                   # a different port, or run: PORT=3001 npm run dev
```

`.env.local` → `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3000/api`).
The backend must allow this origin via its `CORS_ORIGIN`.

| Command                                       |                                     |
| --------------------------------------------- | ----------------------------------- |
| `npm run dev` / `npm run build` / `npm start` | Next.js                             |
| `npm run typecheck`                           | `tsc --noEmit`                      |
| `npm run lint`                                | ESLint (next config)                |
| `npm run format` / `format:check`             | Prettier (+ tailwind class sorting) |

## Layout

```
src/
  app/
    layout.tsx           root — fonts + <Providers>
    providers.tsx        Redux store (one per client) + <ToastProvider>
    page.tsx             redirects to /thoughts or /login
    (auth)/              login, register — bounce to /thoughts if already in
    (app)/               layout = AuthGuard + <AppShell>; thoughts, activity, trash
  lib/
    api/axios.ts         axios instance: attaches Bearer; on 401 → single-flight
                         refresh → replay; on refresh failure → hard /login
    api/baseQuery.ts     RTK Query baseQuery over that axios instance
    api/api.ts           every endpoint + cache tags; timeline & activity are
                         `infiniteQuery` (a "next page" = older entries)
    auth/tokenStore.ts   the only module that touches localStorage
    auth/authSlice.ts    { user, status }
    auth/useSession.ts   bootstraps /auth/me, exposes signOut
    store.ts, hooks.ts, cn.ts, format.ts, types.ts
  components/
    ui/                  Button, Input, Dialog, Dropdown, Toast, misc (Card, Spinner…)
    layout/              AppShell (sidebar), PageHeader
    thoughts/ entries/ tags/   feature components
```

## Conventions

- New API call → add an endpoint in `api/api.ts` with precise `providesTags` /
  `invalidatesTags`; never call `axios`/`fetch` from a component.
- Anything reading `localStorage`, `window`, or using hooks/effects needs
  `'use client'`.
- Mutations surface errors with `toast.error(errorMessage(err, '…'))`.
- Styling: Tailwind utilities only, theme tokens from `globals.css`
  (`bg-canvas`, `text-ink`, `border-border`, `text-accent`, …). Keep the
  reading column at `reading-column`.
