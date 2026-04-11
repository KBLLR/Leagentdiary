# LeAgentDiary Agents

## House Role
- House ID: `leagentdiary`
- Role: internal process and journal surface for session chronology, handoffs, and curated reflections
- Status/Type: development · house app

## Boundary
- Owns raw process trace and curated reflection exports
- Does **not** own the canonical research/archive layer
- Does **not** own public editorial publication
- Does **not** own world/stage productization

## Shared Contracts
- `core-x/schemas/trace.session.schema.json`
- `core-x/schemas/trace.reflection.schema.json`

These contracts are the seam into Anthology.

## Interfaces
- UI: `http://localhost:5170`
- HTDI base API: `http://localhost:3000/api`
- Required endpoint: `GET /diary`
- Optional endpoint: `GET /agents`

## Runtime / Dev
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run export:traces -- --source-file fixtures/htdi.diary.sample.json`
- `npm run verify:active`

## Export Layer
- Writes deterministic process artifacts to `exports/trace.session/` and `exports/trace.reflection/`
- `trace.session` is provenance/evidence only
- `trace.reflection` is the curated ingest seam into Anthology

## Experimental Modules
- `experimental/stage/src/`
- `experimental/stage/public/`
- `experimental/stage/api/vercel-deployments.mjs`
- `experimental/stage/server/fetchVercelDeployments.mjs`

These modules are preserved as optional experiments and must not redefine the house as a scene platform or general memory backend.

## Protocol Notes
- If agentic/runtime features are added, use Core-X gateway `http://localhost:8090`
- Use `/v1/responses` for LLM calls
- Do not introduce `/v1/chat/completions`
