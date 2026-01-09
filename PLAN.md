# Plan

Phased delivery plan. Each phase ends with:

- working functionality
- updated documentation
- issues closed in GitHub

## Operating model (how this repo is managed)

### Milestones

- Each phase (or phase subset) maps to a GitHub **Milestone**.
- Every GitHub Issue belongs to **exactly one milestone**.
- Milestones are kept small (typically 5–15 issues).
- A milestone is "done" when its Definition of Done is satisfied and
  all issues are closed.

### Sprints

- A sprint is a small set of issues from the active milestone.
- Each sprint is executed in a **separate ChatGPT conversation**.
- The sprint ends with a **Sprint Handoff Packet** pasted back into the
  PM Hub conversation, which updates:
  - `TASKS.md`
  - phase status here
  - any impacted docs

### Labels (required per issue)

Every issue must have exactly:

- 1 area: `area:frontend | area:backend | area:db | area:infra`
- 1 type: `type:feature | type:bug | type:docs | type:chore | type:security |
type:refactor | type:test | type:ci | type:perf | type:deps`
- 1 priority: `priority:P0 | priority:P1 | priority:P2 | priority:P3`

### Reduced overhead mode (current)

To keep momentum, we're minimizing admin overhead:

- **One branch per sprint**
- **One PR per sprint**
- Fewer, larger issues (2–4 per sprint)

---

## Hosting reality (current)

- Frontend: Vercel
- Backend: DigitalOcean App Platform
- Database: DigitalOcean Managed Postgres
- Local dev: Vite proxies `/api/*` to the Docker backend

---

## Phase status

- Phase 0 — DONE
- Phase 1 — DONE
- Phase 2 — DONE
- Phase 3 — DONE (v0 milestone complete)
- Phase 4 — ACTIVE (routing + layout in progress)
- Phase 4.5 — DONE (Live API deployment on DigitalOcean v0)
- Phase 5 — PLANNED
- Phase 6 — PLANNED
- Phase 7 — PLANNED
- Phase 8 — PLANNED
- Phase 9 — PLANNED (hardening and ops polish)
- Phase 10 — PLANNED

---

## Phase 0 — Repo + Process (DONE)

- Monorepo structure created
- Planning docs added
- GitHub repo created and working with SSH
- Docker-first direction chosen

## Phase 1 — Local Dev Environment (DONE)

Goal: One-command local dev with Docker Compose.

Deliverables:

- db/backend/frontend run via Docker Compose
- Django Admin reachable at `/admin`
- React app reachable at port 5173
- Scripts in `scripts/` for common tasks
- README quickstart reflects actual steps

Definition of Done:

- New dev machine can run the app by following README
- No secrets committed

## Phase 2 — First End-to-End Integration (DONE)

Goal: Prove frontend ↔ backend communication.

Deliverables:

- Backend: `GET /api/health/` returns `{ "status": "ok" }`
- Frontend: fetch `/api/health/` and display status on the home page
- Document API conventions in `docs/architecture.md`

Definition of Done:

- `/api/health/` returns expected output
- Frontend renders health status with basic error handling

## Phase 3 — Backend Foundations (DONE for v0)

Goal: Clean Django module structure + scalable API conventions.

Definition of Done:

- Clear app boundaries (apps own their code)
- CI runs backend tests
- First real endpoint shipped beyond health

Milestone notes:

- Backend Foundations v0 — DONE (Dec 23, 2025)
  - apps: accounts/content/games/analytics
  - health endpoint app-owned + tests + CI
  - API error envelope baseline
  - first endpoint: `GET /api/content/projects/`

## Phase 4 — Frontend Foundations (DONE)

Goal: Real site layout and a clean way to call the API.

Deliverables:

- Routing + layout (Home, Resume, Projects, Games, Contact, Site, Stats)
- Universal header + footer
- API client pattern (single place for fetch logic)
- Shared components, loading/error states
- Basic SEO metadata once routes exist

Definition of Done:

- No "god components"
- API calls centralized and consistent
- All primary routes exist and are navigable

## Phase 4.5 — Live API Deployment on DigitalOcean (DONE for v0)

Goal: Make the live site talk to a real API.

Deliverables:

- Django deployed on DigitalOcean App Platform
- DigitalOcean Managed Postgres connected
- Migrations run; Admin usable
- Frontend successfully calls deployed API
- Live site shows:
  - API Status OK
  - Projects loaded from API

Definition of Done:

- Live home page shows API Status OK
- Live home page renders Projects from API

## Phase 5 — Content System (Blog/Admin Workflow) (ACTIVE)

Goal: Create/edit content in Django Admin and display in frontend.

Deliverables:

- Projects workflow polish
- Blog model + admin workflow
- Frontend pages render content from API

Definition of Done:

- Admin-created content appears on site
- Slugs work and pages are shareable

## Phase 6 — Accounts + Security Baseline (PLANNED)

Goal: Own-auth flows with good security practices.

Deliverables:

- Registration + login + logout
- Password reset flow
- Email verification (if feasible early)
- Basic rate limiting for auth endpoints
- Security notes documented

Stretch:

- TOTP-based 2FA (Authenticator app)

Definition of Done:

- Auth flows verified end-to-end
- Basic abuse prevention in place

## Phase 7 — Games + Leaderboards (PLANNED)

Goal: Small interactive games and user score tracking.

Status note:

- Games UI **v0 shipped in Sprint 9** as **frontend-only**
  (no auth, no persistence yet):
  - `/games` hub + 4 games (Zip, Tango, Queens, Mini Sudoku)
  - On-page “How to play” UI (accordion/modal-style UX)

Deliverables:

- Backend `games` API:
  - Score submission endpoint
  - Leaderboard endpoints (pagination)
  - Score history endpoint (per-user)
  - Validation + basic rate limiting
- Frontend:
  - Wire v0 games UI to score submission
  - Leaderboard UI + personal history UI
- Auth dependency:
  - Requires user accounts/login (Phase 6) before per-user history is meaningful

Definition of Done:

- Users can submit scores and see rankings

## Phase 8 — Analytics Dashboard (PLANNED)

Goal: Site and user activity metrics with graphs.

Deliverables:

- Event capture model (page views, actions)
- Aggregation endpoints (daily totals, per-user stats)
- Frontend dashboard with charts

Definition of Done:

- Dashboard displays real data from Postgres

## Phase 9 — Hardened DigitalOcean Production (PLANNED)

Goal: Production deployment with maintainability and ops maturity.

Deliverables:

- Reverse proxy + HTTPS plan
- CI/CD plan
- Backups + monitoring/logging plan
- Rollback steps documented

Definition of Done:

- Rollback steps documented and tested
- Backups and monitoring have a documented plan

## Phase 10 — Hardening + Polish (PLANNED)

Goal: Robust, maintainable, interview-ready.

Deliverables:

- Security headers + CSP
- Dependency scanning in CI
- Better tests
- Performance + accessibility baselines

Definition of Done:

- "Production readiness" checklist mostly complete
