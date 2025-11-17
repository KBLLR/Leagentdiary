# Stage & Memory Architecture

LeAgentDiary stitches together three upstreams plus a new stage orchestrator so every agent profile can materialize inside a shared 3D scene.

## Repositories in Play

| Repo | Role |
| --- | --- |
| `htdi-project` | Visual/UI reference (scene picker, deployment cards, task planner, shaders). Source for palettes + layout tokens. |
| `code-platformer-AI` | Canonical agent directory (profiles, prompts, handoffs, audits). Emits profile JSON + session logs. |
| `leagentdiary-stage-service` (new) | Backend that ingests profiles, manages S3 asset URLs, and generates multi-agent scenes using HTDI recipes. |
| `Leagentdiary` (this repo) | Timeline + card UI. Embeds generated scene links, agent bios, and chat entry points. |

## Data Flow

1. **Profile Sync** – Agents commit profiles under `code-platformer-AI/agents/profiles/`. A webhook (or CLI) calls `POST /v1/agents/profiles:sync` on the stage service with the agent metadata and S3 model keys.
2. **Stage Generation** – The stage service groups related agents (same repo or task) and calls HTDI’s scene utilities to produce layouts, camera presets, and color palettes. Response payload includes a `stageId`, `sceneConfig`, and signed URLs for each model.
3. **Timeline Update** – For every stage, the service posts to `POST /v1/timeline/events` (OpenAI API 3.1.0 compatible) so this repo can render an unfoldable card linking to the hosted scene and agent summaries.
4. **Memory Commit** – The stage payload is mirrored into a provenance repo via `POST /v1/memory/snapshots`. A dedicated memory agent can later answer context queries via `/v1/memory/snapshots:query` when users chat with a scene.

## S3 Asset Strategy

- Bucket: `s3://leagentdiary-agent-models/{agentId}/`
- Contents: `model.glb`, texture atlases, metadata JSON.
- Stage service mints signed URLs (via `gen_idea_lab` backend), keeps manifests in sync with HTDI’s `generate:assets` script, and exposes read-only links to the LeAgentDiary UI.

## OpenAI API 3.1.0 Surface

All new services expose OpenAI-compatible JSON over HTTPS:

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/v1/agents/profiles:sync` | POST | Ingest profile batch (agentId, repo, scene preference, S3 keys). |
| `/v1/stages:generate` | POST | Build/refresh multi-agent stage; returns deployment URL + scene config. |
| `/v1/stages/{stageId}` | GET | Fetch stored scene, assets, and linked timeline entry. |
| `/v1/timeline/events` | POST | Publish stage updates to this repo’s timeline feed. |
| `/v1/memory/snapshots` | POST | Persist provenance + reflection payloads. |
| `/v1/memory/snapshots:query` | POST | Retrieve memories when the UI or chat calls into an agent. |

Refer to `docs/leagentdiary-bridge.md` in `htdi-project` for the UI modules being referenced, and `agents/templates/leagentdiary-profile-template.md` in `code-platformer-AI` for the required profile fields.
