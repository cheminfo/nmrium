import { memo, useState } from 'react';
import { BsArrowsMove } from 'react-icons/bs';
import { useMeasure } from 'react-use';

import { useGlobal } from '../../context/GlobalContext';
import { usePreferences } from '../../context/PreferencesContext';
import {
  ActionsButtonsPopover,
  ActionsButtonsPopoverProps,
} from '../../elements/ActionsButtonsPopover';
import useDraggable from '../../elements/draggable/useDraggable';
import { useHighlight } from '../../highlight';
import { usePeaksLabelSettings } from '../../hooks/usePeaksLabelSettings';
import { Margin } from '../../reducer/Reducer';
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

function usePeaksPosition() {
  const { viewerRef } = useGlobal();
  const { dispatch } = usePreferences();
  const { marginTop: originMarginTop } = usePeaksLabelSettings();
  const [isDragActive, setIsMoveActive] = useState(false);
  const [marginTop, setMarginTop] = useState<number>(originMarginTop);

  const { onPointerDown } = useDraggable({
    position: { x: 0, y: marginTop },
    onChange: (dragEvent) => {
      const { action, position } = dragEvent;
      const yOffset = Math.round(position.y);
      switch (action) {
        case 'start': {
          setMarginTop(yOffset);
          setIsMoveActive(true);
          break;
        }
        case 'move': {
          setMarginTop(yOffset);

          break;
        }
        case 'end':
          dispatch({
            type: 'CHANGE_PEAKS_LABEL_POSITION',
            payload: {
              marginTop: yOffset,
            },
          });
          setIsMoveActive(false);
          break;
        default:
          break;
      }
    },
    parentElement: viewerRef,
  });

  return { marginTop, isDragActive, onPointerDown };
}

interface PeakAnnotationsSpreadModeProps
  extends Omit<PeaksAnnotationsProps, 'xDomain'> {
  height: number;
  margin: Margin;
}

function PeakAnnotationsSpreadMode(props: PeakAnnotationsSpreadModeProps) {
  const {
    peaks,
    peaksSource,
    spectrumColor,
    displayerKey,
    peakFormat,
    margin,
    height,
  } = props;
  const [ref, boxSize] = useMeasure<SVGGElement>();
  const { marginTop, isDragActive, onPointerDown } = usePeaksPosition();

  const actionsButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <BsArrowsMove />,
      onPointerDown: (event) => {
        event.stopPropagation();
        onPointerDown(event);
      },
      intent: 'none',
      title: 'Move peaks label vertically',
      style: { cursor: 'move' },
    },
  ];

  const mapPeaks = resolve(peaks, {
    key: 'scaleX',
    width: notationWidth,
    margin: notationMargin,
    groupMargin: 10,
  });

  const boxHeight = Math.round(boxSize.height);

  let y = boxHeight + marginTop;

  if (y + boxHeight > height - margin.bottom) {
    y = height - margin.bottom - boxHeight;
  }

  if (marginTop < 0) {
    y = boxHeight;
  }
  return (
    <ActionsButtonsPopover
      targetTagName="g"
      buttons={actionsButtons}
      positioningStrategy="fixed"
      position="top"
      direction="row"
      {...(isDragActive && { isOpen: true })}
      modifiers={{
        offset: {
          data: { x: 0, y },
        },
      }}
    >
      <g className="peaks" clipPath={`url(#${displayerKey}clip-chart-1d)`}>
        <g
          transform={`translate(0,${y})`}
          style={{ visibility: boxSize.height > 0 ? 'visible' : 'hidden' }}
        >
          <rect
            data-no-export="true"
            width="100%"
            y={-boxHeight / 2}
            height={boxHeight}
            fill={isDragActive ? 'white' : 'transparent'}
            opacity={isDragActive ? 0.9 : 0}
          />
          <g ref={ref}>
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
      </g>
    </ActionsButtonsPopover>
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
