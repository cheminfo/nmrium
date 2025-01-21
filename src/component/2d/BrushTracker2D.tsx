import { useCallback, useRef } from 'react';

import type {
  OnBrush,
  OnClick,
  OnDoubleClick,
  OnZoom,
} from '../EventsTrackers/BrushTracker.js';
import { BrushTracker } from '../EventsTrackers/BrushTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useMapKeyModifiers } from '../context/KeyModifierContext.js';
import { options } from '../toolbar/ToolTypes.js';

import {
  get2DDimensionLayout,
  getLayoutID,
} from './utilities/DimensionLayout.js';
import { get2DXScale, get2DYScale } from './utilities/scale.js';

export function BrushTracker2D({ children }) {
  const state = useChartData();
  const {
    toolOptions: { selectedTool },
  } = state;

  const dispatch = useDispatch();
  const brushStartRef = useRef<{ x: number; y: number } | null>(null);
  const { getModifiersKey, primaryKeyIdentifier } = useMapKeyModifiers();
  const DIMENSION = get2DDimensionLayout(state);

  function handleBrush(brushData) {
    const {
      startX: startXInPixel,
      endX: endXInPixel,
      startY: startYInPixel,
      endY: endYInPixel,
      mouseButton,
    } = brushData;

    if (mouseButton === 'secondary') {
      const scaleX = get2DXScale(state);
      const scaleY = get2DYScale(state);
      if (!brushStartRef.current) {
        const x = scaleX.invert(startXInPixel);
        const y = scaleY.invert(startYInPixel);
        brushStartRef.current = { x, y };
      }
      const { x, y } = brushStartRef.current;
      const shiftX = scaleX.invert(endXInPixel) - x;
      const shiftY = scaleY.invert(endYInPixel) - y;

      dispatch({ type: 'MOVE', payload: { shiftX, shiftY } });
    }
  }

  const handleBrushEnd = useCallback<OnBrush>(
    (brushData) => {
      //reset the brush start
      brushStartRef.current = null;

      const modifierKey = getModifiersKey(brushData as unknown as MouseEvent);
      let executeDefaultAction = false;

      if (brushData.mouseButton === 'main') {
        const trackID = getLayoutID(DIMENSION, brushData);
        if (trackID) {
          switch (modifierKey) {
            case primaryKeyIdentifier: {
              switch (selectedTool) {
                case options.zoom.id: {
                  executeDefaultAction = true;
                  break;
                }
                case options.zonePicking.id: {
                  dispatch({ type: 'ADD_2D_ZONE', payload: brushData });

                  break;
                }
                default:
                  break;
              }

              break;
            }
            default: {
              executeDefaultAction = true;
              break;
            }
          }
          const isNotDistanceMeasurementTool =
            selectedTool !== 'zoom' ||
            (selectedTool === 'zoom' && !brushData.shiftKey);

          if (
            executeDefaultAction &&
            selectedTool != null &&
            isNotDistanceMeasurementTool
          ) {
            return dispatch({
              type: 'BRUSH_END',
              payload: {
                ...brushData,
                trackID: getLayoutID(DIMENSION, brushData),
              },
            });
          }
        }
      }
    },
    [getModifiersKey, DIMENSION, selectedTool, primaryKeyIdentifier, dispatch],
  );

  const handleOnDoubleClick: OnDoubleClick = useCallback(
    (e) => {
      const { x: startX, y: startY } = e;
      const trackID = getLayoutID(DIMENSION, { startX, startY });
      if (trackID) {
        dispatch({ type: 'FULL_ZOOM_OUT', payload: { trackID } });
      }
    },
    [DIMENSION, dispatch],
  );

  const handleZoom: OnZoom = (options) => {
    const { x: startX, y: startY, shiftKey } = options;
    const trackID = getLayoutID(DIMENSION, { startX, startY });

    if (trackID) {
      const isZoomWithScroll =
        trackID === 'CENTER_2D' && shiftKey && selectedTool === 'zoom';
      const isMouseOver1DTrace = trackID !== 'CENTER_2D';
      const isTraceZoomActive =
        selectedTool === 'phaseCorrectionTwoDimensions' && !shiftKey;
      if (isZoomWithScroll || isMouseOver1DTrace || isTraceZoomActive) {
        dispatch({ type: 'SET_ZOOM', payload: { options, trackID } });
      } else {
        dispatch({ type: 'SET_2D_LEVEL', payload: { options } });
      }
    }
  };

  const mouseClick: OnClick = useCallback(
    (event) => {
      const { x, y, shiftKey } = event;
      if (shiftKey) {
        switch (selectedTool) {
          case 'phaseCorrectionTwoDimensions':
            dispatch({
              type: 'SET_TWO_DIMENSION_PIVOT_POINT',
              payload: { x, y },
            });
            break;
          default:
            break;
        }
      } else {
        switch (selectedTool) {
          case 'phaseCorrectionTwoDimensions':
            dispatch({ type: 'ADD_PHASE_CORRECTION_TRACE', payload: { x, y } });
            break;
          default:
            break;
        }
      }
    },
    [selectedTool, dispatch],
  );

  return (
    <BrushTracker
      onBrush={handleBrush}
      onBrushEnd={handleBrushEnd}
      onDoubleClick={handleOnDoubleClick}
      onClick={mouseClick}
      onZoom={handleZoom}
      style={{
        width: '100%',
        height: '100%',
        margin: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </BrushTracker>
  );
}
