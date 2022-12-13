import { memo, useMemo } from 'react';

import { SpectraAnalysisColumns } from '../../../data/data1d/multipleSpectraAnalysis';
import { useChartData } from '../../context/ChartContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';

import AnalysisRange from './AnalysisRange';

interface MultiAnalysisRangesInnerProps {
  displayerKey: string;
  columns: SpectraAnalysisColumns;
  activeTab: string;
}

function MultiAnalysisRangesInner({
  columns,
  displayerKey,
  activeTab,
}: MultiAnalysisRangesInnerProps) {
  const ranges = useMemo(() => {
    return Object.keys(columns).map((key) => key);
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
          activeTab={activeTab}
        />
      ))}
    </g>
  );
}

const MemoizedMultiAnalysisRanges = memo(MultiAnalysisRangesInner);

export default function MultiAnalysisRanges() {
  const {
    view: {
      spectra: { activeTab },
    },
    displayerKey,
  } = useChartData();
  const multipleSpectraAnalysis = usePanelPreferences(
    'multipleSpectraAnalysis',
    activeTab,
  );
  const columns = multipleSpectraAnalysis.columns;
  return (
    <MemoizedMultiAnalysisRanges {...{ columns, displayerKey, activeTab }} />
  );
}
