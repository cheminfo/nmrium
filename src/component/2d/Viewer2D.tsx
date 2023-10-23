import { Spectrum1D } from 'nmr-load-save';
import { useCallback, useEffect, useMemo, ReactNode, useRef } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { assert } from 'react-science/ui';

import BrushXY, { BRUSH_TYPE } from '../1d-2d/tools/BrushXY';
import CrossLinePointer from '../1d-2d/tools/CrossLinePointer';
import {
  BrushTracker,
  OnBrush,
  OnClick,
  OnDoubleClick,
  OnZoom,
} from '../EventsTrackers/BrushTracker';
import { MouseTracker } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import Spinner from '../loader/Spinner';
import { options } from '../toolbar/ToolTypes';

import { PhaseTraces } from './1d-tracer/phase-correction-traces';
import Chart2D from './Chart2D';
import FooterBanner from './FooterBanner';
import SlicingView from './SlicingView';
import PivotIndicator from './tools/PivotIndicator';
import XYLabelPointer from './tools/XYLabelPointer';
import { get2DDimensionLayout, getLayoutID } from './utilities/DimensionLayout';
import { get2DXScale, get2DYScale } from './utilities/scale';

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

  const spectrumData: Spectrum1D[] = useMemo(() => {
    const nuclei = activeTab.split(',');
    return nuclei
      .map((nucleus) => {
        const spectra = activeSpectra[nucleus];
        if (spectra?.length === 1) {
          const id = spectra[0].id;
          const spectrum = data.find(
            (datum) => datum.id === id && !datum.info.isFid,
          );
          assert(spectrum, `Spectrum with id ${id} not found`);
          return spectrum;
        }
        return null;
      })
      .filter((d) => d !== null) as Spectrum1D[];
  }, [activeTab, data, activeSpectra]);

  const DIMENSION = get2DDimensionLayout(state);

  function handelBrush(brushData) {
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

  const handelBrushEnd = useCallback<OnBrush>(
    (brushData) => {
      //reset the brush start
      brushStartRef.current = null;

      if (brushData.mouseButton === 'main') {
        const trackID = getLayoutID(DIMENSION, brushData);
        if (trackID) {
          if (brushData.altKey) {
            switch (selectedTool) {
              default:
                break;
            }
          } else if (brushData.shiftKey) {
            switch (selectedTool) {
              case options.zonePicking.id:
                dispatch({ type: 'ADD_2D_ZONE', payload: brushData });
                break;
              default:
                break;
            }
          } else {
            switch (selectedTool) {
              default:
                if (selectedTool != null) {
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
        }
      }
    },
    [selectedTool, dispatch, DIMENSION],
  );

  const handelOnDoubleClick: OnDoubleClick = useCallback(
    (e) => {
      const { x: startX, y: startY } = e;
      const trackID = getLayoutID(DIMENSION, { startX, startY });
      if (trackID) {
        dispatch({ type: 'FULL_ZOOM_OUT', payload: { trackID } });
      }
    },
    [DIMENSION, dispatch],
  );

  const handleZoom: OnZoom = (event) => {
    const { x: startX, y: startY, shiftKey } = event;
    const trackID = getLayoutID(DIMENSION, { startX, startY });

    if (trackID) {
      if (
        trackID !== 'CENTER_2D' ||
        (selectedTool === 'phaseCorrectionTwoDimensions' && !shiftKey)
      ) {
        dispatch({ type: 'SET_ZOOM', payload: { event, trackID } });
      } else {
        dispatch({ type: 'SET_2D_LEVEL', payload: event });
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
              onBrush={handelBrush}
              onBrushEnd={handelBrushEnd}
              onDoubleClick={handelOnDoubleClick}
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

  useEffect(() => {
    dispatch({ type: 'SET_DIMENSIONS', payload: { width, height } });
  }, [width, height, dispatch]);

  return children;
}

export default Viewer2D;
