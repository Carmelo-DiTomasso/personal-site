# personal-site

Monorepo for my personal website + portfolio.
This project is intentionally run like a real software product:
documented architecture, reproducible local dev, issue tracking,
and scalable full-stack design.

## Goals

Primary:

- Showcase my computer science skills and projects in a professional site.
- Build real engineering experience I can discuss in interviews
  (architecture, auth, APIs, deployment, security).

Secondary:

- Add interactive features (games, leaderboards, analytics dashboards).
- Practice maintainability and scalability (clear modules, documentation, automation).

## Tech Stack

- Frontend: React + TypeScript (Vite)
- Backend: Django + Django REST Framework
- Database: Postgres
- Local dev: Docker + Docker Compose
- Repo: GitHub (monorepo)
- Editor: VSCode

## Repo Structure

```text
personal-site/
  backend/        # Django backend (API, auth, admin)
  frontend/       # React + TypeScript frontend
  infra/          # Deployment/infrastructure files (later)
  docs/           # Architecture, ADRs, checklists
  scripts/        # One-command developer workflows
  README.md
  PLAN.md
  TASKS.md
  docker-compose.yml
  .env.example
```

## Prerequisites

- Docker Desktop installed and running
- Git
- (Recommended) VSCode

## Quickstart (Local Dev)

### 1) Create local environment file

`.env` is not committed. Create it from `.env.example`:

```powershell
Copy-Item .env.example .env
```

### 2) Start the stack (one command)

From the repo root:

```powershell
.\scripts\dev.ps1
```

Services:

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:8000>
- Admin: <http://localhost:8000/admin/>
- DB: localhost:5432

### 3) Run migrations

```powershell
.\scripts\migrate.ps1
```

### 4) Create a Django admin user

```powershell
.\scripts\superuser.ps1
```

Then sign in at:

- <http://localhost:8000/admin/>

### 5) Stop everything

```powershell
.\scripts\down.ps1
```

## Common Commands

### Show running containers

```powershell
docker compose ps
```

### Follow logs

```powershell
.\scripts\logs-backend.ps1
.\scripts\logs-frontend.ps1
```

### Rebuild after dependency changes

```powershell
docker compose up -d --build
```

## Environment Variables

Local dev uses `.env` (not committed). See `.env.example` for required variables.

## Development Workflow

- Work in small, focused commits.
- Keep docs current (docs/ is source of truth).
- “Done” means: implementation + basic verification + docs updated.
- Track features/bugs in GitHub Issues.

## Documentation

- `PLAN.md` – roadmap and milestones
- `TASKS.md` – current actionable tasks
- `CHALLENGES.md` — issues we hit + fixes/prevention
- `docs/architecture.md` – system design + module boundaries
- `docs/joel-test.md` – quality/process checklist (project version)
- `docs/adr/` – architecture decision records

## License

TBD
