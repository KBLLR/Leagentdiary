# LeAgentDiary Roadmap

## Active lane
LeAgentDiary is a narrow upstream house:
- run the persona ritual for active diary agents
- review HTDI session chronology
- inspect handoffs and process signals
- export curated `trace.reflection` artifacts for Anthology

## Current priorities
1. Keep the persona ritual explicit and enforced in the profile lane.
2. Keep the Vite app stable around the diary lane.
3. Keep `scripts/export-traces.mjs` deterministic for identical input.
4. Maintain a minimal verification story: lint, build, and fixture export determinism.
5. Preserve the boundary with Anthology and avoid growing a second archive or publication system here.

## Experimental material
All stage and scene work is quarantined under `experimental/stage/`.

It is preserved for reference only:
- not part of the default runtime
- not required for the build
- not required for the export flow
- not a product direction for this house

## Deferred work
- Better internal review affordances on the timeline
- richer ritual-guided profile editing and validation feedback
- More explicit reflection curation tooling before Anthology ingest
- Stronger fixture coverage around export schemas and error cases
