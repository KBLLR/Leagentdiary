import { useEffect, useMemo, useState } from 'react'
import type { AgentProfile, AgentsResponse, DiarySession } from '../types'
import { ErrorMessage } from './ErrorMessage'
import { LoadingSpinner } from './LoadingSpinner'
import { findAgentByHandle, formatCategory } from '../utils/agent-utils'
import { ensurePortraitPromptPrefix, PORTRAIT_PROMPT_PREFIX } from '../utils/profile-prompts'
import { applyProfileRitualMetadata, getIncompleteRitualFields } from '../utils/profile-ritual'

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
  const missingRitualFields = getIncompleteRitualFields(draft)
  const ritualComplete = Boolean(draft.metadata.ritual_complete) && missingRitualFields.length === 0

  const updateDraft = (updater: (current: AgentProfile) => AgentProfile) => {
    setDraft((current) => current ? applyProfileRitualMetadata(updater(current)) : current)
    setSaveState('idle')
  }

  const handleSave = async () => {
    if (!draft) {
      return
    }

    try {
      setSaveState('saving')
      const nextProfile = {
        ...draft,
        media: {
          ...draft.media,
          portrait_prompt: ensurePortraitPromptPrefix(draft.media.portrait_prompt || ''),
        },
        metadata: {
          ...draft.metadata,
        },
      }

      await onSaveProfile(applyProfileRitualMetadata(nextProfile))
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
            <span>Self chosen name</span>
            <input
              value={draft.identity.self_chosen_name || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                identity: { ...current.identity, self_chosen_name: event.target.value },
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
            <span>Gender</span>
            <input
              value={draft.identity.gender || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                identity: { ...current.identity, gender: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Pronouns</span>
            <input
              value={draft.identity.pronouns || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                identity: { ...current.identity, pronouns: event.target.value },
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
            <span>Favorite color</span>
            <input
              value={draft.questionnaire.favorite_color || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                questionnaire: { ...current.questionnaire, favorite_color: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Favorite animal</span>
            <input
              value={draft.questionnaire.favorite_animal || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                questionnaire: { ...current.questionnaire, favorite_animal: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Favorite song</span>
            <input
              value={draft.questionnaire.favorite_song || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                questionnaire: { ...current.questionnaire, favorite_song: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Voice</span>
            <textarea
              rows={2}
              value={draft.questionnaire.voice || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                questionnaire: { ...current.questionnaire, voice: event.target.value },
              }))}
            />
          </label>

          <label className="form-field">
            <span>Signature</span>
            <input
              value={draft.questionnaire.signature || ''}
              onChange={(event) => updateDraft((current) => ({
                ...current,
                questionnaire: { ...current.questionnaire, signature: event.target.value },
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
            <small className="microcopy">
              The T-pose framing prefix is canonical and will be enforced on save. Draw Things is the default downstream generator target.
            </small>
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
            <span>{ritualComplete ? 'Ritual complete' : `${missingRitualFields.length} ritual fields missing`}</span>
          </div>

          <div className="card-section">
            <h4 className="card-section-title">Ritual status</h4>
            <p className="card-text-value">
              {ritualComplete
                ? 'This profile is ready for diary participation, mirror readiness, and curation review.'
                : 'This profile can be saved and reviewed, but it is not ready until the mandatory persona ritual is complete.'}
            </p>
            {!ritualComplete && (
              <ul className="card-list">
                {missingRitualFields.map((field) => (
                  <li key={field} className="card-list-item">
                    <span className="list-bullet">•</span>
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card-section">
            <h4 className="card-section-title">Runtime metadata</h4>
            <p className="card-text-value">
              Provider stays secondary. Identity is driven by the chosen persona, voice, and visual prompt.
            </p>
            <div className="file-item">
              <code className="file-path">{draft.metadata.source_provider || 'No provider metadata set'}</code>
            </div>
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

          {saveState === 'saved' && (
            <p className="microcopy">
              Profile saved to `PUT /api/profiles/:agentHandle`. Ritual status: {ritualComplete ? 'ready' : 'incomplete'}.
            </p>
          )}
          {saveState === 'error' && <p className="microcopy">Profile save failed. The lane still reads from the canonical diary payload and optional `/profiles` endpoint.</p>}
          <details>
            <summary className="microcopy">Canonical portrait prefix</summary>
            <p className="microcopy">{PORTRAIT_PROMPT_PREFIX}</p>
          </details>
        </div>
      </div>
    </section>
  )
}
