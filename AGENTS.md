# LeAgentDiary Agents

## House Role
- House ID: `leagentdiary`
- Role: internal intake and review surface for profiles, chronology, tasks, handoffs, and curated reflections
- Status/Type: development · house app

## Boundary
- Owns profile intake, session review, deterministic exports, and curation markers
- Does **not** own the canonical research/archive layer
- Does **not** own public editorial publication
- Does **not** own world/stage productization

## Shared Contracts
- `core-x/schemas/trace.session.schema.json`
- `core-x/schemas/trace.reflection.schema.json`

These contracts are the seam into Anthology.

## House-Local Contracts
- `schemas/agent.profile.v1.schema.json`
- `schemas/diary.session.v2.schema.json`
- `schemas/task.record.v1.schema.json`

## Interfaces
- UI: `http://localhost:5170`
- HTDI base API: `http://localhost:3000/api`
- Required endpoint: `GET /diary`
- Optional endpoints:
  - `GET /agents`
  - `GET /profiles`
  - `PUT /profiles/:agentHandle`
  - `GET /tasks`
  - `PUT /tasks/:taskId`
  - `PUT /sessions/:sessionId/reflection`

## Runtime / Dev
- `npm install`
- `npm run dev`
- `npm run build`
- `npm run export:traces -- --source-file fixtures/htdi.diary.sample.json`
- `npm run verify:active`

## Export Layer
- Writes deterministic process artifacts to:
  - `exports/trace.session/`
  - `exports/trace.reflection/`
  - `exports/agent.profile/`
- `trace.session` is provenance/evidence only
- `trace.reflection` is the curated ingest seam into Anthology
- `agent.profile` remains house-local for HTDI/Notion/Belle-related workflows

## Notion Mirror
- Notion is a mirrored workspace, not the source of truth
- Recommended skills:
  - `notion-knowledge-capture`
  - `notion-research-documentation`
- Recommended tool flow:
  - `Notion:notion-search`
  - `Notion:notion-fetch`
  - `Notion:notion-create-pages`
  - `Notion:notion-update-page`

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
