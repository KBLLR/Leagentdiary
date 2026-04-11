# House Profile: leagentdiary
**ID:** `leagentdiary`  
**Version:** `1.0.0`  
**Status:** `development`

> Internal process and journal surface for session chronology, handoffs, and curated reflections.

## 1. Identity & Purpose
LeAgentDiary exists to make agent work traces inspectable before they are archived or published elsewhere.

It currently works best as:
- a timeline reader for HTDI diary data
- a process review surface for maintainers
- a staging point for deterministic `trace.session` and `trace.reflection` exports

It should not be treated as the canonical research corpus, a public-facing editorial layer, or a stage platform.

## 2. Technology Stack
- Vite
- React
- TypeScript
- HTDI API client
- deterministic export scripts

## 3. Alignment Boundary
- **Owns:** process trace, session chronology, curated reflections
- **Hands off to:** Anthology for ingest and archive
- **Consumed by:** downstream editorial surfaces only through selective public excerpts

## 4. Current Reality
- The timeline UI is the active runtime.
- The house depends on `GET /diary` and can optionally enrich with `GET /agents`.
- Stage and scene modules are quarantined under `experimental/stage/`.
- `trace.session` remains provenance evidence; `trace.reflection` is the Anthology ingest seam.
