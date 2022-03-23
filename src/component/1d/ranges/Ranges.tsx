import { Fragment, memo } from 'react';

import {
  Datum1D,
  Range as RangProps,
  Ranges as RangesProps,
} from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import useSpectrum from '../../hooks/useSpectrum';

import Range from './Range';
import RangeIntegral from './RangeIntegral';

interface RangesInnerProps {
  displayerKey: string;
  selectedTool: string;
  ranges: RangesProps;
  tempRange: RangProps | null;
  showMultiplicityTrees: boolean;
  showRangesIntegrals: boolean;
}

function RangesInner({
  ranges,
  displayerKey,
  selectedTool,
  tempRange,
  showMultiplicityTrees,
  showRangesIntegrals,
}: RangesInnerProps) {
  return (
    <g clipPath={`url(#${displayerKey}clip-chart-1d)`}>
      {ranges?.values?.map((range) => (
        <Fragment key={range.id}>
          {tempRange?.id !== range.id && (
            <Range
              rangeData={range}
              selectedTool={selectedTool}
              showMultiplicityTrees={showMultiplicityTrees}
              startEditMode={
                false
                // tempRange && tempRange?.id === range.id ? true : false
              }
            />
          )}
          {showRangesIntegrals && <RangeIntegral range={range} />}
        </Fragment>
      ))}
      {tempRange && (
        <Range
          rangeData={tempRange}
          selectedTool={selectedTool}
          showMultiplicityTrees={showMultiplicityTrees}
          startEditMode
        />
      )}
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
      data: { tempRange, showMultiplicityTrees, showRangesIntegrals },
    },
  } = useChartData();

  const { ranges } = useSpectrum(empyData) as Datum1D;

  return (
    <MemoizedRanges
      {...{
        ranges,
        showMultiplicityTrees,
        showRangesIntegrals,
        selectedTool,
        displayerKey,
        tempRange: tempRange,
      }}
    />
  );
}
