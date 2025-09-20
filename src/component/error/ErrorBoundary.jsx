import React from "react";
import PropTypes from "prop-types";
import * as Sentry from "@sentry/react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, eventId: null };
    this.handleRetry = this.handleRetry.bind(this);
    this.handleReport = this.handleReport.bind(this);
    this.retryButtonRef = React.createRef();
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    try {
      if (Sentry && Sentry.captureException) {
        const eventId = Sentry.captureException(error, { extra: errorInfo });
        // captureException may return an eventId; store it so we can show a report dialog
        this.setState({ eventId });
      }
    } catch (e) {
      // swallow errors from Sentry itself
      // but still mark that an error occurred
      this.setState({ eventId: null });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // If the tree under this boundary changed, try resetting the error state.
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, eventId: null });
      return;
    }

    // When entering the error state, autofocus the Retry button for accessibility
    if (this.state.hasError && !prevState.hasError) {
      try {
        this.retryButtonRef.current?.focus();
      } catch (e) {
        // ignore focus errors
      }
    }
  }

  handleRetry() {
    this.setState({ hasError: false, eventId: null });
  }

  handleReport() {
    const { eventId } = this.state;
    if (eventId && Sentry && typeof Sentry.showReportDialog === "function") {
      Sentry.showReportDialog({ eventId });
    }
  }

  renderFallback() {
    const fallback = this.props.fallback ?? (
      <div>
        <p>Something went wrong.</p>
      </div>
    );

    return (
      <div>
        <div role="alert" aria-live="assertive">
          {fallback}
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            ref={this.retryButtonRef}
            onClick={this.handleRetry}
            className="px-3 py-1 mr-2 bg-gray-200 rounded"
          >
            Retry
          </button>
          {this.state.eventId && (
            <button onClick={this.handleReport} className="px-3 py-1 bg-blue-600 text-white rounded">
              Report feedback
            </button>
          )}
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  fallback: PropTypes.node,
  children: PropTypes.node,
};

export default ErrorBoundary;
