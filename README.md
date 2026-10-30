# Turva-admin

Turva-admin is the administrative frontend for the TurvaOppi project. It provides a dashboard-style interface for browsing the core content used by the platform.

## For Future Developers

See the detailed implementation handoff in [ProjectGuide.md](ProjectGuide.md).

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
- [Docker](https://docs.docker.com/) (only for running the app in a container)

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

## Running with Docker

The Docker image builds the app and serves it with nginx on port 8080. nginx also forwards `/api` requests to turva-back, like the Vite dev proxy does with `npm run dev`.

1. Clone the repository

    ```bash
    git clone https://github.com/haagahelia/turva-admin.git
    cd turva-admin
    ```

2. Choose which backend to use in `nginx.conf`

    - **DEV** (active by default): turva-back running locally on port 3000. Start it first with `docker compose up` in the turva-back repository.
    - **PROD**: turva-back on Rahti.

    Keep only one of the two `location /api/` blocks uncommented.

3. Build and run the project

    ```bash
    docker compose up --build
    ```

4. Open [http://localhost:8080](http://localhost:8080)

Stop the container with `docker compose down`.

> Switch `nginx.conf` back to **PROD** before deploying to Rahti. Rahti builds the image from the `Dockerfile` and does not use `docker-compose.yml`.

## Project Structure

- `src/main.tsx` bootstraps the application.
- `src/App.tsx` defines the dashboard layout and route handling.
- `src/components/Sidepanel.tsx` renders the persistent navigation.
- `src/components/EntityList.tsx` renders the shared entity table layout.
- `src/sections/` contains the individual admin views.
- `src/util/Dateparser.ts` provides date formatting for list rows.

## Notes

The current app is a functional admin shell rather than a fully complete CRUD tool. The list views are wired to backend reads, while create, edit, and delete flows still need implementation.
