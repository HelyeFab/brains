import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  widgetId: string;
  widgetTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  attemptCount: number;
}

/**
 * Error boundary for widgets that provides graceful error handling
 * and recovery options. Catches errors in child components and displays
 * a user-friendly error UI with retry functionality.
 */
export class WidgetErrorBoundary extends Component<Props, State> {
  private maxAttempts = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      attemptCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error(`Widget Error (${this.props.widgetId}):`, error, errorInfo);

    this.setState({
      errorInfo,
    });

    // TODO: Send error to error tracking service (e.g., Sentry)
    // trackError(error, { widgetId: this.props.widgetId, ...errorInfo });
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state if widgetId changes
    if (prevProps.widgetId !== this.props.widgetId && this.state.hasError) {
      this.handleReset();
    }
  }

  handleReset = () => {
    const { attemptCount } = this.state;

    // Limit retry attempts to prevent infinite loops
    if (attemptCount >= this.maxAttempts) {
      console.warn(`Widget ${this.props.widgetId} has exceeded maximum retry attempts`);
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      attemptCount: attemptCount + 1,
    });

    // Call optional reset handler
    this.props.onReset?.();
  };

  handleRemoveWidget = () => {
    // Import dynamically to avoid circular dependencies
    import('@/stores/useWidgetStore').then(({ useWidgetStore }) => {
      useWidgetStore.getState().removeWidget(this.props.widgetId);
    });
  };

  render() {
    const { hasError, error, attemptCount } = this.state;
    const { children, widgetTitle } = this.props;

    if (hasError && error) {
      const canRetry = attemptCount < this.maxAttempts;

      return (
        <div className="h-full flex items-center justify-center p-6 bg-background">
          <Card className="max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Widget Error
                </h3>
                <p className="text-sm text-muted-foreground">
                  {widgetTitle || 'This widget'} encountered an error and couldn't be displayed.
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-md p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Error Details
              </p>
              <p className="text-sm font-mono text-foreground break-words">
                {error.message}
              </p>
            </div>

            {attemptCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Retry attempts: {attemptCount} / {this.maxAttempts}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              {canRetry ? (
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              ) : (
                <div className="flex-1 text-center text-sm text-muted-foreground py-2">
                  Maximum retry attempts reached
                </div>
              )}

              <Button
                onClick={this.handleRemoveWidget}
                variant="outline"
                className="flex-1"
              >
                Remove Widget
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Stack Trace (Development Only)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-[10px] overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return children;
  }
}
