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
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>Agent Timeline</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Live diary of agent sessions across your repositories
          </p>
        </div>

        <Timeline />
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', marginTop: '4rem', padding: 'var(--spacing-lg) 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--spacing-lg)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <p>
            LeAgentDiary • Powered by{' '}
            <a
              href="https://github.com/KBLLR/htdi-agentic-lab"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              HTDI Agentic Lab
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
