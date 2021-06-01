import { CSSProperties } from 'react';
import { FallbackProps } from 'react-error-boundary';

type RecordKey = 'container' | 'header' | 'title' | 'body';

const styles: Record<RecordKey, CSSProperties> = {
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

  title: {
    textDecoration: 'underline',
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
      <details style={styles.body}>
        <p style={styles.title}>{props.error.message}</p>
        {props.error.stack}
      </details>
    </div>
  );
}
