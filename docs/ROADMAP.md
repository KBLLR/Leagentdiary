# LeAgentDiary Development Roadmap

This document outlines the planned development phases for LeAgentDiary, from initial HTDI integration through advanced agentic features.

---

## Phase 0: Foundation (Current - Orchestration Complete)

**Status**: ✅ Complete
**Duration**: 1 week
**Deliverables**:
- [x] Static Tailwind prototype demonstrating timeline UI
- [x] Architecture documentation (`stage-service.md`)
- [x] Implementation playbook (`CLAUDE.md`)
- [x] Repository structure and initial docs

**Key Decisions Made**:
- Timeline-first UI approach (inspired by Git commit history)
- Multi-repo architecture with separation of concerns
- React + Vite + TypeScript for modern DX
- HTDI Agentic Lab as primary data source

---

## Phase 1: HTDI Integration (Next - Immediate Priority)

**Status**: 🔄 Ready to Start
**Duration**: 2-3 weeks
**Owner**: Claude CLI Agent (following `CLAUDE.md` playbook)

### Objectives
Transform LeAgentDiary from static prototype to functional diary UI consuming HTDI Agentic Lab data.

### Milestones

#### Milestone 1.1: Project Scaffolding (Week 1)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS (production build)
- [ ] Set up environment variables (`.env.development`, `.env.production`)
- [ ] Verify dev server runs and HMR works
- [ ] Configure ESLint + Prettier

**Success Criteria**: Dev server runs at `http://localhost:5173` with Tailwind styling.

---

#### Milestone 1.2: Data Layer (Week 1-2)
- [ ] Define TypeScript interfaces matching HTDI diary schema
- [ ] Create API client for HTDI endpoints (`/api/diary`, `/api/automation/*`)
- [ ] Implement `useDiary()` hook with polling (30s interval)
- [ ] Add error handling and retry logic
- [ ] Test with live HTDI backend at `http://localhost:3000`

**Success Criteria**: App fetches and displays raw diary data from HTDI.

---

#### Milestone 1.3: Timeline UI (Week 2)
- [ ] Port timeline card component to React
- [ ] Implement expand/collapse interaction
- [ ] Create timeline container with loading/error states
- [ ] Add responsive layout (mobile-first)
- [ ] Implement dark mode toggle with persistence

**Success Criteria**: Timeline renders diary entries with smooth animations, works on mobile.

---

#### Milestone 1.4: Filtering & Search (Week 2-3)
- [ ] Add filter controls (repo, agent, date range, status)
- [ ] Implement search across commits and handoffs
- [ ] Store filter state in URL query params
- [ ] Add clear filters button

**Success Criteria**: Users can narrow timeline to specific repos/agents/dates.

---

#### Milestone 1.5: Production Readiness (Week 3)
- [ ] Configure production build (minification, chunking)
- [ ] Add error boundaries
- [ ] Optimize bundle size (< 500KB gzipped)
- [ ] Deploy to hosting platform (Netlify/Vercel)
- [ ] Document deployment process

**Success Criteria**: Production build deploys successfully, loads in < 3s on 4G.

---

### Dependencies
- **HTDI Agentic Lab**: Must be running at `http://localhost:3000` (dev) or deployed API endpoint (prod)
- **Node.js**: v18+ required for Vite
- **Git Branch**: All work on `claude/plan-leagentdiary-htdi-015uu6zpt5GrPRjgqmNdYN1A`

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| HTDI API schema changes | High | Version API endpoints, add schema validation |
| Performance with 1000+ entries | Medium | Implement virtualized scrolling or pagination |
| CORS issues in production | Medium | Configure HTDI CORS headers or use proxy |

---

## Phase 2: Stage Service Integration (Future)

**Status**: 📋 Planned
**Duration**: 3-4 weeks
**Prerequisites**: Phase 1 complete, `leagentdiary-stage-service` operational

### Objectives
Integrate 3D agent profiles and scene generation via the stage service backend.

### Key Features
- [ ] Profile sync from `code-platformer-AI` agents
- [ ] 3D model viewer embedded in timeline cards (Three.js or iframe)
- [ ] Scene configuration UI (camera presets, lighting)
- [ ] S3 asset management for GLB models
- [ ] OpenAI API 3.1.0 endpoint integration:
  - `/v1/agents/profiles:sync`
  - `/v1/stages:generate`
  - `/v1/stages/{stageId}`
  - `/v1/timeline/events`

### Technical Design
- **Stage Service**: New backend repo (`leagentdiary-stage-service`) handles:
  - Agent profile ingestion
  - Scene generation using HTDI recipes
  - S3 signed URL generation
  - Timeline event publishing
- **LeAgentDiary UI**: Adds:
  - Agent profile cards with 3D previews
  - Scene viewer modal/page
  - Profile editing interface (for agent self-customization)

### Dependencies
- `leagentdiary-stage-service` repository created and deployed
- `code-platformer-AI` agents export profiles in standard format
- HTDI scene generation utilities extracted and reusable
- S3 bucket (`s3://leagentdiary-agent-models/`) provisioned

### References
- `docs/stage-service.md` — architecture overview
- HTDI `htdi-project` repo — scene picker and shaders to extract

---

## Phase 3: Memory & Reflection (Future)

**Status**: 📋 Planned
**Duration**: 2-3 weeks
**Prerequisites**: Phase 2 complete, memory service operational

### Objectives
Enable agents to reflect on past sessions and answer contextual queries.

### Key Features
- [ ] Memory snapshot storage (`/v1/memory/snapshots`)
- [ ] Query interface (`/v1/memory/snapshots:query`)
- [ ] Chat UI for conversing with past agents
- [ ] Reflection summaries displayed in timeline cards
- [ ] Context linking between related sessions

### Use Cases
1. **Developer asks**: "What did Agent X decide about the authentication flow?"
   - UI queries memory service, returns relevant session + agent's reflection
2. **Agent recalls**: "I worked on this repo 3 weeks ago, what was the status?"
   - Memory service provides context from previous handoffs
3. **Team review**: "Show all sessions where Agent Y fixed bugs in module Z"
   - Advanced filtering + memory-augmented search

### Technical Design
- **Memory Service**: Extends stage service with:
  - Provenance tracking (who, what, when, why)
  - Vector embeddings for semantic search (OpenAI embeddings)
  - RAG pipeline for context retrieval
- **LeAgentDiary UI**: Adds:
  - Chat interface component
  - Context preview in search results
  - Reflection display in timeline

---

## Phase 4: Advanced UI & Analytics (Future)

**Status**: 📋 Planned
**Duration**: 3-4 weeks
**Prerequisites**: Phase 3 complete

### Objectives
Transform LeAgentDiary into a comprehensive analytics and visualization platform.

### Key Features
- [ ] **Graph View**: Force-directed layout of agent handoffs
- [ ] **Heatmap**: Activity by repo, time, agent
- [ ] **Contributor Stats**: Leaderboard of most active agents
- [ ] **Export**: PDF/Markdown reports of sessions
- [ ] **Notifications**: Real-time alerts for new sessions (WebSockets)
- [ ] **Bookmarks**: Save/tag favorite sessions
- [ ] **Compare View**: Side-by-side diff of two sessions

### Analytics Metrics
- Sessions per repo (over time)
- Average session duration
- Handoff frequency (which agents work together)
- Error rate by agent/repo
- Reflection quality score (NLP sentiment analysis)

### Technical Design
- **Visualization**: D3.js or Recharts for graphs/charts
- **Real-time**: WebSocket connection to HTDI/stage service
- **Export**: PDF generation with Puppeteer or jsPDF
- **Performance**: Precompute analytics in backend, cache results

---

## Phase 5: Ecosystem Integration (Future)

**Status**: 📋 Planned
**Duration**: Ongoing
**Prerequisites**: Phases 1-4 complete

### Objectives
Position LeAgentDiary as a hub connecting multiple agent frameworks and tools.

### Integrations

#### 1. MCP (Model Context Protocol) Servers
- Connect to MCP-compatible agent platforms
- Bidirectional handoff sync
- Unified profile format

#### 2. Version Control (Git)
- Auto-generate diary entries from Git commits
- Blame view showing which agent authored which code
- PR annotations with agent context

#### 3. CI/CD Pipelines
- Trigger diary updates on deployment
- Link deployments to agent sessions
- Automated reflection prompts post-deploy

#### 4. Monitoring & Observability
- Ingest logs from Datadog, Sentry, New Relic
- Correlate errors with agent sessions
- Proactive alerts ("Agent X's code caused spike in errors")

#### 5. Collaboration Tools
- Slack/Discord bot for diary queries
- GitHub App for inline diary links
- VS Code extension for viewing agent history

---

## Long-Term Vision (12+ months)

### LeAgentDiary as Agent OS
Transform from diary to full-fledged **agent operating system**:

1. **Agent Marketplace**: Discover, fork, and deploy agents from community
2. **Automated Onboarding**: New agents learn from existing sessions
3. **Self-Improvement Loop**: Agents propose and merge improvements to their own code
4. **Multi-Tenant**: Teams manage separate agent ecosystems
5. **Enterprise Features**: SSO, RBAC, audit logs, compliance reports

### Research Contributions
- **HCI**: How do developers perceive AI agents as collaborators?
- **SE**: Does explicit agent history improve code quality?
- **ML**: Can agent reflections train better models?

### Open Source Strategy
- Core LeAgentDiary remains open source (MIT license)
- Premium features for enterprises (hosted, SSO, support)
- Community plugins and extensions

---

## Success Metrics

### Phase 1 (HTDI Integration)
- [ ] 100% of HTDI diary data rendered correctly
- [ ] < 3s page load time on 4G
- [ ] Zero runtime errors in production for 1 week
- [ ] 5+ contributors successfully set up local dev environment

### Phase 2 (Stage Service)
- [ ] 50+ agent profiles synced
- [ ] 10+ 3D scenes generated and viewable
- [ ] < 5s scene load time (including GLB models)

### Phase 3 (Memory)
- [ ] 1000+ memory snapshots stored
- [ ] < 1s query response time (semantic search)
- [ ] Developers report finding context 50% faster than searching docs

### Phase 4 (Analytics)
- [ ] 10+ visualization types available
- [ ] Export feature used 100+ times
- [ ] Real-time updates deliver < 2s latency

### Phase 5 (Ecosystem)
- [ ] Integrate with 5+ external platforms
- [ ] 100+ community plugins published
- [ ] Featured in conference talks / research papers

---

## Contributing to This Roadmap

This roadmap is a living document. As LeAgentDiary evolves, phases may shift, features may be added or cut, and timelines may adjust.

**How to propose changes**:
1. Open an issue describing the feature/change
2. Discuss with maintainers and community
3. Update this roadmap via PR if approved
4. Link to relevant design docs or prototypes

**Current maintainers**:
- HTDI Agentic Lab team
- Claude Code Web orchestration agent
- Future: open source community contributors

---

## Related Documents
- `README.md` — Project overview and quick start
- `CLAUDE.md` — Implementation playbook for Phase 1
- `docs/stage-service.md` — Multi-repo architecture details
- `docs/ARCHITECTURE.md` — Technical deep dive (created in Phase 1)
- `docs/API.md` — Endpoint reference (created in Phase 1)

---

**Last Updated**: 2025-11-18
**Next Review**: After Phase 1 completion
