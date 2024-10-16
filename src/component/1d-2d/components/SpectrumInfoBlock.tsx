/** @jsxImportSource @emotion/react */
import lodashGet from 'lodash/get.js';
import type { Spectrum } from 'nmr-load-save';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { BsArrowsMove } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import reactUse from 'react-use';

import { useChartData } from '../../context/ChartContext.js';
import { useGlobal } from '../../context/GlobalContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import type { ActionsButtonsPopoverProps } from '../../elements/ActionsButtonsPopover.js';
import { ActionsButtonsPopover } from '../../elements/ActionsButtonsPopover.js';
import { SVGGroup } from '../../elements/SVGGroup.js';
import useDraggable from '../../elements/draggable/useDraggable.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import type { Margin } from '../../reducer/Reducer.js';
import { formatNumber } from '../../utility/formatNumber.js';

const verticalSpace = 5;
const boxPadding = 0;
const dragShiftY = 24;

const styles: Record<'value' | 'label' | 'colorIndicator', CSSProperties> = {
  label: {
    fontSize: '11px',
    fill: 'black',
    fontWeight: 'bold',
  },
  value: {
    fontSize: '12px',
    fill: 'black',
  },
  colorIndicator: {
    width: '10px',
    height: '2px',
  },
};

function getInfoValue(
  spectrum: Spectrum,
  field: { jpath: string[]; format: string },
) {
  const { jpath, format } = field;
  const value = lodashGet(spectrum, jpath, '');

  switch (typeof value) {
    case 'number':
      return formatNumber(value, format);
    case 'string':
      return value;
    case 'boolean':
      return value ? 'Yes' : 'No';
    default:
      return JSON.stringify(value);
  }
}

function useInfoPosition(margin: Margin) {
  const { left, top } = margin;

  const {
    current: { infoBlock },
  } = usePreferences();
  const { x, y } = infoBlock?.position || { x: left, y: top };

  return { x, y };
}

function SpectrumInfoBlock() {
  const { height, width, margin } = useChartData();
  const spectrum = useSpectrum();
  const { viewerRef } = useGlobal();
  const coordinate = useInfoPosition(margin);
  const { dispatch } = usePreferences();
  const [isMoveActive, setIsMoveActive] = useState(false);

  const [currentPosition, setCurrentPosition] = useState<{
    x: number;
    y: number;
  }>(coordinate);
  const {
    current: {
      infoBlock: { visible, fields },
    },
  } = usePreferences();

  const infoFields = fields.filter((field) => field.visible);
  const totalSpace =
    verticalSpace *
    ((infoFields?.length < 2
      ? 2
      : infoFields?.length - (infoFields?.length % 2)
        ? 2
        : 1) || 0);
  const [ref, boxSize] = reactUse.useMeasure<SVGGElement>();
  const { onPointerDown } = useDraggable({
    position: coordinate,
    onChange: (dragEvent) => {
      const { action, position } = dragEvent;

      switch (action) {
        case 'start': {
          setCurrentPosition({ x: position.x, y: position.y + dragShiftY });
          setIsMoveActive(true);
          break;
        }
        case 'move': {
          setCurrentPosition({
            x: position.x,
            y: position.y + dragShiftY,
          });
          break;
        }
        case 'end':
          dispatch({
            type: 'CHANGE_INFORMATION_BLOCK_POSITION',
            payload: {
              coordination: {
                x: position.x,
                y: position.y,
              },
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

  if (!visible || !spectrum) return null;

  const bothSidePadding = boxPadding * 2;
  const shift = dragShiftY / 2;

  let { x, y } = currentPosition;

  if (x + boxSize.width + boxPadding > width - margin.right) {
    x = width - margin.right - boxSize.width - boxPadding;
  }

  if (x - boxPadding < margin.left) {
    x = margin.left + boxPadding;
  }
  if (y + boxSize.height + bothSidePadding + shift > height - margin.bottom) {
    y = height - margin.bottom - boxSize.height - bothSidePadding - shift;
  }

  if (y + shift < margin.top) {
    y = margin.top - shift;
  }

  const boxWidth = boxSize.width + bothSidePadding;
  const boxHeight = boxSize.height + bothSidePadding;

  const actionsButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <BsArrowsMove />,
      onPointerDown: (event) => {
        event.stopPropagation();
        onPointerDown(event);
      },
      intent: 'none',
      title: 'Move information block',
      style: { cursor: 'move' },
    },
    {
      icon: <FaTimes />,
      onClick: () => {
        dispatch({
          type: 'TOGGLE_INFORMATION_BLOCK',
          payload: { visible: false },
        });
      },
      intent: 'danger',
      title: 'Hide information block',
    },
  ];

  return (
    <ActionsButtonsPopover
      targetTagName="g"
      buttons={actionsButtons}
      positioningStrategy="fixed"
      position="top-left"
      direction="row"
      space={2}
      {...(isMoveActive && { isOpen: true })}
      modifiers={{
        offset: {
          data: { x, y },
        },
      }}
    >
      <g className="spectra-info-block" transform={`translate(${x} ${y})`}>
        <rect
          data-no-export="true"
          x={-boxPadding}
          y={-boxPadding + totalSpace}
          width={boxWidth}
          height={boxHeight}
          rx="5"
          fill={isMoveActive ? 'white' : 'transparent'}
          opacity={isMoveActive ? 0.9 : 0}
        />
        <g ref={ref}>
          {infoFields.map((field, index) => {
            return (
              <SVGGroup
                transform={`translate(0,${20 * (index + 1)})`}
                space={verticalSpace}
                key={field.jpath + field.label}
              >
                <text alignmentBaseline="middle" style={styles.label}>
                  {field.label} :
                </text>
                <text alignmentBaseline="middle" style={styles.value}>
                  {getInfoValue(spectrum, field)}
                </text>
              </SVGGroup>
            );
          })}
        </g>
      </g>
    </ActionsButtonsPopover>
  );
}

export default SpectrumInfoBlock;
