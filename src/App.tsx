import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">LeAgentDiary</h1>
        <p className="text-text-secondary mb-8">
          Agentic diary timeline - React + Vite + TypeScript + Tailwind setup complete!
        </p>

        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div>
            <button
              onClick={() => setCount((count) => count + 1)}
              className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              count is {count}
            </button>
          </div>

          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 bg-success/20 text-success rounded">✓ Vite</span>
            <span className="px-2 py-1 bg-success/20 text-success rounded">✓ React</span>
            <span className="px-2 py-1 bg-success/20 text-success rounded">✓ TypeScript</span>
            <span className="px-2 py-1 bg-success/20 text-success rounded">✓ Tailwind</span>
          </div>

          <p className="text-sm text-text-secondary border-t border-border pt-4">
            Edit <code className="bg-surface-hover px-2 py-1 rounded text-accent">src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
