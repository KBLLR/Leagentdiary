# LeAgentDiary

LeAgentDiary is the internal process and journal surface in the Core-X stack.

It exists to review HTDI session chronology, inspect handoffs, and produce curated `trace.reflection` exports for Anthology. It is not the canonical archive, not the editorial layer, and not a stage platform.

## Active boundary
- LeAgentDiary owns timeline review and curated reflection export.
- Anthology owns ingest, archive, and downstream compilation.
- Le Belle Epoch owns public/editorial presentation.

## Active runtime
- Vite + React + TypeScript timeline app
- HTDI client with required `GET /diary` and optional `GET /agents`
- Deterministic export script at `scripts/export-traces.mjs`

## Experimental boundary
Experimental stage and scene material has been quarantined under `experimental/stage/`.

That preserved material is reference-only and does not participate in the default app runtime, build, or export flow.

## Shared contracts
- `core-x/schemas/trace.session.schema.json`
- `core-x/schemas/trace.reflection.schema.json`

These contracts are the seam into Anthology.

## Development

### Install
```bash
npm install
```

### Run the timeline app
```bash
npm run dev
```

UI: `http://localhost:5170`

### Build
```bash
npm run build
```

### Export fixture traces
```bash
npm run export:traces -- --source-file fixtures/htdi.diary.sample.json
```

Outputs:
- `exports/trace.session/`
- `exports/trace.reflection/`
- `exports/manifest.json`

`trace.session` is provenance/evidence only. `trace.reflection` is the curated Anthology ingest seam.

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

## Data flow
```text
HTDI diary sessions
  -> LeAgentDiary timeline review
  -> trace.session + trace.reflection exports
  -> Anthology ingest/archive layer
  -> downstream editorial surfaces
```
