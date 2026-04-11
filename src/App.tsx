/**
 * LeAgentDiary Main App
 */

import { Header } from './components/Header'
import { Timeline } from './components'

function App() {
  return (
    <div className="app-container">
      <Header />

      <main className="app-main">
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
            Session Chronology
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Review HTDI diary sessions, inspect handoffs, and prepare curated reflection exports for Anthology.
          </p>
        </div>

        <Timeline />
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '4rem', padding: 'var(--spacing-lg) 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--spacing-lg)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <p>LeAgentDiary • Internal chronology review and reflection export surface</p>
        </div>
      </footer>
    </div>
  )
}

export default App
