import type { AgentProfile, DiarySession, TaskRecord } from '../types'

interface ReviewExportPanelProps {
  sessions: DiarySession[]
  profiles: AgentProfile[]
  tasks: TaskRecord[]
}

export function ReviewExportPanel({ sessions, profiles, tasks }: ReviewExportPanelProps) {
  const anthologyCandidates = sessions.filter((session) => session.reflection?.anthology_ingest_candidate)
  const belleCandidates = sessions.filter((session) => session.reflection?.public_excerpt_candidate)
  const notionProfiles = profiles.filter((profile) => profile.notion?.profile_page_id)

  return (
    <section className="panel-grid">
      <div className="panel-card">
        <div className="section-header">
          <div className="section-intro">
            <h3>Export Boundary</h3>
            <p className="microcopy">Deterministic exports stay evidence-first here. Anthology ingests reflections, and Belle only receives curated public-safe stories.</p>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">trace.session</span>
            <strong>{sessions.length}</strong>
            <p className="microcopy">Evidence-only session exports.</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">trace.reflection</span>
            <strong>{anthologyCandidates.length}</strong>
            <p className="microcopy">Curated Anthology ingest candidates.</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">agent.profile</span>
            <strong>{profiles.length}</strong>
            <p className="microcopy">House-local profile exports.</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Belle-ready</span>
            <strong>{belleCandidates.length}</strong>
            <p className="microcopy">Public excerpt candidates for Le Belle Epoch.</p>
          </div>
        </div>

        <div className="card-section">
          <h4 className="card-section-title">Curated publication rule</h4>
          <p className="card-text-value">
            Raw timeline history does not publish. Belle consumes approved diary-derived `publish.story` entries in the new
            `Le Agent Diary` lane, while Anthology remains the archive/compiler for curated reflections.
          </p>
        </div>

        <div className="card-section">
          <h4 className="card-section-title">Current public candidates</h4>
          <ul className="card-list">
            {belleCandidates.length === 0 && (
              <li className="card-list-item">
                <span className="list-bullet">•</span>
                <span>No sessions are currently marked as Belle-ready.</span>
              </li>
            )}
            {belleCandidates.map((session) => (
              <li key={session.sessionId} className="card-list-item">
                <span className="list-bullet">•</span>
                <span>@{session.agent_handle} • {session.reflection?.summary}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel-card">
        <div className="section-header">
          <div className="section-intro">
            <h3>Notion Mirror</h3>
            <p className="microcopy">Notion is a mirrored workspace for agent-owned pages, journals, and cross-house tasks. HTDI stays authoritative.</p>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">Profile pages</span>
            <strong>{notionProfiles.length}</strong>
            <p className="microcopy">Profiles already linked to a Notion page.</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Journal candidates</span>
            <strong>{anthologyCandidates.length}</strong>
            <p className="microcopy">Reflections that can be mirrored into per-agent journal pages.</p>
          </div>
          <div className="summary-card">
            <span className="summary-label">Cross-house tasks</span>
            <strong>{tasks.length}</strong>
            <p className="microcopy">Task records that can be mirrored into the shared Notion table.</p>
          </div>
        </div>

        <div className="card-section">
          <h4 className="card-section-title">Skills and tool flow</h4>
          <ul className="card-list">
            <li className="card-list-item"><span className="list-bullet">•</span><span>`notion-knowledge-capture` for profile pages, journal entries, and decision capture.</span></li>
            <li className="card-list-item"><span className="list-bullet">•</span><span>`notion-research-documentation` for cross-page synthesis and reporting.</span></li>
            <li className="card-list-item"><span className="list-bullet">•</span><span>Tool flow: `Notion:notion-search` → `Notion:notion-fetch` → `Notion:notion-create-pages` → `Notion:notion-update-page`.</span></li>
          </ul>
        </div>

        <div className="card-section">
          <h4 className="card-section-title">Setup if MCP is missing</h4>
          <div className="file-item">
            <code className="file-path">codex mcp add notion --url https://mcp.notion.com/mcp</code>
          </div>
          <div className="file-item">
            <code className="file-path">codex --enable rmcp_client</code>
          </div>
          <div className="file-item">
            <code className="file-path">codex mcp login notion</code>
          </div>
        </div>
      </div>
    </section>
  )
}
