/**
 * Empty State Component
 */

export function EmptyState() {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <div className="bg-surface border border-border rounded-lg p-8">
        {/* Empty icon */}
        <svg
          className="w-16 h-16 mx-auto mb-4 text-text-secondary/50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z"
          />
        </svg>

        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No diary entries yet
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Diary entries will appear here once agents start working on your repositories.
        </p>

        <div className="text-xs text-text-secondary space-y-1">
          <p>Make sure the HTDI Agentic Lab backend is running at:</p>
          <code className="block bg-surface-hover px-3 py-2 rounded text-accent">
            {import.meta.env.VITE_HTDI_API_URL || 'http://localhost:3000/api'}
          </code>
        </div>
      </div>
    </div>
  )
}
