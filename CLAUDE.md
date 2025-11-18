# LeAgentDiary Implementation Playbook

## Mission Statement

Transform LeAgentDiary from a static Tailwind prototype into a fully functional, deployable diary UI that integrates with the HTDI Agentic Lab backend. This playbook guides the implementation of a modern React + Vite application that consumes multi-repo diary data and provides an interactive timeline interface for agent sessions, handoffs, and reflections.

---

## Context & Dependencies

### Current State
- **Repository**: `Leagentdiary` contains only:
  - Static `index.html` with Tailwind CDN (prototype timeline UI)
  - Documentation describing the intended architecture (`README.md`, `docs/stage-service.md`)
  - No build system, no package management, no data layer

### Upstream Dependencies

#### HTDI Agentic Lab
- **Location**: `htdi-agentic-lab` repository (assumed to be at `../htdi-agentic-lab` or specified by user)
- **Status**: Phase-4 ready, serving REST API at `http://localhost:3000/api/*`
- **Key Outputs**:
  - Multi-repo diary JSON files in `var/htdi.diary.json`
  - REST endpoints for diary data, automation, and commands
- **Key Files to Reference**:
  - `automation/scripts/diary/parse-multi-repo.mjs` — diary generation logic
  - `api/server/README.md` — API endpoint documentation
  - `docs/PHASE4_STACK.md` — infrastructure overview

#### API Endpoints Available
| Endpoint | Method | Purpose | Expected Response |
|----------|--------|---------|-------------------|
| `/api/diary` | GET | Fetch complete multi-repo diary data | JSON array of sessions with commits, handoffs, timestamps |
| `/api/automation/parse` | POST | Trigger diary re-parsing | Status confirmation |
| `/api/automation/autopilot` | POST | Launch automation workflows | Task ID and status |
| `/api/run-command` | POST | Execute remote commands | Command output and exit code |

### Future Services (Not Yet Implemented)
The following are described in `docs/stage-service.md` but don't exist yet:
- `leagentdiary-stage-service` — Backend for 3D agent profiles and scene generation
- OpenAI API 3.1.0 compatible endpoints (`/v1/agents/profiles:sync`, `/v1/stages:generate`, etc.)
- S3 asset management for agent models

**Important**: For this implementation phase, focus on integrating with HTDI's existing `/api/diary` endpoint. Stage service integration is a future milestone.

---

## High-Level Technical Strategy

### What to Build in LeAgentDiary
1. **Modern Build Pipeline**
   - Vite + React + TypeScript (or JavaScript if user prefers)
   - Tailwind CSS (production build, not CDN)
   - ESLint + Prettier for code quality
   - Development server with HMR

2. **Data Integration Layer**
   - API client for HTDI endpoints
   - Data models matching diary JSON schema
   - Polling or WebSocket strategy for live updates (start with polling)
   - Error handling and retry logic

3. **Timeline UI Components**
   - Port existing prototype to React components
   - Expand card for session details
   - Filter by agent, repo, date range
   - Search across commits and handoffs
   - Responsive design (mobile-first)

4. **Environment Configuration**
   - `.env` files for API base URL
   - Development vs. production configs
   - CORS handling for local HTDI backend

### What Lives Elsewhere
- **Diary Data Generation**: Handled by `htdi-agentic-lab/automation/scripts/diary/parse-multi-repo.mjs`
- **Agent Profile Management**: Future `code-platformer-AI` repository
- **3D Scene Generation**: Future `leagentdiary-stage-service`
- **Backend Logic**: All business logic stays in HTDI or future services

---

## Implementation Tasks

### Phase 1: Project Scaffolding (Priority: CRITICAL)

#### Task 1.1: Initialize Vite + React Project
**Objective**: Set up modern development environment

**Actions**:
1. Run `npm create vite@latest . -- --template react-ts` (or `react` for JS)
2. Install dependencies: `npm install`
3. Verify dev server runs: `npm run dev`

**Acceptance Criteria**:
- [ ] `package.json` exists with Vite, React, and TypeScript
- [ ] Development server runs on `http://localhost:5173`
- [ ] Hot module replacement works
- [ ] `src/` directory structure created

**Files to Create/Modify**:
- `package.json`
- `vite.config.ts`
- `tsconfig.json` (if TypeScript)
- `src/main.tsx`
- `src/App.tsx`

---

#### Task 1.2: Configure Tailwind CSS (Production)
**Objective**: Replace CDN with build-optimized Tailwind

**Actions**:
1. Install Tailwind: `npm install -D tailwindcss postcss autoprefixer`
2. Initialize config: `npx tailwindcss init -p`
3. Configure `tailwind.config.js` with dark mode and custom colors (port from `index.html:11-36`)
4. Add Tailwind directives to `src/index.css`
5. Remove old `index.html` at project root (backup first)

**Acceptance Criteria**:
- [ ] Tailwind classes work in React components
- [ ] Dark mode toggle functions
- [ ] Custom color palette matches prototype (`accent: #818cf8`, background/surface/border variants)
- [ ] Production build purges unused CSS

**Reference**:
- Current colors in `index.html:14-32`

---

#### Task 1.3: Environment Configuration
**Objective**: Externalize API URLs and secrets

**Actions**:
1. Create `.env.development`:
   ```env
   VITE_HTDI_API_URL=http://localhost:3000/api
   VITE_ENABLE_STAGE_SERVICE=false
   ```
2. Create `.env.production`:
   ```env
   VITE_HTDI_API_URL=https://api.leagentdiary.com/api
   VITE_ENABLE_STAGE_SERVICE=false
   ```
3. Add `.env*.local` to `.gitignore`
4. Document all env vars in `README.md`

**Acceptance Criteria**:
- [ ] Environment variables accessible via `import.meta.env.VITE_*`
- [ ] Different configs for dev/prod
- [ ] Secrets not committed to git

**Files to Create**:
- `.env.development`
- `.env.production`
- `.env.example` (template for contributors)

---

### Phase 2: Data Layer (Priority: HIGH)

#### Task 2.1: Define Diary Data Models
**Objective**: Create TypeScript interfaces matching HTDI diary schema

**Actions**:
1. Inspect actual response from `http://localhost:3000/api/diary` (or `var/htdi.diary.json`)
2. Create `src/types/diary.ts` with interfaces:
   - `DiaryEntry` — top-level session object
   - `CommitInfo` — Git commit metadata
   - `HandoffInfo` — Agent handoff details
   - `AgentInfo` — Agent name, role, repo
   - `SessionMetadata` — Timestamps, tags, status

**Example Structure** (adjust based on actual data):
```typescript
export interface DiaryEntry {
  id: string;
  timestamp: string; // ISO 8601
  repo: string;
  branch: string;
  agent: AgentInfo;
  commits: CommitInfo[];
  handoffs: HandoffInfo[];
  metadata: SessionMetadata;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  timestamp: string;
  filesChanged: string[];
}

export interface HandoffInfo {
  from: string; // agent name
  to: string;
  context: string;
  timestamp: string;
}

export interface AgentInfo {
  name: string;
  role: string;
  repo: string;
  avatar?: string; // future: S3 URL from stage service
}

export interface SessionMetadata {
  duration?: number; // seconds
  status: 'success' | 'error' | 'in_progress';
  tags: string[];
  reflection?: string; // agent's end-of-session summary
}
```

**Acceptance Criteria**:
- [ ] Interfaces match actual HTDI API response structure
- [ ] All required fields present
- [ ] Optional fields marked with `?`
- [ ] Exports organized in `src/types/index.ts`

**Reference Files**:
- `htdi-agentic-lab/automation/scripts/diary/parse-multi-repo.mjs` — inspect output format
- `htdi-agentic-lab/var/htdi.diary.json` — sample data

---

#### Task 2.2: Create API Client
**Objective**: Abstracted layer for all HTDI API calls

**Actions**:
1. Create `src/api/htdi-client.ts`
2. Implement functions:
   - `fetchDiary(): Promise<DiaryEntry[]>`
   - `triggerParse(): Promise<void>`
   - `runCommand(command: string): Promise<string>`
3. Add error handling with retries (exponential backoff)
4. Add request/response logging for debugging
5. Use `fetch` API (no axios needed unless user prefers)

**Example Implementation**:
```typescript
const API_BASE = import.meta.env.VITE_HTDI_API_URL;

export async function fetchDiary(): Promise<DiaryEntry[]> {
  const response = await fetch(`${API_BASE}/diary`);
  if (!response.ok) {
    throw new Error(`Failed to fetch diary: ${response.statusText}`);
  }
  return response.json();
}

export async function triggerParse(): Promise<void> {
  const response = await fetch(`${API_BASE}/automation/parse`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Parse failed: ${response.statusText}`);
  }
}

// Add retry logic, timeout handling, etc.
```

**Acceptance Criteria**:
- [ ] All HTDI endpoints wrapped
- [ ] TypeScript types for request/response
- [ ] Error handling with user-friendly messages
- [ ] Configurable timeout (default 10s)
- [ ] Works in both dev and prod environments

**Files to Create**:
- `src/api/htdi-client.ts`
- `src/api/index.ts` (re-exports)

---

#### Task 2.3: Data Fetching Strategy
**Objective**: React hooks for managing diary data state

**Actions**:
1. Create `src/hooks/useDiary.ts`
2. Implement polling mechanism (refresh every 30s)
3. Add loading, error, and success states
4. Provide manual refresh function
5. Consider React Query or SWR for caching (optional, keep simple initially)

**Example Hook**:
```typescript
import { useState, useEffect } from 'react';
import { fetchDiary } from '../api/htdi-client';
import type { DiaryEntry } from '../types/diary';

export function useDiary(pollInterval = 30000) {
  const [data, setData] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const entries = await fetchDiary();
      setData(entries);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  return { data, loading, error, refresh };
}
```

**Acceptance Criteria**:
- [ ] Hook returns diary entries, loading state, error state
- [ ] Auto-refreshes at configurable interval
- [ ] Cleanup on component unmount
- [ ] Manual refresh function exposed
- [ ] No memory leaks

**Files to Create**:
- `src/hooks/useDiary.ts`
- `src/hooks/index.ts`

---

### Phase 3: UI Components (Priority: HIGH)

#### Task 3.1: Port Timeline Card Component
**Objective**: Convert prototype HTML to React component

**Actions**:
1. Create `src/components/TimelineCard.tsx`
2. Extract collapsible logic from `index.html:204-212`
3. Replace inline styles with Tailwind classes
4. Add proper TypeScript props interface
5. Make chevron animation smooth (CSS transitions)

**Component Structure**:
```typescript
interface TimelineCardProps {
  entry: DiaryEntry;
  defaultExpanded?: boolean;
}

export function TimelineCard({ entry, defaultExpanded = false }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="timeline-item relative pb-10">
      {/* Timeline line, dot, card content */}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Card matches prototype visual design
- [ ] Expand/collapse animation smooth
- [ ] Displays commit message, branch, timestamp
- [ ] Shows agent info (name, avatar)
- [ ] Links to commit and deployment (if available)
- [ ] Handles missing data gracefully

**Reference**:
- `index.html:144-197` — card structure
- `index.html:38-63` — styles for timeline and collapsible

**Files to Create**:
- `src/components/TimelineCard.tsx`

---

#### Task 3.2: Create Timeline Container
**Objective**: Render list of timeline cards

**Actions**:
1. Create `src/components/Timeline.tsx`
2. Consume `useDiary()` hook
3. Map diary entries to `<TimelineCard>` components
4. Add loading spinner and error message
5. Handle empty state (no diary entries)

**Example**:
```typescript
export function Timeline() {
  const { data, loading, error, refresh } = useDiary();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refresh} />;
  if (data.length === 0) return <EmptyState />;

  return (
    <div className="relative">
      {data.map(entry => (
        <TimelineCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Renders all diary entries
- [ ] Shows loading state while fetching
- [ ] Displays error with retry button
- [ ] Empty state with helpful message
- [ ] Sorted by timestamp (newest first)

**Files to Create**:
- `src/components/Timeline.tsx`
- `src/components/LoadingSpinner.tsx`
- `src/components/ErrorMessage.tsx`
- `src/components/EmptyState.tsx`

---

#### Task 3.3: Add Filtering & Search
**Objective**: Interactive controls for narrowing timeline view

**Actions**:
1. Create `src/components/TimelineFilters.tsx`
2. Add filter options:
   - **Repo**: Dropdown/multi-select of available repos
   - **Agent**: Filter by agent name
   - **Date Range**: Start/end date pickers
   - **Status**: success/error/in_progress
3. Add search input (fuzzy search across commit messages, handoff context)
4. Store filter state in URL query params (for shareable links)
5. Implement filter logic in `useDiary()` or separate hook

**Acceptance Criteria**:
- [ ] Filters work independently and in combination
- [ ] Search highlights matching text
- [ ] Filter state persists in URL
- [ ] Clear filters button
- [ ] Filter count badge (e.g., "3 active filters")

**Files to Create**:
- `src/components/TimelineFilters.tsx`
- `src/hooks/useFilters.ts`

---

#### Task 3.4: Responsive Layout & Dark Mode Toggle
**Objective**: Mobile-first design with theme switching

**Actions**:
1. Create `src/components/Header.tsx` (port from `index.html:68-75`)
2. Add dark mode toggle button
3. Persist theme choice in `localStorage`
4. Test on mobile (375px), tablet (768px), desktop (1440px)
5. Ensure timeline cards stack properly on small screens

**Acceptance Criteria**:
- [ ] Dark mode toggle works
- [ ] Theme persists across page reloads
- [ ] Responsive breakpoints follow Tailwind conventions
- [ ] No horizontal scroll on mobile
- [ ] Touch-friendly tap targets (min 44px)

**Files to Create**:
- `src/components/Header.tsx`
- `src/hooks/useDarkMode.ts`

---

### Phase 4: Polish & Production Readiness (Priority: MEDIUM)

#### Task 4.1: Error Boundaries
**Objective**: Graceful error handling in React tree

**Actions**:
1. Create `src/components/ErrorBoundary.tsx`
2. Wrap main `<App>` with error boundary
3. Log errors to console (future: send to monitoring service)
4. Show user-friendly fallback UI

**Acceptance Criteria**:
- [ ] Catches React component errors
- [ ] Displays fallback UI
- [ ] Provides "Report Issue" link (GitHub issues)
- [ ] Doesn't crash entire app

**Files to Create**:
- `src/components/ErrorBoundary.tsx`

---

#### Task 4.2: Build & Deployment Config
**Objective**: Optimize for production deployment

**Actions**:
1. Configure `vite.config.ts`:
   - Set base path if deploying to subdirectory
   - Enable minification
   - Configure chunk splitting for large bundles
2. Add build scripts to `package.json`:
   - `npm run build` — production build
   - `npm run preview` — preview production build locally
3. Create `netlify.toml` or `vercel.json` (depending on hosting choice)
4. Document deployment process in `README.md`

**Acceptance Criteria**:
- [ ] Production build completes without errors
- [ ] Bundle size under 500KB (gzipped)
- [ ] Source maps generated for debugging
- [ ] Environment variables work in production
- [ ] Deployment config ready for hosting platform

**Files to Modify/Create**:
- `vite.config.ts`
- `package.json`
- `netlify.toml` or `vercel.json`

---

#### Task 4.3: Testing Setup (Optional but Recommended)
**Objective**: Basic test coverage for critical paths

**Actions**:
1. Install Vitest: `npm install -D vitest`
2. Install React Testing Library: `npm install -D @testing-library/react @testing-library/jest-dom`
3. Write tests for:
   - `TimelineCard` rendering
   - `useDiary` hook data flow
   - Filter logic
4. Add test script: `npm run test`

**Acceptance Criteria**:
- [ ] Test suite runs successfully
- [ ] At least 50% coverage of components
- [ ] Mocked API responses for tests
- [ ] CI/CD ready (GitHub Actions)

**Files to Create**:
- `vitest.config.ts`
- `src/components/__tests__/TimelineCard.test.tsx`
- `src/hooks/__tests__/useDiary.test.ts`

---

### Phase 5: Documentation (Priority: MEDIUM)

#### Task 5.1: Update README.md
**Objective**: Comprehensive guide for contributors and users

**Actions**:
1. Add **Getting Started** section:
   - Prerequisites (Node.js version)
   - Installation steps (`npm install`)
   - Environment setup (`.env` file)
   - Running dev server
2. Add **Development** section:
   - Project structure
   - Key technologies
   - Code style guidelines
3. Add **Deployment** section:
   - Build command
   - Hosting platforms
   - Environment variables for production
4. Add **Integration with HTDI** section:
   - How to start HTDI backend
   - API endpoint overview
   - Troubleshooting common issues

**Acceptance Criteria**:
- [ ] First-time contributor can get app running in < 5 minutes
- [ ] All env vars documented
- [ ] Links to HTDI repo and docs
- [ ] Screenshots of UI (add after implementation)

**Files to Modify**:
- `README.md`

---

#### Task 5.2: Create ARCHITECTURE.md
**Objective**: Deep dive into technical decisions

**Actions**:
1. Document:
   - Data flow (HTDI API → React state → UI)
   - Component hierarchy
   - State management strategy
   - API client design
   - Future extensibility points (stage service, memory queries)
2. Add diagrams (ASCII art or Mermaid.js):
   - System architecture
   - Component tree
   - Data flow

**Acceptance Criteria**:
- [ ] Architecture decisions explained
- [ ] Diagrams aid understanding
- [ ] Links to relevant code files

**Files to Create**:
- `docs/ARCHITECTURE.md`

---

#### Task 5.3: API Documentation
**Objective**: Reference for HTDI endpoint contracts

**Actions**:
1. Create `docs/API.md`
2. Document each endpoint:
   - URL
   - HTTP method
   - Request params/body
   - Response schema
   - Example request/response
   - Error codes
3. Note differences between dev and production

**Acceptance Criteria**:
- [ ] All HTDI endpoints documented
- [ ] Examples are accurate (test against live API)
- [ ] Future endpoints (stage service) marked as "Coming Soon"

**Files to Create**:
- `docs/API.md`

---

## Integration Points with HTDI Agentic Lab

### Critical Files to Reference

#### In `htdi-agentic-lab`:
1. **`automation/scripts/diary/parse-multi-repo.mjs`**
   - Logic for generating diary JSON
   - Schema of output data
   - How commits and handoffs are parsed

2. **`api/server/README.md`**
   - Endpoint documentation
   - Authentication (if any)
   - Rate limits, CORS settings

3. **`docs/PHASE4_STACK.md`**
   - Infrastructure overview
   - Smart Campus integration
   - Service orchestration

4. **`var/htdi.diary.json`**
   - Sample output data
   - Use for development when API is unavailable

### Environment Variables to Expose
| Variable | Description | Dev Value | Prod Value |
|----------|-------------|-----------|------------|
| `VITE_HTDI_API_URL` | Base URL for HTDI API | `http://localhost:3000/api` | `https://api.htdi.example.com/api` |
| `VITE_ENABLE_STAGE_SERVICE` | Enable stage service features | `false` | `false` (future: `true`) |
| `VITE_POLL_INTERVAL` | Diary refresh interval (ms) | `30000` | `60000` |

### CORS Considerations
- **Dev**: HTDI backend must allow `http://localhost:5173` (Vite default port)
- **Prod**: Configure HTDI to allow production domain
- If CORS issues, consider proxy in `vite.config.ts`:
  ```typescript
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
  ```

---

## Future Work (Out of Scope for This Session)

### Stage Service Integration
When `leagentdiary-stage-service` is implemented:
1. Add API client functions for OpenAI API 3.1.0 endpoints
2. Fetch agent profiles and 3D models
3. Embed scene viewer (Three.js or iframe)
4. Add profile sync UI

### Memory & Reflection Features
1. Chat interface to query past sessions (`/v1/memory/snapshots:query`)
2. Agent reflection display in timeline cards
3. Context linking between related sessions

### Advanced UI Features
1. Graph view of agent handoffs (force-directed layout)
2. Heatmap of activity by repo/time
3. Export diary as PDF or Markdown
4. Real-time updates via WebSockets (replace polling)

---

## Open Questions & Risks

### Questions for User
1. **TypeScript vs. JavaScript**: Preference for this project?
   - Recommendation: TypeScript for type safety with API integration
2. **Hosting Platform**: Netlify, Vercel, GitHub Pages, or custom?
   - Affects build config and deployment docs
3. **Authentication**: Will HTDI API require auth tokens?
   - Affects API client and env vars
4. **3D Scene Viewer**: When stage service is ready, use iframe or embedded Three.js?
   - Affects component architecture

### Known Risks
1. **HTDI API Schema Changes**
   - Mitigation: Version API endpoints, add schema validation
2. **Performance with Large Diaries**
   - Risk: Rendering 1000+ entries could be slow
   - Mitigation: Virtualized scrolling (react-window), pagination
3. **Mobile Touch Interactions**
   - Risk: Collapsible cards may not be touch-friendly
   - Mitigation: Increase tap target size, test on real devices
4. **CORS in Production**
   - Risk: HTDI backend may not allow cross-origin requests
   - Mitigation: Proxy through same-origin server, or configure CORS headers

---

## Step-by-Step Execution Guide for Claude CLI

### Pre-flight Checklist
- [ ] HTDI Agentic Lab is running at `http://localhost:3000`
- [ ] Confirm `/api/diary` returns valid JSON
- [ ] Node.js v18+ installed
- [ ] Git branch `claude/plan-leagentdiary-htdi-015uu6zpt5GrPRjgqmNdYN1A` checked out

### Execution Order
1. **Start with Phase 1** (scaffolding) — must complete before other phases
2. **Phase 2** (data layer) — required for Phase 3
3. **Phase 3** (UI components) — can parallelize some tasks (e.g., Header + TimelineCard)
4. **Phase 4** (polish) — after core functionality works
5. **Phase 5** (docs) — continuous throughout, finalize at end

### Testing as You Go
After each phase, verify:
- **Phase 1**: Dev server runs, Tailwind styles work
- **Phase 2**: API client fetches real data from HTDI
- **Phase 3**: Timeline renders entries, filters work
- **Phase 4**: Production build succeeds, bundle analyzed
- **Phase 5**: Docs are accurate (run through setup steps)

### Commit Strategy
- Commit after each task (not phase)
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Push to branch after each phase completes
- Example:
  ```bash
  git add .
  git commit -m "feat: initialize Vite + React project with TypeScript"
  git push -u origin claude/plan-leagentdiary-htdi-015uu6zpt5GrPRjgqmNdYN1A
  ```

### If Blocked
- **HTDI API unavailable**: Use mock data from `var/htdi.diary.json`, implement API client as stub
- **Unclear data schema**: Inspect actual response, update types iteratively
- **UI complexity**: Start with simplest version, iterate
- **Environment issues**: Document in README troubleshooting section

---

## Success Criteria (Definition of Done)

### Functional Requirements
- [ ] App runs locally with `npm run dev`
- [ ] Fetches diary data from HTDI API
- [ ] Displays timeline with expandable cards
- [ ] Filters and search work correctly
- [ ] Dark mode toggle persists
- [ ] Responsive on mobile, tablet, desktop
- [ ] Production build deploys successfully

### Code Quality
- [ ] No TypeScript errors (if using TS)
- [ ] No ESLint warnings
- [ ] Proper error handling (no unhandled promise rejections)
- [ ] Clean component structure (< 200 lines per file)
- [ ] Reusable hooks and utilities

### Documentation
- [ ] README has complete setup instructions
- [ ] API endpoints documented
- [ ] Architecture decisions explained
- [ ] Environment variables documented
- [ ] Deployment process described

### Git Hygiene
- [ ] All changes committed with clear messages
- [ ] Pushed to correct branch
- [ ] No sensitive data in commits
- [ ] `.gitignore` covers all secrets and build artifacts

---

## Final Notes for Claude CLI Agent

This playbook is designed to be executed autonomously but also allows for flexibility:
- **Adjust based on actual data**: The diary schema is inferred; inspect real responses and update types accordingly.
- **Ask questions if blocked**: If HTDI API structure differs significantly, clarify before proceeding.
- **Prioritize working software**: A simple, functional timeline is better than a complex, broken one.
- **Document as you go**: Add inline comments, update README sections after each phase.
- **Test frequently**: Run dev server, check API responses, verify UI renders correctly.

The goal is a deployable, maintainable codebase that serves as the foundation for future enhancements (stage service, memory queries, 3D personas). Focus on clean architecture and clear documentation so the next developer (human or AI) can easily extend the system.

**Good luck, and happy coding!**
