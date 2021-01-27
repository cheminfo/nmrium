import { memo, useMemo } from 'react';

import MultiAnalysisWrapper from '../../hoc/MultiAnalysisWrapper';

import AnalysisRange from './AnalysisRange';

function MultiAnalysisRanges({ activeTab, spectraAanalysis, displayerKey }) {
  const columns = useMemo(() => {
    const {
      options: { columns },
    } = spectraAanalysis[activeTab] || {
      options: { columns: {} },
    };
    return columns;
  }, [activeTab, spectraAanalysis]);

  const ranges = useMemo(() => {
    return Object.keys(columns).map((key) => key, []);
  }, [columns]);

  if (!ranges || ranges.length === 0) {
    return null;
  }

  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {ranges.map((columnKey) => (
        <AnalysisRange
          key={columnKey}
          columnKey={columnKey}
          rangeData={columns[columnKey]}
        />
      ))}
    </g>
  );
}

export default MultiAnalysisWrapper(memo(MultiAnalysisRanges));
