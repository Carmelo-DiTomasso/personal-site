# Tasks

This is the **single source of truth** for what’s **Now / Next / Soon / Later**.
It stays small and actionable. The PM Hub conversation uses this file to plan sprints.

## How we work (ChatGPT Projects workflow)

- **PM Hub conversation:**
  - Chooses the next **Milestone**
  - Proposes a sprint backlog (**5–10 issues max**) with labels + DoD
  - After each sprint, ingests a **Sprint Handoff Packet** and updates docs and
  progress here

- **Each sprint gets its own ChatGPT conversation**
  - Work issue-by-issue (1–3 commits each)
  - End with a Sprint Handoff Packet pasted back into the PM Hub

## Current status

- **Active Milestone:** Projects v0 — Admin + Seed + Frontend Consumption
  (proposed)
- **Last completed sprint:** Sprint 3 — Phase 3 Backend Foundations v0 ✅
- **Phase alignment:** Phase 3 foundations are in place; next is project
  content workflow + frontend consumption.

---

## Now (Projects v0 milestone)

Turn these into GitHub issues for the next sprint.

- [ ] Backend: register `Project` in Django Admin with useful list display /
  search / filter
- [ ] Backend: add repeatable local seed data for projects (management
  command or fixture)
- [ ] Frontend: render projects from `GET /api/content/projects/` (home
  section and/or Projects page)
- [ ] Frontend: centralize API calls into a small client module (typed DTO
  - consistent error handling)
- [ ] Docs: update architecture or README with:
  - `/api/content/projects/` contract (response shape, ordering
    expectations)
  - API error envelope shape + usage guidance
- [ ] Optional: add pagination + ordering contract to projects endpoint
  (only if list will grow soon)

---

## Next (Phase 4 — Frontend Foundations)

- [ ] Routing + layout baseline:
  - [ ] Home
  - [ ] Projects
  - [ ] Blog
  - [ ] Resume
  - [ ] Contact
- [ ] Standard loading/error patterns (shared UI components)

---

## Soon (Quality & safety rails)

- [ ] CI: strengthen checks (tests + lint parity) as coverage grows
- [ ] Add backend formatting/linting expansions (only when low-churn):
  - [ ] tighten Ruff rules
  - [ ] optional Black
- [ ] Add basic API pagination patterns (DRF pagination or custom)

---

## Later (Deployment prep)

- [ ] Add `infra/` plan for DigitalOcean deployment
- [ ] Production env strategy (secrets, DEBUG=0, allowed hosts)
- [ ] HTTPS + reverse proxy plan
- [ ] Backups plan for Postgres

---

## Done (reference)

### Sprint 1 — E2E Integration v0 ✅

- Scripts hardened + status script + Vite proxy + Home API status

### Sprint 2 — Repo Hygiene + Tooling Baseline ✅

- `.gitattributes`, API base path decision, Ruff + Prettier, CI workflow,
  docs updated

### Sprint 3 — Backend Foundations v0 ✅

- Django apps scaffolded: accounts/content/games/analytics
- `/api/health/` moved into apps/analytics
- Health smoke tests (SQLite override for tests)
- CI runs `python manage.py test`
- API error envelope introduced and adopted
- First real endpoint: `GET /api/content/projects/` (model + serializer +
  migration + test)
