# Turva-admin

Turva-admin is the administrative frontend for the TurvaOppi project. It provides a dashboard-style interface for browsing the core content used by the platform.

## For Future Developers

See the detailed implementation handoff in [ProjectGuide.md](ProjectGuide.md).

## What the app does

- Requires an admin sign-in (email code) before any page is shown.
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

Run the tests (Vitest + React Testing Library, see the Testing section of [ProjectGuide.md](ProjectGuide.md)):

```bash
npm test
```

## Running with Docker

The Docker image builds the app and serves it with nginx on port 8080. nginx also forwards `/api` requests to turva-back, like the Vite dev proxy does with `npm run dev`.

1. Clone the repository

    ```bash
    git clone https://github.com/haagahelia/turva-admin.git
    cd turva-admin
    ```

1. create the .env file and write "BACKEND_URL=http://host.docker.internal:3000"

1. Start turva-back locally on port 3000 (`docker compose up` in the turva-back repository)

    The backend is chosen with the `BACKEND_URL` environment variable:

    - `docker-compose.yml` reads it from the `.env` file.
    - The Rahti deployment gets it from the `BACKEND_URL` GitHub Actions variable (see [Deployment to CSC Rahti](#deployment-to-csc-rahti)).
    - The container does not start without it.

1. Build and run the project

    ```bash
    docker compose up --build
    ```

1. Open [http://localhost:8080](http://localhost:8080)

Stop the container with `docker compose down`.

## Deployment to CSC Rahti

The CD workflow ([.github/workflows/cd_workflow.yml](.github/workflows/cd_workflow.yml)) deploys every push to `main` to CSC Rahti. It can also be started by hand from the Actions tab (**Run workflow**).

What it does:

1. Runs lint, tests and build. The deploy only starts if they pass.
1. Builds the Docker image and pushes it to the Rahti registry, tagged with the commit SHA.
1. Applies [csc/deployment_template.yml](csc/deployment_template.yml): a `turva-admin` Deployment, Service and HTTPS Route.
1. Waits for the rollout and prints the public URL in the workflow summary.

Configure the GitHub `dev` environment (**Settings → Environments → dev**) once:

| Name | Type | Value |
|---|---|---|
| `CSC_PROJECT` | secret | Rahti project name |
| `CSC_TOKEN` | secret | Rahti access token |
| `BACKEND_URL` | variable | turva-back URL, without a trailing slash |

For `BACKEND_URL`, if turva-back runs in the same Rahti project, use its internal service: `http://turva-back:3000`. Otherwise use its public URL, for example `https://turva-back-<project>.2.rahtiapp.fi`. The workflow stops before deploying if a value is missing or malformed.

## Project Structure

- `src/main.tsx` bootstraps the application.
- `src/App.tsx` defines the dashboard layout and route handling.
- `src/components/Sidepanel.tsx` renders the persistent navigation.
- `src/components/EntityList.tsx` renders the shared entity table layout.
- `src/sections/` contains the individual admin views.
- `src/hooks/useFetch.ts` loads list data from the API for the views.
- `src/pages/Login.tsx` is the sign-in page.
- `src/auth/` keeps the admin session (token and profile) and protects the routes.
- `src/api/apiFetch.ts` calls the backend with the admin token and handles errors.
- `src/util/Dateparser.ts` provides date formatting for list rows.

## Notes

The current app is a functional admin shell rather than a fully complete CRUD tool. The list views are wired to backend reads, while create, edit, and delete flows still need implementation.
