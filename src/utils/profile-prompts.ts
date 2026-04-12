export const PORTRAIT_PROMPT_PREFIX =
  'Generate the character clearly centered within the frame, standing in a symmetrical T-pose, palms facing forward, fingers fully spread, directly facing the viewer. Use neutral, even lighting and a plain, non-distracting background. Render in a consistent related to input image style with attention to detail in facial features, body, clothing, sane number of fingers unless otherwise expressed on input prompt and if accessories, detaialed them as well. Image rendered in 8k Ultra high quality (UHQ).'

export function ensurePortraitPromptPrefix(prompt: string): string {
  const trimmed = prompt.trim()

  if (!trimmed) {
    return ''
  }

  if (trimmed.startsWith(PORTRAIT_PROMPT_PREFIX)) {
    return trimmed
  }

  return `${PORTRAIT_PROMPT_PREFIX} ${trimmed}`
}
