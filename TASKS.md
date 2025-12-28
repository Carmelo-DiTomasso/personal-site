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

- **Live hosting:** Vercel (frontend)
- **Backend hosting:** DigitalOcean App Platform + DO Managed Postgres
- **Last completed sprint:** Sprint 6 — Phase 4: Site Skeleton v0 ✅
- **Live behavior:** API Status and Projects work on the live homepage

---

## Now (Sprint 7 / Milestone: Phase 5 — Content + UX v0)

Goal: Replace placeholders with real page content and improve UX for common
dev/prod failure modes (auth, empty states).

- [ ] Projects page v0
  - [ ] Render projects from `GET /api/content/projects/` on `/projects`
  - [ ] Loading / empty / error states
  - [ ] Reuse existing UI primitives (no duplicate badge/card CSS)
- [ ] Resume page v0 polish
  - [ ] Consistent embed/download behavior
  - [ ] Works on refresh/direct URL
- [ ] Contact page v0
  - [ ] Real copy + mailto + social links (accessible)
- [ ] DX: graceful auth failures for API calls
  - [ ] Friendly UI when `/api/*` returns 401/403 (no noisy console errors)
  - [ ] Document in `CHALLENGES.md`
- [ ] Docs: routing/layout conventions
  - [ ] Update `docs/architecture.md` with current route/layout structure

---

## Next (Projects polish + content workflows)

- [ ] Featured project display rules (UI + ordering contract)
- [ ] Add `/projects/:slug` (optional detail pages)
- [ ] Blog: model + API + admin + placeholder page
- [ ] Site info + stats: decide data sources and API needs

---

## Soon (Quality & safety rails)

- [ ] Tighten tests for content endpoints
- [ ] Add basic rate limiting plan (when forms/auth arrive)
- [ ] SEO basics once routes exist (title/meta/OG/robots/sitemap)

---

## Later (Hardening / ops polish)

- [ ] DO production hardening (reverse proxy, backups, monitoring, rollback)
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

### Sprint 5 — Live API on DigitalOcean v0 ✅

- DO App Platform backend + DO Managed Postgres deployed
- WhiteNoise + collectstatic so admin/static work in prod
- CI fixed for SECRET_KEY enforcement during tests
- Production Projects seeded via admin
- Live homepage API Status + Projects working

### Sprint 6 — Phase 4: Site Skeleton v0 ✅

- Routing skeleton for top-level pages
- Universal header/footer + layout wrapper
- Root pre-PR command: `.\scripts\check.ps1` documented
