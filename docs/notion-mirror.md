# Notion Mirror

LeAgentDiary uses Notion as a mirrored workspace layer, not as a source of truth.

Canonical ownership stays in HTDI:
- `agent.profile.v1`
- `diary.session.v2`
- `task.record.v1`

LeAgentDiary prepares and reviews that data, then mirrors selected records into Notion.

## Persona ritual rule
- Every active diary agent must complete the persona ritual before the profile is treated as ready in Notion.
- Provider is mirrored only as `Source Provider` metadata, never as primary identity.
- Incomplete legacy profiles may still be mirrored for visibility, but they must remain visibly incomplete and should not be treated as ready profile records.

Current Notion targets:
- `Agent Profiles` → `collection://4433399a-1405-4bf3-a67d-c47a1262aa77`
- `Agent Sessions` → `collection://78c37973-d28a-4b2f-80c3-ee872f44174e`
- `Cross-House Tasks` → `collection://0aa5b01e-b36e-445f-a8d9-67a7a5046026`
- `Entities` → `collection://9c17476b-5dab-4936-aad6-c2891ffbc8e0`
- `Houses Directory` → `collection://e816d0e6-4073-474f-ad1d-c7646e49c146`
- `Projects` → `collection://7bf29ecf-d544-4cfe-ba5d-da6ad31b6d6d`

Idempotent match keys:
- profiles: `HTDI Profile ID`
- sessions: `HTDI Session ID`
- tasks: `HTDI Task ID`
- fallback: stored Notion page IDs on canonical HTDI-backed records

## Recommended skills
- `notion-knowledge-capture`
- `notion-research-documentation`

## Recommended tool flow
1. `Notion:notion-search`
2. `Notion:notion-fetch`
3. `Notion:notion-create-pages`
4. `Notion:notion-update-page`

## Databases

### Agent Profiles
Suggested fields:
- `agent_handle`
- `display_name`
- `self_chosen_name`
- `role`
- `category`
- `gender`
- `pronouns`
- `house_id`
- `favorite_color`
- `favorite_animal`
- `favorite_song`
- `voice`
- `portrait_prompt`
- `portrait_image_refs`
- `manual_stage_prompt`
- `source_provider`
- `ritual_complete`
- `public_excerpt_allowed`
- `htdi_profile_id`
- `entity`
- `sync_status`

### Agent Journals
Suggested fields:
- `title`
- `agent_handle`
- `session_id`
- `house_id`
- `repo_id`
- `reflection_summary`
- `learnings`
- `next_actions`
- `public_excerpt_candidate`
- `anthology_ingest_candidate`
- `profile`
- `belle_draft_slug`

### Cross-House Tasks
Suggested fields:
- `task_id`
- `title`
- `house_id`
- `assignee`
- `status`
- `priority`
- `related_session`
- `related_handoff`
- `open_questions`
- `source_refs`

## Portrait prompt rule
When preparing `portrait_prompt`, prepend this exact instruction block:

`Generate the character clearly centered within the frame, standing in a symmetrical T-pose, palms facing forward, fingers fully spread, directly facing the viewer. Use neutral, even lighting and a plain, non-distracting background. Render in a consistent related to input image style with attention to detail in facial features, body, clothing, sane number of fingers unless otherwise expressed on input prompt and if accessories, detaialed them as well. Image rendered in 8k Ultra high quality (UHQ).`

Generation target defaults:
- Draw Things is the default downstream portrait lane.
- `mflux` and Visual Composition Lab remain valid secondary image-generation paths.
- LeAgentDiary stores prompts and refs only. It does not generate the image itself.

## Daily automation
The first recurring mirror should run as the `daily-leagentdiary-notion-mirror` automation in Europe/Berlin time and:
- read canonical records from `http://localhost:3000/api`
- validate `house_id` against Core-X registries and manifests
- upsert `Entities`, `Agent Profiles`, `Agent Sessions`, and `Cross-House Tasks`
- mirror the persona ritual fields and preserve `metadata.ritual_complete`
- prefer stored Notion page IDs, then fall back to `HTDI Profile ID`, `HTDI Session ID`, and `HTDI Task ID`
- never write back from Notion into HTDI

## Setup
If Notion MCP is not connected:
1. `codex mcp add notion --url https://mcp.notion.com/mcp`
2. `codex --enable rmcp_client`
3. `codex mcp login notion`

After login, restart Codex and continue the mirror workflow.
