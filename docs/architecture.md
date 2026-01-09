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

#### Responsibilities

- UI routes/pages (Home, Resume, Projects, Games, Contact, Site, Stats, etc.)
- API calls to backend
- Client-side state and rendering

#### Structure (conventions)

- `src/pages/*` contains **route-level** components (one folder per route).
  - Examples:
    - `src/pages/home/HomePage.tsx`
    - `src/pages/resume/ResumePage.tsx`
    - `src/pages/projects/ProjectsPage.tsx`
- `src/pages/games/*` contains the Games hub + individual game routes.
  - Example folders (v0):
    - `src/pages/games/BipPage/` (Zip-style game; route slug may differ — see `src/App.tsx`)
    - `src/pages/games/BangoPage/` (Tango-style game; currently served at `/games/bango`)
    - `src/pages/games/BeensPage/` (Queens-style game; currently served at `/games/beens`)
    - `src/pages/games/SudokuPage/` (Mini Sudoku; currently served at `/games/sudoku`)
- `src/components/games/*` contains **shared** game UI primitives
  used across multiple games.
  - Example:
    - `src/components/games/BoardFrame/*` (focusable wrapper + consistent board framing)
- `src/components/sections/*` contains **page sections** (primarily Home page sections).
- `src/components/layout/*` contains **app-wide layout primitives**:
  - `AppLayout` (wraps every route)
  - `Header` / `Footer`
  - `Container` (shared max-width + gutters; used by layout + pages)
- `src/components/nav/*` contains navigation UI:
  - `SiteNav` renders the route links (layout-agnostic;
    spacing is owned by layout components)

#### Routing

- Uses React Router (`react-router-dom`).
- Route table lives in `src/App.tsx`.
- Uses a nested route wrapper:
  - `AppLayout` renders on every route and hosts `<Outlet />` for page content.
- Current top-level routes:
  - `/` (Home)
  - `/resume`
  - `/projects`
  - `/games` (Games hub)
    - `/games/bango` (Tango-style)
    - `/games/beens` (Queens-style)
    - `/games/sudoku` (Mini Sudoku)
    - Zip-style route: see `src/App.tsx`
      (folder exists as `src/pages/games/BipPage/`)
  - `/contact`
  - `/site`
  - `/stats`
  - `*` (Not Found)

#### Styling

- Uses CSS Modules (`*.module.css`) for component/page styles to keep
  styles local and scalable.
- Global styles live in `src/index.css` and `src/App.css`.

#### UI primitives: ExternalIconLink

Use `ExternalIconLink` for pill-style links that include an icon (e.g., Resume/GitHub/LinkedIn).

Location:

- `frontend/src/components/ui/ExternalIconLink/ExternalIconLink.tsx`
- `frontend/src/components/ui/ExternalIconLink/ExternalIconLink.module.css`
- Shared SVG icons: `frontend/src/components/ui/ExternalIconLink/icons.tsx`

Behavior:

- Renders an external `<a>` (new tab) for `https://...` links.
- Renders an internal React Router `<Link>` for relative paths like `/resume`.

Styling knobs (edit `ExternalIconLink.module.css`):

- Hover lift: `.link:hover { transform: translateY(-Npx); }`
- Animation timing/easing: `.link { transition: ... 140ms ease; }`
- Visual emphasis:
  - Opacity: `.link { opacity: ... }`
  - Border color: `.link { border: 1px solid ... }` and
    `.link:hover { border-color: ... }`
  - Optional text/icon color: `.link:hover { color: ... }`
- Icon sizing: `.icon svg { width/height: ... }`
- Spacing + shape: `.link { gap: ...; padding: ...; border-radius: ... }`
- Keyboard focus ring: `.link:focus-visible { outline: ...; outline-offset: ... }`

Icon color rule:

- Icons use `fill="currentColor"` so they inherit the link’s CSS `color`.
  Changing `.link`/`.link:hover { color: ... }` updates both text and icon.

#### API client

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
- `submissions`: contact + feedback intake
  (Turnstile + honeypot + throttling + cooldown + dedupe)

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

## Environment Variables (important)

Backend (Docker `backend` service reads repo root `.env`
via `docker-compose.yml`):

- `TURNSTILE_SECRET_KEY` (required in prod): Cloudflare Turnstile secret for
  server-side verification.
- `SUBMISSIONS_THROTTLE_RATE` (default `5/min`): DRF throttle rate for
  unauthenticated submissions.

  Rationale: protects the submissions inbox + DB from spam bursts while
  keeping normal users unblocked.

Frontend (Vite env):

- `VITE_TURNSTILE_SITE_KEY` (required for CAPTCHA): Cloudflare Turnstile site
  key used by the widget.
  - Put this in `frontend/.env.local` for local development
    (Vite reliably loads this file).

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

### Submissions

Turnstile may emit browser console warnings (PAT challenge / preload notices).
Treat as non-actionable if:

- the widget renders,
- a token is produced, and
- the backend verifies successfully.

#### POST /api/submissions/

Creates a new submission of kind `contact` or `feedback`.

Spam/abuse defenses (layered):

- Cloudflare Turnstile (token verification in backend)
- Honeypot field (silent drop with 204)
- DRF throttle scope `submissions` (rate controlled by `SUBMISSIONS_THROTTLE_RATE`)
- Cooldown: 1 successful submit per IP per `COOLDOWN_SECONDS`
- Dedupe: blocks duplicate content within `DEDUPE_WINDOW_SECONDS`

##### 201 Created (JSON)

```json
{ "status": "ok", "cooldown_seconds": 60 }
```

##### 204 No Content

returned when honeypot triggers (silent drop)

#### 409 Conflict (JSON)

```json
{ "detail": "DUPLICATE_SUBMISSION", "retry_after_seconds": 123 }
```

#### 429 Too Many Requests (JSON)

```json
{ "detail": "COOLDOWN", "retry_after_seconds": 41 }
```

Also sets a `Retry-After` header

#### 400 Bad Request (JSON)

- Validation errors (DRF default validation shape)

- CAPTCHA failure

```json
{ "detail": "CAPTCHA_FAILED", "error_codes": ["..."] }
```

- Note: The broader "error envelope" is planned;
  `submissions` currently uses DRF's
  default `{detail: ...}`/ field-error shapes

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

| Field         | Type    | Notes                                     |
| ------------- | ------- | ----------------------------------------- |
| `slug`        | string  | Unique, stable identifier (use as UI key) |
| `title`       | string  | Display name                              |
| `description` | string  | Optional; may be empty                    |
| `live_url`    | string  | Optional; may be empty                    |
| `repo_url`    | string  | Optional; may be empty                    |
| `sort_order`  | number  | Lower comes first                         |
| `is_featured` | boolean | Optional UI emphasis flag                 |

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

| Field           | Type      | Notes                                |
| --------------- | --------- | ------------------------------------ |
| `error.code`    | string    | Stable, machine-readable error code  |
| `error.message` | string    | User/developer-readable description  |
| `error.details` | any\|null | Optional extra context for debugging |

## Deployment (later)

Goals:

- HTTPS
- reverse proxy (Nginx)
- production env separation (DEBUG off, secrets managed)
- DB backups and monitoring
