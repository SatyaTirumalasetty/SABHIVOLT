import React from "react";

/** Catches render errors (e.g. malformed remote content) and shows a safe fallback. */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("SABHIVOLT render error", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback || (
          <div className="sv-root">
            <div className="sv-splash">
              <div className="logo">
                SABHI<span style={{ color: "var(--brand-500)" }}>VOLT</span>
              </div>
              <p style={{ color: "var(--muted)" }}>
                Something went wrong loading the page. Please refresh.
              </p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
