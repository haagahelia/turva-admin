# Turva-admin Project Guide

## Purpose

This guide is a handoff for developers who need to continue building the Turva-admin interface.

It focuses on what is already implemented, where the data comes from, how the app is structured, and what still needs to be finished so you do not have to rediscover the codebase each time.

## At A Glance

- Turva-admin is a React single-page application for the TurvaOppi admin team.
- It currently works as a read-focused dashboard for browsing backend data.
- The app uses a shared list component for the current admin views.
- Backend requests are proxied through the Vite development server.
- Write-side workflows, authentication, and automated tests are still incomplete.

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
- [src/util/Dateparser.ts](src/util/Dateparser.ts) formats timestamps for display.

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

The request pattern is intentionally simple: each section issues a `fetch` call in `useEffect`, checks `response.ok`, converts the response to JSON, and stores the result in local state.

If the backend contract changes, update the relevant section component and the proxy target in [vite.config.ts](vite.config.ts) together.

## Important Components

- `src/App.tsx` sets up the dashboard layout and route handling.
- `src/components/Sidepanel.tsx` renders the main navigation and placeholder profile area.
- `src/components/EntityList.tsx` renders the reusable list layout, headers, row actions, and create button.
- `src/sections/Quizzes.tsx` fetches and displays quiz data.
- `src/sections/Worlds.tsx` fetches and displays world data.
- `src/sections/CrisisTeam.tsx` fetches and displays crisis team data.
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

1. Declare local state for the list data and any fetch error.
2. Fetch data from the relevant API endpoint in `useEffect`.
3. Pass the data into `EntityList` together with column definitions.
4. Render the row-level edit and delete buttons through the shared component.

Future list screens should generally reuse the same structure instead of introducing a separate layout from scratch.

The current list component also includes a create button, but the handler it receives is still a placeholder in the page components.

## Working Notes

- The current implementation expects the backend APIs to be available at the `/api/...` paths.
- The list views currently use English labels for the visible table content.
- The delete, edit, and create handlers in the current screens are still TODOs and do not perform real actions yet.
- The navigation includes a logout button and a placeholder avatar, but neither is wired to real authentication state yet.
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
1. Consider extracting the repeated fetch logic into a shared hook or service layer.
1. Add automated tests for the shared entity list component and for the individual section screens.

## Extension Guide

When adding a new admin view:

1. Create a new section component under `src/sections/`.
1. Define the view-specific columns in that section.
1. Fetch the data from the appropriate `/api/...` endpoint.
1. Pass the data and handlers into `EntityList`.
1. Add the route in [src/App.tsx](src/App.tsx).
1. Add a matching navigation item in `src/constants/index.ts`.

When changing an existing view:

- Update the section component first.
- Keep the shared `EntityList` API stable if possible.
- Update the guide if the route, data shape, or backend contract changes.

## Testing

There is no automated test suite in place yet, so this should be treated as a priority for future development.

Recommended approach:

- Use Playwright for end-to-end browser testing of the admin UI.
- Use Robot Framework if the team wants a keyword-driven acceptance-testing layer that is easier for non-developers to read and maintain.

Suggested coverage:

- Verify that the side navigation routes to all three views.
- Verify that each view renders data fetched from its API endpoint.
- Verify error handling when an API request fails.
- Verify the shared entity list actions and any future create/edit/delete flows.
- Verify the default redirect from `/` to `/quizzes`.

## Development Tips

- Keep new list screens consistent with the existing section pattern unless there is a strong reason to diverge.
- Prefer reusing `EntityList` for any new admin entity views.
- If you add new endpoints, update both the relevant section component and this guide.
- If the UI contract changes, document the new route or data shape here so future developers do not have to infer it from the code.

## Status

Turva-admin is usable for browsing backend content, but it is not yet a complete administration tool. The remaining work is centered on write operations, authentication, routing polish, and automated testing.
