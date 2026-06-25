import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
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
        <div className="p-6 max-w-lg mx-auto mt-10 bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Ops! Algo deu errado.</h2>
          <p className="text-red-600 mb-4">Ocorreu um erro inesperado no aplicativo.</p>
          <pre className="bg-white p-4 rounded text-sm text-red-900 overflow-auto border border-red-100">
            {this.state.error?.message}
          </pre>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
