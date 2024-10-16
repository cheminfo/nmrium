import { Spectrum1D } from 'nmr-load-save';
import { Ranges as RangesProps } from 'nmr-processing';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import useSpectrum from '../../hooks/useSpectrum.js';

import MultiplicityTreeNode from './MultiplicityTree.js';

interface MultiplicityTreesInnerProps {
  displayerKey: string;
  ranges: RangesProps;
}

function MultiplicityTreesInner({
  ranges,
  displayerKey,
}: MultiplicityTreesInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {ranges?.values?.map((range) => (
        <MultiplicityTreeNode key={range.id} range={range} />
      ))}
    </g>
  );
}

const MemoizedMultiplicityTrees = memo(MultiplicityTreesInner);

const emptyData = { ranges: {}, info: {}, display: {} };

export default function MultiplicityTrees() {
  const { displayerKey } = useChartData();
  const { showMultiplicityTrees } = useActiveSpectrumRangesViewState();
  const spectrum = useSpectrum(emptyData) as Spectrum1D;

  if (
    !spectrum.ranges?.values ||
    !spectrum.display.isVisible ||
    spectrum.info?.isFid ||
    !showMultiplicityTrees
  ) {
    return null;
  }

  return (
    <MemoizedMultiplicityTrees
      ranges={spectrum.ranges}
      displayerKey={displayerKey}
    />
  );
}
