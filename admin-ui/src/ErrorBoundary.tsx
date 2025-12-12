import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { 
  children: ReactNode 
}

interface State { 
  hasError: boolean; 
  error: Error | null 
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { 
    hasError: false, 
    error: null 
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-red-500 p-8">
          <h1 className="text-2xl font-bold mb-4">⚠️ Cortex Crashed</h1>
          <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto max-w-2xl border border-red-900">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 px-6 py-2 bg-red-600 text-white rounded-full"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}