import { Spectrum1D, Ranges as RangesProps } from 'nmr-processing';
import { Fragment, memo, useMemo } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useActiveSpectrum } from '../../hooks/useActiveSpectrum';
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
            range={range}
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

export default function Ranges() {
  const {
    displayerKey,
    view: {
      ranges: rangeState,
      spectra: { activeTab },
    },
    toolOptions: { selectedTool },
  } = useChartData();
  const activeSpectrum = useActiveSpectrum();
  const { showMultiplicityTrees, showRangesIntegrals } = useMemo(
    () =>
      activeSpectrum
        ? rangeState.find((r) => r.spectrumID === activeSpectrum.id) ||
          rangeStateInit
        : rangeStateInit,
    [activeSpectrum, rangeState],
  );
  const spectrum = useSpectrum() as Spectrum1D;
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  if (!spectrum?.display?.isVisible) {
    return null;
  }

  return (
    <MemoizedRanges
      ranges={spectrum.ranges}
      {...{
        showMultiplicityTrees,
        showRangesIntegrals,
        selectedTool,
        displayerKey,
        relativeFormat: rangesPreferences.relative.format,
      }}
    />
  );
}
