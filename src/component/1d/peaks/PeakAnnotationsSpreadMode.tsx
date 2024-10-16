import { memo } from 'react';
import { useMeasure } from 'react-use';

import { useHighlight } from '../../highlight';
import { usePeaksLabelSettings } from '../../hooks/usePeaksLabelSettings';
import { formatNumber } from '../../utility/formatNumber';
import { resolve } from '../utilities/intersectionResolver';

import { PeakEditionListener } from './PeakEditionManager';
import {
  PeaksAnnotationsProps,
  PeaksSource,
  getHighlightExtraId,
  getHighlightSource,
} from './Peaks';

const notationWidth = 10;
const notationMargin = 2;

function PeakAnnotationsSpreadMode(
  props: Omit<PeaksAnnotationsProps, 'xDomain'>,
) {
  const { peaks, peaksSource, spectrumColor, displayerKey, peakFormat } = props;

  const [ref, boxSize] = useMeasure<SVGGElement>();
  const { marginTop } = usePeaksLabelSettings();

  const mapPeaks = resolve(peaks, {
    key: 'scaleX',
    width: notationWidth,
    margin: notationMargin,
    groupMargin: 10,
  });

  const y = boxSize.height + marginTop;
  return (
    <g
      ref={ref}
      className="peaks"
      clipPath={`url(#${displayerKey}clip-chart-1d)`}
    >
      <g
        transform={`translate(0,${y})`}
        style={{ visibility: boxSize.height > 0 ? 'visible' : 'hidden' }}
      >
        {mapPeaks.map((group) => {
          return (
            <g
              key={group.meta.id}
              transform={`translate(${group.meta.groupStartX},0)`}
            >
              {group.group.map((item, index) => {
                const { id, x: value, scaleX, parentKeys } = item;
                const startX = index * (notationWidth + notationMargin);
                const x = scaleX - group.meta.groupStartX;
                return (
                  <PeakAnnotation
                    key={id}
                    startX={startX}
                    x={x}
                    id={id}
                    parentKeys={parentKeys}
                    value={value}
                    format={peakFormat}
                    color={spectrumColor}
                    peakEditionFieldPosition={{
                      x: group.meta.groupStartX + startX,
                      y,
                    }}
                    peaksSource={peaksSource}
                  />
                );
              })}
            </g>
          );
        })}
      </g>
    </g>
  );
}

interface PeakAnnotationProps {
  startX: number;
  x: number;
  format: string;
  color: string;
  id: string;
  value: number;
  peakEditionFieldPosition: { x: number; y: number };
  peaksSource: PeaksSource;
  parentKeys: string[];
}
function PeakAnnotation(props: PeakAnnotationProps) {
  const {
    startX,
    format,
    color,
    id,
    value,
    x,
    peakEditionFieldPosition,
    peaksSource,
    parentKeys,
  } = props;
  const highlight = useHighlight([id], {
    type: getHighlightSource(peaksSource),
    extra: { id: getHighlightExtraId(peaksSource, id, parentKeys) },
  });
  return (
    <g
      onMouseEnter={() => highlight.show()}
      onMouseLeave={() => highlight.hide()}
    >
      <PeakEditionListener {...{ ...peakEditionFieldPosition, id, value }}>
        <text
          transform={`rotate(-90) translate(0 ${startX})`}
          dominantBaseline="middle"
          textAnchor="start"
          fontSize="11px"
          fill="black"
        >
          {formatNumber(value, format)}
        </text>
      </PeakEditionListener>
      <path
        d={`M ${startX} 5 v 5 L ${x} 20 v 5`}
        stroke={color}
        fill="transparent"
        strokeWidth={highlight.isActive ? '3px' : '1px'}
      />
    </g>
  );
}

export default memo(PeakAnnotationsSpreadMode);
