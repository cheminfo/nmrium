import type { Spectrum1D } from 'nmr-load-save';
import type { Ranges as RangesProps } from 'nmr-processing';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { ShareDataProvider } from '../../context/ShareDataContext.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectrum from '../../hooks/useSpectrum.js';

import Range from './Range.js';

interface RangesInnerProps {
  selectedTool: string;
  ranges: RangesProps;
  showMultiplicityTrees: boolean;
  relativeFormat: string;
}

function RangesInner({
  ranges,
  selectedTool,
  showMultiplicityTrees,
  relativeFormat,
}: RangesInnerProps) {
  return (
    <ShareDataProvider>
      <g>
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
    </ShareDataProvider>
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
