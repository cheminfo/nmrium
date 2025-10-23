import type { SpectraAnalysisColumns } from '@zakodium/nmrium-core';
import { ANALYSIS_COLUMN_TYPES } from '@zakodium/nmrium-core';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';

import AnalysisRange from './AnalysisRange.js';

interface MultiAnalysisRangesInnerProps {
  columns: SpectraAnalysisColumns;
  activeTab: string;
}

function MultiAnalysisRangesInner({
  columns,
  activeTab,
}: MultiAnalysisRangesInnerProps) {
  const ranges = Object.keys(columns).filter(
    (key) => columns[key].type !== ANALYSIS_COLUMN_TYPES.FORMULA,
  );

  if (ranges.length === 0) {
    return null;
  }

  return (
    <g>
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
  } = useChartData();
  const multipleSpectraAnalysis = usePanelPreferences(
    'multipleSpectraAnalysis',
    activeTab,
  );

  const columns = multipleSpectraAnalysis.analysisOptions?.columns;
  if (!columns) return null;
  return <MemoizedMultiAnalysisRanges {...{ columns, activeTab }} />;
}
