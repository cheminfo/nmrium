/** @jsxImportSource @emotion/react */
import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, useOnOff } from 'react-science/ui';

import checkModifierKeyActivated from '../../data/utilities/checkModifierKeyActivated';
import { useAssignmentData } from '../assignment/AssignmentsContext';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useLoader } from '../context/LoaderContext';
import { usePreferences } from '../context/PreferencesContext';
import { useToaster } from '../context/ToasterContext';
import { HighlightEventSource, useHighlightData } from '../highlight/index';
import { useCheckToolsVisibility } from '../hooks/useCheckToolsVisibility';
import useExport from '../hooks/useExport';
import useToolsFunctions from '../hooks/useToolsFunctions';
import SaveAsModal from '../modal/SaveAsModal';
import { options } from '../toolbar/ToolTypes';

interface KeysListenerTrackerProps {
  mainDivRef: RefObject<HTMLDivElement>;
}

function KeysListenerTracker(props: KeysListenerTrackerProps) {
  const { mainDivRef } = props;
  const [confirmDialogIsOpen, openConfirmDialog, closeConfirmDialog] =
    useOnOff();
  const [confirmDialogContent, setConfirmDialogContent] = useState<{
    message: string;
    buttons: Array<{
      text: string;
      handler?: () => void;
    }>;
  }>({ message: '', buttons: [] });
  const {
    keysPreferences,
    displayerMode,
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const dispatch = useDispatch();
  const {
    dispatch: dispatchPreferences,
    current: { nuclei },
  } = usePreferences();
  const toaster = useToaster();
  const openLoader = useLoader();
  const [isSaveModalOpened, openSaveAsDialog, closeSaveAsDialog] =
    useOnOff(false);

  const {
    handleChangeOption,
    handleFullZoomOut,
    alignSpectraVerticallyHandler,
    changeDisplayViewModeHandler,
  } = useToolsFunctions();

  const { saveToClipboardHandler, saveAsJSONHandler } = useExport();
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
            { text: 'No' },
            {
              text: 'Yes',
              handler: () => {
                if (spectrumID) {
                  const hideLoading = toaster.showLoading({
                    message: 'Delete exclusion zones in progress',
                  });
                  dispatch({
                    type: 'DELETE_EXCLUSION_ZONE',
                    payload: {
                      zone,
                      spectrumId: spectrumID,
                    },
                  });
                  hideLoading();
                  closeConfirmDialog();
                }
              },
            },
            {
              text: 'Yes, for all spectra',
              handler: () => {
                if (zone) {
                  const hideLoading = toaster.showLoading({
                    message: 'Delete all spectra exclusion zones in progress',
                  });
                  dispatch({
                    type: 'DELETE_EXCLUSION_ZONE',
                    payload: {
                      zone,
                    },
                  });
                  hideLoading();
                  closeConfirmDialog();
                }
              },
            },
          ];

          setConfirmDialogContent({
            message: 'Are you sure you want to delete the exclusion zone/s?',
            buttons,
          });
          openConfirmDialog();
          break;
        }
        case HighlightEventSource.MATRIX_GENERATION_EXCLUSION_ZONE: {
          const { zone } = extra || {};

          const buttons = [
            { text: 'No' },
            {
              text: 'Yes',
              handler: () => {
                if (zone) {
                  const hideLoading = toaster.showLoading({
                    message: 'Delete all spectra exclusion zones in progress',
                  });
                  dispatchPreferences({
                    type: 'DELETE_MATRIX_GENERATION_EXCLUSION_ZONE',
                    payload: {
                      zone,
                      nucleus: activeTab,
                    },
                  });
                  hideLoading();
                  closeConfirmDialog();
                }
              },
            },
          ];

          setConfirmDialogContent({
            message:
              'Are you sure you want to delete the Matrix generation exclusion zones?',
            buttons,
          });
          openConfirmDialog();
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
      toaster,
      dispatchPreferences,
      activeTab,
      openConfirmDialog,
      closeConfirmDialog,
      setConfirmDialogContent,
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
          toaster.show({
            message: `Configuration Reset, press '${num}' again to reload it.`,
          });
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
            toaster.show({
              message: `Configuration saved, press '${num}' again to reload it.`,
            });
          }
        }
      }
    },
    [data, dispatch, keysPreferences, toaster],
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
                alignSpectraVerticallyHandler();
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

        if (e.shiftKey) {
          switch (e.key) {
            case 'F': {
              dispatch({
                type: 'SET_AXIS_DOMAIN',
                payload: { nucleiPreferences: nuclei },
              });
              break;
            }
            default:
          }
        }

        if (e.shiftKey && (e.metaKey || e.ctrlKey)) {
          switch (e.key) {
            case 's':
            case 'S':
              openSaveAsDialog();
              e.preventDefault();
              break;
            default:
          }
        }
      } catch (error: any) {
        reportError(error);
        toaster.show({ message: error.message, intent: 'danger' });
      }
    },
    [
      alignSpectraVerticallyHandler,
      allow1DTool,
      changeDisplayViewModeHandler,
      dispatch,
      handleChangeOption,
      handleFullZoomOut,
      isToolVisible,
      nuclei,
      openLoader,
      openSaveAsDialog,
      saveAsJSONHandler,
      saveToClipboardHandler,
      toaster,
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

  return (
    <>
      <Dialog
        isOpen={confirmDialogIsOpen}
        onClose={closeConfirmDialog}
        title=" "
        isCloseButtonShown={false}
        css={css`
          .bp5-dialog-header {
            background-color: red;
            min-height: 0;
          }
        `}
      >
        <DialogBody>{confirmDialogContent.message}</DialogBody>
        <DialogFooter
          minimal
          actions={confirmDialogContent.buttons.map((option, i) => (
            <Button
              key={option.text}
              intent={i === 0 ? 'danger' : 'primary'}
              text={option.text}
              onClick={() => {
                option.handler?.();
                closeConfirmDialog();
              }}
            />
          ))}
        />
      </Dialog>
      <Dialog>
        <DialogBody>
          <div
            style={{
              display: 'block',
              borderRadius: '5px',
              minWidth: '400px',
              borderTop: '10px solid #ed0000',
            }}
          >
            <div className="buttons-container">
              {confirmDialogContent.buttons.map((option) => (
                <button
                  key={option.text}
                  type="button"
                  onClick={() => {
                    option.handler?.();
                    closeConfirmDialog();
                  }}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </DialogBody>
      </Dialog>
      <SaveAsModal
        isOpen={isSaveModalOpened}
        onCloseDialog={closeSaveAsDialog}
      />
    </>
  );
}

function checkNotInputField(e: Event) {
  const tags = ['input', 'textarea'];
  const tagName = (e.composedPath()[0] as HTMLElement).tagName.toLowerCase();
  if (!tags.includes(tagName)) return true;

  return false;
}

export default KeysListenerTracker;
