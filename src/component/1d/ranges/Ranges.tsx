import { Fragment, memo } from 'react';

import { Datum1D, Ranges as RangesProps } from '../../../data/types/data1d';
import { useChartData } from '../../context/ChartContext';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';

import Range from './Range';
import RangeIntegral from './RangeIntegral';

interface RangesInnerProps {
  displayerKey: string;
  selectedTool: string;
  ranges: RangesProps;
  editRangeID: string;
  showMultiplicityTrees: boolean;
  showRangesIntegrals: boolean;
  relativeFormat: string;
}

function RangesInner({
  ranges,
  displayerKey,
  selectedTool,
  editRangeID,
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
            startEditMode={
              !!(editRangeID && editRangeID === range.id)
            }
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
    displayerKey,
    toolOptions: {
      selectedTool,
      data: { tempRange, showMultiplicityTrees, showRangesIntegrals },
    },
    activeTab,
  } = useChartData();

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
        editRangeID: tempRange?.id || '',
        relativeFormat: rangesPreferences.relative.format,
      }}
    />
  );
}
