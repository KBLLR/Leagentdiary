/**
 * LeAgentDiary Main App
 */

import { Header } from './components/Header'
import { Timeline } from './components'

function App() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Agent Timeline</h2>
          <p className="text-text-secondary">
            Live diary of agent sessions across your repositories
          </p>
        </div>

        <Timeline />
      </main>

      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 max-w-4xl text-center text-sm text-text-secondary">
          <p>
            LeAgentDiary • Powered by{' '}
            <a
              href="https://github.com/KBLLR/htdi-agentic-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
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
