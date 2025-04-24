import type { Ranges as RangesProps } from 'nmr-processing';
import type { Spectrum1D } from 'nmrium-core';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { ShareDataProvider } from '../../context/ShareDataContext.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectrum from '../../hooks/useSpectrum.js';

import Range from './Range.js';

interface RangesInnerProps {
  selectedTool: string;
  ranges: RangesProps;
  relativeFormat: string;
}

function RangesInner({
  ranges,
  selectedTool,
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
    view: {
      spectra: { activeTab },
    },
    toolOptions: { selectedTool },
  } = useChartData();
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
      selectedTool={selectedTool}
      relativeFormat={rangesPreferences.relative.format}
    />
  );
}
