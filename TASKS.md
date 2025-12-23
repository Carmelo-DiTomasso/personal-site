<!-- markdownlint-disable MD013 -->

# Tasks

This is the **single source of truth** for what’s **Now / Next / Soon / Later**.
It stays small and actionable. The PM Hub conversation uses this file to plan sprints.

## How we work (ChatGPT Projects workflow)

- **PM Hub conversation (this one):**
  - Chooses the **next milestone**
  - Proposes a **sprint backlog (5–10 issues max)** with labels + DoD
  - After each sprint, ingests a **Sprint Handoff Packet** and updates docs + progress here

- **Each sprint gets its own ChatGPT conversation**
  - Work issue-by-issue (1–3 commits each)
  - End with a Sprint Handoff Packet pasted back into the PM Hub

## Current status

- **Active milestone:** *(set by PM Hub when you say “suggest next milestone” or “start sprint”)*
- **Last completed sprint:** E2E Integration v0 (Health Check + Dev Workflow Baseline) ✅
- **Phase alignment:** Phase 2 is complete; next work should advance Phase 3 (Backend Foundations).

---

## Now (prepare next milestone + sprint)

These are the **next 3–7 items** that should become GitHub Issues for the next sprint.

- [ ] Create/confirm GitHub **Milestone** for Phase 3 kickoff (see PLAN Phase 3)
- [ ] Decide API base path strategy:
  - [ ] Keep `/api/` now
  - [ ] Define migration plan to `/api/v1/` later (docs-only decision is fine)
- [ ] Add repo-wide line ending normalization to prevent CRLF/LF lint churn:
  - [ ] Add `.gitattributes`
  - [ ] Ensure YAML/MD stay lint-clean on Windows
- [ ] Establish backend lint/format baseline (minimal, safe):
  - [ ] Add `ruff` (and optionally `black`) configuration
  - [ ] Add a script or documented command to run backend lint locally
- [ ] Establish frontend formatting baseline:
  - [ ] Add `prettier` (and keep ESLint as-is if already present)
  - [ ] Add a script or documented command to format/lint frontend
- [ ] Add a minimal GitHub Actions CI workflow:
  - [ ] Run lint (backend + frontend) and tests (if present) on PRs

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
