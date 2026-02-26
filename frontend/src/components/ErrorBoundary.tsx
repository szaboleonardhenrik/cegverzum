import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">&#9888;</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Hiba történt
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Sajnáljuk, váratlan hiba lépett fel. Kérjük, töltsd újra az oldalt.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal hover:bg-teal-light text-white font-semibold rounded-xl px-8 py-3 transition-colors border-none cursor-pointer"
            >
              Oldal újratöltése
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
