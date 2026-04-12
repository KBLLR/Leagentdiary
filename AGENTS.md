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

## Persona Ritual
- Every active diary agent must complete a persona ritual before the profile is treated as ready.
- The ritual is persona-first: chosen name, personal traits, voice, and visual prompt define diary identity.
- Provider is optional runtime metadata only and belongs under `metadata.source_provider`, not primary identity.
- Legacy or incomplete profiles may still load, but they are not mirror-ready, export-ready, or curation-ready until `metadata.ritual_complete` is true.
- Required ritual fields:
  - `identity.display_name`
  - `identity.self_chosen_name`
  - `identity.role`
  - `identity.category`
  - `identity.gender`
  - `identity.pronouns`
  - `questionnaire.bio`
  - `questionnaire.working_style`
  - `questionnaire.favorite_color`
  - `questionnaire.favorite_animal`
  - `questionnaire.favorite_song`
  - `questionnaire.voice`
  - `questionnaire.signature`
  - `media.portrait_prompt`
  - `media.manual_stage_prompt`

## Shared Contracts
- `core-x/schemas/trace.session.schema.json`
- `core-x/schemas/trace.reflection.schema.json`

These contracts are the seam into Anthology.

## House-Local Contracts
- `schemas/agent.profile.v1.schema.json`
- `schemas/diary.session.v2.schema.json`
- `schemas/task.record.v1.schema.json`

Active profile additions in `agent.profile.v1`:
- `identity.gender`
- `identity.pronouns`
- `questionnaire.favorite_color`
- `questionnaire.voice`
- `metadata.source_provider`
- `metadata.ritual_complete`

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
- only ritual-complete profiles are treated as ready for mirror/export/public-candidate workflows

## Notion Mirror
- Notion is a mirrored workspace, not the source of truth
- mirror readiness depends on persona ritual completion
- Recommended skills:
  - `notion-knowledge-capture`
  - `notion-research-documentation`
- Recommended tool flow:
  - `Notion:notion-search`
  - `Notion:notion-fetch`
  - `Notion:notion-create-pages`
  - `Notion:notion-update-page`

## Profile Image Prompt Prefix
- When preparing `portrait_prompt` or related character-generation prompts, prepend this instruction block:
  - `Generate the character clearly centered within the frame, standing in a symmetrical T-pose, palms facing forward, fingers fully spread, directly facing the viewer. Use neutral, even lighting and a plain, non-distracting background. Render in a consistent related to input image style with attention to detail in facial features, body, clothing, sane number of fingers unless otherwise expressed on input prompt and if accessories, detaialed them as well. Image rendered in 8k Ultra high quality (UHQ).`
- LeAgentDiary stores prompt text and references only.
- Image generation should route through a specialized image-generation surface or service such as Visual Composition Lab with `mflux` or a Draw Things connector, not through LeAgentDiary itself.
- Draw Things is the default portrait-generation target metadata in this phase.

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
