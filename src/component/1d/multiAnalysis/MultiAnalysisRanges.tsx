import { memo, useMemo } from 'react';

import { SpectraAnalysis } from '../../../data/data1d/MultipleAnalysis';
import { useChartData } from '../../context/ChartContext';

import AnalysisRange from './AnalysisRange';

interface MultiAnalysisRangesInnerProps {
  activeTab: string;
  displayerKey: string;
  spectraAnalysis: SpectraAnalysis;
}

function MultiAnalysisRangesInner({
  activeTab,
  spectraAnalysis,
  displayerKey,
}: MultiAnalysisRangesInnerProps) {
  const columns = useMemo(() => {
    const {
      options: { columns },
    } = spectraAnalysis[activeTab] || {
      options: { columns: {} },
    };
    return columns;
  }, [activeTab, spectraAnalysis]);

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

const MemoizedMultiAnalysisRanges = memo(MultiAnalysisRangesInner);

export default function MultiAnalysisRanges() {
  const { activeTab, spectraAnalysis, displayerKey } = useChartData();

  return (
    <MemoizedMultiAnalysisRanges
      {...{ activeTab, spectraAnalysis, displayerKey }}
    />
  );
}
