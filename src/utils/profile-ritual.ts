import type { AgentProfile } from '../types'

export const PROFILE_RITUAL_FIELDS = [
  { key: 'identity.display_name', label: 'Display name' },
  { key: 'identity.self_chosen_name', label: 'Self chosen name' },
  { key: 'identity.role', label: 'Role' },
  { key: 'identity.category', label: 'Category' },
  { key: 'identity.gender', label: 'Gender' },
  { key: 'identity.pronouns', label: 'Pronouns' },
  { key: 'questionnaire.bio', label: 'Bio' },
  { key: 'questionnaire.working_style', label: 'Working style' },
  { key: 'questionnaire.favorite_color', label: 'Favorite color' },
  { key: 'questionnaire.favorite_animal', label: 'Favorite animal' },
  { key: 'questionnaire.favorite_song', label: 'Favorite song' },
  { key: 'questionnaire.voice', label: 'Voice' },
  { key: 'questionnaire.signature', label: 'Signature' },
  { key: 'media.portrait_prompt', label: 'Portrait prompt' },
  { key: 'media.manual_stage_prompt', label: 'Manual stage prompt' },
] as const

const hasValue = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  return value !== undefined && value !== null
}

const getFieldValue = (profile: AgentProfile, key: string): unknown =>
  key.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined
    }

    return (current as Record<string, unknown>)[segment]
  }, profile)

export function getIncompleteRitualFields(profile: AgentProfile): string[] {
  return PROFILE_RITUAL_FIELDS
    .filter((field) => !hasValue(getFieldValue(profile, field.key)))
    .map((field) => field.label)
}

export function isProfileRitualComplete(profile: AgentProfile): boolean {
  return getIncompleteRitualFields(profile).length === 0
}

export function applyProfileRitualMetadata(profile: AgentProfile): AgentProfile {
  return {
    ...profile,
    metadata: {
      ...profile.metadata,
      ritual_complete: isProfileRitualComplete(profile),
    },
  }
}
