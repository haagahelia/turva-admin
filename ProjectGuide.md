# Turva-admin Project Guide

## Purpose

This guide is a handoff for developers who need to continue building the Turva-admin interface.

It focuses on what is already implemented, where the data comes from, how the app is structured, and what still needs to be finished so you do not have to rediscover the codebase each time.

## At A Glance

- Turva-admin is a React single-page application for the TurvaOppi admin team.
- It currently works as a read-focused dashboard for browsing backend data.
- The app uses a shared list component for the current admin views.
- Backend requests are proxied through the Vite development server.
- Write-side workflows (create, edit, delete) are still incomplete.

## Setup

Prerequisites:

- Node.js 20 or newer
- npm

Common commands:

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

The development server uses the proxy defined in [vite.config.ts](vite.config.ts), so requests made to `/api/...` are forwarded to the backend during local development.

## Architecture

The application is organized as a small routed dashboard:

- [src/main.tsx](src/main.tsx) mounts the app inside `BrowserRouter` and loads the global stylesheet.
- [src/App.tsx](src/App.tsx) defines the page shell and the route table.
- [src/components/Sidepanel.tsx](src/components/Sidepanel.tsx) renders the persistent navigation and account area.
- [src/components/EntityList.tsx](src/components/EntityList.tsx) renders the reusable list layout.
- [src/sections/](src/sections) contains the page-level data views.
- [src/hooks/useFetch.ts](src/hooks/useFetch.ts) loads a list from an API endpoint and exposes the data and any error.
- [src/pages/Login.tsx](src/pages/Login.tsx) is the two-step sign-in page.
- [src/auth/](src/auth) holds the session (`AuthProvider`, `useAuth`, `RequireAuth`, storage in `session.ts`).
- [src/api/apiFetch.ts](src/api/apiFetch.ts) is the client for authenticated requests.
- [src/util/Dateparser.ts](src/util/Dateparser.ts) formats timestamps for display.
- [src/test/](src/test) contains the shared test setup and the `mockFetch` helper.

The main design idea is reuse. Each section fetches data, defines its columns, and hands everything to `EntityList`.

## What Exists Today

The current app already provides:

- A persistent left-side navigation menu.
- Route-based views for quizzes, worlds, and crisis team members.
- A reusable table-like component for rendering entity lists.
- Data loading from backend endpoints.
- Error display in each view when a request fails.
- Date formatting for created timestamps.

The current build is best understood as a read-focused admin shell. It is already useful for browsing records, but the write-side workflows are still incomplete.

## Routes

The app currently exposes these routes:

- `/` redirects to `/quizzes`.
- `/quizzes` shows quiz records.
- `/worlds` shows world records.
- `/crisis-team` shows crisis team records.
- Any unknown route currently falls back to `/quizzes`.

## Data Sources

The app reads from the following backend endpoints:

- `/api/quiz`
- `/api/world`
- `/api/crisis-team`

The request pattern is intentionally simple: each section calls the shared `useFetch(url)` hook, which issues a `fetch` call in `useEffect`, checks `response.ok`, converts the response to JSON, and returns `{ data, error }`.

If the backend contract changes, update the relevant section component and the proxy target in [vite.config.ts](vite.config.ts) together.

## Authentication

Every page except `/login` requires a signed-in admin.

1. The admin enters their email and username. `POST /api/auth/login` emails a 6-digit code.
1. The admin enters the code. `POST /api/auth/verify` returns a JWT (valid 3 days).
1. The app calls `GET /api/user/profile` with that token and only continues if `role` is `admin`.

The token and profile are stored in `localStorage` (`turva-admin-session`) so a reload or a new tab stays signed in. An expired token is dropped on load and checked every minute.

For write requests, use `apiFetch` from [src/api/apiFetch.ts](src/api/apiFetch.ts): it adds the `Authorization: Bearer <token>` header, sends JSON, and throws an `ApiError` with the backend's `error` message. If the backend answers 401, the session ends and the login page says the session expired.

To give someone admin access, set `role = 'admin'` for their user in the database (see the turva-back README).

**React Compiler and forms:** read form errors with `useFormState({ control })` from react-hook-form, not `form.formState`. The compiler caches the render and would not show updated errors otherwise.

## Important Components

- `src/App.tsx` sets up the dashboard layout and route handling.
- `src/components/Sidepanel.tsx` renders the main navigation and placeholder profile area.
- `src/components/EntityList.tsx` renders the reusable list layout, headers, row actions, and create button.
- `src/sections/Quizzes.tsx` fetches and displays quiz data.
- `src/sections/Worlds.tsx` fetches and displays world data.
- `src/sections/CrisisTeam.tsx` fetches and displays crisis team data.
- `src/hooks/useFetch.ts` contains the shared request and error handling used by every section.
- `src/util/Dateparser.ts` formats timestamps for display.

## Data Model Notes

The visible list columns are driven by the section components, not by a shared schema file.

Current fields in use include:

- Quiz records: quiz id, English and Finnish names, world id, order number, created timestamp, and a `deleted_at` field in the type definition.
- World records: world id, organization id, English name, order number, created timestamp, and a `deleted_at` field in the type definition.
- Crisis team records: contact id, English and Finnish names, role, phone, organization id, order number, created timestamp, and a `deleted_at` field in the type definition.

Those types suggest that soft-deletion is part of the backend model, even though the UI does not yet act on it.

## Data Flow

Each section follows the same pattern:

1. Call `useFetch<Type>('/api/...')` to get the list data and any fetch error.
2. Define the column definitions for the view.
3. Pass the data into `EntityList` together with column definitions.
4. Render the row-level edit and delete buttons through the shared component.

Future list screens should generally reuse the same structure instead of introducing a separate layout from scratch.

The current list component also includes a create button, but the handler it receives is still a placeholder in the page components.

## Working Notes

- The current implementation expects the backend APIs to be available at the `/api/...` paths.
- The list views currently use English labels for the visible table content.
- The delete, edit, and create handlers in the current screens are still TODOs and do not perform real actions yet.
- The navigation shows the signed-in admin's name and a working logout button. The avatar is still a placeholder.
- The app currently redirects unknown routes back to the quiz page instead of showing a separate 404 page.
- There are no loading indicators or empty-state messages yet, so an empty table can mean either no data or a pending request.
- The current UI is intentionally minimal and relies on Tailwind utility classes rather than a component library.

## Things That Still Need To Be Done

1. Implement create flows for quizzes, worlds, and crisis team members.
1. Implement edit flows for all three entity types.
1. Implement delete flows for all three entity types.
1. Add loading states so an empty screen is not confused with a slow request.
1. Add empty-state messaging when an API returns no records.
1. Confirm the full backend contract for each endpoint, including create and update payloads.
1. Decide how soft-deleted records should be handled in the UI.
1. Replace the placeholder navigation footer with real user data and logout handling.
1. Add a proper 404 page instead of redirecting unknown URLs to `/quizzes`.
1. Add end-to-end browser tests (Playwright) on top of the existing unit and component tests.

## Extension Guide

When adding a new admin view:

1. Create a new section component under `src/sections/`.
1. Define the view-specific columns in that section.
1. Fetch the data from the appropriate `/api/...` endpoint with `useFetch`.
1. Pass the data and handlers into `EntityList`.
1. Add the route in [src/App.tsx](src/App.tsx).
1. Add a matching navigation item in `src/constants/index.ts`.

When changing an existing view:

- Update the section component first.
- Keep the shared `EntityList` API stable if possible.
- Update the guide if the route, data shape, or backend contract changes.

## Testing

Unit and component tests use [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) in a jsdom environment. They run in CI on every push and pull request to `main`.

```bash
npm test            # run all tests once
npm run test:watch  # re-run tests on file changes
npm run coverage    # run tests and write a coverage report to coverage/
```

How the tests are organised:

- Test files live next to the code they test and end in `.test.ts` or `.test.tsx`.
- [src/test/setup.ts](src/test/setup.ts) loads the `jest-dom` matchers (`toBeInTheDocument`, ...) and cleans up after each test.
- [src/test/mockFetch.ts](src/test/mockFetch.ts) replaces `fetch` with a stub that answers by URL. Tests never call the real backend.
- Tests run with `TZ=UTC` (set in [vite.config.ts](vite.config.ts)) so date output does not depend on the machine's time zone.
- Prefer queries by role and accessible name (`getByRole('heading', { name: ... })`) over CSS classes, so tests survive styling changes.

Current coverage:

- `useFetch`: successful load, HTTP error status, network failure.
- `EntityList`: title, column headers, rows, empty list, error message, create/edit/delete callbacks.
- `formatDate`: valid and invalid input.
- `App`: redirects from `/` and unknown paths, side navigation, active link, and each view's data and error states.

Next steps:

- Add Playwright end-to-end tests that run the built app in a real browser with a mocked API.
- Add tests for the create, edit and delete flows when they are implemented.

## Development Tips

- Keep new list screens consistent with the existing section pattern unless there is a strong reason to diverge.
- Prefer reusing `EntityList` for any new admin entity views.
- If you add new endpoints, update both the relevant section component and this guide.
- If the UI contract changes, document the new route or data shape here so future developers do not have to infer it from the code.

## Status

Turva-admin is usable for browsing backend content, but it is not yet a complete administration tool. The remaining work is centered on write operations and routing polish.
