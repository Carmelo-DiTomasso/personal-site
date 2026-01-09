# Challenges

Running log of issues we hit while building this monorepo.

Goal: capture the why + fix quickly so we don't repeat work.

Guidelines:

- Keep entries short and actionable.
- Use "symptoms -> root cause -> fix -> prevention".
- Link to commits/docs when helpful.
- If a challenge becomes a reusable rule, add it to `docs/architecture.md`
  or scripts/docs.

---

## Active

### CH-000X: [short title]

- Date: YYYY-MM-DD
- Area: frontend | backend | infra | docs | tooling
- Impact: low | medium | high
- Status: investigating | mitigated | resolved

#### Active Symptoms

- [what you saw: errors, behavior]

#### Active Root cause

- [the underlying cause]

#### Active Fix

- [the minimal fix: commands / file changes]

#### Active Prevention

- [guardrails: lint rule, script, doc note, convention]

#### Active Refs

- Commit/PR: [hash or link]
- Notes: [links to docs or external refs]

---

## Resolved

### CH-0001: TS/Vite typecheck broke after deleting .d.ts

- Date: 2025-12-21
- Area: tooling
- Impact: high
- Status: resolved

#### 0001 Symptoms

- Cannot find global types like `Array` / `String`
- Cannot find `vite/client` type definitions
- Missing `lib.dom.d.ts` / `lib.es2022.d.ts`
- `tsc` / `vite` not recognized (broken local binaries)

#### 0001 Root cause

- Deleted `*.d.ts` under `node_modules` (TypeScript and Vite depend on them).
- Windows file locks caused a partial `node_modules` removal.

#### 0001 Fix

- Kill `node.exe` / `esbuild.exe` processes.
- Hard-delete `frontend/node_modules`.
- Reinstall with `npm ci`.

#### 0001 Prevention

- Never delete `*.d.ts` outside `src/`.
- Run `npm run typecheck` and `npm run build` before committing.
- Ignore `*.tsbuildinfo` files.

### CH-0002: Django test discovery missed tests in new packages

- Date: 2025-12-30
- Area: backend
- Impact: medium
- Status: resolved

#### 0002 Symptoms

- `python manage.py test` reported fewer tests than expected.
- Running a fully-qualified test path worked, but global discovery missed them.

#### 0002 Root cause

- Django test discovery requires `__init__.py` in test packages for module discovery.

#### 0002 Fix

- Add `__init__.py` to `apps/<app>/tests/` (and any nested test packages).

#### 0002 Prevention

- When adding a new test folder, always include `__init__.py`.
- If tests seem “missing”, compare `manage.py test` vs running a module path.

### CH-0003: Turnstile site key not loaded until `frontend/.env.local`

- Date: 2025-12-30
- Area: frontend
- Impact: medium
- Status: resolved

#### 0003 Symptoms

- UI showed: “CAPTCHA is not configured. Set VITE_TURNSTILE_SITE_KEY.”
- Keys added to other `.env` files didn’t affect the Vite dev build.

#### 0003 Root cause

- Vite env loading is scoped to the frontend project and expected env file locations.

#### 0003 Fix

- Add `VITE_TURNSTILE_SITE_KEY` to `frontend/.env.local`.

#### 0003 Prevention

- Document frontend env var placement (`frontend/.env.local`)
  and backend secrets in root `.env`.

### CH-0004: Turnstile emits console warnings (PAT challenge / preload)

- Date: 2025-12-30
- Area: frontend
- Impact: low
- Status: resolved

#### 0004 Symptoms

- Console warnings about
  PAT challenge requests /
  preloaded resources /
  CSP fallback notes.

#### 0004 Root cause

- Turnstile’s injected scripts and challenge flow can trigger browser warnings.

#### 0004 Fix

- No code change required; confirm widget renders
  and backend verification succeeds.

#### 0004 Prevention

- Treat as non-actionable unless the widget fails or token verification fails.

### CH-0005: Safari compatibility warning for `user-select`

- Date: 2026-01-09
- Area: frontend
- Impact: low
- Status: resolved

#### 0005 Symptoms

- VSCode / Edge DevTools warning:
  `user-select` is not supported by Safari (iOS/Safari), suggests adding `-webkit-user-select`.

#### 0005 Root cause

- Safari requires the prefixed property for consistent support.

#### 0005 Fix

- Add `-webkit-user-select: none;` alongside `user-select: none;`
  on the relevant container.

#### 0005 Prevention

- When using browser-sensitive CSS features, include vendor-prefixed equivalents
  where recommended by tooling (or rely on a configured autoprefixing pipeline).
