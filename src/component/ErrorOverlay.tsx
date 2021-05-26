import { CSSProperties } from 'react';
import { FallbackProps } from 'react-error-boundary';

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
    marginTop: '10px',
    whiteSpace: 'pre-wrap',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    color: 'red',
  },
};

export default function ErrorOverlay(props: FallbackProps) {
  return (
    <div style={styles.container}>
      <p style={styles.header}>Something went wrong.</p>
      <details style={styles.body}>{props.error.stack}</details>
    </div>
  );
}
