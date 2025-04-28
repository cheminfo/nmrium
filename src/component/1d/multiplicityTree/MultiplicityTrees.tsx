import type { Spectrum1D } from '@zakodium/nmrium-core';
import type { Ranges as RangesProps } from 'nmr-processing';
import { memo } from 'react';

import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import useSpectrum from '../../hooks/useSpectrum.js';

import MultiplicityTreeNode from './MultiplicityTree.js';

interface MultiplicityTreesInnerProps {
  ranges: RangesProps;
}

function MultiplicityTreesInner({ ranges }: MultiplicityTreesInnerProps) {
  return (
    <g>
      {ranges?.values?.map((range) => (
        <MultiplicityTreeNode key={range.id} range={range} />
      ))}
    </g>
  );
}

const MemoizedMultiplicityTrees = memo(MultiplicityTreesInner);

const emptyData = { ranges: {}, info: {}, display: {} };

export default function MultiplicityTrees() {
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

  return <MemoizedMultiplicityTrees ranges={spectrum.ranges} />;
}
