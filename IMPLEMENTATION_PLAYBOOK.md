# LeAgentDiary Implementation Playbook

This file is now a historical note.

The older playbook described a stage-service expansion path that is no longer the active product direction for this house.

## Current direction
- timeline review of HTDI diary sessions
- handoff inspection
- deterministic `trace.session` and `trace.reflection` export
- Anthology as the downstream ingest/archive layer

## Experimental material
The quarantined stage and scene work now lives under `experimental/stage/`.

That material is preserved for reference only and is not part of the default runtime, build, or export flow.

## Source of truth
Use these files for the active house definition:
- `README.md`
- `AGENTS.md`
- `package.json`
- `scripts/export-traces.mjs`
- `scripts/verify-active.mjs`
