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

## API conventions (initial)

Base path:
- Start with `/api/`
- Option to migrate later to `/api/v1/` when versioning matters

Response format:
- JSON
- Errors should be returned as JSON with a consistent shape (to be defined once endpoints expand)

Planned first endpoint:
- `GET /api/health/` → `{ "status": "ok" }`

## Deployment (later)

Target hosting:
- DigitalOcean via GitHub Student Pack

Goals:
- HTTPS
- reverse proxy (Nginx)
- production env separation (DEBUG off, secrets managed)
- DB backups and monitoring
