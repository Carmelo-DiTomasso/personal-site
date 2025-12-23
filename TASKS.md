# Tasks

This is the **single source of truth** for what’s **Now / Next / Soon / Later**.
It stays small and actionable. The PM Hub conversation uses this file to plan sprints.

## How we work (ChatGPT Projects workflow)

- **PM Hub conversation (this one):**
  - Chooses the **next milestone**
  - Proposes a **sprint backlog (5–10 issues max)** with labels + DoD
  - After each sprint, ingests a **Sprint Handoff Packet** and updates docs +
    progress here

- **Each sprint gets its own ChatGPT conversation**
  - Work issue-by-issue (1–3 commits each)
  - End with a Sprint Handoff Packet pasted back into the PM Hub

## Current status

- **Active milestone:** Phase 3 Kickoff — Repo Hygiene + Tooling Baseline ✅
- **Last completed sprint:** Sprint 2 — Phase 3 Kickoff baseline ✅
- **Phase alignment:** Phase 3 is active; next work should implement Backend
  Foundations (apps + tests).

---

## Now (prepare next milestone + sprint)

These are the **next 3–7 items** that should become GitHub Issues for the next sprint.

- [ ] Create/confirm GitHub **Milestone** for Phase 3 Backend Foundations
- [ ] Backend Foundations sprint backlog (5–10 issues):
  - [ ] Scaffold Django apps: accounts, content, games, analytics
  - [ ] Add minimal backend tests for `/api/health/` (smoke test)
  - [ ] Decide initial API error shape and add one example endpoint using it

---

## Next (Phase 3 — Backend Foundations)

These should be scheduled once “Now” items are underway or complete.

- [ ] Create Django apps (scaffolding only to start):
  - [ ] accounts
  - [ ] content
  - [ ] games
  - [ ] analytics
- [ ] Move `/api/health/` into an appropriate app/module (optional refactor)
- [ ] Add minimal backend tests for health endpoint (smoke test)

---

## Soon (Phase 4 — Frontend Foundations)

- [ ] Routing + layout baseline:
  - [ ] Home
  - [ ] Projects
  - [ ] Blog
  - [ ] Resume
  - [ ] Contact
- [ ] Centralize API calls (single API client module)
- [ ] Standard loading/error patterns (shared components)

---

## Later (Deployment prep)

- [ ] Add `infra/` plan for DigitalOcean deployment
- [ ] Production env strategy (secrets, DEBUG=0, allowed hosts)
- [ ] HTTPS + reverse proxy plan
- [ ] Backups plan for Postgres

---

## Done (reference)

These are completed; keep only as a historical record.

- [x] Paste finalized docs (README/PLAN/TASKS/architecture/joel-test)
- [x] Commit + push documentation updates
- [x] Verify scripts work end-to-end:
  - [x] `.\scripts\dev.ps1`
  - [x] `.\scripts\down.ps1`
  - [x] `.\scripts\logs-backend.ps1`
  - [x] `.\scripts\logs-frontend.ps1`
  - [x] `.\scripts\migrate.ps1`
  - [x] `.\scripts\superuser.ps1`
- [x] Add `scripts/status.ps1`
- [x] Create GitHub labels + project board
- [x] Add Search Console note to PLAN (domain verified; postpone SEO)

- [x] Backend: add `/api/health/` endpoint returning `{ "status": "ok" }`
- [x] Frontend: fetch `/api/health/` and render status on home page
- [x] Document API conventions in `docs/architecture.md`
- [x] Decide API base path strategy: keep `/api/` now; plan `/api/v1/`
  later (documented migration trigger)
- [x] Add repo-wide line ending normalization (`.gitattributes`)
- [x] Establish backend lint baseline (ruff)
- [x] Establish frontend formatting baseline (prettier)
- [x] Add GitHub Actions CI baseline for backend/frontend checks
