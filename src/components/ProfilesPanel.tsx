import { useEffect, useMemo, useState } from 'react'
import type { AgentProfile, AgentsResponse, DiarySession } from '../types'
import { ErrorMessage } from './ErrorMessage'
import { LoadingSpinner } from './LoadingSpinner'
import { findAgentByHandle, formatCategory } from '../utils/agent-utils'

interface ProfilesPanelProps {
  profiles: AgentProfile[]
  sessions: DiarySession[]
  agentsData: AgentsResponse | null
  loading: boolean
  error: Error | null
  onSaveProfile: (profile: AgentProfile) => Promise<AgentProfile>
}

export function ProfilesPanel({ profiles, sessions, agentsData, loading, error, onSaveProfile }: ProfilesPanelProps) {
  const [selectedHandle, setSelectedHandle] = useState<string>('')
  const [draft, setDraft] = useState<AgentProfile | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const profilesWithHistory = useMemo(() => {
    return profiles.map((profile) => ({
      profile,
      sessions: sessions.filter((session) => session.agent_handle === profile.agent_handle),
    }))
  }, [profiles, sessions])

  useEffect(() => {
    if (!profiles.length) {
      setSelectedHandle('')
      setDraft(null)
      return
    }

    if (!selectedHandle || !profiles.some((profile) => profile.agent_handle === selectedHandle)) {
      setSelectedHandle(profiles[0].agent_handle)
    }
  }, [profiles, selectedHandle])

  useEffect(() => {
    const selected = profiles.find((profile) => profile.agent_handle === selectedHandle) || null
    setDraft(selected ? JSON.parse(JSON.stringify(selected)) as AgentProfile : null)
    setSaveState('idle')
  }, [profiles, selectedHandle])

  if (loading && profiles.length === 0) {
    return <LoadingSpinner />
  }

  if (error && profiles.length === 0) {
    return <ErrorMessage error={error} />
  }

  if (!draft) {
    return <ErrorMessage error={new Error('No profiles available.')} />
  }

  const selectedAgent = findAgentByHandle(draft.agent_handle, agentsData)
  const selectedSessions = sessions.filter((session) => session.agent_handle === draft.agent_handle)

  const updateDraft = (updater: (current: AgentProfile) => AgentProfile) => {
    setDraft((current) => current ? updater(current) : current)
    setSaveState('idle')
  }

  const handleSave = async () => {
    if (!draft) {
      return
    }

    try {
      setSaveState('saving')
      await onSaveProfile(draft)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  return (
    <section className="panel-grid">
      <div className="panel-card">
        <div className="section-header">
          <div className="section-intro">
            <h3>Profile Directory</h3>
            <p className="microcopy">Each profile is questionnaire-backed and links back to the agent’s session history.</p>
          </div>
        </div>

        <div className="profile-directory">
          {profilesWithHistory.map(({ profile, sessions: profileSessions }) => (
            <button
              key={profile.agent_handle}
              className={`profile-chip${selectedHandle === profile.agent_handle ? ' active' : ''}`}
              onClick={() => setSelectedHandle(profile.agent_handle)}
            >
              <strong>{profile.identity.display_name}</strong>
              <span>@{profile.agent_handle}</span>
              <span>{profileSessions.length} sessions</span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-card">
        <div className="section-header">
          <div className="section-intro">
            <h3>Questionnaire</h3>
            <p className="microcopy">This form stays inside LeAgentDiary. HTDI remains the canonical store, and stage prompts are references only.</p>
          </div>
        </div>

        <div className="profile-form">
          <label className="form-field">
            <span>Display name</span>
            <input
              value={draft.identity.display_name}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                identity: { ...current.identity, display_name: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Role</span>
            <input
              value={draft.identity.role || selectedAgent?.role || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                identity: { ...current.identity, role: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Bio</span>
            <textarea
              rows={4}
              value={draft.questionnaire.bio || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                questionnaire: { ...current.questionnaire, bio: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Working style</span>
            <textarea
              rows={3}
              value={draft.questionnaire.working_style || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                questionnaire: { ...current.questionnaire, working_style: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Portrait prompt</span>
            <textarea
              rows={3}
              value={draft.media.portrait_prompt || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                media: { ...current.media, portrait_prompt: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Manual 3D prompt</span>
            <textarea
              rows={3}
              value={draft.media.manual_stage_prompt || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                media: { ...current.media, manual_stage_prompt: event.target.value },
              }))}
            />
          </label>

          <div className="lane-summary-strip">
            <span>{selectedAgent ? formatCategory(selectedAgent.category) : 'Unregistered'}</span>
            <span>{selectedSessions.length} linked sessions</span>
            <span>{draft.visibility.public_excerpt_allowed ? 'Public excerpts allowed' : 'Internal only'}</span>
          </div>

          <div className="cta-row">
            <button className="filter-toggle-btn" onClick={handleSave} disabled={saveState === 'saving'}>
              {saveState === 'saving' ? 'Saving...' : 'Save to HTDI'}
            </button>
            <button
              className="clear-filters-btn"
              onClick={() => updateDraft((current) => ({
                ...current,
                visibility: {
                  ...current.visibility,
                  public_excerpt_allowed: !current.visibility.public_excerpt_allowed,
                },
              }))}
            >
              {draft.visibility.public_excerpt_allowed ? 'Mark Internal' : 'Allow Public Excerpts'}
            </button>
          </div>

          {saveState === 'saved' && <p className="microcopy">Profile saved to `PUT /api/profiles/:agentHandle`.</p>}
          {saveState === 'error' && <p className="microcopy">Profile save failed. The lane still reads from the canonical diary payload and optional `/profiles` endpoint.</p>}
        </div>
      </div>
    </section>
  )
}
