import { useCallback, useRef, useState } from 'react';
import { useOnOff } from 'react-science/ui';

import {
  createRange,
  isSpectrum1D,
} from '../../data/data1d/Spectrum1D/index.js';
import { cutRange } from '../../data/data1d/Spectrum1D/ranges/createRange.js';
import type {
  BrushTrackerData,
  OnBrush,
  OnClick,
  OnZoom,
} from '../EventsTrackers/BrushTracker.js';
import { BrushTracker } from '../EventsTrackers/BrushTracker.js';
import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useMapKeyModifiers } from '../context/KeyModifierContext.js';
import { useLogger } from '../context/LoggerContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useScaleChecked } from '../context/ScaleContext.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import { usePanelPreferences } from '../hooks/usePanelPreferences.js';
import useSpectrum from '../hooks/useSpectrum.js';
import MultipletAnalysisModal from '../modal/MultipletAnalysisModal.js';
import { ZOOM_TYPES } from '../reducer/helper/Zoom1DManager.js';
import { sortRange } from '../reducer/helper/getRange.js';
import type { Tool } from '../toolbar/ToolTypes.js';
import { options } from '../toolbar/ToolTypes.js';
import Events from '../utility/Events.js';

import { useInsetOptions } from './inset/InsetProvider.js';

function usePixelToPPMConverter() {
  const { scaleX, scaleY } = useScaleChecked();

  return useCallback(
    (
      brushData: Pick<BrushTrackerData, 'startX' | 'endX' | 'startY' | 'endY'>,
    ) => {
      const startX = scaleX().invert(brushData.startX);
      const endX = scaleX().invert(brushData.endX);
      const startY = scaleY().invert(brushData.startY);
      const endY = scaleY().invert(brushData.endY);
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

export function BrushTracker1D({ children }) {
  const state = useChartData();

  const {
    toolOptions: { selectedTool },

    view: {
      spectra: { activeTab },
    },
  } = state;
  const brushStartRef = useRef<number | null>(null);
  const spectrum = useSpectrum();
  const dispatch = useDispatch();
  const { dispatch: dispatchPreferences } = usePreferences();
  const { showBoxPlot, showStocsy } = usePanelPreferences(
    'matrixGeneration',
    activeTab,
  );
  const { logger } = useLogger();
  const scaleState = useScaleChecked();
  const convertToPPM = usePixelToPPMConverter();

  const { getModifiersKey, primaryKeyIdentifier } = useMapKeyModifiers();
  const activeSpectrum = useActiveSpectrum();
  const inset = useInsetOptions();

  const [isOpenAnalysisModal, openAnalysisModal, closeAnalysisModal] =
    useOnOff(false);

  const [brushData, setBrushData] = useState<BrushTrackerData | null>(null);

  function handleBrush(brushData) {
    const { mouseButton } = brushData;
    const brushDataInPPM = convertToPPM(brushData);

    if (mouseButton === 'secondary') {
      if (!brushStartRef.current) {
        brushStartRef.current = brushDataInPPM.startX;
      }

      const shiftX = brushDataInPPM.endX - brushStartRef.current;

      dispatch({ type: 'MOVE', payload: { shiftX, shiftY: 0 } });
    }
  }
  function handleInsetBrush(brushData) {
    const { mouseButton } = brushData;
    const brushDataInPPM = convertToPPM(brushData);

    if (mouseButton === 'secondary') {
      if (!brushStartRef.current) {
        brushStartRef.current = brushDataInPPM.startX;
      }
      const shiftX = brushDataInPPM.endX - brushStartRef.current;

      if (!inset) return;

      dispatch({
        type: 'MOVE_INSET',
        payload: { insetKey: inset.id, shiftX, shiftY: 0 },
      });
    }
  }

  const handleBrushEnd = useCallback<OnBrush>(
    (brushData) => {
      //reset the brush start
      brushStartRef.current = null;
      setBrushData(brushData);
      const brushDataInPPM = convertToPPM(brushData);

      const keyModifiers = getModifiersKey(brushData as unknown as MouseEvent);

      const selectRange = sortRange(brushDataInPPM.startX, brushDataInPPM.endX);

      if (brushData.mouseButton === 'main') {
        const propagateEvent = () => {
          Events.emit('brushEnd', {
            ...brushData,
            range: selectRange,
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
              case options.multipleSpectraAnalysis.id: {
                dispatchPreferences({
                  type: 'ANALYZE_SPECTRA',
                  payload: {
                    start: brushDataInPPM.startX,
                    end: brushDataInPPM.endX,
                    nucleus: activeTab,
                  },
                });
                break;
              }
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

              case options.inset.id:
                dispatch({
                  type: 'ADD_INSET',
                  payload: {
                    startX: brushData.startX,
                    endX: brushData.endX,
                  },
                });
                break;

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
            dispatch({ type: 'BRUSH_END', payload: brushDataInPPM });
          }

          propagateEvent();
        }
      }
    },
    [
      getModifiersKey,
      selectedTool,
      primaryKeyIdentifier,
      dispatch,
      spectrum,
      logger,
      dispatchPreferences,
      activeTab,
      openAnalysisModal,
      convertToPPM,
    ],
  );
  const handleInsetBrushEnd = useCallback<OnBrush>(
    (brushData) => {
      const brushDataInPPM = convertToPPM(brushData);

      //reset the brush start
      brushStartRef.current = null;

      if (!inset || brushData.mouseButton !== 'main') {
        return;
      }

      dispatch({
        type: 'BRUSH_END_INSET',
        payload: {
          insetKey: inset.id,
          startX: brushDataInPPM.startX,
          endX: brushDataInPPM.endX,
        },
      });
    },
    [convertToPPM, inset, dispatch],
  );

  const handleOnDoubleClick = useCallback(() => {
    dispatch({
      type: 'FULL_ZOOM_OUT',
      payload: { zoomType: ZOOM_TYPES.STEP_HORIZONTAL },
    });
  }, [dispatch]);

  const handleInsetOnDoubleClick = useCallback(() => {
    if (!inset) {
      return;
    }

    dispatch({
      type: 'FULL_INSET_ZOOM_OUT',
      payload: { zoomType: ZOOM_TYPES.STEP_HORIZONTAL, insetKey: inset.id },
    });
  }, [dispatch, inset]);

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
  const handleInsetZoom = useCallback<OnZoom>(
    (options) => {
      if (!inset) return;
      dispatch({
        type: 'SET_INSET_ZOOM',
        payload: { options, insetKey: inset.id },
      });
    },
    [dispatch, inset],
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

  if (inset) {
    return (
      <BrushTracker
        onBrush={handleInsetBrush}
        onBrushEnd={handleInsetBrushEnd}
        onDoubleClick={handleInsetOnDoubleClick}
        onZoom={handleInsetZoom}
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

  return (
    <>
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
      {brushData && (
        <MultipletAnalysisModal
          isOpen={isOpenAnalysisModal}
          onClose={closeAnalysisModal}
          activeSpectrum={activeSpectrum}
          {...brushData}
        />
      )}
    </>
  );
}
