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

- UI routes/pages (Home, Resume, Projects, Games, Contact, Site, Stats, etc.)
- API calls to backend
- Client-side state and rendering

Structure (conventions):

- `src/pages/*` contains **route-level** components (one folder per route).
  - Examples:
    - `src/pages/home/HomePage.tsx`
    - `src/pages/resume/ResumePage.tsx`
    - `src/pages/projects/ProjectsPage.tsx`
- `src/components/sections/*` contains **page sections** (primarily Home page sections).
- `src/components/layout/*` contains **app-wide layout primitives**:
  - `AppLayout` (wraps every route)
  - `Header` / `Footer`
  - `Container` (shared max-width + gutters; used by layout + pages)
- `src/components/nav/*` contains navigation UI:
  - `SiteNav` renders the route links (layout-agnostic;
    spacing is owned by layout components)

Routing:

- Uses React Router (`react-router-dom`).
- Route table lives in `src/App.tsx`.
- Uses a nested route wrapper:
  - `AppLayout` renders on every route and hosts `<Outlet />` for page content.
- Current top-level routes:
  - `/` (Home)
  - `/resume`
  - `/projects`
  - `/games`
  - `/contact`
  - `/site`
  - `/stats`
  - `*` (Not Found)

Styling:

- Uses CSS Modules (`*.module.css`) for component/page styles to keep
  styles local and scalable.
- Global styles live in `src/index.css` and `src/App.css`.

API client:

- `src/lib/api.ts` centralizes fetch logic.
- `VITE_API_BASE_URL` controls whether requests go to an absolute API origin
  (prod) or remain relative (dev proxy).
  - If `VITE_API_BASE_URL` is empty, callers should use relative paths like
    `/api/...` and Vite will proxy in dev.
  - If `VITE_API_BASE_URL` is set, requests resolve against that base.

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
- `.\scripts\status.ps1` shows service status
- `.\scripts\migrate.ps1` runs migrations in backend container
- `.\scripts\superuser.ps1` creates a Django admin user
- `.\scripts\check.ps1` runs the universal pre-PR checks
  (lint/format + backend tests + frontend lint + frontend typecheck)

## API conventions

Base path:

- All backend endpoints live under `/api/`.
- Trailing slashes are used (Django default): e.g. `/api/health/`.

Versioning:

- Current base path is `/api/` (no version prefix yet).
- Introduce `/api/v1/` when we either:
  - need a breaking change to existing endpoints, or
  - ship endpoints meant to stay stable across multiple clients
    (e.g., multiple frontends / public docs).
- Migration approach:
  - add `/api/v1/` routes, and
  - keep `/api/` as an alias to v1 during a transition window, then
  - remove the alias once all clients move.

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

- Frontend calls APIs via relative paths like `/api/...`.

- In Docker dev, Vite proxies `/api/*` to the backend service.

- Backend is reachable at `http://localhost:8000`, frontend at `http://localhost:5173`.

### Projects

#### GET /api/content/projects/

Returns the list of Projects for the site.

#### Ordering

- Sorted by `sort_order` (ascending), then `title` (ascending).

##### 200 OK (JSON)

Returns a JSON array of project objects:

```json
[
  {
    "slug": "personal-site",
    "title": "Personal Site",
    "description": "Monorepo personal site with Django API + React frontend.",
    "live_url": "",
    "repo_url": "",
    "sort_order": 10,
    "is_featured": true
  }
]
```

##### Fields

| Field        | Type    | Notes                                        |
|--------------|---------|----------------------------------------------|
| `slug`       | string  | Unique, stable identifier (use as UI key)    |
| `title`      | string  | Display name                                 |
| `description`| string  | Optional; may be empty                       |
| `live_url`   | string  | Optional; may be empty                       |
| `repo_url`   | string  | Optional; may be empty                       |
| `sort_order` | number  | Lower comes first                            |
| `is_featured`| boolean | Optional UI emphasis flag                    |

#### Error envelope

Non-2xx responses should use the standard error envelope:

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human readable message",
    "details": null
  }
}
```

| Field            | Type      | Notes                                      |
|------------------|-----------|--------------------------------------------|
| `error.code`     | string    | Stable, machine-readable error code        |
| `error.message`  | string    | User/developer-readable description        |
| `error.details`  | any\|null | Optional extra context for debugging       |

## Deployment (later)

Goals:

- HTTPS
- reverse proxy (Nginx)
- production env separation (DEBUG off, secrets managed)
- DB backups and monitoring
