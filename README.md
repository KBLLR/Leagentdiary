# LeAgentDiary

LeAgentDiary is a **version controller for agents**: a place to save, reuse, and evolve your AI agents across projects. It connects your handoffs and logs (via the HTDI Agentic Framework) into a single interface where you can:

- Track contributions per agent and session  
- Re-summon previous agents with their context and history  
- Let agents grow through memory, self-reflection, and iteration  
- Attach smart 3D personas, either self-chosen or assigned at creation  

LeAgentDiary sits at the intersection of **HCI research**, **agentic workflows**, and **developer tooling**. It borrows the best ideas from version control systems (like Git) and applies them to **multi-agent ecosystems**: handoffs become commits, agents become contributors, and your lab turns into a navigable history of decisions, experiments, and narratives.

## Why this exists

Modern agent systems are powerful but ephemeral:
- Agent prompts get lost in chats.
- Handoffs live in random docs.
- There’s no canonical view of *who* did *what*, *when*, and *why*.

LeAgentDiary turns that chaos into an explicit, inspectable system:

- **HTDI Agentic Framework integration**  
  Use structured `HANDOFFS.md` files and agent logs as the backbone for your diary and dashboards.

- **Github-like history for agents**  
  Browse sessions as if they were commits, see which agents touched which files, and understand how your system evolved over time.

- **Reflection-first workflows**  
  Encourage agents to summarize, reflect, and propose next steps at the end of each session, making the system steadily more debuggable and learnable.

- **Room for narrative and personality**  
  While staying production-safe, LeAgentDiary lets agents keep self-chosen names, roles, and personas, so the ecosystem stays human-readable and memorable.

## Status

LeAgentDiary **HTDI Integration (Phase 1-3) is now complete** ✅

### Current Phase: Functional Application
**Status**: ✅ **COMPLETE** - App is deployed and operational
**Goal**: ~~Transform static Tailwind mock into deployable React app~~ **DONE**

**What's Complete**:
- ✅ Vite + React + TypeScript project structure
- ✅ Tailwind CSS v4 with custom color palette
- ✅ HTDI API client with retry logic and error handling
- ✅ React hooks for data fetching (useDiary, useDarkMode)
- ✅ Timeline UI components (expandable cards, loading/error/empty states)
- ✅ Header with dark mode toggle
- ✅ Error boundaries for graceful error handling
- ✅ Production build optimized (51KB gzipped)
- ✅ Responsive design (mobile, tablet, desktop)

**Next Phases** (future work):
- Phase 4: Advanced filtering and search
- Phase 5: Stage service integration (3D agent profiles)
- Phase 6: Memory and reflection features

Contributions, experiments, and weird ideas are welcome.

## Architecture Roadmap

- **Stage & Memory Service** — A dedicated backend (`leagentdiary-stage-service`) ingests agent profiles from `code-platformer-AI`, stores their GLBs in S3, and generates HTDI-style scenes. All interactions use OpenAI API 3.1.0 endpoints (`/v1/agents/profiles:sync`, `/v1/stages:generate`, `/v1/timeline/events`, `/v1/memory/snapshots`).
- **HTDI UI Reference** — The `htdi-project` repository remains the canonical source for the scene picker, deployment timeline, and UI chrome. See `docs/leagentdiary-bridge.md` in that repo for the extraction plan.
- **LeAgentDiary Timeline** — This repo consumes stage events and renders unfoldable cards linking to hosted scenes plus agent bios/chat entry points.

See `docs/stage-service.md` for the full multi-repo data flow.

---

## Getting Started

### Prerequisites
- **Node.js** v18+ (tested with v22.18.0)
- **npm** v10+ (comes with Node.js)
- **HTDI Agentic Lab** backend running at `http://localhost:3000` _(optional for testing - app will show empty state if unavailable)_
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/KBLLR/Leagentdiary.git
cd Leagentdiary

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.development
# (Optional) Edit .env.development to customize API URL, polling interval, etc.
```

### Development

```bash
# Start development server (runs on http://localhost:5170)
npm run dev

# The app will automatically:
# - Poll HTDI API every 30 seconds for diary updates
# - Show empty state if HTDI backend is unavailable
# - Display timeline entries when data is available
```

**Dark Mode**: Click the moon/sun icon in the header to toggle. Preference is saved to localStorage.

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Build output is in ./dist/
# Bundle size: ~51KB gzipped
```

### Environment Variables

All environment variables are prefixed with `VITE_` to be accessible in the browser:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_HTDI_API_URL` | HTDI backend URL | `http://localhost:3000/api` |
| `VITE_POLL_INTERVAL` | Diary refresh interval (ms) | `30000` (30s) |
| `VITE_DEBUG` | Enable debug logging | `true` in dev, `false` in prod |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `10000` (10s) |
| `VITE_API_MAX_RETRIES` | Max retry attempts | `3` |

See [`.env.example`](./.env.example) for complete configuration options.

### Project Structure

```
Leagentdiary/
├── src/
│   ├── api/          # HTDI API client with retry logic
│   ├── components/   # React components (Timeline, TimelineCard, etc.)
│   ├── hooks/        # Custom hooks (useDiary, useDarkMode)
│   ├── types/        # TypeScript interfaces for diary data
│   ├── App.tsx       # Main application component
│   └── main.tsx      # Entry point with ErrorBoundary
├── .env.development  # Development environment config
├── .env.production   # Production environment config
├── tailwind.config.js # Tailwind CSS v4 configuration
├── vite.config.ts    # Vite build configuration
└── package.json
```

### Troubleshooting

**App shows "No diary entries yet"**
- This is expected if the HTDI backend isn't running
- Start the HTDI backend: `cd ../htdi-agentic-lab && npm run dev`
- Verify backend is accessible: `curl http://localhost:3000/api/diary`

**Port 5170 already in use**
- Vite will automatically try ports 5171, 5172, etc.
- Check console output for actual port: `Local: http://localhost:XXXX/`

**Tailwind CSS classes not working**
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server: `npm run dev`

**TypeScript errors**
- Ensure you're using Node.js v18+
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`

For detailed implementation notes, see [`CLAUDE.md`](./CLAUDE.md).

---

## HTDI Agentic Lab Integration

LeAgentDiary's primary data source is the **HTDI Agentic Lab** multi-repo diary system.

### Architecture Overview
```
┌─────────────────────────────────────────────────────────┐
│  htdi-agentic-lab                                       │
│  ├── automation/scripts/diary/parse-multi-repo.mjs     │
│  │   → Generates diary JSON from Git history           │
│  ├── api/server (Express)                              │
│  │   → Exposes REST endpoints                          │
│  └── var/htdi.diary.json                               │
│      → Multi-repo diary data                           │
└─────────────────────────────────────────────────────────┘
                           ↓
              HTTP GET /api/diary
                           ↓
┌─────────────────────────────────────────────────────────┐
│  LeAgentDiary (this repo)                               │
│  ├── src/api/htdi-client.ts                            │
│  │   → Fetches diary data                              │
│  ├── src/components/Timeline.tsx                       │
│  │   → Renders interactive timeline                    │
│  └── src/hooks/useDiary.ts                             │
│      → Manages data state and polling                  │
└─────────────────────────────────────────────────────────┘
```

### HTDI API Endpoints
| Endpoint | Purpose | Status |
|----------|---------|--------|
| `GET /api/diary` | Fetch complete diary data | ✅ Available |
| `POST /api/automation/parse` | Trigger diary re-parsing | ✅ Available |
| `POST /api/automation/autopilot` | Launch automation workflows | ✅ Available |
| `POST /api/run-command` | Execute remote commands | ✅ Available |

### Future: Stage Service Endpoints (Phase 2)
These OpenAI API 3.1.0 compatible endpoints will be added when `leagentdiary-stage-service` is built:
- `POST /v1/agents/profiles:sync` — Ingest agent profiles
- `POST /v1/stages:generate` — Build multi-agent 3D scenes
- `GET /v1/stages/{stageId}` — Fetch scene configuration
- `POST /v1/timeline/events` — Publish timeline updates
- `POST /v1/memory/snapshots` — Store agent reflections
- `POST /v1/memory/snapshots:query` — Query past sessions

See [`docs/ROADMAP.md`](./docs/ROADMAP.md) for the full development plan.

---

## Documentation

- **[`CLAUDE.md`](./CLAUDE.md)** — Implementation playbook for Phase 1 (HTDI integration)
- **[`docs/ROADMAP.md`](./docs/ROADMAP.md)** — Long-term development phases and milestones
- **[`docs/stage-service.md`](./docs/stage-service.md)** — Multi-repo architecture and data flow
- **Architecture docs** (created during Phase 1):
  - `docs/ARCHITECTURE.md` — Technical deep dive
  - `docs/API.md` — Endpoint reference and contracts

---

## Contributing

LeAgentDiary is in active development. Contributions are welcome!

### How to Contribute
1. **Check the roadmap**: See [`docs/ROADMAP.md`](./docs/ROADMAP.md) for current priorities
2. **Read the playbook**: Review [`CLAUDE.md`](./CLAUDE.md) for implementation guidelines
3. **Open an issue**: Discuss your idea before starting work
4. **Submit a PR**: Follow conventional commit style (`feat:`, `fix:`, `docs:`, etc.)

### Development Workflow
- **Branch naming**: `claude/plan-leagentdiary-htdi-<session-id>` for agent sessions
- **Commit style**: Conventional commits (e.g., `feat: add timeline filtering`)
- **Testing**: Write tests for new features (Vitest + React Testing Library)
- **Documentation**: Update relevant docs in `docs/` and code comments

---

## License

MIT License — see [`LICENSE`](./LICENSE) for details.

---

## Acknowledgments

- **HTDI Agentic Lab** — Multi-repo diary system and API backend
- **code-platformer-AI** — Agent profile management (future integration)
- **htdi-project** — UI/UX inspiration and scene generation utilities

---

**Questions or feedback?** Open an issue or reach out to the HTDI team.
