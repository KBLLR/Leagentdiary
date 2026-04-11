# Notion Mirror

LeAgentDiary uses Notion as a mirrored workspace layer, not as a source of truth.

Canonical ownership stays in HTDI:
- `agent.profile.v1`
- `diary.session.v2`
- `task.record.v1`

LeAgentDiary prepares and reviews that data, then mirrors selected records into Notion.

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
- `role`
- `category`
- `house_id`
- `portrait_prompt`
- `portrait_image_refs`
- `manual_stage_prompt`
- `public_excerpt_allowed`
- `htdi_profile_id`

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

## Setup
If Notion MCP is not connected:
1. `codex mcp add notion --url https://mcp.notion.com/mcp`
2. `codex --enable rmcp_client`
3. `codex mcp login notion`

After login, restart Codex and continue the mirror workflow.
