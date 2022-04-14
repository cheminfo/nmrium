import { useCallback, useEffect, useMemo } from 'react';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import { useAssignmentData } from '../assignment/AssignmentsContext';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import { useAlert } from '../elements/popup/Alert';
import { HighlightedSource, useHighlightData } from '../highlight/index';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import {
  SET_KEY_PREFERENCES,
  APPLY_KEY_PREFERENCES,
  DELETE_INTEGRAL,
  DELETE_PEAK_NOTATION,
  DELETE_RANGE,
  DELETE_2D_ZONE,
  DELETE_EXCLUSION_ZONE,
} from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';

function KeysListenerTracker() {
  const {
    keysPreferences,
    displayerMode,
    overDisplayer,
    data,
    activeSpectrum,
  } = useChartData();
  const dispatch = useDispatch();
  const alert = useAlert();
  const openLoader = useLoader();

  const {
    handleChangeOption,
    handleFullZoomOut,
    alignSpectrumsVerticallyHandler,
    changeDisplayViewModeHandler,
  } = useToolsFunctions();

  const { saveToClipboardHandler, saveAsJSONHandler, saveAsHandler } =
    useExport();

  const { highlight, remove } = useHighlightData();

  const assignmentData = useAssignmentData();
  const allow1DTool = useMemo(() => {
    return displayerMode === DISPLAYER_MODE.DM_1D && data && data.length > 0;
  }, [data, displayerMode]);

  const deleteHandler = useCallback(
    async (sourceData) => {
      const {
        type,
        extra: { id },
      } = sourceData;

      switch (type) {
        case HighlightedSource.INTEGRAL: {
          dispatch({
            type: DELETE_INTEGRAL,
            integralID: id,
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }
        case HighlightedSource.PEAK: {
          dispatch({
            type: DELETE_PEAK_NOTATION,
            data: { id },
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }
        case HighlightedSource.RANGE: {
          dispatch({
            type: DELETE_RANGE,
            payload: {
              data: {
                id,
                assignmentData,
              },
            },
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }
        case HighlightedSource.ZONE: {
          dispatch({
            type: DELETE_2D_ZONE,
            payload: {
              id,
              assignmentData,
            },
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }
        case HighlightedSource.EXCLUSION_ZONE: {
          const hideLoading = await alert.showLoading(
            `Exclusion filter in progress`,
          );
          dispatch({
            type: DELETE_EXCLUSION_ZONE,
            payload: {
              id,
              spectrumID: sourceData.extra.spectrumID,
            },
          });
          hideLoading();
          // remove keys from the highlighted list after delete
          remove();

          break;
        }

        default:
          break;
      }
    },
    [assignmentData, dispatch, remove, alert],
  );

  const keysPreferencesListenerHandler = useCallback(
    (e, num) => {
      if (data && data.length > 0 && num >= 1 && num <= 9) {
        if (e.shiftKey) {
          dispatch({
            type: SET_KEY_PREFERENCES,
            keyCode: num,
          });
          alert.show(`Configuration Reset, press '${num}' again to reload it.`);
        } else {
          if (!checkModifierKeyActivated(e)) {
            if (keysPreferences?.[num]) {
              dispatch({
                type: APPLY_KEY_PREFERENCES,
                keyCode: num,
              });
            } else {
              dispatch({
                type: SET_KEY_PREFERENCES,
                keyCode: num,
              });
              alert.show(
                `Configuration saved, press '${num}' again to reload it.`,
              );
            }
          }
        }
      }
    },
    [alert, data, dispatch, keysPreferences],
  );

  const toolsListenerHandler = useCallback(
    (e) => {
      function check1DModeWithActiveSpectrum(
        label: string,
        checkSwitch = true,
      ) {
        if (displayerMode === DISPLAYER_MODE.DM_1D && !activeSpectrum) {
          throw new Error(`Select a spectrum to proceed with ${label}`);
        } else if (checkSwitch && displayerMode === DISPLAYER_MODE.DM_2D) {
          throw new Error(
            `Switch to 1D Mode and select a spectrum to proceed with ${label}`,
          );
        }
      }
      function check2DModeWithActiveSpectrum(
        label: string,
        checkSwitch = true,
      ) {
        if (displayerMode === DISPLAYER_MODE.DM_2D && !activeSpectrum) {
          throw new Error(`Select a spectrum to proceed with ${label}`);
        } else if (checkSwitch && displayerMode === DISPLAYER_MODE.DM_1D) {
          throw new Error(
            `Switch to 2D Mode and select a spectrum to proceed with ${label}`,
          );
        }
      }

      try {
        if (!e.shiftKey && !e.metaKey) {
          switch (e.key) {
            case 'f':
              handleFullZoomOut();
              break;
            case 'z':
            case 'Escape':
              handleChangeOption(options.zoom.id);
              break;
            case 'r': {
              if (displayerMode === DISPLAYER_MODE.DM_2D) {
                check2DModeWithActiveSpectrum(options.zone2D.label, false);
                handleChangeOption(options.zone2D.id);
              } else {
                check1DModeWithActiveSpectrum(
                  options.rangesPicking.label,
                  false,
                );
                handleChangeOption(options.rangesPicking.id);
              }
              break;
            }
            case 'a': {
              check1DModeWithActiveSpectrum(options.phaseCorrection.label);
              handleChangeOption(options.phaseCorrection.id);

              break;
            }
            case 'b': {
              check1DModeWithActiveSpectrum(options.baseLineCorrection.label);
              handleChangeOption(options.baseLineCorrection.id);

              break;
            }
            case 'p': {
              check1DModeWithActiveSpectrum(options.peakPicking.label);
              handleChangeOption(options.peakPicking.id);

              break;
            }
            case 'i': {
              check1DModeWithActiveSpectrum(options.integral.label);
              handleChangeOption(options.integral.id);

              break;
            }
            case 'e': {
              check1DModeWithActiveSpectrum(options.exclusionZones.label);
              handleChangeOption(options.exclusionZones.id);

              break;
            }
            default:
          }
        }

        if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
          switch (e.key) {
            case 'c': {
              if (allow1DTool) {
                alignSpectrumsVerticallyHandler();
              }
              break;
            }
            case 's': {
              if (allow1DTool) {
                changeDisplayViewModeHandler();
              }
              break;
            }
            default:
          }
        }

        if (!e.shiftKey && (e.metaKey || e.ctrlKey)) {
          switch (e.key) {
            case 'c':
              void saveToClipboardHandler();
              e.preventDefault();
              break;
            case 's':
              void saveAsJSONHandler();
              e.preventDefault();
              break;
            case 'o':
              openLoader();
              e.preventDefault();
              break;
            default:
          }
        }
        if (e.shiftKey && (e.metaKey || e.ctrlKey)) {
          switch (e.key) {
            case 's':
            case 'S':
              void saveAsHandler();
              e.preventDefault();
              break;
            default:
          }
        }
      } catch (e: any) {
        alert.error(e.message);
      }
    },
    [
      activeSpectrum,
      alert,
      alignSpectrumsVerticallyHandler,
      allow1DTool,
      changeDisplayViewModeHandler,
      displayerMode,
      handleChangeOption,
      handleFullZoomOut,
      openLoader,
      saveAsHandler,
      saveAsJSONHandler,
      saveToClipboardHandler,
    ],
  );
  const handleOnKeyDown = useCallback(
    (e) => {
      if (
        !['input', 'textarea'].includes(e.target.localName) &&
        overDisplayer
      ) {
        const num = Number(e.code.substr(e.code.length - 1)) || 0;
        if (num > 0) {
          keysPreferencesListenerHandler(e, num);
        } else {
          if (['Delete', 'Backspace'].includes(e.key) && highlight.sourceData) {
            e.preventDefault();
            void deleteHandler(highlight.sourceData);
          } else {
            toolsListenerHandler(e);
          }
        }
      }
    },
    [
      deleteHandler,
      highlight,
      keysPreferencesListenerHandler,
      overDisplayer,
      toolsListenerHandler,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyDown, true);

    return () => document.removeEventListener('keydown', handleOnKeyDown, true);
  }, [handleOnKeyDown]);

  return null;
}

export default KeysListenerTracker;
