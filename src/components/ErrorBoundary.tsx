import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="w-full h-full flex items-center justify-center bg-[var(--background)] p-8"
          role="alert"
          aria-live="assertive"
        >
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                {this.props.fallbackMessage ||
                  this.state.error?.message ||
                  'An unexpected error occurred.'}
              </p>
              <Button
                size="sm"
                onClick={() => window.location.reload()}
                aria-label="Reload the page to try again"
              >
                Reload page
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
