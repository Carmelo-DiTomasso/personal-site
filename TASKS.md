# Tasks

This file is the current working checklist. Keep it small and actionable.

## Now

- [ ] Paste finalized docs (README/PLAN/TASKS/architecture/joel-test)
- [ ] Commit + push documentation updates
- [ ] Verify scripts work end-to-end:
  - [ ] `.\scripts\dev.ps1`
  - [ ] `.\scripts\down.ps1`
  - [ ] `.\scripts\logs-backend.ps1`
  - [ ] `.\scripts\logs-frontend.ps1`
  - [ ] `.\scripts\migrate.ps1`
  - [ ] `.\scripts\superuser.ps1`
- [ ] Add `scripts/status.ps1` (prints `docker compose ps`)
- [ ] Create GitHub labels + project board
- [ ] Add a Search Console note to PLAN (domain verified;
      postpone SEO work until after real pages exist)

## Next (First end-to-end integration)

- [ ] Backend: add `/api/health/` endpoint returning `{ "status": "ok" }`
- [ ] Frontend: fetch `/api/health/` and render status on home page
- [ ] Document API conventions in `docs/architecture.md`

## Soon

- [ ] Decide API base path: `/api/` now, migrate to `/api/v1/` later
- [ ] Create Django apps:
  - [ ] accounts
  - [ ] content
  - [ ] games
  - [ ] analytics
- [ ] Add backend formatting/linting:
  - [ ] black
  - [ ] ruff
- [ ] Add frontend formatting/linting:
  - [ ] eslint (already present via Vite template)
  - [ ] prettier
- [ ] Add CI on GitHub Actions (lint + tests on PRs)
- [ ] SEO basics (after Home/Projects/About exist):
  - [ ] Add `<title>` + meta description + OG tags
  - [ ] Add `robots.txt` + `sitemap.xml`
  - [ ] Add Person schema (name + links)
  - [ ] Add site URL to LinkedIn + GitHub profile
  - [ ] Submit sitemap + request indexing in Search Console

## Later (Deployment prep)

- [ ] Add `infra/` plan for DigitalOcean deployment
- [ ] Add production env strategy (secrets, DEBUG=0, allowed hosts)
- [ ] Add HTTPS + reverse proxy plan
- [ ] Add backups plan for Postgres
