# Tasks

Single source of truth for **Now / Next / Soon / Later**.
The PM Hub conversation plans sprints from this file.

## How we work (ChatGPT Projects workflow)

- **PM Hub conversation:**
  - Chooses the next **Milestone**
  - Proposes a sprint backlog
  - After each sprint, ingests a **Sprint Handoff Packet** and updates docs and
  progress here

- **Each sprint = separate ChatGPT conversation**
  - Work issue-by-issue
  - End with a Sprint Handoff Packet pasted back into the PM Hub

## Workflow tweak (reduced overhead)

We are optimizing for momentum:

- **One branch per sprint**
- **One PR per sprint**
- Fewer, larger issues (2–4 per sprint) with clear deliverables

## Current status

- **Live hosting:** Vercel (frontend-only)
- **Backend hosting:** not deployed yet (local only via Docker + Vite proxy)
- **Last completed sprint:** Sprint 4 — Projects v0 ✅
- **Blocker:** Live site cannot reach `/api/*` yet

---

## Now (Sprint 5 / Milestone: Live API on DigitalOcean v0)

Goal: Deploy Django + Postgres on DigitalOcean so the live site works.

- [ ] Provision DigitalOcean infrastructure
  - [ ] Create App Platform app for Django
  - [ ] Create Managed Postgres
  - [ ] Attach DB to app and store secrets/env vars in DO
  - [ ] Decide API hostname strategy (recommended: `api.<domain>`)
- [ ] Deploy backend + validate API
  - [ ] Build + deploy container
  - [ ] Run migrations in the deployed environment
  - [ ] Create admin user (prod)
  - [ ] Verify:
    - `/api/health/` returns `{ "status": "ok" }`
    - `/api/content/projects/` returns JSON list
- [ ] Wire Vercel frontend to live API
  - [ ] Add `VITE_API_BASE_URL` support in frontend API client
  - [ ] Set Vercel env var + redeploy
  - [ ] Verify on live homepage:
    - API Status is OK
    - Projects load from API (not failing)

---

## Next (Projects v1 polish + Phase 4 routing)

- [ ] Add `/projects` route page (optional if you want it soon)
- [ ] Featured project display rules (UI + ordering contract)
- [ ] Pagination contract for projects endpoint (if list grows)
- [ ] Expand content system: Blog model + API + admin

---

## Soon (Quality & safety rails)

- [ ] Tighten tests for content endpoints
- [ ] Add basic rate limiting plan (when forms/auth arrive)
- [ ] SEO basics once routes exist (title/meta/OG/robots/sitemap)

---

## Later (Hardened production deployment)

- [ ] DigitalOcean hardening phase (reverse proxy, HTTPS plan, backups,
  monitoring, CI/CD, rollback docs)
- [ ] Security headers + CSP + dependency scanning
- [ ] Performance + accessibility baseline

---

## Done (reference)

### Sprint 1 — E2E Integration v0 ✅

- Scripts hardened + status script + Vite proxy + Home API status

### Sprint 2 — Repo Hygiene + Tooling Baseline ✅

- `.gitattributes`, API base path decision, Ruff + Prettier, CI workflow,
  docs updated

### Sprint 3 — Backend Foundations v0 ✅

- Django apps scaffolded: accounts/content/games/analytics
- `/api/health/` moved into apps/analytics + tests + CI
- API error envelope introduced and adopted
- First real endpoint: `GET /api/content/projects/`

### Sprint 4 — Projects v0 ✅

- Project Admin UX + seed script
- Frontend API client + Projects section on Home
- Projects API contract documented
