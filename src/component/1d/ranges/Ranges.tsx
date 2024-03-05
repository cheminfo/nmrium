import { Spectrum1D } from 'nmr-load-save';
import { Ranges as RangesProps } from 'nmr-processing';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';

import Range from './Range';

interface RangesInnerProps {
  displayerKey: string;
  selectedTool: string;
  ranges: RangesProps;
  showMultiplicityTrees: boolean;
  relativeFormat: string;
}

function RangesInner({
  ranges,
  displayerKey,
  selectedTool,
  showMultiplicityTrees,
  relativeFormat,
}: RangesInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {ranges?.values?.map((range) => (
        <Range
          key={range.id}
          range={range}
          selectedTool={selectedTool}
          showMultiplicityTrees={showMultiplicityTrees}
          relativeFormat={relativeFormat}
        />
      ))}
    </g>
  );
}

const MemoizedRanges = memo(RangesInner);

const emptyData = { ranges: {}, info: {}, display: {} };

export default function Ranges() {
  const {
    displayerKey,
    view: {
      spectra: { activeTab },
    },
    toolOptions: { selectedTool },
  } = useChartData();
  const { showMultiplicityTrees, showIntegrals } =
    useActiveSpectrumRangesViewState();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  if (
    !spectrum.ranges?.values ||
    !spectrum.display.isVisible ||
    spectrum.info?.isFid
  ) {
    return null;
  }

  return (
    <MemoizedRanges
      ranges={spectrum.ranges}
      {...{
        showMultiplicityTrees,
        showIntegrals,
        selectedTool,
        displayerKey,
        relativeFormat: rangesPreferences.relative.format,
      }}
    />
  );
}
