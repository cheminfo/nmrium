import { Component, CSSProperties, ErrorInfo } from 'react';

const styles: Record<string, CSSProperties> = {
  container: {
    margin: '25px',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    fontSize: '30px',
    textAlign: 'center',
  },

  body: {
    whiteSpace: 'pre-wrap',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    color: 'red',
  },
};

export default class ErrorBoundary extends Component<
  unknown,
  { error: Error | null; errorInfo: ErrorInfo | null }
> {
  public constructor(props: unknown) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  public render() {
    if (this.state.errorInfo && process.env.NODE_ENV === 'production') {
      // Error path
      return (
        <div style={styles.container}>
          <p style={styles.header}>Something went wrong.</p>
          <details style={styles.body}>
            {this.state.error}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}
