import {
  useCallback,
  useEffect,
  useReducer,
  ReactNode,
  useRef,
  useState,
} from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { useOnOff } from 'react-science/ui';

import BrushXY, { BRUSH_TYPE } from '../1d-2d/tools/BrushXY';
import CrossLinePointer from '../1d-2d/tools/CrossLinePointer';
import { ViewerResponsiveWrapper } from '../2d/Viewer2D';
import {
  BrushTracker,
  BrushTrackerContext,
  OnBrush,
  OnClick,
  OnZoom,
} from '../EventsTrackers/BrushTracker';
import { MouseTracker } from '../EventsTrackers/MouseTracker';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { usePreferences } from '../context/PreferencesContext';
import { ScaleProvider } from '../context/ScaleContext';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum';
import { useVerticalAlign } from '../hooks/useVerticalAlign';
import Spinner from '../loader/Spinner';
import MultipletAnalysisModal from '../modal/MultipletAnalysisModal';
import { ZOOM_TYPES } from '../reducer/helper/Zoom1DManager';
import getRange from '../reducer/helper/getRange';
import scaleReducer, {
  scaleInitialState,
  SET_SCALE,
} from '../reducer/scaleReducer';
import { options } from '../toolbar/ToolTypes';
import Events from '../utility/Events';

import Chart1D from './Chart1D';
import FooterBanner from './FooterBanner';
import PeakPointer from './tool/PeakPointer';
import VerticalIndicator from './tool/VerticalIndicator';
import XLabelPointer from './tool/XLabelPointer';
import { getXScale } from './utilities/scale';

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
    displayerKey,
    view: {
      spectra: { activeTab },
    },
  } = state;
  const brushStartRef = useRef<number | null>(null);
  const verticalAlign = useVerticalAlign();
  const activeSpectrum = useActiveSpectrum();
  const dispatch = useDispatch();
  const { dispatch: dispatchPreferences } = usePreferences();

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
    verticalAlign,
    heightProp,
    margin,
    mode,
    widthProp,
    xDomain,
    xDomains,
    yDomain,
    yDomains,
  ]);

  function handelBrush(brushData) {
    const { startX: startXInPixel, endX: endXInPixel, mouseButton } = brushData;

    if (mouseButton === 'secondary') {
      const scaleX = getXScale(state);
      if (!brushStartRef.current) {
        brushStartRef.current = scaleX.invert(startXInPixel);
      }
      const shiftX = scaleX.invert(endXInPixel) - brushStartRef.current;

      dispatch({ type: 'MOVE', payload: { shiftX, shiftY: 0 } });
    }
  }

  const [isOpenAnalysisModal, openAnalysisModal, closeAnalysisModal] =
    useOnOff(false);

  const [brushData, setBrushData] = useState<BrushTrackerContext | null>(null);

  const handelBrushEnd = useCallback<OnBrush>(
    (brushData) => {
      //reset the brush start
      brushStartRef.current = null;
      setBrushData(brushData);

      if (brushData.mouseButton === 'main') {
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
              openAnalysisModal();
              break;
            }
            default:
              break;
          }
        } else if (brushData.shiftKey) {
          switch (selectedTool) {
            case options.integral.id:
              dispatch({
                type: 'ADD_INTEGRAL',
                payload: brushData,
              });
              break;
            case options.rangePicking.id: {
              if (!activeSpectrum) break;

              dispatch({
                type: 'ADD_RANGE',
                payload: brushData,
              });

              break;
            }
            case options.multipleSpectraAnalysis.id:
              if (scaleState.scaleX) {
                const { startX, endX } = brushData;
                const start = scaleState.scaleX().invert(startX);
                const end = scaleState.scaleX().invert(endX);
                dispatchPreferences({
                  type: 'ANALYZE_SPECTRA',
                  payload: {
                    start,
                    end,
                    nucleus: activeTab,
                  },
                });
              }
              break;

            case options.peakPicking.id:
              dispatch({
                type: 'ADD_PEAKS',
                payload: brushData,
              });
              break;

            case options.baselineCorrection.id:
              dispatch({
                type: 'ADD_BASE_LINE_ZONE',
                payload: {
                  startX: brushData.startX,
                  endX: brushData.endX,
                },
              });
              break;

            case options.exclusionZones.id:
              dispatch({
                type: 'ADD_EXCLUSION_ZONE',
                payload: { startX: brushData.startX, endX: brushData.endX },
              });
              break;
            case options.matrixGenerationExclusionZones.id: {
              const [from, to] = getRange(state, {
                startX: brushData.startX,
                endX: brushData.endX,
              });
              dispatchPreferences({
                type: 'ADD_MATRIX_GENERATION_EXCLUSION_ZONE',
                payload: {
                  zone: { from, to },
                  nucleus: activeTab,
                  range: { from: xDomain[0], to: xDomain[1] },
                },
              });

              break;
            }

            default:
              propagateEvent();
              break;
          }
        } else {
          switch (selectedTool) {
            default:
              if (selectedTool != null) {
                dispatch({ type: 'BRUSH_END', payload: brushData });
              }
              break;
          }
        }
      }
    },
    [
      scaleState,
      selectedTool,
      openAnalysisModal,
      activeSpectrum,
      dispatch,
      dispatchPreferences,
      activeTab,
      xDomain,
      state,
    ],
  );

  const handelOnDoubleClick = useCallback(() => {
    dispatch({
      type: 'FULL_ZOOM_OUT',
      payload: { zoomType: ZOOM_TYPES.STEP_HORIZONTAL },
    });
  }, [dispatch]);

  const handleZoom = useCallback<OnZoom>(
    (event) => {
      dispatch({ type: 'SET_ZOOM', payload: { event } });
    },
    [dispatch],
  );

  const mouseClick = useCallback<OnClick>(
    (event) => {
      if (!scaleState.scaleX) return;

      const xPPM = scaleState.scaleX().invert(event.x);

      const propagateEvent = () => {
        Events.emit('mouseClick', {
          ...event,
          xPPM,
        });
      };

      if (event.shiftKey) {
        switch (selectedTool) {
          case options.peakPicking.id:
            dispatch({
              type: 'ADD_PEAK',
              payload: event,
            });
            break;
          case options.editRange.id:
            propagateEvent();
            break;
          case options.integral.id:
            dispatch({
              type: 'CUT_INTEGRAL',
              payload: { cutValue: xPPM },
            });
            break;
          case options.rangePicking.id:
            dispatch({
              type: 'CUT_RANGE',
              payload: { cutValue: xPPM },
            });
            break;

          case options.phaseCorrection.id:
            dispatch({
              type: 'SET_ONE_DIMENSION_PIVOT_POINT',
              payload: {
                value: event.x,
              },
            });

            break;
          default:
            break;
        }
      } else {
        switch (selectedTool) {
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
                      style={{
                        width: '100%',
                        height: `100%`,
                        position: 'absolute',
                      }}
                    >
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
      {brushData && (
        <MultipletAnalysisModal
          isOpen={isOpenAnalysisModal}
          onClose={closeAnalysisModal}
          data={data}
          activeSpectrum={activeSpectrum}
          scaleX={scaleState.scaleX}
          {...brushData}
        />
      )}
    </ScaleProvider>
  );
}

export default Viewer1D;
