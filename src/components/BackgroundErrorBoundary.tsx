import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface BackgroundErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface BackgroundErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class BackgroundErrorBoundary extends Component<BackgroundErrorBoundaryProps, BackgroundErrorBoundaryState> {
  constructor(props: BackgroundErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): BackgroundErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Background system caught rendering error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Fallback cleanly to a solid dark sky background so data cards remain 100% functional
      return this.props.fallback || (
        <div 
          className="absolute inset-0 pointer-events-none bg-slate-900" 
          aria-hidden="true"
          style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
        />
      );
    }

    return this.props.children;
  }
}
