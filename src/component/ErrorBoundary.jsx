import { Component } from 'react';

const styles = {
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

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }
  render() {
    if (this.state.errorInfo && process.env.NODE_ENV === 'production') {
      // Error path
      return (
        <div style={styles.container}>
          <p style={styles.header}>Something went wrong.</p>
          <details style={styles.body}>
            {this.state.error && this.state.error.toString()}
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

export default ErrorBoundary;
