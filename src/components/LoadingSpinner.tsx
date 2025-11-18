/**
 * Loading Spinner Component
 */

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-border animate-pulse" />
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
      <span className="ml-4 text-text-secondary">Loading diary entries...</span>
    </div>
  )
}
