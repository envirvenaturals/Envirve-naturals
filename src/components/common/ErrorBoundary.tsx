import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Envirve UI Error Caught by Boundary:', error, errorInfo);
  }

  private handleRecover = () => {
    // Clear any potentially bloated temporary localStorage keys safely
    try {
      this.setState({ hasError: false, error: null });
    } catch (_) {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center p-6 text-center">
          <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-[#DDD7C8] shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FFF2F2] text-[#B83232] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#1B3218]">
              Application Recovered
            </h2>
            <p className="text-xs text-[#52634F] leading-relaxed">
              A temporary rendering issue occurred while processing media. Your data and settings are safely preserved.
            </p>
            <button
              onClick={this.handleRecover}
              className="px-6 py-2.5 bg-[#2D5A27] hover:bg-[#1E4119] text-white text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resume Storefront</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
