/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (future: send to monitoring service)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-surface border border-border rounded-lg p-8">
            <div className="flex items-start space-x-4">
              {/* Error icon */}
              <svg
                className="w-12 h-12 text-error flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-error mb-2">
                  Something went wrong
                </h1>
                <p className="text-text-secondary mb-4">
                  The application encountered an unexpected error. Please try refreshing the page.
                </p>

                {this.state.error && (
                  <details className="mb-6">
                    <summary className="cursor-pointer text-sm text-accent hover:underline mb-2">
                      Error details
                    </summary>
                    <pre className="text-xs bg-background border border-border rounded p-4 overflow-auto max-h-48">
                      <code className="text-error">{this.state.error.toString()}</code>
                    </pre>
                  </details>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90 transition-opacity font-medium"
                  >
                    Refresh Page
                  </button>
                  <a
                    href="https://github.com/KBLLR/Leagentdiary/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-surface-hover border border-border text-text-primary rounded-md hover:bg-border transition-colors font-medium"
                  >
                    Report Issue
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
