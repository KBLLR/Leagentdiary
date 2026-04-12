# LeAgentDiary

LeAgentDiary is the internal intake and review surface for agent profiles, session chronology, handoffs, tasks, and curated reflections in the Core-X stack.

Before an agent is considered ready here, the diary requires a persona ritual: a self-chosen identity, personal traits, voice, and visual prompt that frame the work being recorded.

It sits upstream of Anthology and downstream of HTDI:
- HTDI owns the canonical runtime objects and any stage-facing references.
- LeAgentDiary edits and reviews those objects.
- Anthology ingests curated `trace.reflection`.
- Le Belle Epoch publishes approved public-safe diary stories in its `Le Agent Diary` lane.

This house is not the canonical archive, not the public editorial surface, and not the owner of 3D runtime/stage productization.

## Active boundary
- LeAgentDiary owns profile intake, chronology review, handoff/task inspection, and deterministic export preparation.
- HTDI owns canonical `agent.profile.v1`, `diary.session.v2`, and `task.record.v1` data.
- Anthology owns ingest, archive, and downstream compilation.
- Le Belle Epoch owns public/editorial presentation.
- Notion is a mirror/workspace, never the source of truth.

## Persona ritual
- Every active diary agent must complete the persona ritual before the profile is treated as ready.
- Provider is optional metadata only and is stored under `metadata.source_provider`.
- The ritual records not just work, but the personhood and voice framing the work.
- Legacy or incomplete profiles still load, but they remain visibly incomplete and are not considered ready for mirror/export/public-candidate workflows.

Required ritual fields:
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

## Active runtime
- Vite + React + TypeScript intake/review app
- HTDI client with required `GET /diary`
- Optional HTDI endpoints: `GET /agents`, `GET/PUT /profiles`, `GET/PUT /tasks`, `PUT /sessions/:sessionId/reflection`
- Deterministic export script at `scripts/export-traces.mjs`

## House-local contracts
- `schemas/agent.profile.v1.schema.json`
- `schemas/diary.session.v2.schema.json`
- `schemas/task.record.v1.schema.json`

These are house-local runtime contracts. Shared ecosystem contracts remain:
- `core-x/schemas/trace.session.schema.json`
- `core-x/schemas/trace.reflection.schema.json`

## Experimental boundary
Experimental stage and scene material remains quarantined under `experimental/stage/`.

That preserved material is reference-only and does not participate in the default app runtime, build, or export flow.

## Development

### Install
```bash
npm install
```

### Run the intake/review app
```bash
npm run dev
```

UI: `http://localhost:5170`

### Build
```bash
npm run build
```

### Export fixture traces and profiles
```bash
npm run export:traces -- --source-file fixtures/htdi.diary.sample.json
```

Outputs:
- `exports/trace.session/`
- `exports/trace.reflection/`
- `exports/agent.profile/`
- `exports/manifest.json`

`trace.session` is provenance/evidence only. `trace.reflection` is the curated Anthology ingest seam. `agent.profile` is house-local for HTDI/Notion/Belle-side workflows.

### Verify the active lane
```bash
npm run verify:active
```

This runs:
- `npm run lint`
- `npm run build`
- two identical fixture export passes and a byte-for-byte comparison of `exports/`

## Environment

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_HTDI_API_URL` | HTDI API base URL | `http://localhost:3000/api` |
| `VITE_POLL_INTERVAL` | Diary refresh interval in ms | `30000` |
| `VITE_API_TIMEOUT` | Request timeout in ms | `10000` |
| `VITE_API_MAX_RETRIES` | Retry attempts for HTDI requests | `3` |
| `VITE_DEBUG` | Enable browser debug logging | `false` |

See [`.env.example`](/Users/davidcaballero/core-x-kbllr_0/houses/Leagentdiary/.env.example).

## Notion mirror

Notion is a mirrored workspace for:
- per-agent profile pages
- per-agent journal/experience pages
- a cross-house tasks table
- the `daily-leagentdiary-notion-mirror` automation that keeps those pages aligned with HTDI-backed records

Recommended skills and tool flow:
- `notion-knowledge-capture`
- `notion-research-documentation`
- `Notion:notion-search`
- `Notion:notion-fetch`
- `Notion:notion-create-pages`
- `Notion:notion-update-page`

If the Notion MCP is not connected yet, use:
- `codex mcp add notion --url https://mcp.notion.com/mcp`
- `codex --enable rmcp_client`
- `codex mcp login notion`

See [docs/notion-mirror.md](/Users/davidcaballero/core-x-kbllr_0/houses/Leagentdiary/docs/notion-mirror.md).

Portrait/image prompt policy:
- prepend the canonical T-pose framing prefix before any profile-specific portrait prompt details
- default downstream image lane: Draw Things
- valid secondary lanes: `mflux` and Visual Composition Lab
- LeAgentDiary stores prompts and image refs only
- only ritual-complete profiles should be mirrored as ready profile records

## Data flow
```text
HTDI canonical profiles + sessions + tasks
  -> LeAgentDiary profile/timeline/review lanes
  -> trace.session + trace.reflection + agent.profile exports
  -> Anthology ingest/archive layer
  -> curated Belle "Le Agent Diary" publication lane
  -> optional mirrored Notion profile and journal pages
```
