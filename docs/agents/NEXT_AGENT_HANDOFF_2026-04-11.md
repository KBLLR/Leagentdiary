# Next Agent Handoff: Persona Ritual Enforcement and HTDI Alignment

You are working in `/Users/davidcaballero/core-x-kbllr_0/houses/Leagentdiary`.

## Mission

Make the persona ritual mandatory for active diary agents while keeping LeAgentDiary as an internal process and journal surface. Harden the HTDI diary UX, deterministic export flow, and Notion mirror without turning this repo into a stage platform, general memory backend, or a second archive system.

## Current Truth

- `AGENTS.md` and `README.md` define the house as a persona ritual, chronology, review, and export surface.
- The active app lane already exists:
  - React + Vite + TypeScript timeline app
  - HTDI API client in `src/api/htdi-client.ts`
  - deterministic export script in `scripts/export-traces.mjs`
  - export outputs under `exports/trace.session/` and `exports/trace.reflection/`
- Active diary readiness now depends on a ritual-complete profile rather than a thin provider-backed identity.
- The repo still contains a large experimental stage subsystem:
  - `src/stage/`
  - `public/stage/`
  - `api/vercel-deployments.mjs`
  - `server/fetchVercelDeployments.mjs`
- Git state is mixed on `main` and currently ahead of `origin/main` by 5 commits.

## What To Do

1. Audit the current worktree and separate product-critical work from experimental or stale drift.
2. Align docs, scripts, and runtime with the journal/export boundary:
   - LeAgentDiary owns persona ritual intake, timeline review, and curated reflection exports.
   - Anthology is the downstream ingest and archive layer.
   - Stage and scene modules stay explicitly experimental and secondary.
3. Keep provider as optional metadata only and make chosen name, traits, voice, and visual prompt the primary identity surface.
4. Decide whether these should be quarantined behind an explicit experimental boundary or trimmed if they are confusing the product direction:
   - `src/stage/`
   - `public/stage/`
   - `api/vercel-deployments.mjs`
   - `server/fetchVercelDeployments.mjs`
   - Default: quarantine, not expand.
5. Harden the HTDI app lane:
   - verify the timeline app entrypoints and HTDI client assumptions
   - verify the export flow is deterministic and documented
   - ensure `package.json`, `README.md`, and `AGENTS.md` tell the same story
6. Add a minimal verification story for the active house:
   - build check
   - lint check if still valid
   - export check against `fixtures/htdi.diary.sample.json`
7. Do not introduce new agent-platform abstractions, stage-service productization, or repo-spanning architecture in this pass.

## Expected Deliverable

- one clean persona-first diary direction
- reduced ambiguity around the stage subsystem
- docs, scripts, and runtime aligned to the active boundary
- a concise summary of what was kept active, quarantined, or removed
- validation results for build and export

## Acceptance Criteria

- `README.md`, `AGENTS.md`, and `package.json` tell the same story
- active runtime and export flow work without requiring the stage subsystem
- experimental stage files are clearly quarantined or documented as non-blocking
- no new product lane is introduced

## Recommended First Checks

```bash
git status --short --branch
npm install
npm run build
npm run lint
npm run export:traces -- --source-file fixtures/htdi.diary.sample.json
```
