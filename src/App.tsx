import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Timeline, ProfilesPanel, ReviewExportPanel } from './components'
import { useAgents, useDiary, useProfiles } from './hooks'
import type { AgentProfile } from './types'
import { isProfileRitualComplete } from './utils/profile-ritual'

type AppView = 'timeline' | 'profiles' | 'review'

function App() {
  const [activeView, setActiveView] = useState<AppView>('timeline')
  const { data: sessions, tasks, loading, error, refresh, isStale } = useDiary()
  const { data: agentsData } = useAgents()
  const { data: profiles, loading: profilesLoading, error: profilesError, persistProfile } = useProfiles()

  const summary = useMemo(() => ({
    sessions: sessions.length,
    profiles: profiles.length,
    ritualReadyProfiles: profiles.filter((profile) => isProfileRitualComplete(profile)).length,
    tasks: tasks.length,
    anthologyCandidates: sessions.filter((session) => session.reflection?.anthology_ingest_candidate).length,
    publicCandidates: sessions.filter((session) => session.reflection?.public_excerpt_candidate).length,
    notionReadyProfiles: profiles.filter((profile) => profile.notion?.profile_page_id).length,
  }), [profiles, sessions, tasks])

  return (
    <div className="app-container">
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        summary={summary}
      />

      <main className="app-main">
        <div className="hero-shell">
          <div>
            <p className="hero-eyebrow">LeAgentDiary</p>
            <h2 className="hero-title">Internal intake for persona rituals, history, handoffs, and reflection review</h2>
            <p className="hero-description">
              HTDI remains the canonical store. This house edits and reviews persona-first profile rituals, ordered session history,
              task and handoff context, then exports deterministic reflection evidence to Anthology and curated public candidates
              to Belle.
            </p>
          </div>
          <div className="hero-metrics">
            <div className="hero-metric-card">
              <span className="hero-metric-label">Profiles</span>
              <strong className="hero-metric-value">{summary.profiles}</strong>
            </div>
            <div className="hero-metric-card">
              <span className="hero-metric-label">Ritual-ready</span>
              <strong className="hero-metric-value">{summary.ritualReadyProfiles}</strong>
            </div>
            <div className="hero-metric-card">
              <span className="hero-metric-label">Sessions</span>
              <strong className="hero-metric-value">{summary.sessions}</strong>
            </div>
            <div className="hero-metric-card">
              <span className="hero-metric-label">Tasks</span>
              <strong className="hero-metric-value">{summary.tasks}</strong>
            </div>
            <div className="hero-metric-card">
              <span className="hero-metric-label">Belle candidates</span>
              <strong className="hero-metric-value">{summary.publicCandidates}</strong>
            </div>
          </div>
        </div>

        {activeView === 'timeline' && (
          <Timeline
            sessions={sessions}
            tasks={tasks}
            agentsData={agentsData}
            loading={loading}
            error={error}
            refresh={refresh}
            isStale={isStale}
          />
        )}

        {activeView === 'profiles' && (
          <ProfilesPanel
            profiles={profiles}
            sessions={sessions}
            agentsData={agentsData}
            loading={profilesLoading}
            error={profilesError}
            onSaveProfile={persistProfile as (profile: AgentProfile) => Promise<AgentProfile>}
          />
        )}

        {activeView === 'review' && (
          <ReviewExportPanel
            sessions={sessions}
            profiles={profiles}
            tasks={tasks}
          />
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '4rem', padding: 'var(--spacing-lg) 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--spacing-lg)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <p>LeAgentDiary • HTDI-backed persona ritual intake, chronology review, and deterministic Anthology/Belle export preparation</p>
        </div>
      </footer>
    </div>
  )
}

export default App
