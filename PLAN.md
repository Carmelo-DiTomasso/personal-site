# Plan

This plan is organized into phases. Each phase should end with:

- working functionality
- updated documentation
- issues closed in GitHub

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

## Phase 2 — First End-to-End Integration (NEXT)

Goal: Prove frontend ↔ backend communication.

Deliverables:

- Backend: `GET /api/health/` returns JSON `{ "status": "ok" }`
- Frontend: fetch `/api/health/` and display status on the home page
- Document API conventions in `docs/architecture.md`

Definition of Done:

- `/api/health/` returns expected output
- Frontend renders health status with basic error handling

## Phase 3 — Backend Foundations

Goal: A clean Django module structure and API conventions.

Deliverables:

- Django apps created:
  - accounts (auth + profiles)
  - content (posts + projects)
  - games (scores + leaderboards)
  - analytics (events + aggregations)
- DRF routing conventions under `/api/` (later `/api/v1/`)
- API error format conventions documented

Definition of Done:

- Module boundaries are clear (apps own their models/serializers/views)
- Critical endpoints have minimal tests

## Phase 4 — Frontend Foundations

Goal: Real site layout and a clean way to call the API.

Deliverables:

- Routing + layout (Home, Projects, Blog, Resume, Contact)
  - Contact
    - Contact form (no public email) can add rate limiting and CAPTCHA
    - alias email that forwards to real inbox
    - obfuscate email
    - clickable mailto + scrape
- API client pattern (single place for fetch logic)
- Baseline UI styling and shared components
- Error handling and loading states
- Basic SEO metadata (title/description/OG) once routes exist

Notes

- Search Console (domain property) verified for `carmeloditomasso.app`.
- SEO work is intentionally deferred until the site has real pages
  (Home/About/Projects) to index.

Definition of Done:

- No single file becomes a “god component”
- API calls are centralized and consistent

## Phase 5 — Content System (Blog/Admin Workflow)

Goal: Create/edit content in Django Admin and display in frontend.

Deliverables:

- Update site logo and name
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
