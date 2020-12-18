import { useCallback, Fragment, useEffect, useState, useReducer } from 'react';
import { useSize, useDebounce } from 'react-use';

import { BrushTracker } from '../EventsTrackers/BrushTracker';
import { MouseTracker } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { usePreferences } from '../context/PreferencesContext';
import { ScaleProvider } from '../context/ScaleContext';
import { useModal } from '../elements/popup/Modal';
import Spinner from '../loader/Spinner';
import MultipletAnalysisModal from '../modal/MultipletAnalysisModal';
import { ZoomType } from '../reducer/actions/Zoom';
import {
  scaleInitialState,
  scaleReducer,
  SET_X_SCALE,
  SET_Y_SCALE,
} from '../reducer/scaleReducer';
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
  ANALYZE_SPECTRA,
} from '../reducer/types/Types';
import BrushXY, { BRUSH_TYPE } from '../tool/BrushXY';
import CrossLinePointer from '../tool/CrossLinePointer';
import { options } from '../toolbar/ToolTypes';
import Events from '../utility/Events';

import Chart1D from './Chart1D';
import FooterBanner from './FooterBanner';
import SpectraTracker from './SpectraTracker';
import PeakPointer from './tool/PeakPointer';
import VerticalIndicator from './tool/VerticalIndicator';
import XLabelPointer from './tool/XLabelPointer';

const Viewer1D = () => {
  const {
    display: { general },
  } = usePreferences();
  const state = useChartData();
  const {
    selectedTool,
    isLoading,
    data,
    mode,
    width: widthProp,
    height: heightProp,
    margin,
    activeSpectrum,
    xDomain,
    xDomains,
    yDomain,
    yDomains,
    verticalAlign,
  } = state;

  const dispatch = useDispatch();
  const modal = useModal();
  const [scaleState, dispatchScale] = useReducer(
    scaleReducer,
    scaleInitialState,
  );

  useEffect(() => {
    dispatchScale({
      type: SET_Y_SCALE,
      yDomain,
      yDomains,
      margin,
      height: heightProp,
      verticalAlign,
    });
  }, [heightProp, margin, verticalAlign, yDomain, yDomains]);

  useEffect(() => {
    dispatchScale({
      type: SET_X_SCALE,
      xDomain,
      xDomains,
      width: widthProp,
      margin,
      mode,
    });
  }, [margin, widthProp, xDomain, xDomains, mode]);

  const handelBrushEnd = useCallback(
    (brushData) => {
      const propagateEvent = () => {
        const { startX, endX } = brushData;
        const startXPPM = scaleState.scaleX().invert(startX);
        const endXPPM = scaleState.scaleX().invert(endX);
        Events.emit('brushEnd', {
          ...brushData,
          range: [startXPPM, endXPPM],
        });
      };

      if (brushData.altKey) {
        switch (selectedTool) {
          case options.rangesPicking.id: {
            if (!general.disableMultipletAnalysis) {
              modal.show(
                <MultipletAnalysisModal
                  data={data}
                  activeSpectrum={activeSpectrum}
                  scaleX={scaleState.scaleX}
                  {...brushData}
                />,
                {
                  onClose: () => {
                    modal.close();
                  },
                },
              );
            }
            break;
          }
          default:
            break;
        }
      } else if (brushData.shiftKey) {
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
          case options.multipleSpectraAnalysis.id:
            dispatch({
              type: ANALYZE_SPECTRA,
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
            propagateEvent(brushData);

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
            if (selectedTool != null) {
              dispatch({ type: BRUSH_END, ...brushData });
            }
            break;
        }
      }
    },
    [scaleState, selectedTool, general, modal, data, activeSpectrum, dispatch],
  );

  const handelOnDoubleClick = useCallback(() => {
    dispatch({ type: FULL_ZOOM_OUT, zoomType: ZoomType.STEP_HROZENTAL });
  }, [dispatch]);

  const handleZoom = useCallback(
    (event) => {
      switch (selectedTool) {
        case options.integral.id:
          dispatch({ type: CHANGE_INTEGRAL_ZOOM, ...event });
          break;

        default:
          dispatch({ type: SET_ZOOM_FACTOR, ...event });

          return;
      }
    },
    [dispatch, selectedTool],
  );

  const mouseClick = useCallback(
    (position) => {
      const propagateEvent = () => {
        const xPPM = scaleState.scaleX().invert(position.x);
        Events.emit('mouseClick', {
          ...position,
          xPPM,
        });
      };

      if (position.shiftKey) {
        switch (selectedTool) {
          case options.peakPicking.id:
            dispatch({
              type: ADD_PEAK,
              mouseCoordinates: position,
            });
            break;
          default:
            break;
        }
      } else {
        switch (selectedTool) {
          case options.phaseCorrection.id:
            dispatch({
              type: SET_VERTICAL_INDICATOR_X_POSITION,
              position: position.x,
            });
            break;
          case 'editRange':
            if (position.shiftKey) {
              propagateEvent();
            }
            break;

          default:
        }
      }
    },
    [dispatch, scaleState, selectedTool],
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
              <SpectraTracker />
              <CrossLinePointer />
              <BrushXY brushType={BRUSH_TYPE.X} />
              <XLabelPointer />
              <PeakPointer />
              <VerticalIndicator />
              <FooterBanner />
              <Chart1D
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

  return <ScaleProvider value={scaleState}>{sizedNMRChart}</ScaleProvider>;
};

export default Viewer1D;
