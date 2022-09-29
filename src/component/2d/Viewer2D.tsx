import { useCallback, useEffect, useMemo, ReactNode } from 'react';
import { ResponsiveChart } from 'react-d3-utils';

import { BrushTracker } from '../EventsTrackers/BrushTracker';
import { MouseTracker } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import Spinner from '../loader/Spinner';
import {
  BRUSH_END,
  FULL_ZOOM_OUT,
  SET_DIMENSIONS,
  SET_2D_LEVEL,
  SET_ZOOM,
  ADD_2D_ZONE,
} from '../reducer/types/Types';
import BrushXY, { BRUSH_TYPE } from '../tool/BrushXY';
import CrossLinePointer from '../tool/CrossLinePointer';
import { options } from '../toolbar/ToolTypes';

import Chart2D from './Chart2D';
import FooterBanner from './FooterBanner';
import SlicingView from './SlicingView';
import XYLabelPointer from './tools/XYLabelPointer';
import { get2DDimensionLayout, getLayoutID } from './utilities/DimensionLayout';

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

  const spectrumData = useMemo(() => {
    const nucleuses = activeTab.split(',');
    return nucleuses.reduce<any>((acc, n) => {
      if (activeSpectra[n]?.id) {
        const id = activeSpectra[n]?.id;
        const spectrum = data.find(
          (datum) => datum.id === id && !datum.info.isFid,
        );
        if (spectrum) {
          acc.push(spectrum);
        }
      } else {
        acc.push(null);
      }
      return acc;
    }, []);
  }, [activeTab, data, activeSpectra]);

  const DIMENSION = get2DDimensionLayout(state);

  const handelBrushEnd = useCallback(
    (brushData) => {
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
              dispatch({ type: ADD_2D_ZONE, ...brushData });
              break;
            default:
              break;
          }
        } else {
          switch (selectedTool) {
            default:
              if (selectedTool != null) {
                return dispatch({
                  type: BRUSH_END,
                  ...brushData,
                  trackID: getLayoutID(DIMENSION, brushData),
                });
              }
          }
        }
      }
    },
    [selectedTool, dispatch, DIMENSION],
  );

  const handelOnDoubleClick = useCallback(
    (e) => {
      const { x: startX, y: startY } = e;
      const trackID = getLayoutID(DIMENSION, { startX, startY });
      if (trackID) {
        dispatch({ type: FULL_ZOOM_OUT, trackID });
      }
    },
    [DIMENSION, dispatch],
  );

  const handleZoom = (event) => {
    const { x: startX, y: startY } = event;
    const trackID = getLayoutID(DIMENSION, { startX, startY });

    if (trackID) {
      if (trackID === 'CENTER_2D') {
        dispatch({ type: SET_2D_LEVEL, ...event });
      } else {
        dispatch({ type: SET_ZOOM, event, trackID });
      }
    }
  };

  const mouseClick = useCallback(
    (position) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { x, y } = position;
      switch (selectedTool) {
        default:
          break;
      }
    },
    [selectedTool],
  );

  return (
    <ResponsiveChart>
      {({ width, height }) => (
        <ViewerResponsiveWrapper width={width} height={height}>
          <Spinner isLoading={isLoading} emptyText={emptyText} />
          {data && data.length > 0 && (
            <BrushTracker
              onBrush={handelBrushEnd}
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
                style={{ width: '100%', height: `100%`, position: 'absolute' }}
              >
                {selectedTool && selectedTool === options.slicing.id && (
                  <SlicingView />
                )}

                <CrossLinePointer />
                {spectrumData && (
                  <XYLabelPointer data1D={spectrumData} layout={DIMENSION} />
                )}

                <BrushXY
                  brushType={BRUSH_TYPE.XY}
                  dimensionBorder={DIMENSION.CENTER_2D}
                />
                <>
                  {spectrumData?.[0] && (
                    <BrushXY
                      brushType={BRUSH_TYPE.X}
                      dimensionBorder={DIMENSION.TOP_1D}
                      height={margin.top}
                    />
                  )}
                  {spectrumData?.[1] && (
                    <BrushXY
                      brushType={BRUSH_TYPE.Y}
                      dimensionBorder={DIMENSION.LEFT_1D}
                      width={margin.left}
                    />
                  )}
                </>
                {spectrumData && (
                  <FooterBanner data1D={spectrumData} layout={DIMENSION} />
                )}

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
  children: any;
}

export function ViewerResponsiveWrapper(props: ViewerResponsiveWrapperProps) {
  const dispatch = useDispatch();
  const { width, height, children } = props;

  useEffect(() => {
    dispatch({ type: SET_DIMENSIONS, ...{ width, height } });
  }, [width, height, dispatch]);

  return children;
}

export default Viewer2D;
