import React, {
  useCallback,
  Fragment,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useSize, useDebounce } from 'react-use';

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
  SET_ZOOM_FACTOR,
  ADD_2D_ZONE,
} from '../reducer/types/Types';
import BrushXY, { BRUSH_TYPE } from '../tool/BrushXY';
import CrossLinePointer from '../tool/CrossLinePointer';
import { options } from '../toolbar/ToolTypes';
// import FooterBanner from '../1d/FooterBanner';

import Chart2D from './Chart2D';
import FooterBanner from './FooterBanner';
import XYLabelPointer from './tools/XYLabelPointer';
import SlicingView from './tools/slicing/SlicingView';
import { get2DDimensionLayout, getLayoutID } from './utilities/DimensionLayout';

const Viewer2D = () => {
  const state = useChartData();
  const {
    selectedTool,
    isLoading,
    data,
    margin,
    tabActiveSpectrum,
    activeTab,
  } = state;

  const dispatch = useDispatch();

  const spectrumData = useMemo(() => {
    const nucleuses = activeTab.split(',');
    return nucleuses.reduce((acc, n) => {
      if (tabActiveSpectrum[n] && tabActiveSpectrum[n].id) {
        const id = tabActiveSpectrum[n].id;
        const spectrum = data.find(
          (datum) => datum.id === id && !datum.info.isFid,
        );
        if (spectrum) {
          acc.push(spectrum);
        }
      }
      return acc;
    }, []);
  }, [activeTab, data, tabActiveSpectrum]);

  // const colors = useMemo(() => {
  //   const id = tabActiveSpectrum[activeTab].id;
  //   const spectrum = data.find((datum) => datum.id === id);
  //   return [spectrum.display.positiveColor, spectrum.display.negativeColor];
  // }, [activeTab, data, tabActiveSpectrum]);

  // console.log(colors);

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
            case options.zone2D.id:
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

  const handleZoom = (wheelData) => {
    const { x: startX, y: startY } = wheelData;
    const trackID = getLayoutID(DIMENSION, { startX, startY });

    if (trackID) {
      if (trackID === 'CENTER_2D') {
        dispatch({ type: SET_2D_LEVEL, ...wheelData });
      } else {
        dispatch({ type: SET_ZOOM_FACTOR, ...wheelData, trackID });
      }
    }
  };

  const mouseClick = useCallback(
    (position) => {
      // eslint-disable-next-line no-unused-vars
      const { x, y } = position;
      switch (selectedTool) {
        default:
          break;
      }
    },
    [selectedTool],
  );

  const [sizedNMRChart, { width, height }] = useSize(() => {
    return (
      <Fragment>
        <Spinner isLoading={isLoading} />

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
              {selectedTool && selectedTool === options.slicingTool.id && (
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
              {spectrumData && spectrumData.length > 1 && (
                <>
                  <BrushXY
                    brushType={BRUSH_TYPE.X}
                    dimensionBorder={DIMENSION.TOP_1D}
                    height={margin.top}
                  />
                  <BrushXY
                    brushType={BRUSH_TYPE.Y}
                    dimensionBorder={DIMENSION.LEFT_1D}
                    width={margin.left}
                  />
                </>
              )}
              {spectrumData && (
                <FooterBanner data1D={spectrumData} layout={DIMENSION} />
              )}

              <Chart2D data={spectrumData} />
            </MouseTracker>
          </BrushTracker>
        )}
      </Fragment>
    );
  }, []);

  const [finalSize, setFinalSize] = useState();
  useDebounce(() => setFinalSize({ width, height }), 400, [width, height]);
  useEffect(() => {
    if (
      finalSize &&
      finalSize.width !== Infinity &&
      finalSize.height !== Infinity
    ) {
      dispatch({
        type: SET_DIMENSIONS,
        ...finalSize,
      });
    }
  }, [dispatch, finalSize]);

  return sizedNMRChart;
};

export default Viewer2D;
