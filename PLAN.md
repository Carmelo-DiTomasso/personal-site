<!-- markdownlint-disable MD013 -->

# Plan

This plan is organized into phases. Each phase ends with:

- working functionality
- updated documentation
- issues closed in GitHub

## Operating model (how this repo is managed)

### Milestones

- Each phase (or phase subset) maps to a GitHub **Milestone**.
- Every GitHub Issue belongs to **exactly one milestone**.
- A milestone is “done” when its Definition of Done is satisfied and all issues are closed.

### Sprints

- A sprint is **one focused set of 5–10 issues** from the active milestone.
- Each sprint is executed in a **separate ChatGPT conversation**.
- The sprint ends with a **Sprint Handoff Packet** pasted back into the PM Hub conversation, which updates:
  - `TASKS.md`
  - phase status here
  - any docs affected by decisions

### Labels (required per issue)

Every issue must have exactly:

- 1 area: `area:frontend | area:backend | area:db | area:infra`
- 1 type: `type:feature | type:bug | type:docs | type:chore | type:security | type:refactor | type:test | type:ci | type:perf | type:deps`
- 1 priority: `priority:P0 | priority:P1 | priority:P2 | priority:P3`

---

## Phase status

- Phase 0 — DONE
- Phase 1 — DONE
- **Phase 2 — DONE**
- Phase 3 — NEXT
- Phase 4+ — PLANNED

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

- Backend: `GET /api/health/` returns JSON `{ "status": "ok" }`
- Frontend: fetch `/api/health/` and display status on the home page
- Document API conventions in `docs/architecture.md`

Definition of Done:

- `/api/health/` returns expected output
- Frontend renders health status with basic error handling

Notes:

- Search Console (domain property) verified for `carmeloditomasso.app`.
- SEO work is intentionally deferred until real pages exist (Home/About/Projects) to index.

## Phase 3 — Backend Foundations (NEXT)

Goal: A clean Django module structure and scalable API conventions.

Deliverables:

- Django apps created (initial scaffolding is fine to start):
  - accounts (auth + profiles)
  - content (posts + projects)
  - games (scores + leaderboards)
  - analytics (events + aggregations)
- Routing conventions under `/api/` (plan migration to `/api/v1/` later)
- API error format conventions documented

Definition of Done:

- Module boundaries are clear (apps own their models/serializers/views)
- Critical endpoints have minimal tests (at least a health smoke test)
- Lint/format baseline exists for backend (and ideally CI runs it)

## Phase 4 — Frontend Foundations

Goal: Real site layout and a clean way to call the API.

Deliverables:

- Routing + layout (Home, Projects, Blog, Resume, Contact, Games)
- API client pattern (single place for fetch logic)
- Baseline UI styling and shared components
- Error handling and loading states
- Basic SEO metadata (title/description/OG) once routes exist

Contact notes:

- Contact form (no public email) should support rate limiting and CAPTCHA (later)
- Consider alias email that forwards to a real inbox
- Avoid exposing raw email to scraping (mailto only if obfuscated)

Definition of Done:

- No single file becomes a “god component”
- API calls are centralized and consistent

## Phase 5 — Content System (Blog/Admin Workflow)

Goal: Create/edit content in Django Admin and display in frontend.

Deliverables:

- Update site logo and name (instead of Vite logo and "app")
- Blog post model (title, slug, body, published, timestamps)
- Projects model (title, stack, description, links, timestamps)
- Django Admin customization (search, list display)
- Frontend pages render content from API

Definition of Done:

- New post created in admin appears on site
- Slugs work and pages are shareable

## Phase 6 — Accounts + Security Baseline

Goal: Own-auth flows with good security practices.

Deliverables:

- Registration + login + logout
- Password reset flow
- Email verification (if feasible early)
- Rate limiting for auth endpoints (basic)
- Security notes documented

Stretch:

- TOTP-based 2FA (Authenticator app)

Definition of Done:

- Auth flows verified end-to-end
- Basic abuse prevention in place

## Phase 7 — Games + Leaderboards

Goal: Small interactive games and user score tracking.

Deliverables:

- Score submission endpoint
- Leaderboard endpoints (pagination)
- Frontend UI for scores and leaderboards
- Validation + basic rate limiting

Definition of Done:

- Users can submit scores and see rankings

## Phase 8 — Analytics Dashboard

Goal: Site and user activity metrics with graphs.

Deliverables:

- Event capture model (page views, actions)
- Aggregation endpoints (daily totals, per-user stats)
- Frontend dashboard with charts

Definition of Done:

- Dashboard displays real data from Postgres

## Phase 9 — Deployment to DigitalOcean (Student Pack)

Goal: Production deployment with control and maintainability.

Deliverables:

- Production container strategy
- Nginx reverse proxy + HTTPS (Let’s Encrypt)
- CI/CD deployment plan
- Backups plan (db dumps, retention)
- Monitoring/logging plan

Definition of Done:

- Public site reachable over HTTPS
- Rollback steps documented

## Phase 10 — Hardening + Polish

Goal: Make it robust, maintainable, and interview-ready.

Deliverables:

- Security headers + CSP
- Dependency scanning in CI
- Better tests (backend + frontend)
- Performance checks (Lighthouse baseline)
- Accessibility pass

Definition of Done:

- “Production readiness” checklist mostly complete
