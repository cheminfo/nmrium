import type {
  Range as RangeType,
  Ranges as RangesType,
} from '@zakodium/nmr-types';
import type { Spectrum1D } from '@zakodium/nmrium-core';
import { memo } from 'react';

import { useChartData } from '../../context/ChartContext.js';
import { useScaleChecked } from '../../context/ScaleContext.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { useTextMetrics } from '../../hooks/useTextMetrics.js';
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
  signalId: string;
  assignment: string;
};

function useStackRangesAssignmentsLabels(ranges: RangeType[]) {
  const { scaleX } = useScaleChecked();

  const { getTextWidth } = useTextMetrics(labelSize);

  if (ranges.length === 0) return null;

  const processedRanges: ProcessedRange[] = [];

  for (const range of ranges) {
    const { from, signals } = range;

    const startPosition = scaleX()(from);
    for (const signal of signals) {
      const { id, assignment = '' } = signal;
      const labelWidth = getTextWidth(assignment);

      processedRanges.push({
        ...range,
        labelWidth,
        startPosition,
        signalId: id,
        assignment,
      });
    }
  }

  processedRanges.sort((a, b) => b.startPosition - a.startPosition);
  return stackOverlappingLabelsMap(processedRanges, {
    startPositionKey: 'startPosition',
    labelWidthKey: 'labelWidth',
    padding: 0,
    idKey: 'signalId',
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
    <g>
      {ranges.values.map((range) => (
        <Range
          key={range.id}
          range={range}
          selectedTool={selectedTool}
          relativeFormat={relativeFormat}
          signalsStackIndexes={assignmentLabelsStackIndexes || {}}
        />
      ))}
    </g>
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
