import { Component, type ReactNode, type ErrorInfo } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MayLamDi UI Error Boundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main className="auth-state-page" style={{ padding: "3rem 1rem", textAlign: "center" }}>
          <h1 className="display-heading">Something went wrong.</h1>
          <p style={{ margin: "1rem 0", color: "var(--color-muted)" }}>
            {this.state.error?.message || "An unexpected error occurred while loading this page."}
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            }}
          >
            Return to Home
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
