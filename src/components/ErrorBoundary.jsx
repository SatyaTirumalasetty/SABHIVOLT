import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="sv-error-boundary">
          <div className="sv-wrap">
            <h2>Something went wrong</h2>
            <p>We apologize for the inconvenience. Please refresh the page to try again.</p>
            <button
              className="sv-btn sv-btn-solid"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className="sv-error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
