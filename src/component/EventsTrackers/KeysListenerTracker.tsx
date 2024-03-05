import { RefObject, useCallback, useEffect, useMemo, useRef } from 'react';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import { useAssignmentData } from '../assignment/AssignmentsContext';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import { usePreferences } from '../context/PreferencesContext';
import { useAlert } from '../elements/popup/Alert';
import { useModal } from '../elements/popup/Modal';
import { HighlightEventSource, useHighlightData } from '../highlight/index';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import { options } from '../toolbar/ToolTypes';

interface KeysListenerTrackerProps {
  mainDivRef: RefObject<HTMLDivElement>;
}

function KeysListenerTracker(props: KeysListenerTrackerProps) {
  const { mainDivRef } = props;

  const {
    keysPreferences,
    displayerMode,
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const dispatch = useDispatch();
  const { dispatch: dispatchPreferences } = usePreferences();
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

  const mouseIsOverDisplayer = useRef(false);
  useEffect(() => {
    const div = mainDivRef.current;
    if (!div) {
      return;
    }
    function mouseEnterHandler() {
      mouseIsOverDisplayer.current = true;
    }
    function mouseLeaveHandler() {
      mouseIsOverDisplayer.current = false;
    }
    div.addEventListener('mouseenter', mouseEnterHandler);
    div.addEventListener('mouseleave', mouseLeaveHandler);
    return () => {
      div.removeEventListener('mouseenter', mouseEnterHandler);
      div.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }, [mainDivRef]);

  const assignmentData = useAssignmentData();
  const allow1DTool = useMemo(() => {
    return displayerMode === '1D' && data && data.length > 0;
  }, [data, displayerMode]);

  const deleteHandler = useCallback(
    async (sourceData) => {
      const { type, extra } = sourceData;
      switch (type) {
        case HighlightEventSource.INTEGRAL: {
          const { id } = extra || {};
          if (id) {
            dispatch({
              type: 'DELETE_INTEGRAL',
              payload: {
                id,
              },
            });
            // remove keys from the highlighted list after delete
            remove();
          }
          break;
        }
        case HighlightEventSource.PEAK: {
          const { id } = extra || {};
          if (id) {
            dispatch({
              type: 'DELETE_PEAK',
              payload: {
                id,
              },
            });
            // remove keys from the highlighted list after delete
            remove();
          }

          break;
        }
        case HighlightEventSource.RANGE_PEAK: {
          const { id } = extra || {};
          if (id) {
            dispatch({
              type: 'DELETE_RANGE_PEAK',
              payload: {
                id,
              },
            });
            // remove keys from the highlighted list after delete
            remove();
          }

          break;
        }
        case HighlightEventSource.RANGE: {
          const { id } = extra || {};
          if (id) {
            dispatch({
              type: 'DELETE_RANGE',
              payload: {
                id,
                assignmentData,
              },
            });
            // remove keys from the highlighted list after delete
            remove();
          }
          break;
        }
        case HighlightEventSource.ZONE: {
          const { id } = extra || {};
          if (id) {
            dispatch({
              type: 'DELETE_2D_ZONE',
              payload: {
                id,
                assignmentData,
              },
            });
            // remove keys from the highlighted list after delete
            remove();
          }
          break;
        }
        case HighlightEventSource.EXCLUSION_ZONE: {
          const { zone, spectrumID } = extra || {};

          const buttons = [
            {
              text: 'Yes, for all spectra',
              handler: async () => {
                if (zone) {
                  const hideLoading = await alert.showLoading(
                    'Delete all spectra exclusion zones in progress',
                  );
                  dispatch({
                    type: 'DELETE_EXCLUSION_ZONE',
                    payload: {
                      zone,
                    },
                  });
                  hideLoading();
                }
              },
            },
            {
              text: 'Yes',
              handler: async () => {
                if (spectrumID) {
                  const hideLoading = await alert.showLoading(
                    'Delete exclusion zones in progress',
                  );
                  dispatch({
                    type: 'DELETE_EXCLUSION_ZONE',
                    payload: {
                      zone,
                      spectrumId: spectrumID,
                    },
                  });
                  hideLoading();
                }
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
        case HighlightEventSource.MATRIX_GENERATION_EXCLUSION_ZONE: {
          const { zone } = extra || {};

          const buttons = [
            {
              text: 'Yes',
              handler: async () => {
                if (zone) {
                  const hideLoading = await alert.showLoading(
                    'Delete all spectra exclusion zones in progress',
                  );
                  dispatchPreferences({
                    type: 'DELETE_MATRIX_GENERATION_EXCLUSION_ZONE',
                    payload: {
                      zone,
                      nucleus: activeTab,
                    },
                  });
                  hideLoading();
                }
              },
            },
            { text: 'No' },
          ];

          modal.showConfirmDialog({
            message:
              'Are you sure you want to delete the Matrix generation exclusion zones?',
            buttons,
          });

          break;
        }
        case HighlightEventSource.MULTIPLE_ANALYSIS_ZONE: {
          const { colKey } = extra || {};
          if (colKey) {
            dispatchPreferences({
              type: 'DELETE_ANALYSIS_COLUMN',
              payload: { columnKey: colKey, nucleus: activeTab },
            });
            // remove keys from the highlighted list after delete
            remove();
          }
          break;
        }
        case HighlightEventSource.BASELINE_ZONE: {
          const { id } = extra || {};
          if (id) {
            dispatch({ type: 'DELETE_BASE_LINE_ZONE', payload: { id } });
            // remove keys from the highlighted list after delete
            remove();
          }
          break;
        }
        case HighlightEventSource.PHASE_CORRECTION_TRACE: {
          const { id } = extra || {};
          if (id) {
            dispatch({
              type: 'DELETE_PHASE_CORRECTION_TRACE',
              payload: { id },
            });
            // remove keys from the highlighted list after delete
            remove();
          }
          break;
        }

        default:
          break;
      }
    },
    [
      dispatch,
      remove,
      assignmentData,
      modal,
      alert,
      dispatchPreferences,
      activeTab,
    ],
  );

  const keysPreferencesListenerHandler = useCallback(
    (e, num) => {
      if (data && data.length > 0 && num >= 1 && num <= 9) {
        if (e.shiftKey) {
          dispatch({
            type: 'SET_KEY_PREFERENCES',
            payload: {
              keyCode: num,
            },
          });
          alert.show(`Configuration Reset, press '${num}' again to reload it.`);
        } else if (!checkModifierKeyActivated(e)) {
          if (keysPreferences?.[num]) {
            dispatch({
              type: 'APPLY_KEY_PREFERENCES',
              payload: {
                keyCode: num,
              },
            });
          } else {
            dispatch({
              type: 'SET_KEY_PREFERENCES',
              payload: {
                keyCode: num,
              },
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
      try {
        if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
          switch (e.key) {
            case 'f':
              if (isToolVisible('zoomOut')) {
                handleFullZoomOut();
              }
              break;
            case 'Escape':
              if (isToolVisible('zoom')) {
                handleChangeOption(options.zoom.id);
              }
              break;
            case 'r': {
              if (isToolVisible('zonePicking')) {
                handleChangeOption(options.zonePicking.id);
              } else if (isToolVisible('rangePicking')) {
                handleChangeOption(options.rangePicking.id);
              }
              break;
            }
            case 'z': {
              if (isToolVisible('zeroFilling')) {
                handleChangeOption(options.zeroFilling.id);
              }
              break;
            }

            case 'a': {
              if (isToolVisible('apodization')) {
                handleChangeOption(options.apodization.id);
              } else if (isToolVisible('phaseCorrection')) {
                handleChangeOption(options.phaseCorrection.id);
              }

              break;
            }
            case 't': {
              if (isToolVisible('fft')) {
                dispatch({
                  type: 'APPLY_FFT_FILTER',
                });
              }
              break;
            }
            case 'b': {
              if (isToolVisible('baselineCorrection')) {
                handleChangeOption(options.baselineCorrection.id);
              }

              break;
            }
            case 'p': {
              if (isToolVisible('peakPicking')) {
                handleChangeOption(options.peakPicking.id);
              }
              break;
            }
            case 'i': {
              if (isToolVisible('integral')) {
                handleChangeOption(options.integral.id);
              }

              break;
            }
            case 'e': {
              if (isToolVisible('exclusionZones')) {
                handleChangeOption(options.exclusionZones.id);
              }

              break;
            }
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
                saveAsJSONHandler();
                e.preventDefault();
              }
              break;
            case 'o':
              openLoader();
              e.preventDefault();
              break;
            case 'a': {
              dispatch({
                type: 'CHANGE_ACTIVE_SPECTRUM',
                payload: {},
              });
              e.preventDefault();
              break;
            }
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
      } catch (error: any) {
        reportError(error);
        alert.error(error.message);
      }
    },
    [
      alert,
      alignSpectrumsVerticallyHandler,
      allow1DTool,
      changeDisplayViewModeHandler,
      dispatch,
      handleChangeOption,
      handleFullZoomOut,
      isToolVisible,
      openLoader,
      saveAsHandler,
      saveAsJSONHandler,
      saveToClipboardHandler,
    ],
  );

  const handleOnKeyDown = useCallback(
    (e) => {
      if (checkNotInputField(e) && mouseIsOverDisplayer.current) {
        const num = Number(e.code.slice(-1)) || 0;
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
      toolsListenerHandler,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleOnKeyDown);

    return () => document.removeEventListener('keydown', handleOnKeyDown);
  }, [handleOnKeyDown]);

  return null;
}

function checkNotInputField(e: Event) {
  const tags = ['input', 'textarea'];
  const tagName = (e.composedPath()[0] as HTMLElement).tagName.toLowerCase();
  if (!tags.includes(tagName)) return true;

  return false;
}

export default KeysListenerTracker;
