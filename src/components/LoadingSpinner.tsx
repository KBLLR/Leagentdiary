/**
 * Loading Spinner Component
 */

export function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          borderRadius: 'var(--radius-full)',
          border: '4px solid var(--color-border)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3rem',
          height: '3rem',
          borderRadius: 'var(--radius-full)',
          border: '4px solid var(--color-accent)',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
      <span style={{ marginLeft: 'var(--spacing-lg)' }}>Loading diary entries...</span>
    </div>
  )
}
