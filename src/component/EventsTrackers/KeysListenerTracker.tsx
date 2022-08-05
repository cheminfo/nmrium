import { useCallback, useEffect, useMemo } from 'react';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import { useAssignmentData } from '../assignment/AssignmentsContext';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import { useAlert } from '../elements/popup/Alert';
import { useModal } from '../elements/popup/Modal';
import { HighlightedSource, useHighlightData } from '../highlight/index';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';
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
  DELETE_ANALYZE_SPECTRA_RANGE,
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
  const modal = useModal();
  const openLoader = useLoader();

  const {
    handleChangeOption,
    handleFullZoomOut,
    alignSpectrumsVerticallyHandler,
    changeDisplayViewModeHandler,
  } = useToolsFunctions();

  const { saveToClipboardHandler, saveAsJSONHandler, saveAsHandler } =
    useExport();
  const isToolVisible = useCheckToolsVisibility();

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
          const buttons = [
            {
              text: 'Yes, for all spectra',
              handler: async () => {
                const hideLoading = await alert.showLoading(
                  'Delete all spectra exclusive zones in progress',
                );
                const { zone } = sourceData.extra;
                dispatch({
                  type: DELETE_EXCLUSION_ZONE,
                  payload: {
                    zone,
                  },
                });
                hideLoading();
              },
            },
            {
              text: 'Yes',
              handler: async () => {
                const hideLoading = await alert.showLoading(
                  'Delete exclusive zone in progress',
                );
                const { spectrumID, zone } = sourceData.extra;
                dispatch({
                  type: DELETE_EXCLUSION_ZONE,
                  payload: {
                    zone,
                    spectrumID,
                  },
                });
                hideLoading();
              },
            },
            { text: 'No' },
          ];

          modal.showConfirmDialog({
            message: 'Are you sure you want to delete the exclusion zone/s?',
            buttons,
          });

          break;
        }
        case HighlightedSource.MULTIPLE_ANALYSIS_ZONE: {
          dispatch({
            type: DELETE_ANALYZE_SPECTRA_RANGE,
            colKey: sourceData.extra.colKey,
          });
          // remove keys from the highlighted list after delete
          remove();

          break;
        }

        default:
          break;
      }
    },
    [dispatch, remove, assignmentData, modal, alert],
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
        } else if (!checkModifierKeyActivated(e)) {
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
              if (isToolVisible('zoomOutTool')) {
                handleFullZoomOut();
              }
              break;
            case 'z':
            case 'Escape':
              if (isToolVisible('zoomTool')) {
                handleChangeOption(options.zoom.id);
              }
              break;
            case 'r': {
              if (displayerMode === DISPLAYER_MODE.DM_2D) {
                if (isToolVisible('zonePickingTool')) {
                  check2DModeWithActiveSpectrum(options.zone2D.label, false);
                  handleChangeOption(options.zone2D.id);
                }
              } else if (isToolVisible('rangePickingTool')) {
                check1DModeWithActiveSpectrum(
                  options.rangesPicking.label,
                  false,
                );
                handleChangeOption(options.rangesPicking.id);
              }

              break;
            }
            case 'a': {
              if (isToolVisible('phaseCorrectionTool')) {
                check1DModeWithActiveSpectrum(options.phaseCorrection.label);
                handleChangeOption(options.phaseCorrection.id);
              }

              break;
            }
            case 'b': {
              if (isToolVisible('baselineCorrectionTool')) {
                check1DModeWithActiveSpectrum(options.baselineCorrection.label);
                handleChangeOption(options.baselineCorrection.id);
              }

              break;
            }
            case 'p': {
              if (isToolVisible('peakTool')) {
                check1DModeWithActiveSpectrum(options.peakPicking.label);
                handleChangeOption(options.peakPicking.id);
              }

              break;
            }
            case 'i': {
              if (isToolVisible('integralTool')) {
                check1DModeWithActiveSpectrum(options.integral.label);
                handleChangeOption(options.integral.id);
              }

              break;
            }
            case 'e': {
              if (isToolVisible('exclusionZonesTool')) {
                check1DModeWithActiveSpectrum(options.exclusionZones.label);
                handleChangeOption(options.exclusionZones.id);
              }

              break;
            }
            default:
          }
        }

        if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
          switch (e.key) {
            case 'c': {
              if (allow1DTool && isToolVisible('spectraCenterAlignments')) {
                alignSpectrumsVerticallyHandler();
              }
              break;
            }
            case 's': {
              if (allow1DTool && isToolVisible('spectraStackAlignments')) {
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
              if (isToolVisible('exportAs')) {
                void saveAsJSONHandler();
                e.preventDefault();
              }
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
      isToolVisible,
      openLoader,
      saveAsHandler,
      saveAsJSONHandler,
      saveToClipboardHandler,
    ],
  );

  function checkNotInputField(e: Event) {
    const tags = ['input', 'textarea'];
    const tagName = (e.composedPath()[0] as HTMLElement).tagName.toLowerCase();
    if (!tags.includes(tagName)) return true;

    return false;
  }

  const handleOnKeyDown = useCallback(
    (e) => {
      if (checkNotInputField(e) && overDisplayer) {
        const num = Number(e.code.substr(e.code.length - 1)) || 0;
        if (num > 0) {
          keysPreferencesListenerHandler(e, num);
        } else if (
          ['Delete', 'Backspace'].includes(e.key) &&
          highlight.sourceData
        ) {
          e.preventDefault();
          void deleteHandler(highlight.sourceData);
        } else {
          toolsListenerHandler(e);
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
    document.addEventListener('keydown', handleOnKeyDown);

    return () => document.removeEventListener('keydown', handleOnKeyDown);
  }, [handleOnKeyDown]);

  return null;
}

export default KeysListenerTracker;
