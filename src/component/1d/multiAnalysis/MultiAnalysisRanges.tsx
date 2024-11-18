import type { SpectraAnalysisColumns } from 'nmr-load-save';
import { ANALYSIS_COLUMN_TYPES } from 'nmr-load-save';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';

import AnalysisRange from './AnalysisRange.js';

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
  const ranges = Object.keys(columns).filter(
    (key) => columns[key].type !== ANALYSIS_COLUMN_TYPES.FORMULA,
  );

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
  const columns = multipleSpectraAnalysis.analysisOptions.columns;
  return (
    <MemoizedMultiAnalysisRanges {...{ columns, displayerKey, activeTab }} />
  );
}
