import { Fragment, memo, useMemo } from 'react';

import { Datum1D, Ranges as RangesProps } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import { rangeStateInit } from '../../reducer/Reducer';

import Range from './Range';
import RangeIntegral from './RangeIntegral';

interface RangesInnerProps {
  displayerKey: string;
  selectedTool: string;
  ranges: RangesProps;
  showMultiplicityTrees: boolean;
  showRangesIntegrals: boolean;
  relativeFormat: string;
}

function RangesInner({
  ranges,
  displayerKey,
  selectedTool,
  showMultiplicityTrees,
  showRangesIntegrals,
  relativeFormat,
}: RangesInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {ranges?.values?.map((range) => (
        <Fragment key={range.id}>
          <Range
            rangeData={range}
            selectedTool={selectedTool}
            showMultiplicityTrees={showMultiplicityTrees}
            relativeFormat={relativeFormat}
          />
          {showRangesIntegrals && <RangeIntegral range={range} />}
        </Fragment>
      ))}
    </g>
  );
}

const MemoizedRanges = memo(RangesInner);

const empyData = { ranges: {} };

export default function Ranges() {
  const {
    activeSpectrum,
    displayerKey,
    view: { ranges: rangeState },
    toolOptions: { selectedTool },
    activeTab,
  } = useChartData();
  const { showMultiplicityTrees, showRangesIntegrals } = useMemo(
    () =>
      activeSpectrum
        ? rangeState.find((r) => r.spectrumID === activeSpectrum.id) ||
          rangeStateInit
        : rangeStateInit,
    [activeSpectrum, rangeState],
  );
  const { ranges } = useSpectrum(empyData) as Datum1D;
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  return (
    <MemoizedRanges
      {...{
        ranges,
        showMultiplicityTrees,
        showRangesIntegrals,
        selectedTool,
        displayerKey,
        relativeFormat: rangesPreferences.relative.format,
      }}
    />
  );
}
