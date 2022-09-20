import { xGetFromToIndex } from 'ml-spectra-processing';
import { useCallback, useEffect, useReducer, ReactNode } from 'react';
import { ResponsiveChart } from 'react-d3-utils';

import { MAX_LENGTH } from '../../data/data1d/Spectrum1D/ranges/detectSignal';
import { Datum1D } from '../../data/types/data1d';
import { ViewerResponsiveWrapper } from '../2d/Viewer2D';
import { BrushTracker } from '../EventsTrackers/BrushTracker';
import { MouseTracker } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { ScaleProvider } from '../context/ScaleContext';
import { useAlert } from '../elements/popup/Alert';
import { useModal } from '../elements/popup/Modal';
import Spinner from '../loader/Spinner';
import MultipletAnalysisModal from '../modal/MultipletAnalysisModal';
import { useActiveSpectrum } from '../reducer/Reducer';
import { ZoomType } from '../reducer/helper/Zoom1DManager';
import getRange from '../reducer/helper/getRange';
import scaleReducer, {
  scaleInitialState,
  SET_SCALE,
} from '../reducer/scaleReducer';
import {
  ADD_INTEGRAL,
  ADD_PEAKS,
  ADD_BASE_LINE_ZONE,
  BRUSH_END,
  FULL_ZOOM_OUT,
  SET_ZOOM,
  ADD_PEAK,
  SET_VERTICAL_INDICATOR_X_POSITION,
  ADD_RANGE,
  ANALYZE_SPECTRA,
  ADD_EXCLUSION_ZONE,
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

interface Viewer1DProps {
  emptyText?: ReactNode;
}

function Viewer1D({ emptyText = undefined }: Viewer1DProps) {
  const state = useChartData();

  const {
    toolOptions: { selectedTool },
    isLoading,
    data,
    mode,
    width: widthProp,
    height: heightProp,
    margin,
    xDomain,
    xDomains,
    yDomain,
    yDomains,
    verticalAlign,
    displayerKey,
  } = state;

  const activeSpectrum = useActiveSpectrum();
  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();

  const [scaleState, dispatchScale] = useReducer(
    scaleReducer,
    scaleInitialState,
  );

  useEffect(() => {
    if (xDomain.length > 0 && yDomain.length > 0 && widthProp && heightProp) {
      dispatchScale({
        type: SET_SCALE,
        payload: {
          yDomain,
          yDomains,
          xDomain,
          xDomains,
          margin,
          height: heightProp,
          width: widthProp,
          verticalAlign,
          mode,
        },
      });
    }
  }, [
    heightProp,
    margin,
    mode,
    verticalAlign,
    widthProp,
    xDomain,
    xDomains,
    yDomain,
    yDomains,
  ]);

  const handelBrushEnd = useCallback(
    (brushData) => {
      const propagateEvent = () => {
        if (!scaleState.scaleX || !scaleState.scaleY) return;

        const { startX, endX } = brushData;
        const startXPPM = scaleState.scaleX().invert(startX);
        const endXPPM = scaleState.scaleX().invert(endX);
        Events.emit('brushEnd', {
          ...brushData,
          range: [startXPPM, endXPPM].sort((a, b) => a - b),
        });
      };

      if (brushData.altKey) {
        switch (selectedTool) {
          case options.rangePicking.id: {
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
          case options.rangePicking.id: {
            const [from, to] = getRange(state, {
              startX: brushData.startX,
              endX: brushData.endX,
            });

            if (!activeSpectrum) break;

            const {
              data: { x },
            } = state.data[activeSpectrum.index] as Datum1D;

            const { fromIndex, toIndex } = xGetFromToIndex(x, { from, to });

            if (toIndex - fromIndex <= MAX_LENGTH) {
              dispatch({
                type: ADD_RANGE,
                payload: {
                  ...brushData,
                },
              });
            } else {
              alert.error(
                `Advanced peak picking only available for area up to ${MAX_LENGTH} points`,
              );
            }

            break;
          }
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

          case options.baselineCorrection.id:
            dispatch({
              type: ADD_BASE_LINE_ZONE,
              zone: { from: brushData.startX, to: brushData.endX },
            });
            break;

          case options.exclusionZones.id:
            dispatch({
              type: ADD_EXCLUSION_ZONE,
              payload: { from: brushData.startX, to: brushData.endX },
            });
            break;

          default:
            propagateEvent();
            break;
        }
      } else {
        switch (selectedTool) {
          default:
            if (selectedTool != null) {
              dispatch({ type: BRUSH_END, ...brushData });
            }
            break;
        }
      }
    },
    [
      scaleState,
      selectedTool,
      modal,
      data,
      activeSpectrum,
      dispatch,
      state,
      alert,
    ],
  );

  const handelOnDoubleClick = useCallback(() => {
    dispatch({ type: FULL_ZOOM_OUT, zoomType: ZoomType.STEP_HORIZONTAL });
  }, [dispatch]);

  const handleZoom = useCallback(
    (event) => {
      dispatch({ type: SET_ZOOM, event, selectedTool });
    },
    [dispatch, selectedTool],
  );

  const mouseClick = useCallback(
    (position) => {
      const propagateEvent = () => {
        if (!scaleState.scaleX) return;

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
          case options.editRange.id:
            propagateEvent();
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

          default:
        }
      }
    },
    [dispatch, scaleState, selectedTool],
  );

  return (
    <ScaleProvider value={scaleState}>
      <ResponsiveChart>
        {({ height, width }) => (
          <ViewerResponsiveWrapper height={height} width={width}>
            <div style={{ height: '100%', position: 'relative' }}>
              <Spinner isLoading={isLoading} emptyText={emptyText} />

              {scaleState.scaleX &&
                scaleState.scaleY &&
                data &&
                data.length > 0 && (
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
                      style={{
                        width: '100%',
                        height: `100%`,
                        position: 'absolute',
                      }}
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
                        displayerKey={displayerKey}
                      />
                    </MouseTracker>
                  </BrushTracker>
                )}
            </div>
          </ViewerResponsiveWrapper>
        )}
      </ResponsiveChart>
    </ScaleProvider>
  );
}

export default Viewer1D;
