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

LeAgentDiary is currently transitioning from **static prototype to functional application**.

### Current Phase: HTDI Integration (Phase 1)
**Status**: 🔄 Ready for implementation
**Goal**: Transform static Tailwind mock into deployable React app consuming HTDI Agentic Lab data

**What's Ready**:
- ✅ Static timeline UI prototype (`index.html`)
- ✅ Architecture documentation (`docs/stage-service.md`)
- ✅ Comprehensive implementation playbook ([`CLAUDE.md`](./CLAUDE.md))
- ✅ Development roadmap ([`docs/ROADMAP.md`](./docs/ROADMAP.md))

**Next Steps** (see [`CLAUDE.md`](./CLAUDE.md) for detailed tasks):
1. Initialize Vite + React + TypeScript project
2. Build data integration layer for HTDI API endpoints
3. Port timeline UI to React components
4. Add filtering, search, and responsive design
5. Deploy to production

Contributions, experiments, and weird ideas are welcome.

## Architecture Roadmap

- **Stage & Memory Service** — A dedicated backend (`leagentdiary-stage-service`) ingests agent profiles from `code-platformer-AI`, stores their GLBs in S3, and generates HTDI-style scenes. All interactions use OpenAI API 3.1.0 endpoints (`/v1/agents/profiles:sync`, `/v1/stages:generate`, `/v1/timeline/events`, `/v1/memory/snapshots`).
- **HTDI UI Reference** — The `htdi-project` repository remains the canonical source for the scene picker, deployment timeline, and UI chrome. See `docs/leagentdiary-bridge.md` in that repo for the extraction plan.
- **LeAgentDiary Timeline** — This repo consumes stage events and renders unfoldable cards linking to hosted scenes plus agent bios/chat entry points.

See `docs/stage-service.md` for the full multi-repo data flow.

---

## Getting Started (For Developers)

### Prerequisites
- **Node.js** v18+
- **HTDI Agentic Lab** running at `http://localhost:3000` (see [htdi-agentic-lab](https://github.com/KBLLR/htdi-agentic-lab))
- **Git** for version control

### Quick Start (Current: Static Prototype)
```bash
# Clone the repository
git clone https://github.com/KBLLR/Leagentdiary.git
cd Leagentdiary

# Open the prototype in your browser
open index.html
```

The current `index.html` displays a static timeline with mock data to demonstrate the intended UI/UX.

### Upcoming: React Development (Phase 1)
Once Phase 1 implementation begins (see [`CLAUDE.md`](./CLAUDE.md)), the setup will be:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development to point to your HTDI backend

# Start development server
npm run dev

# Build for production
npm run build
```

**Important**: Review [`CLAUDE.md`](./CLAUDE.md) before starting development. It contains the complete implementation plan, task breakdown, and technical decisions.

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
