# Turva-admin Project Guide

## Purpose

This guide is a handoff for developers who need to continue building the Turva-admin interface.

It focuses on what is already implemented, where the data comes from, and what still needs to be finished so you do not have to rediscover the structure from the codebase each time.

## What Exists Today

The current app already provides:

- A persistent left-side navigation menu.
- Route-based views for quizzes, worlds, and crisis team members.
- A reusable table-like component for rendering entity lists.
- Data loading from backend endpoints.
- Error display in each view when a request fails.
- Date formatting for created timestamps.

The current build is best understood as a read-focused admin shell. It is already useful for browsing records, but the write-side workflows are still incomplete.

## Main Routes

The root route redirects to the quiz view.

- `/quizzes` shows quiz records from `/api/quiz`.
- `/worlds` shows world records from `/api/world`.
- `/crisis-team` shows crisis team records from `/api/crisis-team`.

## Important Components

- `src/App.tsx` sets up the dashboard layout and React Router routes.
- `src/components/Sidepanel.tsx` renders the main navigation.
- `src/components/EntityList.tsx` renders the reusable list layout, headers, row actions, and the shared create button.
- `src/sections/Quizzes.tsx` fetches and displays quiz data.
- `src/sections/Worlds.tsx` fetches and displays world data.
- `src/sections/CrisisTeam.tsx` fetches and displays crisis team data.
- `src/util/Dateparser.ts` formats timestamps for display.

## Data Flow

Each section follows the same pattern:

1. Declare local state for the list data and any fetch error.
2. Fetch data from the relevant API endpoint in `useEffect`.
3. Pass the data into `EntityList` together with column definitions.
4. Render the row-level edit and delete buttons through the shared component.

Future list screens should generally reuse the same structure instead of introducing a separate layout from scratch.

## Working Notes

- The current implementation expects the backend APIs to be available at the `/api/...` paths.
- The list views currently use English labels for the visible table content.
- The delete, edit, and create handlers in the current screens are still TODOs and do not perform real actions yet.
- The navigation includes a logout button and a placeholder avatar, but neither is wired to real authentication state yet.

## Things That Still Need To Be Done

1. Implement create flows for quizzes, worlds, and crisis team members.
1. Implement edit flows for all three entity types.
1. Implement delete flows for all three entity types.
1. Add loading states for each data fetch so empty screens are not confused with slow requests.
1. Add empty-state messaging when an API returns no records.
1. Confirm the full backend contract for each endpoint, including request payloads for create and update operations.
1. Wire the logout button to the real authentication flow once auth exists.
1. Since the app is only meant for the TurvaOppi team, the current authentication plan is to use a hidden set of hardcoded usernames and passwords known only to administrators.
1. Implement a `404` error page for incorrect URLs.
1. Consider extracting the repeated fetch logic into a shared data hook or service layer.
1. Add tests for the shared entity list component and for the individual section screens.

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
