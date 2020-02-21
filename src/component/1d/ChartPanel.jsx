import React, { useCallback, Fragment, useEffect, useState } from 'react';
import { useSize, useDebounce } from 'react-use';

import { useDispatch } from '../context/DispatchContext';
import { useChartData } from '../context/ChartContext';
import { options } from '../toolbar/ToolTypes';
import {
  ADD_INTEGRAL,
  ADD_PEAKS,
  ADD_BASE_LINE_ZONE,
  BRUSH_END,
  FULL_ZOOM_OUT,
  CHANGE_INTEGRAL_ZOOM,
  SET_ZOOM_FACTOR,
  ADD_PEAK,
  SET_VERTICAL_INDICATOR_X_POSITION,
  SET_DIMENSIONS,
  ADD_RANGE,
} from '../reducer/types/Types';
import CrossLinePointer from '../tool/CrossLinePointer';
import BrushX from '../tool/BrushX';
import XLabelPointer from '../tool/XLabelPointer';
import PeakPointer from '../tool/PeakPointer';
import VerticalIndicator from '../tool/VerticalIndicator';
import Spinner from '../loader/Spinner';
import { BrushTracker } from '../EventsTrackers/BrushTracker';
import { MouseTracker } from '../EventsTrackers/MouseTracker';

import FooterBanner from './FooterBanner';
import NMRChart from './NMRChart';

const ChartPanel = () => {
  //   const { selectedTool, isLoading, data } = useChartData();
  const {
    selectedTool,
    isLoading,
    data,
    mode,
    width: widthProp,
    height: heightProp,
    margin,
  } = useChartData();
  const dispatch = useDispatch();

  const handelBrushEnd = useCallback(
    (brushData) => {
      if (brushData.shiftKey) {
        switch (selectedTool) {
          case options.integral.id:
            dispatch({
              type: ADD_INTEGRAL,
              ...brushData,
            });
            break;
          case options.rangesPicking.id:
            dispatch({
              type: ADD_RANGE,
              ...brushData,
            });
            break;

          case options.peakPicking.id:
            dispatch({
              type: ADD_PEAKS,
              ...brushData,
            });
            break;
          default:
            break;
        }
      } else {
        switch (selectedTool) {
          case options.baseLineCorrection.id:
            dispatch({
              type: ADD_BASE_LINE_ZONE,
              zone: { from: brushData.startX, to: brushData.endX },
            });
            break;

          default:
            dispatch({ type: BRUSH_END, ...brushData });

            return;
        }
      }
    },
    [dispatch, selectedTool],
  );

  const handelOnDoubleClick = useCallback(() => {
    dispatch({ type: FULL_ZOOM_OUT });
  }, [dispatch]);

  const handleZoom = useCallback(
    (event) => {
      switch (selectedTool) {
        case options.integral.id:
          dispatch({ type: CHANGE_INTEGRAL_ZOOM, zoomFactor: event });
          break;

        default:
          dispatch({ type: SET_ZOOM_FACTOR, zoomFactor: event });

          return;
      }
    },
    [dispatch, selectedTool],
  );

  const mouseClick = useCallback(
    (position) => {
      if (selectedTool === options.peakPicking.id) {
        dispatch({
          type: ADD_PEAK,
          mouseCoordinates: position,
        });
      } else if (selectedTool === options.phaseCorrection.id) {
        dispatch({
          type: SET_VERTICAL_INDICATOR_X_POSITION,
          position: position.x,
        });
      }
    },
    [dispatch, selectedTool],
  );

  // const frequency = useMemo(() => {
  //   return activeSpectrum
  //     ? lodash.get(data[activeSpectrum.index], 'info.frequency')
  //     : 0;
  // }, [activeSpectrum, data]);
  // const currentSpectrum = useMemo(() => {
  //   console.log(activeSpectrum)
  //   return activeSpectrum ? data[activeSpectrum.index] : null;
  // }, [activeSpectrum, data]);

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
              <CrossLinePointer />
              <BrushX />
              <XLabelPointer />
              <PeakPointer />
              <VerticalIndicator />
              <FooterBanner />
              <NMRChart
                width={widthProp}
                height={heightProp}
                margin={margin}
                mode={mode}
              />
            </MouseTracker>
          </BrushTracker>
        )}
      </Fragment>
    );
  }, []);

  const [finalSize, setFinalSize] = useState();
  useDebounce(() => setFinalSize({ width, height }), 400, [width, height]);
  useEffect(() => {
    if (finalSize) {
      dispatch({
        type: SET_DIMENSIONS,
        ...finalSize,
      });
    }
  }, [dispatch, finalSize]);

  return sizedNMRChart;
};

export default ChartPanel;
