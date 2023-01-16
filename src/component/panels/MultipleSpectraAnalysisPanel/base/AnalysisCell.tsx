import { CSSProperties } from 'react';

import { useHighlight } from '../../../highlight/index';
import { useFormatNumberByNucleus } from '../../../hooks/useFormatNumberByNucleus';

const styles: Record<'container' | 'errorLabel', CSSProperties> = {
  container: {
    position: 'inherit',
    padding: '0.15rem 0.4rem',
  },
  errorLabel: {
    color: 'red',
  },
};

interface AnalysisCellProps {
  columnKey: string;
  value: any;
  activeTab: string;
}

function AnalysisCell({ columnKey, value, activeTab }: AnalysisCellProps) {
  const highlight = useHighlight([columnKey]);
  const format = useFormatNumberByNucleus(activeTab);

  return (
    <div
      style={{ ...styles.container, ...highlight.defaultActiveStyle }}
      {...highlight.onHover}
    >
      {value instanceof Error ? (
        <span style={styles.errorLabel}>{value.message}</span>
      ) : (
        format(value)
      )}
    </div>
  );
}

export default AnalysisCell;
