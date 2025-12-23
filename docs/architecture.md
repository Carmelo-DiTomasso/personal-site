# Architecture

## High-level overview

This project is a monorepo with:

- React + TypeScript frontend (Vite)
- Django + Django REST Framework backend
- Postgres database
- Docker Compose for local development

The backend is the source of truth for persisted data (users, posts, scores, analytics).
The frontend is responsible for UI and calling backend APIs.

## Modules

### Frontend (`frontend/`)

Responsibilities:

- UI routes/pages (Home, Projects, Blog, Resume, Contact, etc.)
- API calls to backend
- Client-side state and rendering
- Frontend structure uses src/pages/*for route-level components and
    src/components/sections/* for page sections. - Styling uses CSS
    Modules (*.module.css) to keep styles local and scalable.

### Backend (`backend/`)

Responsibilities:

- Authentication and authorization
- API endpoints (DRF)
- Admin tooling (Django admin)
- Business logic
- Database schema (migrations)

Planned Django apps:

- `accounts`: registration/login, profile, permissions, (later) 2FA
- `content`: blog posts + projects portfolio
- `games`: games, score submissions, leaderboards
- `analytics`: event capture and aggregates for dashboards

### Database (`db`)

- Postgres stores all persistent data.

## Local development

Docker Compose services:

- `db`: Postgres on `localhost:5432`
- `backend`: Django on `http://localhost:8000`
- `frontend`: Vite on `http://localhost:5173`

Scripts:

- `.\scripts\dev.ps1` starts the stack (`docker compose up -d --build`)
- `.\scripts\down.ps1` stops everything (`docker compose down`)
- `.\scripts\migrate.ps1` runs migrations in backend container
- `.\scripts\superuser.ps1` creates a Django admin user

## API conventions

Base path:

- All backend endpoints live under `/api/`.
- Trailing slashes are used (Django default): e.g. `/api/health/`.

Versioning:

- No version prefix yet. If/when needed, migrate to `/api/v1/` and
    keep `/api/` as an alias during transition.

Request/response:

- Requests and responses are JSON for API endpoints.
- Health check: `GET /api/health/` returns `{ "status": "ok" }`.

Naming:

- JSON keys use `snake_case` to match Python/Django conventions.
- URLs use lowercase with hyphens only if needed (prefer short, noun-based paths).

Errors:

- API errors should return JSON (not HTML).
- Initial error shape convention (to standardize as endpoints expand):

  ```json
  {
    "error": {
      "code": "string",
      "message": "human readable",
      "details": {}
    }
  }
  ```

  Examples:
  - 400: invalid input / validation errors
  - 401: unauthenticated
  - 403: unauthorized
  - 404: not found
  - 500: unexpected server error (avoid leaking internals)

Local dev routing:

- Frontend calls APIs via relative paths like `fetch("/api/...")`.
- In Docker dev, Vite proxies `/api/*` to the backend service.
- Backend is reachable at `http://localhost:8000`, frontend at `http://localhost:5173`.

## Deployment (later)

Target hosting:

- DigitalOcean via GitHub Student Pack

Goals:

- HTTPS
- reverse proxy (Nginx)
- production env separation (DEBUG off, secrets managed)
- DB backups and monitoring
