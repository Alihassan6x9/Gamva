import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Voice/video is optional — if anything in the call UI throws, the rest of
// the room (players list, Start Game button, the game itself) must keep
// working. Without this boundary, an error anywhere in the call tree
// unmounts the entire page since React has no other boundary above it.
export default class CallErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Call UI crashed, hiding it so the rest of the room still works:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ marginBottom: 18, color: "var(--ink-dim)", textAlign: "center" }}>
          Voice/video couldn't load, but you can still play without it.
        </div>
      );
    }
    return this.props.children;
  }
}
