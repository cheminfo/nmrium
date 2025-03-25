import { useCallback, useRef } from 'react';

import type {
  BrushAxis,
  BrushTrackerData,
  OnBrush,
  OnClick,
  OnDoubleClick,
  OnZoom,
} from '../EventsTrackers/BrushTracker.js';
import {
  BrushTracker,
  detectBrushing,
} from '../EventsTrackers/BrushTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useMapKeyModifiers } from '../context/KeyModifierContext.js';
import { options } from '../toolbar/ToolTypes.js';

import {
  get2DDimensionLayout,
  getLayoutID,
} from './utilities/DimensionLayout.js';
import type { Layout } from './utilities/DimensionLayout.js';
import { useScale2DX, useScale2DY } from './utilities/scale.js';

function usePixelToPPMConverter() {
  const scaleX = useScale2DX();
  const scaleY = useScale2DY();

  return useCallback(
    (
      brushData: Pick<BrushTrackerData, 'startX' | 'endX' | 'startY' | 'endY'>,
    ) => {
      const startX = scaleX.invert(brushData.startX);
      const endX = scaleX.invert(brushData.endX);
      const startY = scaleY.invert(brushData.startY);
      const endY = scaleY.invert(brushData.endY);
      return {
        startX,
        endX,
        startY,
        endY,
      };
    },
    [scaleX, scaleY],
  );
}

export function BrushTracker2D({ children }) {
  const state = useChartData();
  const {
    toolOptions: { selectedTool },
    width,
    height,
  } = state;

  const dispatch = useDispatch();
  const brushStartRef = useRef<{ x: number; y: number } | null>(null);
  const { getModifiersKey, primaryKeyIdentifier } = useMapKeyModifiers();
  const DIMENSION = get2DDimensionLayout(state);
  const convertToPPM = usePixelToPPMConverter();

  function handleBrush(brushData) {
    const { startX, endX, startY, endY } = convertToPPM(brushData);

    if (brushData.mouseButton === 'secondary') {
      if (!brushStartRef.current) {
        brushStartRef.current = { x: startX, y: startY };
      }
      const { x, y } = brushStartRef.current;
      const shiftX = endX - x;
      const shiftY = endY - y;

      dispatch({ type: 'MOVE', payload: { shiftX, shiftY } });
    }
  }

  const handleBrushEnd = useCallback<OnBrush>(
    (brushData) => {
      const brushDataInPPM = convertToPPM(brushData);

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
            const trackID = getLayoutID(DIMENSION, brushData);

            const axisMap: Record<Layout, BrushAxis> = {
              MAIN: detectBrushing(brushData, width, height).type,
              LEFT: 'Y',
              TOP: 'X',
            };

            const axis: BrushAxis | null = trackID && axisMap[trackID];

            return dispatch({
              type: 'BRUSH_END',
              payload: {
                ...brushDataInPPM,
                axis,
              },
            });
          }
        }
      }
    },
    [
      convertToPPM,
      getModifiersKey,
      DIMENSION,
      selectedTool,
      primaryKeyIdentifier,
      dispatch,
      width,
      height,
    ],
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
        trackID === 'MAIN' && shiftKey && selectedTool === 'zoom';
      const isMouseOver1DTrace = trackID !== 'MAIN';
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
