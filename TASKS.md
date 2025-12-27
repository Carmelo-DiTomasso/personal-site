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
- **Last completed sprint:** Sprint 5 — Live API on DigitalOcean v0 ✅
- **Live behavior:** API Status and Projects work on the live homepage

---

## Now (Sprint 6 / Milestone: Phase 4 — Site Skeleton v0)

Goal: Lay groundwork for a multi-page site with shared layout and navigation.
No heavy content work yet; pages can be placeholders.

- [ ] Add routing for:
  - [ ] `/` (Home)
  - [ ] `/resume`
  - [ ] `/projects`
  - [ ] `/games`
  - [ ] `/contact`
  - [ ] `/site` (site info)
  - [ ] `/stats`
- [ ] Add universal layout:
  - [ ] Header (brand + nav)
  - [ ] Footer (basic links + copyright)
  - [ ] Shared page wrapper (consistent spacing)
- [ ] Add nav UX baseline:
  - [ ] Active link state
  - [ ] Keyboard accessible navigation
  - [ ] Mobile-friendly baseline (simple stacked or menu button, minimal)
- [ ] Add a root "check" command (universal pre-PR check)
  - [ ] Create `.\scripts\check.ps1`
  - [ ] Run lint + backend tests (and any existing frontend checks)
  - [ ] Document in README as "run before PR"

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
