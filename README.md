# Turva-admin

Turva-admin is the administrative frontend for the TurvaOppi project. It provides a dashboard-style interface for browsing the core content used by the platform.

## What the app does

- Shows a persistent side navigation for the main admin areas.
- Routes between three management views: quizzes, worlds, and crisis team members.
- Loads data from backend API endpoints and displays it in shared table-like entity lists.
- Formats creation timestamps for easier scanning.
- Shows API errors in the view so failed requests are visible to admins.
- Includes row-level edit and delete actions in the UI shell, with creation flows still marked as TODO in the current implementation.

## Current Views

- Quizzes: reads quiz records from `/api/quiz`.
- Worlds: reads world records from `/api/world`.
- Crisis team: reads crisis team contact records from `/api/crisis-team`.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS v4
- react-hook-form
- zod

## Prerequisites

- Node.js 20 or newer
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the app for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Project Structure

- `src/main.tsx` bootstraps the application.
- `src/App.tsx` defines the dashboard layout and route handling.
- `src/components/Sidepanel.tsx` renders the persistent navigation.
- `src/components/EntityList.tsx` renders the shared entity table layout.
- `src/sections/` contains the individual admin views.
- `src/util/Dateparser.ts` provides date formatting for list rows.

## Notes

The current app is a functional admin shell rather than a fully complete CRUD tool. The list views are wired to backend reads, while create, edit, and delete flows still need implementation.
