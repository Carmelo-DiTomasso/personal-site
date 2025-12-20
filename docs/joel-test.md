# Joel Test Checklist (Project Version)

This is a practical checklist to keep the project “professional-grade” as it grows.

## Build & run

- [x] Source control exists (GitHub)
- [x] One-command local start exists (`.\scripts\dev.ps1`)
- [ ] One-command test run exists (add after tests exist)
- [x] New machine can run local dev using README (Docker Desktop + scripts)
- [x] Secrets are not committed (`.env` ignored)

## Quality

- [ ] Backend lint/format configured (ruff/black)
- [ ] Frontend formatting configured (prettier)
- [ ] CI runs on every PR (lint + tests)
- [ ] Main branch stays deployable

## Process

- [ ] GitHub Issues used for features/bugs
- [ ] Labels exist (type/area/priority)
- [ ] Project board exists (Backlog → Ready → In Progress → In Review → Done)
- [ ] PR template exists
- [ ] Definition of Done is written and followed

## Documentation

- [x] Architecture doc exists (`docs/architecture.md`)
- [ ] ADRs used for major decisions (`docs/adr/`)
- [x] Plan + tasks tracked (`PLAN.md`, `TASKS.md`)
- [ ] API docs added as endpoints expand

## Security baseline

- [x] Django Admin working (local)
- [ ] Auth endpoints rate-limited (later)
- [ ] Security headers (later)
- [ ] CSP plan (later)
- [ ] 2FA (TOTP) stretch goal (later)

## Definition of Done (for tasks)

A task is “done” when:
- Code works locally via Docker Compose
- Basic errors are handled (no crashing on common failures)
- Docs updated (README/architecture/tasks as appropriate)
- Committed and pushed with a clear message
