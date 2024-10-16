import type { Spectrum1D } from 'nmr-load-save';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ResponsiveChart } from 'react-d3-utils';

import BrushXY, { BRUSH_TYPE } from '../1d-2d/tools/BrushXY.js';
import CrossLinePointer from '../1d-2d/tools/CrossLinePointer.js';
import type {
  OnBrush,
  OnClick,
  OnDoubleClick,
  OnZoom,
} from '../EventsTrackers/BrushTracker.js';
import { BrushTracker } from '../EventsTrackers/BrushTracker.js';
import { MouseTracker } from '../EventsTrackers/MouseTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useMapKeyModifiers } from '../context/KeyModifierContext.js';
import { useViewportSize } from '../hooks/useViewportSize.js';
import Spinner from '../loader/Spinner.js';
import { options } from '../toolbar/ToolTypes.js';

import { PhaseTraces } from './1d-tracer/phase-correction-traces/index.js';
import Chart2D from './Chart2D.js';
import FooterBanner from './FooterBanner.js';
import SlicingView from './SlicingView.js';
import { PivotIndicator } from './tools/PivotIndicator.js';
import XYLabelPointer from './tools/XYLabelPointer.js';
import {
  get2DDimensionLayout,
  getLayoutID,
} from './utilities/DimensionLayout.js';
import { get2DXScale, get2DYScale } from './utilities/scale.js';

interface Viewer2DProps {
  emptyText: ReactNode;
}

function Viewer2D({ emptyText = undefined }: Viewer2DProps) {
  const state = useChartData();
  const {
    toolOptions: { selectedTool },
    isLoading,
    data,
    margin,
    view: {
      spectra: { activeSpectra, activeTab },
    },
  } = state;

  const dispatch = useDispatch();
  const brushStartRef = useRef<{ x: number; y: number } | null>(null);
  const { getModifiersKey, primaryKeyIdentifier } = useMapKeyModifiers();

  const spectrumData: Spectrum1D[] = useMemo(() => {
    const nuclei = activeTab.split(',');

    const traces: Spectrum1D[] = [];
    for (const nucleus of nuclei) {
      const spectra = activeSpectra[nucleus];
      if (spectra?.length === 1) {
        const id = spectra[0].id;
        const spectrum = data.find(
          (datum) =>
            datum.id === id && !datum.info.isFid && datum.info.dimension === 1,
        ) as Spectrum1D;

        if (spectrum) {
          traces.push(spectrum);
        }
      }
    }
    return traces;
  }, [activeTab, data, activeSpectra]);

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
    <ResponsiveChart>
      {({ width, height }) => (
        <ViewerResponsiveWrapper width={width} height={height}>
          <Spinner isLoading={isLoading} emptyText={emptyText} />
          {data && data.length > 0 && (
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
              <MouseTracker
                style={{ width: '100%', height: `100%`, position: 'relative' }}
              >
                {selectedTool && selectedTool === options.slicing.id && (
                  <SlicingView />
                )}
                {selectedTool &&
                  selectedTool === options.phaseCorrectionTwoDimensions.id && (
                    <PhaseTraces />
                  )}

                <CrossLinePointer />
                <XYLabelPointer data1D={spectrumData} layout={DIMENSION} />

                <BrushXY
                  brushType={BRUSH_TYPE.XY}
                  dimensionBorder={DIMENSION.CENTER_2D}
                />
                <>
                  {spectrumData[0] && (
                    <BrushXY
                      brushType={BRUSH_TYPE.X}
                      dimensionBorder={DIMENSION.TOP_1D}
                      height={margin.top}
                    />
                  )}
                  {spectrumData[1] && (
                    <BrushXY
                      brushType={BRUSH_TYPE.Y}
                      dimensionBorder={DIMENSION.LEFT_1D}
                      width={margin.left}
                    />
                  )}
                </>
                <PivotIndicator />
                <FooterBanner data1D={spectrumData} layout={DIMENSION} />

                <Chart2D spectra={spectrumData} />
              </MouseTracker>
            </BrushTracker>
          )}
        </ViewerResponsiveWrapper>
      )}
    </ResponsiveChart>
  );
}

interface ViewerResponsiveWrapperProps {
  width: number;
  height: number;
  children: ReactNode;
}

export function ViewerResponsiveWrapper(props: ViewerResponsiveWrapperProps) {
  const dispatch = useDispatch();
  const { width, height, children } = props;
  const size = useViewportSize();

  useEffect(() => {
    if (!size) {
      dispatch({ type: 'SET_DIMENSIONS', payload: { width, height } });
    }
  }, [width, height, dispatch, size]);

  return children;
}

export default Viewer2D;
