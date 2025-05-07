import type { Spectrum1D } from '@zakodium/nmrium-core';
import type { Ranges as RangesType, Range as RangeType } from 'nmr-processing';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { ShareDataProvider } from '../../context/ShareDataContext.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { stackOverlappingLabelsMap } from '../../utility/stackOverlappingLabels.js';

import Range from './Range.js';

interface RangesInnerProps {
  selectedTool: string;
  ranges: RangesType;
  relativeFormat: string;
}

const labelSize = 14;

type ProcessedRange = RangeType & {
  labelWidth: number;
  startPosition: number;
};

function useStackRangesAssignmentsLabels(ranges: RangeType[]) {
  const { scaleX } = useScaleChecked();

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context || ranges.length === 0) return null;

  context.font = `${labelSize}px Arial`;

  const processedRanges: ProcessedRange[] = ranges
    .map((range) => {
      const { from, assignment = '' } = range;
      const { width: labelWidth } = context.measureText(assignment);

      return {
        ...range,
        labelWidth,
        startPosition: scaleX()(from),
      };
    }, [])
    .sort((a, b) => b.from - a.from);

  return stackOverlappingLabelsMap(processedRanges, {
    startPositionKey: 'startPosition',
    labelWidthKey: 'labelWidth',
    padding: 0,
    idKey: 'id',
  });
}

function RangesInner({
  ranges,
  selectedTool,
  relativeFormat,
}: RangesInnerProps) {
  const assignmentLabelsStackIndexes = useStackRangesAssignmentsLabels(
    ranges.values,
  );

  return (
    <ShareDataProvider>
      <g>
        {ranges.values.map((range) => (
          <Range
            key={range.id}
            range={range}
            selectedTool={selectedTool}
            relativeFormat={relativeFormat}
            assignmentLabelStackIndex={
              assignmentLabelsStackIndexes?.[range.id] || 0
            }
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
