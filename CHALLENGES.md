<!-- markdownlint-disable MD013 -->

# Challenges

Running log of issues we hit while building this monorepo.

Goal: capture the why + fix quickly so we don’t repeat work.

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

#### Symptoms

- Cannot find global types like `Array` / `String`
- Cannot find `vite/client` type definitions
- Missing `lib.dom.d.ts` / `lib.es2022.d.ts`
- `tsc` / `vite` not recognized (broken local binaries)

#### Root cause

- Deleted `*.d.ts` under `node_modules` (TypeScript and Vite depend on them).
- Windows file locks caused a partial `node_modules` removal.

#### Fix

- Kill `node.exe` / `esbuild.exe` processes.
- Hard-delete `frontend/node_modules`.
- Reinstall with `npm ci`.

#### Prevention

- Never delete `*.d.ts` outside `src/`.
- Run `npm run typecheck` and `npm run build` before committing.
- Ignore `*.tsbuildinfo` files.

#### Refs

- Commit/PR: [fill in]

#### New

Local dev: backend may require re-login; symptoms: /api/* calls fail until you authenticate; fix: open admin/login or run dev script and login.
