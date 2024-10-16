import type { ReactNode } from 'react';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { useOnOff } from 'react-science/ui';

import {
  createRange,
  isSpectrum1D,
} from '../../data/data1d/Spectrum1D/index.js';
import { cutRange } from '../../data/data1d/Spectrum1D/ranges/createRange.js';
import BrushXY, { BRUSH_TYPE } from '../1d-2d/tools/BrushXY.js';
import CrossLinePointer from '../1d-2d/tools/CrossLinePointer.js';
import { ViewerResponsiveWrapper } from '../2d/Viewer2D.js';
import type {
  BrushTrackerContext,
  OnBrush,
  OnClick,
  OnZoom,
} from '../EventsTrackers/BrushTracker.js';
import { BrushTracker } from '../EventsTrackers/BrushTracker.js';
import { MouseTracker } from '../EventsTrackers/MouseTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useMapKeyModifiers } from '../context/KeyModifierContext.js';
import { useLogger } from '../context/LoggerContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { ScaleProvider } from '../context/ScaleContext.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import { usePanelPreferences } from '../hooks/usePanelPreferences.js';
import useSpectrum from '../hooks/useSpectrum.js';
import { useVerticalAlign } from '../hooks/useVerticalAlign.js';
import Spinner from '../loader/Spinner.js';
import MultipletAnalysisModal from '../modal/MultipletAnalysisModal.js';
import { ZOOM_TYPES } from '../reducer/helper/Zoom1DManager.js';
import getRange from '../reducer/helper/getRange.js';
import scaleReducer, {
  scaleInitialState,
  SET_SCALE,
} from '../reducer/scaleReducer.js';
import type { Tool } from '../toolbar/ToolTypes.js';
import { options } from '../toolbar/ToolTypes.js';
import Events from '../utility/Events.js';

import Chart1D from './Chart1D.js';
import FooterBanner from './FooterBanner.js';
import BaseLine from './tool/BaseLine.js';
import PeakPointer from './tool/PeakPointer.js';
import { PivotIndicator } from './tool/PivotIndicator.js';
import XLabelPointer from './tool/XLabelPointer.js';
import { getXScale } from './utilities/scale.js';

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
  const spectrum = useSpectrum();
  const dispatch = useDispatch();
  const { dispatch: dispatchPreferences } = usePreferences();
  const { showBoxPlot, showStocsy } = usePanelPreferences(
    'matrixGeneration',
    activeTab,
  );
  const { logger } = useLogger();

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

  function handleBrush(brushData) {
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

  const { getModifiersKey, primaryKeyIdentifier } = useMapKeyModifiers();

  const handleBrushEnd = useCallback<OnBrush>(
    (brushData) => {
      //reset the brush start
      brushStartRef.current = null;
      setBrushData(brushData);

      const keyModifiers = getModifiersKey(brushData as unknown as MouseEvent);

      const selectRange = getRange(state, {
        startX: brushData.startX,
        endX: brushData.endX,
      });

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

        let executeDefaultAction = false;

        switch (keyModifiers) {
          // when Alt key is active
          case primaryKeyIdentifier: {
            switch (selectedTool) {
              case options.integral.id:
                dispatch({
                  type: 'ADD_INTEGRAL',
                  payload: brushData,
                });
                break;
              case options.rangePicking.id: {
                if (!spectrum) break;

                if (isSpectrum1D(spectrum)) {
                  const [from, to] = selectRange;
                  const range = createRange(spectrum, {
                    from,
                    to,
                    logger,
                  });

                  if (!range) break;

                  dispatch({
                    type: 'ADD_RANGE',
                    payload: { range },
                  });
                }

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
                const [from, to] = selectRange;
                dispatchPreferences({
                  type: 'ADD_MATRIX_GENERATION_EXCLUSION_ZONE',
                  payload: {
                    zone: { from, to },
                    nucleus: activeTab,
                  },
                });

                break;
              }

              default:
                executeDefaultAction = true;
                break;
            }
            break;
          }
          case 'shift[false]_ctrl[false]_alt[true]': {
            switch (selectedTool) {
              case options.rangePicking.id: {
                openAnalysisModal();
                break;
              }
              default:
                executeDefaultAction = true;
                break;
            }
            break;
          }

          default: {
            executeDefaultAction = true;

            break;
          }
        }

        const tools = new Set<Tool>(['zoom', 'databaseRangesSelection']);
        const enableDefaultBrush =
          !tools.has(selectedTool) ||
          (tools.has(selectedTool) && !brushData.shiftKey);

        if (executeDefaultAction && selectedTool != null) {
          if (enableDefaultBrush) {
            dispatch({ type: 'BRUSH_END', payload: brushData });
          }

          propagateEvent();
        }
      }
    },
    [
      getModifiersKey,
      state,
      selectedTool,
      scaleState,
      primaryKeyIdentifier,
      dispatch,
      spectrum,
      logger,
      dispatchPreferences,
      activeTab,
      openAnalysisModal,
    ],
  );

  const handleOnDoubleClick = useCallback(() => {
    dispatch({
      type: 'FULL_ZOOM_OUT',
      payload: { zoomType: ZOOM_TYPES.STEP_HORIZONTAL },
    });
  }, [dispatch]);

  const handleZoom = useCallback<OnZoom>(
    (options) => {
      if (
        (showBoxPlot || showStocsy) &&
        options.altKey &&
        (selectedTool === 'zoom' ||
          selectedTool === 'matrixGenerationExclusionZones')
      ) {
        //change the matrix generation vertical scale
        dispatchPreferences({
          type: 'CHANGE_MATRIX_GENERATION_SCALE',
          payload: { nucleus: activeTab, zoomOptions: options },
        });
      } else {
        dispatch({ type: 'SET_ZOOM', payload: { options } });
      }
    },
    [
      activeTab,
      dispatch,
      dispatchPreferences,
      selectedTool,
      showBoxPlot,
      showStocsy,
    ],
  );

  const mouseClick = useCallback<OnClick>(
    (event) => {
      if (!scaleState.scaleX) return;

      const xPPM = scaleState.scaleX().invert(event.x);

      Events.emit('mouseClick', {
        ...event,
        xPPM,
      });

      const keyModifiers = getModifiersKey(event as unknown as MouseEvent);

      switch (keyModifiers) {
        case primaryKeyIdentifier: {
          switch (selectedTool) {
            case 'peakPicking':
              dispatch({
                type: 'ADD_PEAK',
                payload: event,
              });
              break;

            case 'integral':
              dispatch({
                type: 'CUT_INTEGRAL',
                payload: { cutValue: xPPM },
              });
              break;
            case 'rangePicking': {
              if (!spectrum) break;

              if (isSpectrum1D(spectrum)) {
                const cutRanges = cutRange(spectrum, xPPM);

                dispatch({
                  type: 'CUT_RANGE',
                  payload: { ranges: cutRanges },
                });
              }
              break;
            }
            case 'phaseCorrection':
              dispatch({
                type: 'SET_ONE_DIMENSION_PIVOT_POINT',
                payload: {
                  value: event.x,
                },
              });

              break;
            case 'zoom':
            case 'matrixGenerationExclusionZones':
              if (!showStocsy || !event.shiftKey) break;

              dispatchPreferences({
                type: 'CHANGE_MATRIX_GENERATION_STOCSY_CHEMICAL_SHIFT',
                payload: { nucleus: activeTab, chemicalShift: xPPM },
              });

              break;
            default:
              break;
          }
          break;
        }
        default:
          break;
      }
    },
    [
      activeTab,
      dispatch,
      dispatchPreferences,
      getModifiersKey,
      primaryKeyIdentifier,
      scaleState,
      selectedTool,
      showStocsy,
      spectrum,
    ],
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
                      <FooterBanner />
                      <Chart1D
                        width={widthProp}
                        height={heightProp}
                        margin={margin}
                        mode={mode}
                        displayerKey={displayerKey}
                      />
                      <BaseLine />
                      <PivotIndicator />
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
