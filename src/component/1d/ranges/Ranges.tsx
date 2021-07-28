import { memo } from 'react';

import {
  Datum1D,
  Ranges as RangesProps,
} from '../../../data/data1d/Spectrum1D';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';

import Range from './Range';

interface RangesInnerProps {
  displayerKey: string;
  selectedTool: string;
  ranges: RangesProps;
  editRangeID: string;
  showMultiplicityTrees: boolean;
}

function RangesInner({
  ranges,
  displayerKey,
  selectedTool,
  editRangeID,
  showMultiplicityTrees,
}: RangesInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {ranges?.values?.map((range) => (
        <Range
          key={range.id}
          rangeData={range}
          selectedTool={selectedTool}
          showMultiplicityTrees={showMultiplicityTrees}
          startEditMode={editRangeID && editRangeID === range.id ? true : false}
        />
      ))}
    </g>
  );
}

const MemoizedRanges = memo(RangesInner);

const empyData = { ranges: {} };

export default function Ranges() {
  const {
    displayerKey,
    toolOptions: {
      selectedTool,
      data: { tempRange, showMultiplicityTrees },
    },
  } = useChartData();

  const { ranges } = useSpectrum(empyData) as Datum1D;

  return (
    <MemoizedRanges
      {...{
        ranges,
        showMultiplicityTrees,
        selectedTool,
        displayerKey,
        editRangeID: tempRange?.id,
      }}
    />
  );
}
